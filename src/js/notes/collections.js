(function(L) {
    'use strict';
    /**
    * @filedesc Collection of Notes
    * Design: One collection, has all notes,
    * one view of it shows pinned notes
    * second view shows normal notes.
    * Each view responsible for creating/placing note's view.
    *
    * @author: wstyke@gmail.com - Wolfe Styke
    */

    L.make.notes.BaseNoteCollection = Backbone.Collection.extend({
        model: L.make.notes.NoteModel,
        slice: function(a, b) {
            return this.models.slice(a, b);
        }
    });

    L.make.notes.StoredNoteCollection = L.make.notes.BaseNoteCollection.extend({
        initialize: function(models, options) {
            if (options.url) {
                this.url = options.url;
            }
            this.fetch();
            this.on('add', this.saveOnAdd, this);
            this.on('add remove', function(model, col, options) {
                if (!(options && options.nosave)) {
                    col.save();
                }
            });
        },
        comparator : function(note) {
            return -((note.get('meta').pinned ? Number.MAX_VALUE : 0) + note.get('created'));
        },
        saveOnAdd : function(note) {
            // Ignore nosave (that only applies to the collection
                note.save();
        },
        update: function(notes) {
            var that = this;
            _.each(notes, function(note) {
                var myNote = that.get(note.id);
                if (!myNote) {
                    throw new Error('Can\'t update non-existant note.', note);
                }

                if (!myNote.set(note)) {
                    throw new Error('Note failed to validate', myNote, note);
                }

                myNote.save();
            });
        }
    });

    // Note. This collection must never contain notes that don't exist in L.notes.
    // This shouldn't be a problem in bug-free code but search assumes this (to
        // reduce flickering).
        L.make.notes.FilterableNoteCollection = L.make.notes.BaseNoteCollection.extend({
            initialize : function() {
                _(this).bindAll();
                this.searchQueue = new ActionQueue(50);
                this.searchQueue.start();
                L.notes.on('add', this.maybeAddNew, this);
                L.notes.on('remove', this._onRemove, this);
                L.notes.on('reset', _.mask(this.reset), this);
                this.on('reset', this._onReset, this);
            },
            _offset: 10,
            /*
            comparator : function(note) {
            return -((note.get('meta').pinned ? Number.MAX_VALUE : 0) + note.get('created'));
            },
            */
            _onRemove: function(note, notes, options) {
                if (note.id === this._lastSearchedNoteId) {
                    var n = L.notes.at(L.notes.indexOf(this._lastSearchedNoteId)-1);
                    this._lastSearchedNoteId = n ? n.id : undefined;
                }
                this.remove(note, options);
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
                    lastNote = L.notes.last();

                    // Return if there are no notes to search or at end
                    if (!lastNote || this._lastSearchedNoteId === lastNote.id) {
                        return;
                    }

                    start = L.notes.indexOf(L.notes.get(this._lastSearchedNoteId));
                } else {
                    start = 0;
                }

                end = start+num;

                _.each(L.notes.slice(start, end), function(n) {
                    that.searchQueue.add(function() {
                        if (that.matcher(n)) {
                            that.add(n);
                        }
                    });
                });
                this.searchQueue.add(function() {
                    that.searching = false;
                });

                lastNote = L.notes.at(end);
                if (lastNote) {
                    this._lastSearchedNoteId = lastNote.id;
                    this.searchQueue.add(this.trigger, 'search:paused');
                } else {
                    this._lastSearchedNoteId = L.notes.last().id;
                    this.searchQueue.add(this.trigger, 'search:completed');
                }
            }
        });
})(ListIt);
