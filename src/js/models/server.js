(function(L) {
    'use strict';
    /** Handles all communication with the server.
     *
     * It syncs both notes and logs, translating them to and from the protocol
     * representation.
     *
     * This is broken out into a separate model to avoid contaminating the
     * local implementation with the server protocol.
     */
    L.models.Server = Backbone.Model.extend({
        defaults : {
            url: 'https://welist.it/listit/jv3/',
            syncingNotes: false,
            syncingLogs: false,
            registered: false,
            email: '',
            noteSyncInterval: 10*60*1000, // 10m
            //logSyncInterval:  30*60*1000, // 30m
            logSyncInterval:  -1 // Disabled
        },
        include: [
          'registered',
          'url',
          'email',
          'noteSyncInterval',
          'logSyncInterval'
        ],
        toJSON: function(options) {
          return _.pick(this.attributes, this.include);
        },
        initialize: function() {
          this.listenTo(this, 'change:registered change:email', _.mask(this.save));
          _(this).bindAll(
            '_syncNotesFailure',
            '_syncNotesSuccess',
            '_syncNotesEnter',
            '_syncNotesReschedule',
            '_syncNotesExit',
            '_syncLogsEnter',
            '_syncLogsReschedule',
            'packageNote',
            'unpackageNote',
            'syncNotes',
            'syncLogs'
          );
        },
        // Singleton
        url : '/server',
        isNew: function() {
            return false;
        },
        // Defines a translation between a packaged note and a local note.
        noteTransTable : {
            'jid': { here: 'id' },
            'version': {},
            'created': {},
            'edited': {},
            'contents': {},
            'meta': { transIn: JSON.parse, transOut: JSON.stringify },
            'modified': {
                transIn: function(v) { return v !== 0; },
                transOut: function(v) { return v ? 1 : 0; }
            }
        },
        logTopLevelAttributes: [
          "tabid",
          "action",
          "time",
          "url",
          "noteid"
        ],
        logExcludedAttributes: [
          "id",
        ],
        // Make an ajax method call
        ajax : function(options) {
            options = _.clone(options);

            if (options.continuation) {
                var continuation = options.continuation;
                options.success = function(data) {
                    continuation(true, data);
                };
                if (!options.error) {
                    options.error = function(xhdr, stat) {
                        continuation(false, stat);
                    };
                }
                delete options.continuation;
            }

            // Call with auth token if needed. Do it this way to allow for
            // asynchronous authentication (password prompts etc.)
            if (options.auth && !options.authToken) {
                var that = this;
                L.authmanager.getToken(function(token) {
                    if (token) {
                        options.authToken = token;
                        that.ajax(options);
                    } else {
                        (options.error || $.noop)(null, 'User not authenticated');
                        (options.complete || $.noop)();
                    }
                });
                return;
            }

            if (!options.type) {
                options.type = options.data ? 'POST' : 'GET';
            }

            options.url = this.get('url') + options.method +
              (options.type === 'POST' ? '/' : '') +
                (options.auth ? ('?HTTP_AUTHORIZATION=' + options.authToken) : '');

            options.crossDomain = true;
            $.ajax(options);
        },
        syncNotes : function() {
          return;
          if (this._syncNotesEnter()) {
            var that = this;
            this.pullNotes({
                error: that._syncNotesFailure,
                success: function() {
                  that.pushNotes({
                    error: that._syncNotesFailure,
                    success: that._syncNotesSuccess
                  });
                }
            });
          }
        },
        _syncNotesEnter: function() {
          // Don't sync if waiting for a past sync.
          if (this.get('syncingNotes') || !this.get('registered')) {
            return false;
          }
          clearTimeout(this.get('noteSyncTimer'));
          debug('syncNotes::start');

          this.trigger('sync:start');
          this.set('syncingNotes', true);
          return true;
        },
        _syncNotesExit: function() {
          this.set('syncingNotes', false);
          this._syncNotesReschedule();
        },
        _syncNotesReschedule: function() {
          var interval = this.get('noteSyncInterval');
          if (interval > 0) {
            this.set('noteSyncTimer', window.setTimeout(this.syncNotes, interval));
          }
        },
        _syncNotesFailure: function(xhdr, stat) {
          debug('syncNotes::fail', stat);
          this.trigger('sync:failure', stat);
          this._syncNotesExit();
        },
        _syncNotesSuccess: function() {
          // Successful Ajax Response:
          this.trigger('sync:success');
          this._syncNotesExit();
        },
        pullNotes : function(options) {
          var that = this;
          this.ajax({
            method: 'notes',
            dataType: 'json',
            auth: true,
            success: function(results) {
              that.unbundleNotes(results);
              if (options.success) {
                options.success(results);
              }
            },
            error: options.error,
            complete: options.complete
          });
        },
        pushNotes : function(options) {
          var that = this;
          this.ajax({
              method: 'notespostmulti',
              dataType: 'json',
              auth: true,
              data: JSON.stringify(this.bundleNotes()),
              success: function(response) {
                that.commitNotes(response.committed);
                if (options.success) {
                  options.success();
                }
              },
              error: options.error,
              complete: options.complete
          });
        },
        syncLogs : function() {
          var that = this;
          if (this._syncLogsEnter()) {
            this.ajax({
              method: 'post_json_chrome_logs',
              auth: true,
              data: JSON.stringify(this.bundleLogs()),
              error: function(xhr, error) {
                debug('syncLogs::failed', error);
              },
              success: function(response) {
                L.logger.clearUntil(response.lastTimeRecorded);
                debug('syncLogs::succeeded');
              },
              complete: function() {
                that.set('syncingLogs', false);
                that._syncLogsReschedule();
              }
            });
          }
        },
        _syncLogsEnter: function() {
          // Don't sync if waiting for a past sync.
          if (this.get('syncingLogs') || !this.get('registered')) {
            return false;
          }
          clearTimeout(this.get('logSyncTimer'));
          if (L.logger.get('log').isEmpty()) {
            this._syncLogsReschedule();
            debug('syncLogs::skip');
            return false;
          }

          debug('syncLogs::start');

          this.set('syncingLogs', true);
          return true;

        },
        _syncLogsReschedule: function() {
          var interval = this.get('logSyncInterval');
          if (interval > 0) {
              this.set('logSyncTimer', setTimeout(this.syncLogs, interval));
          }
        },
        start : function() {
            // Note: use timout instead of interval for a responsive interface.
            // Also allows pre-empting
            var that = this;

            _.defer(function() {
              var noteSyncInterval = that.get('noteSyncInterval', -1),
                  logSyncInterval = that.get('logSyncInterval', -1);

              if (noteSyncInterval > 0) {
                  that.syncNotes();
              }
              if (logSyncInterval > 0) {
                  that.syncLogs();
              }
            });
        },
        stop : function() {
            clearTimeout(this.get('noteSyncTimer'));
            clearTimeout(this.get('logSyncTimer'));
        },
        bundleLogs : function() {
          var excluded = _.union(this.logTopLevelAttributes, this.logExcludedAttributes);
          var toplevel = this.logTopLevelAttributes;
          return L.logger.get('log').chain()
          // Convert to object.
          .map(function(e) {
            return e.toJSON();
          })
          // Translate
          .map(function(e) {
            var out = _.pick(e, toplevel);
            var data = _.omit(e, excluded);
            if (!_.isEmpty(data)) {
              out.data = JSON.stringify(data);
            }
            return out;
          }).value();
        },
        /**
        * Package and bundle the given notes.
        */
        bundleNotes : function() {
            var that = this,
                bundle = [],
                bundleNote = function(note, deleted) {
                    if (note.get('modified')) {
                        bundle.push(that.packageNote(note, deleted));
                    }
                };


            // Push magic note.
            //TODO: Avoid sending every time?
            bundle.push({
                'jid': -1,
                'version': L.notebook.get('version') || 0,
                'created': 0,
                'edited': 0,
                'contents': JSON.stringify({noteorder:L.notebook.get('notes').getOrder()}),
                'deleted': 1
            });
            L.notebook.get('notes').each(function(n) { bundleNote(n, false); });
            L.notebook.get('deletedNotes').each(function(n) { bundleNote(n, true); });
            
            return bundle;
        },
        commitNotes: function(committed) {
          // For each
          _.chain(committed)
          // Ignore magic note
          .filter(function(note) {
            return note.jid >= 0;
          })
          // Check status
          .filter(function(note) {
            return (note.status === 201 || note.status === 200);
          })
          // Lookup note
          .pluck('jid')
          .map(_.bind(L.notebook.getNote, L.notebook))
          .reject(_.isUndefined)
          .each(function(note) {
            // Set unmodified and increment version (server does the same).
            note.set({
              modified: false,
              version: note.get('version') + 1
            });
            note.save();
          });
          // Update note collection version.
          L.notebook.set('version', L.notebook.get('version') + 1);
        },
        unbundleNotes: function(result) {
            var order;
            // Update changed
            _.chain(result)
            .pluck("fields")
            .map(this.unpackageNote)
            .filter(function(n) { // Filter out magic note.
                if (n.id < 0) {
                  if (L.notebook.get('version') < n.version) {
                    order = JSON.parse(n.contents);
                  }
                  return false;
                } else {
                    return true;
                }
            })
            .each(function(n) {
              var deleted = _.pop(n, 'deleted');
              var note = L.notebook.getNote(n.id);
              if (note) {
                if (note.get('version') < n.version) {
                  if (note.get('modified')) {
                    note.merge(n);
                    // On merge, only undelete (safest)
                    if (!deleted) {
                      note.moveTo(L.notebook.get('notes'), {nosave: true});
                    }
                  } else {
                    note.set(n);
                    // delete/undelete based on latest version.
                    note.moveTo(L.notebook.get(deleted ? 'deletedNotes' : 'notes'), {nosave: true});
                  }
                  note.save();
                }
              } else {
                L.notebook.get(deleted ? 'deletedNotes' : 'notes').create(n, {nosave: true});
              }
            });
            
            // FIXME: don't necessarily clobber order.
            if (order) {
              L.notebook.get('notes').setOrder(order);
            }

            // Save collections
            L.notebook.save();

            // Successful Ajax Response:
            this.trigger('sync:success');
        },

        /**
        * Convert a note into a package that can be sent to the server.
        */
        packageNote : function(note, deleted) {
            var meta = note.get('meta'),
                packed = {deleted: deleted ? 1 : 0};

            _(this.noteTransTable).each(function(trans, field) {
                packed[field] = note.get(trans.here || field);
                if (trans.transOut) {
                    packed[field] = trans.transOut(packed[field]);
                }
            });
            return packed;
        },
        /**
        * Convert a package from the server into a hash of fields that can be used to update/create a note.
        */
        unpackageNote : function(note) {
            var unpacked = {modified: false, deleted: note.deleted !== 0};
            _(this.noteTransTable).each(function(trans, field) {
                if (!note.hasOwnProperty(field)) {
                    return;
                }
                var myField = trans.here || field;
                unpacked[myField] = note[field];
                if (trans.transIn) {
                    unpacked[myField] = trans.transIn(unpacked[myField]);
                }
            });
            return unpacked;
        },
        login: function(email, password, options) {
            var hashpass = L.util.makeHashpass(email, password);
            var that = this;
            this.set({
              email: '',
              registered: false
            });
            this.ajax({
              method: 'login',
              auth: 'true',
              cache: false,
              authToken: hashpass,
              success: function() {
                that.set({
                  email: '',
                  registered: true,
                  error: undefined
                });
                L.authmanager.setToken(hashpass);
              },
              error: function(jqXHR) {
                if (jqXHR.status === 401) {
                  that.set('error', 'Invalid email or password.');
                } else {
                  that.set('error', 'Connection Error.');
                }
              }
            });
        },
        register: function(email, password, couhes, options) {
            var that = this;
            // Pulled from zen/tags site
            var firstname = '';
            var lastname = '';

            this.set({
              email: '',
              registered: false
            });

            this.ajax({
                method: 'createuser',
                data: {
                    username: email,
                    password: password,
                    couhes: couhes,
                    firstname: firstname,
                    lastname: lastname
                },
                cache: false,
                success: function() {
                    that.set({
                      registered: true,
                      error: undefined,
                      email: email
                    });
                    L.authmanager.setToken(L.util.makeHashpass(email, password));
                },
                error: function() {
                  that.set('error', 'Failed to register user.');
                }
            });
        },
        logout: function() {
          this.set({
            registered: false,
            email: ''
          });
          L.authmanager.unsetToken();
        }
    });

    // This manages account information.
    // It doesn't have a view, it doesn't do anything but store the auth token.
    L.models.AuthManager = Backbone.Model.extend({
        initialize: function() {
            this.fetch();
            this.listenTo(this, 'change', _.mask(this.save));
        },

        // Singleton
        url: '/authmanager',
        isNew: function() {return false;},
        /**
        * Call the callback with the auth token.
        *
        * This method must be defined.
        */
        getToken: function(callback) {
            callback(this.get('hashpass', null));
        },
        /**
        * Set the auth token.
        *
        * This method doesn't only needs to be made available to the authentication agent.
        */
        setToken: function(token) {
            this.set('hashpass', token);
        },
        unsetToken: function() {
            this.unset('hashpass');
        }
    });
})(ListIt);
