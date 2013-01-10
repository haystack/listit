/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false, ActionQueue: true*/

(function(L) {
    'use strict';
    L.make.notes.NoteModel = Backbone.RelationalModel.extend({
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
            L.vent.trigger('note:request:parse', note, window);
            L.vent.trigger('note:request:parse:changed', note, window);
            this.set(note);
            this.save();
        },
        merge: function(attrs) {
          // Merge metadata
          this.set("meta", _.defaults(_.clone(this.get('meta')), attrs.meta), {silent: true});

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
          this.set('contents', newContents, {silent: true});
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

    L.make.notes.NoteBook = Backbone.RelationalModel.extend({
      url: '/notebook',
      defaults : {
        version: 0
      },
      isNew: function() {
        return false;
      },
      initialize: function() {
        var that = this;
        this.on('add remove', function(model, col, options) {
            if (!(options && options.nosave)) {
                that.save();
            }
        });
        // FIXME: Get rid of this with magic note?
        this.get('notes').comparator = function(note) {
          return -((note.get('meta').pinned ? Number.MAX_VALUE : 0) + note.get('created'));
        };

        // Fetch contents.
        this.fetch();
        _.each(this.getRelations(), function(r) {
         that.fetchRelated(r.key);
        });
      },
      relations: [{
        type: Backbone.HasMany,
        key: 'deletedNotes',
        relatedModel: L.make.notes.NoteModel,
        collectionType: 'ListIt.make.notes.NoteCollection',
        includeInJSON: 'id'
      }, {
        type: Backbone.HasMany,
        key: 'notes',
        collectionType: 'ListIt.make.notes.NoteCollection',
        relatedModel: L.make.notes.NoteModel,
        includeInJSON: 'id'
      }],
      addNote: function(text, meta, window) {
          var note = new L.make.notes.NoteModel({contents: text}),
          noteJSON = note.toJSON();

          noteJSON.meta = meta || {};
          window.ListIt.vent.trigger('note:request:parse', noteJSON, window);
          window.ListIt.vent.trigger('note:request:parse:new', noteJSON, window);
          note.set(noteJSON);
          this.get('notes').add(note, {action: 'add'});
          note.save();
      },
      getNote: function(id) {
          return (this.get('deletedNotes').get(id) || this.get('notes').get(id));
      }
    });
})(ListIt);
