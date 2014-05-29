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
    autoFetch: true,
    defaults : function() {
      return {
        url: 'https://welist.it/listit/jv3/',
        syncingNotes: false,
        syncingLogs: false,
        running: false,
        paused: true,
        noteSyncRunning: false,
        logSyncRunning: false,
        registered: false,
        email: '',
        studies: {},
        noteSyncInterval: 10*60*1000, // 10m
        logSyncInterval:  30*60*1000 // 30m
      };
    },
    include: [
      'registered',
      'url',
      'email',
      'noteSyncInterval',
      'logSyncInterval',
      'logSyncInterval',
      'studies'
    ],
    toJSON: function(options) {
      return _.pick(this.attributes, this.include);
    },
    initialize: function() {
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
    initialized: function() {
      var that = this;
      this.listenTo(this, _.reduce(this.include, function(memo, attr) {
        return memo+" change:"+attr;
      }, ""), _.mask(this.save));

      if (DEBUG_MODE && window.console && window.console.time) {
        this.listenTo(this, 'change:syncingNotes', function(server, syncing) {
          if (syncing) {
            console.time('syncing notes');
          } else {
            console.timeEnd('syncing notes');
          }
        });
        this.listenTo(this, 'change:syncingLogs', function(server, syncing) {
          if (syncing) {
            console.time('syncing logs');
          } else {
            console.timeEnd('syncing logs');
          }
        });
      }

      this.listenTo(this, 'change:registered', function(server, registered) {
        // Don't start if not running.
        if (!that.get('running')) {
          return;
        }
        if (registered) {
          that.resume();
        } else {
          that.pause();
        }
      });

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
      'created': {transIn: Number}, // The server is odd
      'edited': {transIn: Number},
      'contents': {},
      'meta': { transIn: JSON.parse, transOut: JSON.stringify }
    },
    logTopLevelAttributes: [
      "tabid",
      "action",
      "time",
      "url",
      "noteid"
    ],
    logExcludedAttributes: [
      "id"
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

      options.crossDomain = false; // Force same domain
      options.jsonp = false; // Don't ever use jsonp XXX JQUERY BUG

      // Ajax uses method internally
      delete options.method;

      $.ajax(options);
    },
    syncNotes : function(synchronous) {
      if (this._syncNotesEnter()) {
        var that = this;
        this.pullNotes({
          error: that._syncNotesFailure,
          success: function() {
            that.pushNotes({
              error: that._syncNotesFailure,
              success: that._syncNotesSuccess
            }, synchronous);
          }
        }, synchronous);
      }
    },
    _syncNotesEnter: function() {
      // Don't sync if waiting for a past sync.
      if (this.get('syncingNotes') || !this.get('registered') || navigator.onLine === false) {
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
        this.set('noteSyncTimer', setTimeout(this.syncNotes, interval));
      }
    },
    _syncNotesFailure: function(xhdr, stat) {
      debug('syncNotes::fail', stat);
      this.trigger('sync:failure', stat);
      this._syncNotesExit();
    },
    _syncNotesSuccess: function() {
      // Successful Ajax Response:
      debug('syncNotes::success');
      this.trigger('sync:success');
      this._syncNotesExit();
    },
    pullNotes : function(options, synchronous) {
      var that = this;
      this.ajax({
        method: 'notes',
        dataType: 'json',
        auth: true,
        async: !synchronous,
        success: function(results) {
          that.unbundleNotes(results, function() {
            if (options.success) {
              options.success(results);
            }
          });
        },
        error: options.error,
        complete: options.complete
      });
    },
    pushNotes : function(options, synchrounous) {
      var that = this;
      this.ajax({
        method: 'notespostmulti',
        dataType: 'json',
        auth: true,
        async: !synchrounous,
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
      if (this.get('syncingLogs') || !this.get('registered') || navigator.onLine === false) {
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
    resume: function() {
      var that = this;
      if (!this.get('paused')) {
        return;
      } else {
        this.set('paused', false);
      }
      if (this.get('noteSyncInterval', -1) > 0) {
        L.notebook.ready(function() {
          that.syncNotes();
          $(window).off('beforeunload.lastSync');
          $(window).on('beforeunload.lastSync', _.bind(that.syncNotes, that, true));
        });
      }
      if (this.get('logSyncInterval', -1) > 0) {
        L.logger.ready(function() {
          that.syncLogs();
        });
      }
    },
    pause: function() {
      clearTimeout(this.get('noteSyncTimer'));
      $(window).off('beforeunload.lastSync');
      clearTimeout(this.get('logSyncTimer'));
      this.set('paused', true);
    },
    start : function() {
      // Note: use timout instead of interval for a responsive interface.
      // Also allows pre-empting
      // Don't start twice
      if (this.get('running')) {
        return;
      } else {
        this.set('running', true);
      }

      if (this.get('registered')) {
        this.resume();
      }
    },
    stop : function() {
      this.pause();
      this.set('running', false);
    },
    bundleLogs : function() {
      var excluded = _.union(this.logTopLevelAttributes, this.logExcludedAttributes);
      var toplevel = this.logTopLevelAttributes;
      return L.logger.get('log').chain()
      // Don't include invalid entries
      .filter(function(e) { return e.isValid(); })
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
      if (DEBUG_MODE && window.console && window.console.time) {
        console.time('bundle notes');
      }
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
        'deleted': true
      });

      // Push all the toBeDestroyed Notes
      var toBeDestroyed = L.notebook.get('toBeDestroyed');
      _.each(toBeDestroyed, function(deletedNoteId, version) {
        bundle.push({
          'jid': deletedNoteId,
          'version': version,
          'created': -1,
          'edited': 0,
          'contents': "",
          'deleted': true
        });
      });

      L.notebook.get('notes').chain()
      .filter(function(n) { return n.isValid(); })
      .each(function(n) { bundleNote(n, false); });
      L.notebook.get('deletedNotes').each(function(n) { bundleNote(n, true); });

      if (DEBUG_MODE && window.console && window.console.time) {
        console.timeEnd('bundle notes');
      }

      return bundle;
    },
    commitNotes: function(committed) {

      if (DEBUG_MODE && window.console && window.console.time) {
        console.time('commit notes');
      }

      // For each
      _.chain(committed)
      // Ignore magic note
      .filter(function(noteResponse) {
        return noteResponse.jid >= 0;
      })
      // Check status
      .each(function(noteResponse) {
        if (!(noteResponse.status === 201 || noteResponse.status === 200)) {
          debug("syncNotes::error", "Invalid Note", noteResponse);
          return;
        }
        var note = L.notebook.getNote(noteResponse.jid);
        if (!note) {
          debug("syncNotes::error", "Received response for non-existant note", noteResponse);
          return;
        }
        note.set("modified", false);

        // Incriment version iff note already existed.
        if (noteResponse.status === 200) {
          note.set("version", note.get('version')+1);
        }

        note.save();
      });
      // Update note collection version.
      L.notebook.set('version', L.notebook.get('version') + 1);

      if (DEBUG_MODE && window.console && window.console.time) {
        console.timeEnd('commit notes');
      }
    },
    unbundleNotes: function(result, cb) {
      if (DEBUG_MODE && window.console && window.console.time) {
        console.time('unbundle notes');
      }

      var magic,
          newVersion,
          that = this,
          notes = L.notebook.get('notes'),
          deletedNotes = L.notebook.get('deletedNotes'),
          toBeDestroyed = L.notebook.get('toBeDestroyed'),
          toAdd = [],
          toAddDeleted = [],
          unbundleQueue = new ActionQueue(10);

      unbundleQueue.start();

      _.each(result, unbundleQueue.wrap(function(noteResult) {
        // Unpackage
        var noteJSON = that.unpackageNote(noteResult.fields);

        // Handle magic note.
        if (noteJSON.id < 0) {
          if (L.notebook.get('version') < noteJSON.version) {
            magic = JSON.parse(noteJSON.contents);
            newVersion = noteJSON.version;
          }
          return;
        }

        // Handle toBeDestroyed notes
        if (noteJSON.created == -1) { //this is a temporary implementation of destroying notes
                                      //set the created field to be -1. 
          var note = L.notebook.getNote(noteJSON.id);
          if (note) {
            if (note.get('version') <= noteJSON.version) {
              note.collection.remove(note);
            }
          }
          return;
        }

        // ignore a note that should be destroyed
        if (toBeDestroyed.hasOwnProperty(noteJSON.id)) {
          if (toBeDestroyed[noteJSON.id] < noteJSON.version) {
            delete toBeDestroyed[noteJSON.id]
          } else {
            return; 
          }
        }

        // Add or merge
        var deleted = _.pop(noteJSON, 'deleted');
        var note = L.notebook.getNote(noteJSON.id);
        if (note) {
          if (note.get('version') < noteJSON.version) {
            if (note.get('modified')) {
              note.merge(noteJSON);
              // On merge, only undelete (safest)
              if (!deleted) {
                note.moveTo(notes, {nosave: true});
              }
            } else {
              note.set(noteJSON, {nomodify: true});
              // delete/undelete based on latest version.
              note.moveTo(deleted ? deletedNotes : notes, {nomodify: true, nosave: true});
            }
            note.save();
          }
        } else {
          (deleted ? toAddDeleted : toAdd).push(new L.models.Note(noteJSON));
        }
      }));

      unbundleQueue.add(function() {
        // This section shouldn't be interrupted
        // We mess with events.
        if (toAddDeleted) {
          toAddDeleted.reverse();
          deletedNotes.add(toAddDeleted, {at: 0, nosave: true});
        }
        if (toAdd) {
          toAdd.reverse();
          notes.add(toAdd, {at: 0, silent: true});
        }
        // FIXME: don't necessarily clobber order.
        if (magic && magic.noteorder) {
          notes.setOrder(magic.noteorder, {silent: true});
        }

        notes.sort({silent: true});

        _.each(toAdd, function(n) {
          notes.trigger('add', n, notes, {nosave: true});
        });
        notes.trigger('sort', notes, {nosave: true});

        if (newVersion !== undefined) {
          L.notebook.set('version', newVersion, {nosave: true});
        }
      });

      // Save everything.
      unbundleQueue.add(function() {
        _.each(toAdd, unbundleQueue.wrap(function(n) {n.save();}));
        _.each(toAddDeleted, unbundleQueue.wrap(function(n) {n.save();}));
        unbundleQueue.add(_.bind(L.notebook.save, L.notebook));
        unbundleQueue.add(function() {
          if (DEBUG_MODE && window.console && window.console.time) {
            console.timeEnd('unbundle notes');
          }
          cb();
        });
      });
    },

    /**
     * Convert a note into a package that can be sent to the server.
     */
    packageNote : function(note, deleted) {
      var packed = {deleted: deleted };

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
      var unpacked = {modified: false, deleted: !!note.deleted};
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
        success: function(response) {
          // Don't change state really done.
          L.authmanager.setToken(hashpass, function() {
            that.set({
              studies: _.kmap(_.omit(response, "code"), function(v) { return v !== 0; }),
              email: email,
              registered: true,
              error: undefined
            });
          });
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
        success: function(response) {
          L.authmanager.setToken(L.util.makeHashpass(email, password), function() {
            that.set({
              studies: _.kmap(_.omit(response, "code"), function(v) { return v !== 0; }),
              registered: true,
              error: undefined,
              email: email
            });
          });
        },
        error: function() {
          that.set('error', 'Failed to register user.');
        }
      });
    },
    logout: function() {
      this.set({
        registered: false,
        email: '',
        studies: {}
      });
      L.authmanager.unsetToken();
    }
  });

  // This manages account information.
  // It doesn't have a view, it doesn't do anything but store the auth token.
  L.models.AuthManager = Backbone.Model.extend({
    autoFetch: true,
    // Singleton
    url: '/authmanager',
    isNew: function() {return false;},
    initialized: function() {
      // Autosave
      this.on('change', _.mask(this.save), this);
    },
    /**
     * Call the callback with the auth token.
     *
     * This method must be defined.
     */
    getToken: function(callback) {
      this.ready(function() {
        callback(this.get('hashpass', null));
      });
    },
    /**
     * Set the auth token.
     *
     * This method doesn't only needs to be made available to the authentication agent.
     */
    setToken: function(token, callback) {
      this.ready(function() {
        this.set('hashpass', token);
        if (callback) {
          callback();
        }
      });
    },
    unsetToken: function(callback) {
      this.ready(function() {
        this.unset('hashpass');
        if (callback) {
          callback();
        }
      });
    }
  });
})(ListIt);
