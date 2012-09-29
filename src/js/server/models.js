(function(L) {
    'use strict';
    // Handles syncing notes with the server.
    // Do not persist
    L.make.server.ServerModel = Backbone.Model.extend({
        defaults : {
            url: 'http://welist.it/listit/jv3/',
            syncing: false,
            syncingLogs: false,

            noteSyncInterval: 10*60*1000, // 10m
            //logSyncInterval:  30*60*1000, // 30m
            logSyncInterval:  -1 // Disabled
        },
        initialize: function() {
            _.bindAll(this);
            L.vent.on('user:sync', this.syncNotes);
        },
        // Defines a translation between a packaged note and a local note.
        transTable : {
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
                        (options.error || $.noop)(null, 'Failed to authenticate');
                        (options.complete || $.noop)();
                    }
                });
                return;
            }

            if (!options.type) {
                options.type = options.data ? 'POST' : 'GET';
            }

            options.url = this.get('url') + options.method + (options.type === 'POST' ? '/' : '') +
                (options.auth ? ('?HTTP_AUTHORIZATION=' + options.authToken) : '');

            options.crossDomain = true;
            $.ajax(options);
        },
        syncNotes : function() {
            clearTimeout(this.get('noteSyncTimer'));

            // Don't sync if waiting for a past sync.
            if (this.get('synching')) {
                return;
            }
            debug('syncNotes::start');

            var that = this;

            this.trigger('sync:start');
            this.set('syncing', true);
            this.ajax({
                method: 'post_json_get_updates',
                dataType: 'json',
                auth: true,
                data: this.bundleNotes(),
                error: function(xhdr, stat) {
                    debug('syncNotes::fail', stat);
                    that.trigger('sync:failure', stat);
                },
                success: function(result) {
                    window.sync_result = result;
                    debug('syncNotes::success', result);
                    that.unbundleNotes(result);
                    // Successful Ajax Response:
                    that.trigger('sync:success');
                },
                complete: function() {
                    that.set('syncing', false);
                    var interval = that.get('noteSyncInterval');
                    if (interval > 0) {
                        that.set('noteSyncTimer', setTimeout(that.syncNotes, interval));
                    }
                }
            });
        },
        syncLogs : function() {
            if (this.get('syncingLogs')) {
                return;
            }

            debug('syncLogs::start');
            var that = this;

            this.set('syncingLogs', true);
            this.ajax({
                method: 'post_json_chrome_logs',
                auth: true,
                data: L.logs.toJSON(),
                error: function() {
                    debug('FAIL: Logs not sent to server.');
                    debug('syncLogs::failed')
                    // TODO:Do something?
                },
                success: function() {
                    // TODO: Clear Logs
                    debug('Implement logging.');
                    debug('syncLogs::succeeded')
                },
                complete: function() {
                    that.set('syncingLogs', false);
                    var interval = that.get('logSyncInterval');
                    if (interval > 0) {
                        that.set('logSyncTimer', setTimeout(that.syncLogs, interval));
                    }
                }
            });
        },
        start : function() {
            // Note: use timout instead of interval for a responsive interface.
            // Also allows pre-empting

            var noteSyncInterval = this.get('noteSyncInterval', -1),
                logSyncInterval = this.get('logSyncInterval', -1);

            if (noteSyncInterval > 0) {
                this.syncNotes();
            }
            if (logSyncInterval > 0) {
                this.syncLogs();
            }
        },
        stop : function() {
            clearTimeout(this.get('noteSyncTimer'));
            clearTimeout(this.get('logSyncTimer'));
        },
        /**
        * Package and bundle the given notes.
        */
        bundleNotes : function() {
            var that = this,
                unmodifiedNotes = {},
                modifiedNotes = [],
                pushNote = function(note, deleted) {
                    // TODO: Insert Magic note hack
                    if (note.get('modified')) {
                        modifiedNotes.push(that.packageNote(note, deleted));
                    } else {
                        unmodifiedNotes[note.get('id')] = note.get('version');
                    }
                };


                /*
            // Push magic note.
            modifiedNotes.push({
                'jid': -1,
                'version': 120,
                'created': 0,
                'edited': 0,
                'contents': JSON.stringify({noteorder:L.notes.getOrder()}),
                'modified': 1,
                'deleted': 1
            });
            */
            L.notes.each(function(n) { pushNote(n, false); });
            L.deletedNotes.each(function(n) { pushNote(n, true); });
            
            return JSON.stringify({
                modifiedNotes: modifiedNotes,
                unmodifiedNotes: unmodifiedNotes
            });
        },
        unbundleNotes: function(result) {
            var order;
            if (result.magicNote && result.magicNote.contents) {
                try {
                    order = JSON.parse(result.magicNote.contents).noteorder;
                    //version = magicNote.version;
                    // I am ignoring the version and hoping for the best.
                    // I need to better understand the backend or just re-write it.
                    // I don't care about the rest.
                } catch (e){
                    debug("unbundleNotes::magicNote invalid");
                }
            }
            // Update changed
            _.chain(result.update.concat(result.updateFinal))
            .map(this.unpackageNote)
            .filter(function(n) { // Filter out magic note.
                return n.id >= 0;
            })
            .each(function(n) {
                var deleted = _.pop(n, 'deleted');
                var note = L.getNote(n.id);
                if (note) {
                    note.moveTo(deleted ? L.deletedNotes : L.notes, {nosave: true}); // Noop if note in collection.
                    note.set(n);
                    note.save();
                } else {
                    debug('Updated note doesn\'t exist, creating', n);
                    (deleted ? L.deletedNotes : L.notes).add(n, {nosave: true});
                }
            });

            // Mark committed as unmodified
            _.chain(result.committed)
            .filter(function(note) { // Filter out magic note.
                return note.jid >= 0;
            })
            .filter(function(note) {  // Filter on success
                return (note.status === 201 || note.status === 200);
            })
            .pluck('jid') // Get ids
            .map(L.getNote) // Look up notes
            .each(function(note) { // Set unmodified if the note exists.
                if (!note) {
                    debug('Non-existant note received.');
                    return;
                }
                note.set('modified', false);
                note.save();
            });

            // Add new notes
            _.chain(result.unknownNotes)
            .map(this.unpackageNote)
            .filter(function(n) {
                return n.id >= 0;
            })
            .each(function(n) {
                debug('Adding new note', n);
                (_.pop(n, 'deleted') ? L.deletedNotes : L.notes).add(n, {
                    nosave: true
                }); // Add the note to the correct set.
            });

            
            L.notes.setOrder(order);

            // Save collections
            L.notes.save();
            L.deletedNotes.save();

            // Successful Ajax Response:
            this.trigger('sync:success');
        },

        /**
        * Convert a note into a package that can be sent to the server.
        */
        packageNote : function(note, deleted) {
            var meta = note.get('meta'),
                packed = {deleted: deleted ? 1 : 0};

            _(this.transTable).each(function(trans, field) {
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
            _(this.transTable).each(function(trans, field) {
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
        validateUser: function(hashPass, options) {
            debug('logging in:', hashPass);
            this.ajax(_.extend({
                method: 'login',
                auth: 'true',
                cache: false,
                authToken: hashPass
            }, options));
        },
        registerUser : function(email, password, couhes, options) {
            // Pulled from zen/tags site
            var firstname = '';
            var lastname = '';

            this.ajax(_.extend({
                method: 'createuser',
                data: {
                    username: email,
                    password: password,
                    couhes: couhes,
                    firstname: firstname,
                    lastname: lastname
                },
                cache: false
            }, options));
        }
    });

    // This manages account information.
    // It doesn't have a view, it doesn't do anything but store the auth token.
    L.make.server.AuthManager = Backbone.Model.extend({
        initialize: function() {
            this.fetch();
            this.on('change', this.save, this);
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
