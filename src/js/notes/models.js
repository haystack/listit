/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false, ActionQueue: true*/

(function(L) {
    'use strict';
    L.make.notes.NoteModel = Backbone.Model.extend({
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
        merge: function(attrs) {
          // Merge metadata
          this.set("meta", _.defaults(_.clone(this.get('meta')), attrs.meta), {silent: true});

          // Merge contents
          var new_contents;
          var old_contents = this.get('contents');
          if (old_contents && _.str.trim(old_contents).length > 0) {
            if (attrs.contents && _.str.trim(attrs.contents).length > 0) {
              new_contents = attrs.contents + '\n--\n' + old_contents;
            } else {
              new_contents = old_contents;
            }
          } else {
            new_contents = old_contents;
          }
          this.set('contents', new_contents, {silent: true});
          this.set('edited', Math.max(attrs.edited, this.get('edited')), {silent: true});
          this.set('version', attrs.version, {silent: true});
          this.change();
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
