/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false, ActionQueue: true*/

(function(L) {
    'use strict';
    L.models.Note = Backbone.Model.extend({
        urlRoot: '/note',
        defaults: function() {
            return {
                contents: '',
                meta: {},
                version: 0,
                modified: true,
                id: Math.ceil(Math.random()*2147483647), // must be an int32.
                created: Date.now()
            };
        },
        initialize: function() {
            this.on('change:contents change:meta', _.bind(this._onChange, this), this);
        },
        _onChange: function() {
            this.set({
                'edited': Date.now(),
                'modified': true
            });
        },
        /*
         * Change the contents of a note and trigger parse events.
         *   newContents: new note contents
         *   window: the window from which this note was changed (optional)
         */
        changeContents: function(newContents, window) {
            var note = this.toJSON();
            note.contents = newContents;
            // TODO: This should use a different event
            L.gvent.trigger("note:request:pqrse note:request:parse:change", note, window);
            this.set(note);
            this.save();
        },
        /*
         * Merge a new note with this one.
         */
        merge: function(attrs) {
          // Merge contents
          var newContents;
          var oldContents = this.get('contents');
          if (oldContents && _.str.trim(oldContents).length > 0) {
            if (attrs.contents && _.str.trim(attrs.contents).length > 0) {
              newContents = attrs.contents + '\n--\n' + oldContents;
            } else {
              newContents = oldContents;
            }
          } else {
            newContents = oldContents;
          }
          this.set({
            'meta': _.defaults({}, this.get('meta'), attrs.meta),
            'contents': newContents,
            'edited': Math.max(attrs.edited, this.get('edited')),
            'version': attrs.version
          });
        },
        /*
         * Move this note from it's current collection to a new one.
         */
        moveTo: function(collection, options) {
            if (collection === this.collection) {
                return;
            }

            this.collection.remove(this, options);
            collection.unshift(this, options);
            this.set('modified', true, options);
            if (!(options && options.nosave)) {
                this.save();
            }
        }
    });

    L.models.NoteCollection = Backbone.Collection.extend({
        model: L.models.Note,
        slice: function(a, b) {
            return this.models.slice(a, b);
        },
        // Reorder contents by list of ids
        setOrder: function(newOrder, options) {
            options = options || {};
            var orderMap = _.invert(newOrder),
                that = this,
                posCounter = 0,
                appendOffset = this.models.length;

            this.models.sort(function(note) {
                var pos = orderMap[note.id];
                // Put the note at the beginning if position unknown.
                if (pos === undefined) {
                    return posCounter++;
                } else {
                    return pos + appendOffset;
                }
            });

          if (!options.silent) {
            this.trigger('sort', this, options);
          }
        },
        getOrder: function() {
            return this.pluck("id");
        }
    });

    // Note. This collection must never contain notes that don't exist in in
    // the notebook.  This shouldn't be a problem in bug-free code but search
    // assumes this (to reduce flickering).
    L.models.FilterableNoteCollection = L.models.NoteCollection.extend({
        initialize : function() {
            this.searchQueue = new ActionQueue(50);
            this.searchQueue.start();
            this._searchCursor = 0;
            this.backingCollection = L.notebook.get('notes');
            this.listenTo(this.backingCollection, 'add', this.maybeAddNew);
            this.listenTo(this.backingCollection, 'remove', this._onRemove);
            this.listenTo(this.backingCollection, 'reset', _.mask(this.reset));
            this.listenTo(this.backingCollection, 'sort', _.mask(this.sort));
            this.on('reset', _.mask(this._filter), this);
            this.on('remove', function(note, c, options) {
              if (this.indexOf(note) < this._searchCursor) {
                this._searchCursor--;
              }
            });
            this.on('add', function(note, c, options) {
              if (this.indexOf(note) < this._searchCursor) {
                this._searchCursor++;
              }
            });
            this.reset();
        },
        _chunk: 10,
        _onRemove: function(note, notes, options) {
            this.remove(note, options);
        },
        comparator: function(note) {
          // Backbone checks the number of arguments (1 = absolute, 2 = compare)
          // Underscore passes an extra argument (the index in the underlying
          // list). This is probabbly a good guess for indexOf.
          var i = arguments[1];
          return this.backingCollection.indexOf(note, typeof(i) === "number" ? i : undefined);
        },
        maybeAddNew: function(note) {
            if (this.matcher(note)) {
                this.add(note, {'new': true});
            }
        },
        matcher: function(note) {
            if (!this._terms) {
                return true;
            }
            var text = L.util.clean(note.get('contents').toLowerCase());
            return L.util.matchTerms(this._terms, text);
        },
        search: function(text) {
            // Extract the terms
            var newTerms = L.util.extractTerms(text);

            // Don't search if the terms haven't changed.
            if (_.isEqual(this._terms, newTerms)) {
                return this.searchID;
            }
            return this._filter(newTerms);
        },
        _filter: function(newTerms) {

          this.searchQueue.clear();
          if (this.searching) {
            this.searching = false;
            this.trigger("search:abort search:end", this._terms, this.searchID);
            debug('search::cancel');
          }

          this._searchCursor = 0;

          debug('search::start');

          var that = this;
          if (arguments.length > 0) {
            this._terms = newTerms;
          }
          this.searching = true;
          this.searchID = Math.random();
          this.trigger("search:begin", this._terms, this.searchID);

          var boundMatcher = _.bind(this.matcher, this);

          _.each(_.chunk(this.backingCollection, this._chunk), function(chunk) {
              that.searchQueue.add(function() {
                _.each(chunk, function(note) {
                  if (that.matcher(note)) {
                    that.add(note, {at: that._searchCursor, sort: false});
                    that._searchCursor++;
                  } else {
                    that.remove(note);
                  }
                });
              });
          });

          this.searchQueue.add(function() {
            that.searching = false;
            debug('search::end');
            that.trigger('search:complete search:end', that._terms, that.searchID);
          });
          return this.searchID;
        }
    });

    L.models.NoteBook = Backbone.RelModel.extend({
      url: '/notebook',
      defaults : {
        version: 0
      },
      isNew: function() {
        return false;
      },
      initialize: function() {
        var that = this;
        this.fetch({
          success: function() {
            // Fetch contents.
            _.each(that.relations, _.mask(_.bind(that.fetchRelated, that), 1));
          }
        });
        var debouncedSave = _.debounce(_.bind(that.save, that), 100);
        _.each(that.relations, function(v, k) {
          that.get(k).on('add remove', function(model, collection, options) {
            if (!(options && options.nosave)) {
              debouncedSave();
            }
          });
        });
      },
      relations: {
        notes: {
          type: L.models.NoteCollection,
          includeInJSON: "id"
        },
        deletedNotes: {
          type: L.models.NoteCollection,
          includeInJSON: "id"
        }
      },
      createNote: function(text, meta, window, options) {
        // Strip extra whitespace/cruft.
        text = L.util.strip(text);

        var fromUser = _.pop(options || {}, "user", true);
        var note = new L.models.Note({contents: text, meta: meta || {}}, options);
        var noteJSON = note.toJSON();

        // TODO: This should use a different event
        L.gvent.trigger("note:request:pqrse note:request:parse:new", noteJSON, window);
        note.set(noteJSON);
        note.save();
        this.get('notes').unshift(note, options);
        this.trigger("create", note);
        return note;
      },
      trashNote: function(note) {
          note.moveTo(this.get('deletedNotes'));
          this.trigger("delete", note);
          return note;
      },
      untrashNote: function(note) {
          note.moveTo(this.get('notes'));
          this.trigger("undelete", note);
          return note;
      },
      getNote: function(id) {
          return (this.get('deletedNotes').get(id) || this.get('notes').get(id));
      }
    });
})(ListIt);
