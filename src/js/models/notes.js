/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false, ActionQueue: true*/

(function(L) {
  'use strict';
  /**
   * Stores a single note.
   **/
  L.models.Note = Backbone.Model.extend({
    urlRoot: '/note',
    defaults: function() {
      return {
        contents: '',
        meta: {},
        version: 0,
        modified: true,
        id: Math.ceil(Math.random()*2147483647), // must be an int32.
        created: Date.now(),
        edited: Date.now()
      };
    },
    initialize: function() {
      this.on('error', function(n, e, o) {
        error('Note storage failure', n, e, o);
      });
    },
    initialized: function() {
      this.on('change:contents change:meta', _.bind(this._onChange, this), this);
    },
    _onChange: function(model, value, options) {
      // Allow setting without marking the note as modified.
      // Also, don't set modified on fetch.
      // TODO: the fetching part shouldn't be necessary, don't add
      // partially fetched notes to the collection!
      if (!(options && (options.fetching || options.nomodify))) {
        this.set({ 'modified': true });
      }
    },
    /**
     * Change the contents of a note and trigger parse events.
     *
     * @param {String} newContents New note contents
     * @param {Window} window The window from which this note was changed (optional)
     *
     **/
    changeContents: function(newContents, window) {
      var noteJSON = _.kmap(this.toJSON(), _.clone);
      noteJSON.contents = newContents;
      // TODO: This should use a different event
      L.gvent.trigger("note:request:parse note:request:parse:change", noteJSON, window);
      noteJSON.edited = Date.now();
      this.set(noteJSON);
      this.save();
    },
    /**
     * Merge a new note with this one.
     *
     * @param {Object} attrs The new note's attributes
     *
     * Merge strategy:
     *
     *   ( old &&  new) && (old == new) -> new
     *   ( old &&  new) && (old != new) -> old + new
     *   ( old && !new)                 -> old
     *   (!old &&  new)                 -> new
     **/
    merge: function(attrs) {
      var newContents;
      var oldContents = this.get('contents');
      if (oldContents && _.str.trim(oldContents).length > 0) {
        if (attrs.contents && _.str.trim(attrs.contents).length > 0) {
          if (_.str.trim(attrs.contents) === _.str.trim(oldContents)) {
            newContents = attrs.contents;
          } else {
            newContents = attrs.contents + '<br/>--<br/>' + oldContents;
          }
        } else {
          newContents = oldContents;
        }
      } else {
        newContents = attrs.contents;
      }
      this.set({
        'meta': _.defaults({}, this.get('meta'), attrs.meta),
        'contents': newContents,
        'edited': Math.max(attrs.edited, this.get('edited')),
        'version': attrs.version
      });
    },
    /**
     * Move this note from it's current collection to a new one.
     *
     * @param {Backbone.Collection} collection The destination collection.
     * @param {Object} [options] Options
     **/
    moveTo: function(collection, options) {
      if (collection === this.collection) {
        return;
      }

      this.collection.remove(this, options);
      collection.unshift(this, options);
      if (!(options && options.nomodify)) {
        this.set('modified', true, options);
      }
      if (!(options && options.nosave)) {
        this.save();
      }
    }
  });

  L.models.NoteCollection = Backbone.Collection.extend({
    model: L.models.Note,
    /**
     * Reorder contents by list of IDs
     *
     * @param {Array<int>} newOrder A list of note IDs
     * @param {Object} [options]
     **/
    setOrder: function(newOrder, options) {
      options = options || {};
      var orderMap = _.kmap(_.invert(newOrder), _.mask(parseInt, 0)),
          posCounter = 0,
      appendOffset = this.models.length;
      this.models = _.sortBy(this.models, function(note) {
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
    // Reinsert a note in it's sorted position
    reinsert: function(note) {
      this.remove(note);
      var idx = this.sortedIndex(note);
      this.add(note, {at: idx});
    },
    /**
     * Get the list of in-order note IDs.
     *
     * @return {Array} Returns an Array of note IDs
     **/
    getOrder: function() {
      return this.pluck("id");
    }
  });

  // Note. This collection must never contain notes that don't exist in in
  // the notebook.  This shouldn't be a problem in bug-free code but search
  // assumes this (to reduce flickering).
  L.models.FilterableNoteCollection = L.models.NoteCollection.extend({
    initialize : function(attrs, options) {
      _.bindAll(this, "comparator");
      this.searchQueue = new ActionQueue(50);
      this.searchQueue.start();
      this._searchCursor = 0;
      this.backingCollection = options.track;
      this.listenTo(this.backingCollection, 'add', this._onAdd);
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
      // Add notes if they change to match the current terms. Do not remove
      // notes as this could be annoying.
      this.listenTo(this.backingCollection, 'change', function(note) {
        if (!this.contains(note)) {
          this._onAdd(note);
        }
      });
      this.reset();
      this.searchFail = false;
    },
    _chunk: 10,
    _onRemove: function(note, notes, options) {
      this.remove(note, options);
    },
    comparator: function(note) {
      // Backbone checks the number of arguments (1 = absolute, 2 = compare)
      // Underscore passes an extra argument (the index in the underlying
      // list). The note must be before this index in the filtered list.
      var val = -1;
      if (typeof(arguments[1]) === "number") {
        val = this.backingCollection.lastIndexOf(note, arguments[1]+1);
      }
      if (val < 0) {
        val = this.backingCollection.indexOf(note);
      }
      return val;
    },
    /**
     * Add note iff it matches the current search terms.
     *
     * @param {LisIt.models.Note} note The note to consider adding.
     **/
    _onAdd: function(note) {
      if (this.searchFail) {
        if (this.matcher(note)) {
          // Refilter
          if (!this.searching) {
            this._filter(this._terms);
            return;
          }
          this.searchFail = false;
          this.trigger('change:searchFail', this, this.searchFail);
        }
      } else if (!this.matcher(note)) {
        return;
      }
      // Avoid sorting.
      var idx = this.sortedIndex(note);

      if (idx >= 0) {
        this.add(note, {sort: false, at: idx});
      } else {
        // This should never happen but check anyways.
        debug("WTF");
        this.add(note);
      }
    },
    /**
     * Check if a note matches the current search terms.
     *
     * @param {ListIt.models.Note} note The note to test
     *
     * @return {boolean} Returns true iff the note matches the terms.
     **/
    matcher: function(note) {
      if (!this._terms) {
        return true;
      }
      var text = L.util.clean(note.get('contents').toLowerCase());
      return L.util.matchTerms(this._terms, text);
    },
    /**
     * Filter the list by the given search terms (as text).
     *
     * @param{String} text the search terms as text (Ex: "search for this but -not -this")
     *
     * @return {int} Returns a unique ID representing this search.
     **/
    search: function(text) {
      // Extract the terms
      var newTerms = L.util.extractTerms(text);

      // Don't search if the terms haven't changed.
      if (_.isEqual(this._terms, newTerms)) {
        return this.searchID;
      }
      return this._filter(newTerms);
    },
    /**
     * Given the parsed search terms, perform the actual search.
     **/
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

      var matched = false;
      this.backingCollection.each(function (note, index) {
        that.searchQueue.add(function() {
          if (that.matcher(note)) {
            if(!matched) {
              matched = true;
              if (that.searchFail) {
                that.searchFail = false;
                that.trigger('change:searchFail', that, that.searchFail);
              }
              that.remove(that.backingCollection.slice(0,index), {filtered: true});
            }
            that.add(note, {at: that._searchCursor, sort: false});
            that._searchCursor++;
          } else if (matched) {
            that.remove(note, {filtered: true});
          }
        });
      });

      this.searchQueue.add(function() {
        that.searching = false;
        debug('search::end');
        // Use boolean because that.searchFail may not be set
        if (Boolean(that.searchFail) === matched) {
          that.searchFail = !that.searchFail;
          that.trigger('change:searchFail', that, that.searchFail);
        }
        if (that.searchFail) {
          that.trigger('search:fail search:end', that._terms, that.searchID);
        } else {
          that.trigger('search:complete search:end', that._terms, that.searchID);
        }
      });

      return this.searchID;
    }
  });

  L.models.NoteBook = Backbone.RelModel.extend({
    url: '/notebook',
    autoFetch: true,
    autoFetchRelated: true,
    defaults: function(){
      return {
        version: 0,
        toBeDestroyed: {}
      };
    },
    isNew: function() {
      return false;
    },
    initialize: function() {
      var that = this;
      // Start saving immediately after loading before fetching related.
      this.once('sync error', function() {
        // Perform an initial flush to save any changes that might have occured
        // durring fetch.
        that.save();
        _.each(that.relations, function(v, k) {
          that.listenTo(that.get(k), 'add remove', function(model, collection, options) {
            if (!(options && options.nosave)) {
              that.save();
            }
          });
        });
      });
    },
    initialized: function() {
      // No need to add this early.
      // Ensures that pinned notes go on top.
      this.get('notes').comparator = function(note) {
        return (note.get('meta') || {}).pinned ? 0 : 1;
      };

      // Re-insert note on pinned change.
      this.listenTo(this.get('notes'), 'change:meta', function(note, meta) {
        var pMeta = note.previous('meta');
        // pinned may be undefined etc.
        if (Boolean(meta.pinned) !== Boolean(pMeta.pinned)) {
          _.defer(function() {
            note.collection.reinsert(note);
          });
        }
      });
    },
    /**
     * Import notes
     *
     * @param{String} string The contents of the file to import.
     * @param{String} type The type of file stored in string.
     *
     * @exception {Error} Throws "Invalid Importer" if the type cannot be imported.
     *
     **/
    importString: function(string, type) {
      if (!_.has(this.importers, type)) {
        throw new Error("Invalid Importer");
      }
      var json = this.importers[type].importer(string);
      if (json.notes) {
        var notes = this.get('notes');
        _.each(json.notes, function(note) {
          note.modified = true;
          notes.create(note);
        });
      }
      if (json.deletedNotes) {
        var deletedNotes = this.get('deletedNotes');
        _.each(json.deletedNotes, function(note) {
          note.modified = true;
          deletedNotes.create(note);
        });
      }
    },
    /**
     * Export notes
     *
     * @param {String} type The type to which to export
     *
     * @exception {Error} Throws "Invalid Exporter" if type cannot be exported.
     * @return {String} Returns the exported notes in the requested format (type).
     *
     **/
    exportString: function(type) {
      if (!_.has(this.exporters, type)) {
        throw new Error("Invalid Exporter");
      }
      return this.exporters[type].exporter(L.notebook);
    },
    /**
     * The exporters. These should be of the form:
     *   <type>: {
     *     display: '<display name>',
     *     exporter: function(<notebook instance>) -> @type{String}
     *   }
     **/
    exporters: {
      json: {
        display: 'JSON',
        exporter: function(notebook) {
          return JSON.stringify(notebook.toJSON({include: true}));
        }
      },
      txt: {
        display : 'Text',
        exporter: function(notebook) {
          return notebook.get('notes').reduce(function(txt, n) {
            return txt + '* ' + L.util.clean(n.get('contents')).replace(/\n/g, '\n  ') + '\n';
          }, '');
        }
      },
      html: {
        display : 'HTML',
        exporter: function(notebook) {
          return L.templates['exported-notes']({
            noteContents: notebook.get('notes').map(function(n) {
              return L.util.metaJoin(n.get("contents"), n.get("meta"));
            })
          });
        }
      },
      csv: {
        display : 'CSV',
        exporter: function(notebook) {
          var noteArray=[];
          noteArray.push(["Contents","Deleted","ID","Version","Created","Edited","Meta"]);
          var convertCSV = function(isDeleted, n) {
            return [_.str.q(n.get('contents').replace(/"/g, '""')),
              isDeleted,
              n.get('id'),
              n.get('version'),
              new Date(n.get('created')),
              new Date(n.get('edited')),
              _.str.q(JSON.stringify(n.get('meta')).replace(/"/g, '""'))];
          };
          noteArray.push.apply(noteArray, notebook.get('notes').map(_.partial(convertCSV, false)));
          noteArray.push.apply(noteArray, notebook.get('deletedNotes').map(_.partial(convertCSV, true)));
          return noteArray.join('\n') + '\n';
        }
      }
    },
    importers: {
      json: {
        display: 'JSON',
        importer : function(string) {
          return JSON.parse(string);
        }
      },
      txt: {
        display: 'Text',
        importer: function(string) {
          string = _.str.trim(string);
          var noteStrings;
          var bullet = string[0];
          if ("*-+".indexOf(bullet) >= 0) {
            string = string.replace(/\n\s*/g, '\n'); // TODO to greedy
            string = string.replace(new RegExp("^\\"+bullet+"\\s*"), ""); // Strip first
            noteStrings = string.split(new RegExp("\n\\s*\\"+bullet+"\\s*"));
            noteStrings = _.map(noteStrings, function(str) {
              return str.replace(/\n/g, '<br />');
            });
          } else {
            noteStrings = string.split('\n');
          }

          return {
            notes: _.map(noteStrings, function(noteString) {
              return {contents: noteString};
            })
          };
        }
      }
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
    createNote: function(obj, window, options) {
      var notes = this.get('notes');
      var note = new L.models.Note(obj, options);

      // Metadata
      var noteJSON = note.toJSON();
      // TODO: This should use a different event
      // TODO: Move this into the collection. Call when NEW (unsaved) note is added.
      L.gvent.trigger("note:request:parse note:request:parse:new", noteJSON, window);
      note.set(noteJSON);
      note.save();

      // Gets first insertable position (will add to top).
      // Insert
      var idx = notes.sortedIndex(note);
      notes.add(note, {at: idx});
      this.trigger("create", note);
      return note;
    },
    trashNote: function(note, options) {
      note.moveTo(this.get('deletedNotes'), options);
      this.trigger("delete", note, options);
      return note;
    },
    untrashNote: function(note, options) {
      note.moveTo(this.get('notes'), options);
      this.trigger("undelete", note, options);
      return note;
    },
    destroyNote: function(note, options) {
      var toBeDestroyed = this.get('toBeDestroyed');
      toBeDestroyed[note.id] = note.get('version');
      // Needed to trigger change events.
      this.set('toBeDestroyed', toBeDestroyed);
      note.collection.remove(note, options);
      note.destroy(options);
    },
    getNote: function(id) {
      return (this.get('deletedNotes').get(id) || this.get('notes').get(id));
    }
  });
})(ListIt);
