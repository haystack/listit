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
      $(window).one('beforeunload', function() {
        this.undelegateEvents();
        this.stopListening();
      }.bind(this));
      this.template = L.templates["note"];
      this.listenTo(this.model, 'change:contents', _.mask(this._updateContents, 2));
      this.listenTo(this.model, 'change:meta', _.mask(this._updateMeta, 2));
    },
    id: function() {
      return "note-"+this.model.id;
    },
    attributes: function() {
      return { "data-note": this.model.id };
    },
    isEditing: function(options) {
      return this.$el.hasClass("editing");
    },
    remove: function(options) {
      if (this._rendered) {
        this._rendered = false;
        var el = this.$el;
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
              this.editor.remove();
              el.remove();
            }.bind(this)
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
        this._rendered = true;

        this.$el.html(this.template());
        this.editor = new ListIt.views.Editor({
          text: this.model.get("contents"),
          spellcheck: false
        });
        this.$(".note-body").append(this.editor.render().el);
        this.editor.undelegateEvents();
        this.editor.delegateEvents();
        this._updateMeta();
      }

      return this;
    },
    events: {
      'click           .close-btn'             : '_onRemoveClicked',
      'mousedown       .note-body a'           : '_swallowIfNotEditing',
      'mousedown       .note-body .listit_tag' : '_swallowIfNotEditing',
      'click           .note-body a'           : '_onLinkOpen',
      'click           .note-body .listit_tag' : '_onTagClicked',
      'focusin         .editor'                : '_onFocusIn',
      'focusout'                               : '_onFocusOut',
      'keydown[ctrl+s] .editor'                : 'blur',
      'keydown[esc]    .editor'                : 'blur',
      'input           .editor'                : '_onChange',
      'resize          .editor'                : '_onResizeEditor'
    },
    blur: function() {
      this.editor.blur();
    },
    _swallowIfNotEditing(event) {
      if (this.isEditing()) {
        return;
      }
      event.preventDefault();
    },
    _onLinkOpen: function(event) {
      if (this.isEditing()) {
        return;
      }
      this.model.trigger('user:open-bookmark', this.model, this, event.target.href);
      // It's a content-editable so we need to manually open links.
      window.open(event.target.href);
      event.stopPropagation();
      event.preventDefault();
    },
    _onTagClicked: function(event) {
      if (this.isEditing()) {
        return;
      }
      L.omnibox.tagToggle(event.target.textContent);
      // stop jquery click event
      event.stopPropagation();
      event.preventDefault();
    },
    _onChange: function() {
      // Constantly auto-save.
      // Do not debounce. This avoids various race-conditions.
      var text = this.editor.getText();
      this.model.changeContents(text, window);
    },
    _onFocusOut: function() {
      _.defer(function() {
        if (!jQuery.contains(this.$el.get(0), document.activeElement)) {
          this.$el.toggleClass("editing", false);
          this.editor.spellcheck(false);
        }
      }.bind(this));
    },
    _onFocusIn: function(e) {
      this.$el.toggleClass("editing", true);
      this.editor.spellcheck(true);
    },
    _updateMeta: function(options) {
      this.$el.toggleClass('pinned', !!this.model.get('meta', {}).pinned);
    },
    _updateContents: function(options) {
      var contents = this.model.get('contents', "");
      if (this.editor.getText() !== contents) {
        this.editor.setText(contents);
      }
    },
    _onRemoveClicked: function() {
      L.notebook.trashNote(this.model);
      // stop jquery click event
      return false;
    },
    _onResizeEditor: function() {
      this.$el.scrollIntoView();
    }
  });

  L.views.NoteCollectionView = Backbone.View.extend({
    tagName: "div",
    className: "notes",
    initialize: function(options) {
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
        this.undelegateEvents();
        this.stopListening();
      }.bind(this));

      // Load more if needed on window resize.
      $(window).on("resize", function() {
        if (this._rendered) {
          this._lazyLoadMore();
        }
      }.bind(this));
    },
    events: {
      'scroll': '_onScroll'
    },
    sort: _.debounce(function() {
      this.collection.each(function(note, i) {
        var view = this.subViews[note.id];
        if (view && !view.isEditing()) {
          view.remove();
          this._insertAt(i, view);
        }
      }, this);
    }, 100),
    reset: function() {
      this.renderNext = 0;
      if (this._rendered) {
        this.$notelist.empty();
        this.collection.every(_.mask(this._onAdd, 0, 1), this);
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
        }.bind(this), true);

        var current;
        var height;
        this.$notelist.sortable({
          items: '.note:not(.pinned)',
          containment: 'parent',
          handle: '.grip',
          tolerance: 'intersect',
          revert: 100,
          start: function(event, ui) {
            $(document.body).toggleClass("gripping", true);
            sorting = true;
            height = ui.item.height();
            ui.placeholder.css({ 'height': 2, 'top': height/2+1 });
            current = ui.placeholder.nextAll(':not(.ui-sortable-helper)').first();
            current.css('margin-top', height);

          }.bind(this),
          change: function(event, ui) {
            current.stop(true).animate({'margin-top': 2}, 100);
            current = ui.placeholder.nextAll(':not(.ui-sortable-helper)').first();
            current.stop(true).animate({'margin-top': height}, 100);
          }.bind(this),
          stop: function(event, ui) {
            $(document.body).toggleClass("gripping", false);
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
          }.bind(this)
        });

        this._rendered = true;
        this.setShrinkNotes(L.preferences.get('shrinkNotes'));
        this.setSearchFailed(this.collection.searchFail);
      }
      _.defer(this.reset.bind(this));
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
      if (!this._rendered || _.has(this.subViews, note.id)) {
        return;
      }

      // Get the index but allow it to be specified manually.
      var index = (typeof(idx) === "number") ? idx : this.collection.indexOf(note);

      if (this._shouldRenderAt(index)) {
        var view = this.subViews[note.id] = new this.noteView({model: note});
        this._insertAt(index, view);
        if (index < this.renderNext) {
          this.renderNext += 1;
        }
        this._fixScrollHeight();
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

      if (!this._rendered || !view || view.isEditing()) {
        return;
      }

      if (0 < this.$notelist.children('.note').index(view.$el) < this.renderNext) {
        this.renderNext--;
      }

      view.remove(options);
      delete this.subViews[id];

      this._fixScrollHeight();
      this._lazyLoadMore();
    },
    _fixScrollHeight: _.throttle(function() {
      // Makes the scrollbar "look" right.
      this.$notelist.css("min-height", 36*this.collection.size());
    }, 100)
  });

})(ListIt);
