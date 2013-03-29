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
        changeContents: function(newContents) {
            var note = this.toJSON();
            note.contents = newContents;
            L.gvent.trigger('note:request:parse', note, window);
            L.gvent.trigger('note:request:parse:changed', note, window);
            this.set(note);
            this.save();
        },
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
            this.backingCollection = L.notebook.get('notes');
            this.listenTo(this.backingCollection, 'add', this.maybeAddNew);
            this.listenTo(this.backingCollection, 'remove', this._onRemove);
            this.listenTo(this.backingCollection, 'reset', _.mask(this.reset));
            this.listenTo(this.backingCollection, 'sort', _.mask(this.sort));
            this.on('reset', this._onReset, this);
        },
        _offset: 10,
        _onRemove: function(note, notes, options) {
            if (note.id === this._lastSearchedNoteId) {
                var n = this.backingCollection.at(this.backingCollection.indexOf(this._lastSearchedNoteId)-1);
                this._lastSearchedNoteId = n ? n.id : undefined;
            }
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
        search: function(text, options) {
            // Extract the terms
            var newTerms = L.util.extractTerms(text);

            // Don't search if the terms haven't changed.
            if (_.isEqual(this._terms, newTerms)) {
                return;
            }

            this._terms = newTerms;
            this.reset();
        },
        _onReset: function() {
            delete this._lastSearchedNoteId;
            this.searching = false;
            this.searchQueue.clear();
            this.next();
        },
        next: function(num) {
            var start, end, lastNote,
                that = this;

            // Don't allow next to be called while searching
            // Prevents bug where multiple views call next.
            if (this.searching) {
                return false;
            } else {
                this.searching = true;
            }

            num = num ? num : this._offset;

            if (this._lastSearchedNoteId) {
                lastNote = this.backingCollection.last();

                // Return if there are no notes to search or at end
                if (!lastNote || this._lastSearchedNoteId === lastNote.id) {
                    return;
                }

                start = this.backingCollection.indexOf(this.backingCollection.get(this._lastSearchedNoteId));
            } else {
                start = 0;
            }

            end = start+num;

            _.each(this.backingCollection.slice(start, end+1), function(n) {
                that.searchQueue.add(function() {
                    if (that.matcher(n)) {
                        // In order (or close enough), don't sort.
                        that.add(n, {sort: false});
                    }
                });
            });
            this.searchQueue.add(function() {
                that.searching = false;
            });

            lastNote = this.backingCollection.at(end);
            if (lastNote) {
                this._lastSearchedNoteId = lastNote.id;
                this.searchQueue.add(_.bind(this.trigger, this, 'search:paused'));
            } else {
                lastNote = this.backingCollection.last();
                this._lastSearchedNoteId = lastNote ? lastNote.id : undefined;
                this.searchQueue.add(_.bind(this.trigger, this, 'search:completed'));
            }
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
      addNote: function(text, meta, window) {
          // Strip extra whitespace/cruft.
          text = L.util.strip(text);

          var note = new L.models.Note({contents: text}),
          noteJSON = note.toJSON();

          noteJSON.meta = meta || {};
          L.gvent.trigger('note:request:parse', noteJSON, window);
          L.gvent.trigger('note:request:parse:new', noteJSON, window);
          note.set(noteJSON);
          this.get('notes').unshift(note, {action: 'add'});
          note.save();
          return note;
      },
      getNote: function(id) {
          return (this.get('deletedNotes').get(id) || this.get('notes').get(id));
      }
    });
})(ListIt);
