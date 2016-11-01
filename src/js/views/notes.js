(function(L) {
  'use strict';

  function isVisible(view) {
    // This assumes that el having a parent means that it is visible. Much
    // faster than checking $el.is(':visible') and speed is important here.
    return view && view.el && view.el.parentNode;
  }

  L.views.AbstractNoteView = Backbone.View.extend({
    tagName: 'li',
    className: 'note'
  });

  L.views.NoteView = L.views.AbstractNoteView.extend({
    initialize: function(options) {
      var that = this;
      $(window).one('beforeunload', function() {
        that.undelegateEvents();
        that.stopListening();
      });
      this.template = L.templates["note"];
      this.listenTo(this.model, 'change:contents', _.mask(this._updateContents, 2));
      this.listenTo(this.model, 'change:meta', _.mask(this._updateMeta, 2));
    },
    remove: function(options) {
      if (this._rendered) {
        var el = this.$el;
        this.closeEditor();

        if (_.contains(["move", "filter"], (options || {}).action)) {
          el.remove();
        } else {
          // Do not use `slideUp`. We don't want to set `display` here.
          el.stop().animate({
            opacity: 0,
            height: 0
          }, {
            queue: false,
            duration: 200,
            complete: function() {
              el.remove();
            }
          });
        }
      }
    },
    render: function(options) {
      options = options || {};
      if (this._rendered) {
        // Always reset animations on render.
        this.$el.stop().css({
          height: "",
          opacity: ""
        });

        this.delegateEvents();
      } else {
        // The id had better not change..."
        this.$el.prop("id", "note-"+this.model.id);
        this.$el.attr("data-note", this.model.id); // Useful for debugging/matching etc.
        this._rendered = true;
        this.$el.html(this.template(this.model.toJSON()));
        this._updateMeta();
      }

      return this;
    },
    events: {
      'click                  .close-btn'           : '_onRemoveClicked',
      'click                  .contents'            : '_onNoteClicked',
      'click                  .contents a'          : '_onLinkOpen',
      'click                  .contents .listit_tag': '_onTagClicked',
      'focusout               .editor'              : '_onBlur',
      'keydown[shift+return]  .editor'              : '_onCloseTriggered',
      'keydown[ctrl+s]        .editor'              : '_onCloseTriggered',
      'keydown[esc]           .editor'              : '_onCloseTriggered',
      'input                  .editor'              : '_onChange',
      'click                  .pin-icon'            : '_onPinToggle',
      'resize                 .editor'              : '_onResizeEditor',
      'mousedown              .pin-icon'            : function(event){event.preventDefault();}
    },
    expand: function() {
      this.$el.css('height', 'auto');
    },
    collapse: function() {
      this.$el.css('height', '');
    },
    openEditor: function() {
      if (this.editor) {
        return;
      }

      var $contentsEl = this.$('.contents');

      var selection = document.getSelection();
      var text = this.model.get('contents');

      if (selection.rangeCount === 1
          && $contentsEl.html() === text /* should never be false but err on the side of caution */) {
        var range = selection.getRangeAt(0);
        if ($contentsEl.get(0).contains(range.commonAncestorContainer)) {
          // Nice hidden squire feature! Someone should probably document this.
          range.insertNode($('<input id="squire-selection-start" type="hidden">').get(0));
          range.collapse(false /* to end */);
          range.insertNode($('<input id="squire-selection-end" type="hidden">').get(0));
          text = $contentsEl.html();
        }
      }

      this.editor = new ListIt.views.Editor({
        text: text,
        initialHeight: $contentsEl.height()
      });

      $contentsEl.replaceWith(this.editor.render().el);
      this.$el.toggleClass("editing", true);

      this.editor.focus();
      this.model.trigger('user:edit:start', this.model, this);
    },
    _onChange: function() {
      // Constantly auto-save.
      // Do not debounce. This avoids various race-conditions.
      var text = this.editor.getText();
      this.model.changeContents(text, window);
    },
    _onBlur: function() {
      var that = this;
     _.defer(function() {
       if (!document.hasFocus()) {
         return;
       }
       var focusedEditor = $(document.activeElement).closest('.editor').get(0),
           myEditor = that.$('.editor').get(0);

       if (focusedEditor !== myEditor) {
         that.closeEditor();
       }
     });
    },
    closeEditor: function() {
      if (this.editor) {
        var $contentsEl = $('<div class="contents">');
        $contentsEl.html(this.model.get("contents"));
        this.editor.$el.replaceWith($contentsEl);
        this.$el.toggleClass("editing", false);
        this.editor.remove();
        delete this.editor;

        this.model.trigger('user:editor:stop', this.model, this);
      }
    },
    _updateMeta: function(options) {
      this.$el.toggleClass('pinned', !!this.model.get('meta', {}).pinned);
    },
    _updateContents: function(options) {
      var contents = this.model.get('contents', "");
      if (this.editor) {
        if (this.editor.getText() !== contents) {
          this.editor.setText(contents);
        }
      } else {
        this.$(".contents").html();
      }
    },
    _onLinkOpen: function(event) {
      this.model.trigger('user:open-bookmark', this.model, this, event.target.href);
      event.stopPropagation();
    },
    _onRemoveClicked: function() {
      L.notebook.trashNote(this.model);
      // stop jquery click event
      return false;
    },
    _onResizeEditor: function() {
      this.$el.scrollIntoView();
    },
    _onTagClicked: function(event) {
      L.omnibox.tagToggle(event.target.textContent);
      // stop jquery click event
      return false;
    },
    _onCloseTriggered: function(e) {
      if (this.editor) {
        e.preventDefault();
        this.closeEditor();
      }
    },
    _onNoteClicked: function(e) {
      this.expand();
      this.openEditor();
    },
    _onPinToggle: function(event) {
      var meta = _.clone(this.model.get("meta"));
      meta.pinned = !meta.pinned;
      this.model.set("meta", meta);
      this.model.save();
    }
  });

  L.views.NoteCollectionView = Backbone.View.extend({
    tagName: "div",
    className: "notes",
    initialize: function(options) {
      var that = this;

      // Allow overriding the note view.
      this.noteView = options.noteView || L.views.NoteView;

      this.subViews = {}; // Note views
      this.renderNext = 0;

      this.listenTo(this.collection, 'add', _.mask(this._onAdd, 0));
      this.listenTo(this.collection, 'remove', _.mask(this._onRemove, 0, 2));
      this.listenTo(this.collection, 'reset', _.mask(this.reset, 1));
      this.listenTo(this.collection, 'sort', _.mask(this.sort));
      this.listenTo(L.preferences, 'change:shrinkNotes', _.mask(this.setShrinkNotes, 1));
      this.listenTo(this.collection, 'change:searchFail', _.mask(this.setSearchFailed, 1));

      $(window).one('beforeunload', function() {
        that.undelegateEvents();
        that.stopListening();
      });

      // Load more if needed on window resize.
      $(window).on("resize", function() {
        if (that._rendered) {
          that._lazyLoadMore();
        }
      });
    },
    events: {
      'scroll': '_onScroll',
    },
    sort: _.debounce(function() {
      var that = this;
      this.collection.each(function(note, i) {
        var view = that.subViews[note.id];
        if (view) {
          view.remove();
          that._insertAt(i, view);
        }
      });
    }, 100),
    reset: function() {
      this.renderNext = 0;
      if (this._rendered) {
        this.$notelist.empty();
        this.collection.every(_.mask(_.bind(this._onAdd, this), 0, 1));
        // Why does lazyLoadMore not work here??? It calls lazyLoadMore but
        // nothing happens. It works from the console!?!?!?!?! It doesn't even
        // work if I delay it by *seconds*!!! WHY???? WTF!!!
        this._loadMore();
      }
    },
    render: function() {
      if (!this._rendered) {
        this.$notelist = $('<ul class="notelist">');
        this.$el.append(this.$notelist);
        var collection = this.collection.backingCollection;

        // Prevent clicks from getting triggered when sorting.
        var sorting = false;
        this.$el.get(0).addEventListener("click", function(e) {
          if (sorting) {
            e.stopImmediatePropagation();
          }
        }, true);

        var current;
        var height;
        this.$notelist.sortable({
          distance: 10,
          items: '.note:not(.pinned):not(.editing)',
          containment: 'parent',
          handle: '.pin-icon',
          tolerance: 'intersect',
          revert: 100,
          start: function(event, ui) {
            sorting = true;
            height = ui.item.height();
            ui.placeholder.css({ 'height': 2, 'top': height/2+1 });
            current = ui.placeholder.nextAll(':not(.ui-sortable-helper)').first();
            current.css('margin-top', height);
          },
          change: function(event, ui) {
            current.stop(true).animate({'margin-top': 2}, 100);
            current = ui.placeholder.nextAll(':not(.ui-sortable-helper)').first();
            current.stop(true).animate({'margin-top': height}, 100);
          },
          stop: function(event, ui) {
            current.css('margin-top', 2);
            var noteId = ui.item.attr('data-note');
            var previousId = ui.item.prev().attr('data-note');
            var note = collection.get(noteId);
            collection.remove(note, {action: "move"});
            var insertIndex;
            if (previousId) {
              insertIndex = collection.indexOf(collection.get(previousId))+1;
            } else {
              insertIndex = 0;
            }
            collection.add(note, {at: insertIndex, action: "move"});

            // This needs to be set after the click event has been triggered.
            _.defer(function() { sorting = false; });
          }
        });

        this._rendered = true;
        this.setShrinkNotes(L.preferences.get('shrinkNotes'));
        this.setSearchFailed(this.collection.searchFail);
      }
      _.defer(_.bind(this.reset, this));
      return this;
    },
    setSearchFailed : function(state) {
      if (!this._rendered) {
        return;
      }

      this.$el.toggleClass('search-failed', state);
    },
    setShrinkNotes : function(state) {
      if (!this._rendered) {
        return;
      }
      this.$el.toggleClass('shrink', state);
    },
    _onScroll: function() {
      // Load on scroll.
      this._loadMore();
    },
    _loadMore: function() {
      var view, note;
      while (this.collection.size() > this.renderNext && this._shouldRenderAt(this.renderNext)) {
        note = this.collection.at(this.renderNext);
        view = this.subViews[note.id];
        if (!view) {
          view = this.subViews[note.id] = new this.noteView({model: note});
        }
        if (!isVisible(view)) {
          this._insertAt(this.renderNext, view);
        }
        this.renderNext += 1;
      }
    },
    _lazyLoadMore: _.debounce(function() {
      return this._loadMore();
    }, 100),
    _shouldRenderAt: function(index) {
      // This is on a hot path. Keep it as fast as possible.
      var scrollTop = this.el.scrollTop,
          containerHeight = this.el.clientHeight,
          notes = this.$notelist.children(),
          noteOffset;
      if (notes.length > index) {
        noteOffset = notes.eq(index)[0].offsetTop;
      } else if (notes.length > 0) {
        noteOffset = notes.last()[0].offsetTop;
      } else {
        noteOffset = 0;
      }
      return (scrollTop + 2*containerHeight) > noteOffset;
    },
    _lazyRefreshSortable: _.debounce(function() {
      this.$notelist.sortable('refresh');
    }, 10),
    _onAdd: function(note, idx) {
      var view = this.subViews[note.id];

      // Ignore already visible/unrendered
      if (!this._rendered || isVisible(view)) {
        return;
      }

      // Get the index but allow it to be specified manually.
      var index = (typeof(idx) === "number") ? idx : this.collection.indexOf(note);

      if (this._shouldRenderAt(index)) {
        if (!view) {
          view = this.subViews[note.id] = new this.noteView({model: note});
        }
        this._insertAt(index, view);
        if (index < this.renderNext) {
          this.renderNext += 1;
        }
        this._fixHeight();
      } else if (index < this.renderNext) {
        // If I choose not to render, fix the render next index.
        this.renderNext = index;
      }
    },
    _insertAt: function(index, view) {
      var otherEl = this.$notelist.find('.note').eq(index);
      if (otherEl.length === 0) {
        this.$notelist.append(view.render().$el);
      } else {
        otherEl.before(view.render().$el);
      }
      this._lazyRefreshSortable();
    },
    _onRemove: function(note, options) {
      var id = note.id || note,
          view = this.subViews[id];

      this._fixHeight();
      if (!view || !this._rendered) {
        return;
      }

      if (0 < this.$notelist.children('.note').index(view.$el) < this.renderNext) {
        this.renderNext--;
      }


      view.remove(options);
      this._lazyLoadMore();
    },
    _fixHeight: _.throttle(function() {
      this.$notelist.css("min-height", 36*this.collection.size());
    }, 100)
  });

})(ListIt);
