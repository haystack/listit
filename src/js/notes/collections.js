(function(L) {
    'use strict';
    L.make.notes.NoteCollection = Backbone.Collection.extend({
        model: L.make.notes.NoteModel,
        slice: function(a, b) {
            return this.models.slice(a, b);
        },
        // Reorder contents by list of ids
        setOrder: function(new_order, options) {
            options || (options = {});
            var order_map = {},
                that = this;

            _.each(new_order, function(v,i) {
                order_map[v] = i;
            });
            var pos_counter = 0;
            var append_offset = this.models.length;
            this.models = this.sortBy(function(note) {
                var pos = order_map[note.id];
                // Put the note at the beginning if position unknown.
                if (pos === undefined) {
                    return pos_counter++;
                } else {
                    return pos + append_offset;
                }
            });

          if (!options.silent) this.trigger('reset', this, options);
        },
        getOrder: function() {
            return this.pluck("id");
        },
    });

    // Note. This collection must never contain notes that don't exist in in
    // the notebook.  This shouldn't be a problem in bug-free code but search
    // assumes this (to reduce flickering).
    L.make.notes.FilterableNoteCollection = L.make.notes.NoteCollection.extend({
        initialize : function() {
            _(this).bindAll();
            this.searchQueue = new ActionQueue(50);
            this.searchQueue.start();
            this.backingCollection = L.notebook.get('notes');
            this.backingCollection.on('add', this.maybeAddNew, this);
            this.backingCollection.on('remove', this._onRemove, this);
            this.backingCollection.on('reset', _.mask(this.reset), this);
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

            _.each(this.backingCollection.slice(start, end), function(n) {
                that.searchQueue.add(function() {
                    if (that.matcher(n)) {
                        that.add(n);
                    }
                });
            });
            this.searchQueue.add(function() {
                that.searching = false;
            });

            lastNote = this.backingCollection.at(end);
            if (lastNote) {
                this._lastSearchedNoteId = lastNote.id;
                this.searchQueue.add(this.trigger, 'search:paused');
            } else {
                lastNote = this.backingCollection.last();
                this._lastSearchedNoteId = lastNote ? lastNote.id : undefined;
                this.searchQueue.add(this.trigger, 'search:completed');
            }
        }
    });
})(ListIt);
