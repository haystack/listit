(function(L) {
  'use strict';

  L.views.NoteView = Backbone.View.extend({
    tagName: 'li',
    className: 'note hbox justified_box',
    initialize: function(options) {
      var that = this;
      $(window).one('beforeunload', function() {
        that.undelegateEvents();
        that.stopListening();
        that.closeEditor();
      });
      this.template = L.templates["note"];
      this.listenTo(this.model, 'change:contents', _.mask(this._updateContents, 2));
      this.listenTo(this.model, 'change:meta', _.mask(this._updateMeta, 2));
    },
    remove : function(options) {
      if (this._rendered) {
        var el = this.$el;

        this.closeEditor();
        if (this.editor) {
          this.editor.remove();
          delete this.editor;
        }

        if (options && options.user) {
          el.stop().fadeOut({queue: false}, 200).slideUp(300, function() {
            el.remove();
          });
        } else {
          el.remove();
        }
      }
    },
    isVisible: function() {
      // This assumes that el having a parent means that it is visible. Much
      // faster than checking $el.is(':visible') and speed is important here.
      return this.el && this.el.parentNode;
    },
    render: function(options) {

      if (this._rendered) {
        this.closeEditor();
        // It's either this or detetch. That would cause problems with lots of notes.
        this.undelegateEvents();
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
      'keyup                  .contents'            : '_onKeyUp',
      'blur                   .editor'              : '_onBlur',
      'keydown[shift+return]  .editor'              : '_onCloseTriggered',
      'keydown[ctrl+s]        .editor'              : '_onCloseTriggered',
      'keydown[esc]           .editor'              : '_onCloseTriggered',
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
      // I know that this is unreadable. But it makes a point.
      // (it's complicated)

      var $contentsEl = this.$('.contents'),
          $editorEl = this.$('.editor-container');

      this._editorOpen = true;
      if ($editorEl.is(":visible")) {
        return; // Already open
      }
      if (!this.editor) {
        this.editor = new ListIt.views.Editor({
          text: this.model.get('contents')
        });
        $editorEl.html(this.editor.render().el);
      } else {
        this.editor.setText(this.model.get('contents'));
      }
      $editorEl.show();
      $contentsEl.hide();
      this.$el.trigger('startediting');
      this.editor.focus();
      this.model.trigger('user:edit', this.model, this);
    },
    _onBlur: function() {
      var that = this;
      if (!this.editor || this.editor.isShowingDialog()) {
        return;
      }
      _.defer(function() {
        var focusedEditor = $(document.activeElement).closest('.editor').get(0),
            myEditor = that.$('.editor').get(0);

        if (focusedEditor !== myEditor) {
          that.closeEditor();
        }
      });
    },
    closeEditor: function() {
      if (this._editorOpen) {
        var $contentsEl = this.$('.contents'),
            $editorEl = this.$('.editor-container');

        // Save Text
        this.model.changeContents(this.editor.getText(), window);
        this.model.trigger('user:save', this.model, this);

        // Close the editor
        this._editorOpen = false;
        this.collapse();
        $editorEl.hide();
        this.$el.trigger('stopediting');
        // Always show contents.
        $contentsEl.show();
      }
    },
    _updateMeta: function(options) {
      this.$el.prop('className', this.className);
      this.$el.toggleClass('pinned', !!this.model.get('meta', {}).pinned);
    },
    _updateContents: function(options) {
      this.$el.children('.contents').html(this.model.get('contents'));
    },
    _onLinkOpen: function(event) {
      this.model.trigger('user:open-bookmark', this.model, this, event.target.href);
      event.stopPropagation();
    },
    _onRemoveClicked: function() {
      L.notebook.trashNote(this.model, {user: true});
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
      if (this.editor && !this.editor.isShowingDialog()) {
        e.preventDefault();
        this.closeEditor();
      }
    },
    _onNoteClicked: function(e) {
      this.expand();
      this.openEditor();
    },
    //if editor is visible, gets/sets text through editor - otherwise, through model
    _onPinToggle: function(event) {
      if (this.$('.editor-container').is(":visible")) {
        if (L.util.strip(this.editor.getText())[0] === '!') {
          this.editor.replaceText(/!+ */, '');
          this.$el.removeClass('pinned');
        } else {
          this.editor.prependText('! ');
          this.$el.addClass('pinned');
        }
      } else {
        var text = this.model.get('contents');
        if (this.model.get('meta').pinned) {
          text = text.replace(/!+ */, '');
        } else {
          text = '! ' + text;
        }
        this.model.changeContents(text);
      }
    }
    /*_onCancel: function(event){
      var $contentsEl = this.$('.contents'),
          $editorEl = this.$('.editor-container');
      if ($editorEl.is(":visible")) {
        this.collapse();
        $editorEl.hide();
        this.$el.trigger('stopediting');
      }
      // Always show contents.
      $contentsEl.show();
    },*/
  });

  L.views.NoteCollectionView = Backbone.View.extend({
    initialize: function() {
      var that = this;
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
      'stopediting .note': '_onStopEditing',
      'startediting .note': '_onStartEditing'
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
        this.$container.empty();
        this.collection.every(_.mask(_.bind(this._onAdd, this), 0, 1));
      }
    },
    render: function() {
      if (!this._rendered) {
        this.$container = $('<ul>');
        this.$container.prop({ className: 'notelist', id: 'notes-container' });
        this.$el.html(this.$container);

        var collection = this.collection.backingCollection;

        // Prevent clicks from getting triggered when sorting.
        var sorting = false;
        this.$container.get(0).addEventListener("click", function(e) {
          if (sorting) {
            e.stopImmediatePropagation();
          }
        }, true);

        var current;
        var height;
        this.$container.sortable({
          distance: 10,
          items: '.note:not(.pinned)',
          containment: 'parent',
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
            collection.remove(note);
            var insertIndex;
            if (previousId) {
              insertIndex = collection.indexOf(collection.get(previousId))+1;
            } else {
              insertIndex = 0;
            }
            collection.add(note, {at: insertIndex});

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
    _onStartEditing: function() {
      this.$container.sortable("disable");
    },
    _onStopEditing: function() {
      this.$container.sortable("enable");
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
          view = this.subViews[note.id] = new L.views.NoteView({model: note});
        }
        if (!view.isVisible()) {
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
          containerHeight = this.el.parentElement.clientHeight,
          notes = this.$container.children(),
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
      this.$container.sortable('refresh');
    }, 10),
    _onAdd: function(note, idx) {
      var view = this.subViews[note.id];

      // Ignore already visible/unrendered
      if (!this._rendered || view && view.isVisible()) {
        return;
      }

      // Get the index but allow it to be specified manually.
      var index = (typeof(idx) === "number") ? idx : this.collection.indexOf(note);

      if (this._shouldRenderAt(index)) {
        if (!view) {
          view = this.subViews[note.id] = new L.views.NoteView({model: note});
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
      var otherEl = this.$container.find('.note').eq(index);
      if (otherEl.length === 0) {
        this.$container.append(view.render().$el);
      } else {
        otherEl.before(view.render().$el);
      }
      this._lazyRefreshSortable();
    },
    // Delay removes just in case we are re-adding the note.
    _onRemove: function(note, options) {
      var id = note.id || note,
          view = this.subViews[id];

      this._fixHeight();
      if (!view || !this._rendered) {
        return;
      }

      if (0 < this.$container.children('.note').index(view.$el) < this.renderNext) {
        this.renderNext--;
      }


      view.remove(options);
      this._lazyLoadMore();
    },
    _fixHeight: _.throttle(function() {
      this.$container.css("min-height", 36*this.collection.size());
    }, 100)
  });

})(ListIt);
