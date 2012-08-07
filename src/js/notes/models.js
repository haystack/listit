/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false, ActionQueue: true*/

(function(L) {
    'use strict';
    L.make.notes.NoteModel = Backbone.Model.extend({
        urlRoot: '/note',
        defaults: function() {
            var now = Date.now();
            return {
                contents: '',
                meta: {},
                version: 0,
                modified: true,
                id: now,
                created: now
            };
        },
        initialize: function() {
            _(this).bindAll();
            this.on('change:contents change:meta', this._onChange, this);
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
            L.vent.trigger('note:request:parse', note, window);
            L.vent.trigger('note:request:parse:changed', note, window);
            this.set(note);
            this.save();
        },
        moveTo: function(collection, options) {
            if (collection === this.collection) {
                return;
            }

            this.collection.remove(this, options);
            collection.add(this, options);
            this.set('modified', true, options);
            if (!(options && options.nosave)) {
                this.save();
            }
        }
    });
})(ListIt);
