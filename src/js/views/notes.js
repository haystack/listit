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
      this.listenTo(this.model, 'change:contents', _.mask(this.updateContents, 2));
      this.listenTo(this.model, 'change:meta', _.mask(this.updateMeta, 2));
    },
    remove : function(options) {
      if (this._rendered) {
        this.closeEditor();
        this.cleanupEditor();
        var el = this.$el;
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
        this.updateMeta();
      }

      return this;
    },
    cleanupEditor: function() {
      if (this.editor) {
        this.editor.remove();
        delete this.editor;
      }
    },
    updateMeta: function(options) {
      this.$el.prop('className', this.className);
      this.$el.toggleClass('pinned', this.model.get('meta', {}).pinned);
    },
    updateContents: function(options) {
      this.$el.children('.contents').html(this.model.get('contents'));
    },
    events: {
      'click                  .close-btn'           : 'onRemoveClicked',
      'click                  .contents'            : 'onClick',
      'click                  .contents a'          : 'onLinkOpen',
      'click                  .contents .listit_tag': 'onTagClick',
      'keyup                  .contents'            : 'onKeyUp',
      'blur                   .editor'              : 'onBlur',
      'keydown[shift+return]  .editor'              : 'onCloseTriggered',
      'keydown[ctrl+s]        .editor'              : 'onCloseTriggered',
      'keydown[esc]           .editor'              : 'onCloseTriggered',
      'click                  .pin-icon'            : 'onPinToggle',
      'resize                 .editor'              : 'onResizeEditor',
      'mousedown              .pin-icon'            : function(event){event.preventDefault();}
    },
    onLinkOpen: function(event) {
      this.model.trigger('user:open-bookmark', this.model, this, event.target.href);
      event.stopPropagation();
    },
    onRemoveClicked: function() {
      L.notebook.trashNote(this.model, {user: true});
      return false;
    },
    onResizeEditor: function() {
      this.$el.scrollIntoView();
    },
    onTagClick: function(event) {
      L.omnibox.tagToggle(event.target.textContent);
      return false;
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
    onBlur: function() {
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
    onCloseTriggered: function(e) {
      if (this.editor && !this.editor.isShowingDialog()) {
        e.preventDefault();
        this.closeEditor();
      }
    },
    closeEditor: function() {
      if (this._editorOpen) {
        var $contentsEl = this.$('.contents'),
            $editorEl = this.$('.editor-container');
        this._editorOpen = false;
        this.storeText();
        this.collapse();
        $editorEl.hide();
        this.$el.trigger('stopediting');
        // Always show contents.
        $contentsEl.show();
      }
    },
    onClick: function(e) {
      this.expand();
      this.openEditor();
    },
    storeText: function() {
      this.model.changeContents(this.editor.getText(), window);
      this.model.trigger('user:save', this.model, this);
    },
    //if editor is visible, gets/sets text through editor - otherwise, through model
    onPinToggle: function(event) {
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
    /*onCancel: function(event){
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
    defaults: {
      noteHeight: '1.3em', //L.base.oneLineHeight, //'1.2em',
      lastFocusedNote: null
    },
    initialize: function() {
      var that = this;
      this.subViews = {}; // Note views
      this.renderNext = 0;
      this.listenTo(this.collection, 'add', _.mask(this.addNote, 0));
      this.listenTo(this.collection, 'remove', function(note, col, options) {
        that.removeNote(note, _.defaults({}, options));
      });
      this.listenTo(this.collection, 'reset', _.mask(this.reset, 1));
      this.listenTo(this.collection, 'sort', _.mask(this.sort));
      this.listenTo(L.preferences, 'change:shrinkNotes', this.updateNoteShrinkState);
      this.listenTo(L.sidebar, 'change:searchFail', this.updateSearchStatus);
      $(window).one('beforeunload', function() {
        that.undelegateEvents();
        that.stopListening();
      });
      // Load more if needed on window resize.
      $(window).on("resize", function() {
        if (that._rendered) {
          that.lazyLoadMore();
        }
      });
    },
    events: {
      'scroll': 'onScroll',
      'stopediting .note': 'onStopEditing',
      'startediting .note': 'onStartEditing'
    },
    onStartEditing: function() {
      this.$container.sortable("disable");
    },
    onStopEditing: function() {
      this.$container.sortable("enable");
    },
    updateSearchStatus : function(model, state) {
      if (!this._rendered) {
        return;
      }

      this.$el.toggleClass('search-failed', state);
    },
    updateNoteShrinkState : function(model, state) {
      if (!this._rendered) {
        return;
      }
      this.$el.toggleClass('shrink', state);
    },
    checkLoadMore: function() {
      var scrollTop = this.$el.scrollTop(),
          containerHeight = this.$el.parent().height(),
          listHeight = this.$container.height();

      return (scrollTop + 2*containerHeight) > listHeight;
    },
    onScroll: function() {
      // Load on scroll.
      this.loadMore();
    },
    loadMore: function() {
      var view, note;
      while (this.collection.size() > this.renderNext && this.shouldRenderAt(this.renderNext)) {
        note = this.collection.at(this.renderNext);
        view = this.subViews[note.id];
        if (!view) {
          view = this.subViews[note.id] = new L.views.NoteView({model: note});
        }
        if (!view.isVisible()) {
          this.insertAt(this.renderNext, view);
        }
        this.renderNext += 1;
      }
    },
    lazyLoadMore: _.debounce(function() {
      return this.loadMore();
    }, 100),
    shouldRenderAt: function(index) {
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
    addNote: function(note, idx) {
      var view = this.subViews[note.id];

      // Ignore already visible/unrendered
      if (!this._rendered || view && view.isVisible()) {
        return true;
      }

      // Get the index but allow it to be specified manually.
      var index = (typeof(idx) === "number") ? idx : this.collection.indexOf(note);

      if (this.shouldRenderAt(index)) {
        if (!view) {
          view = this.subViews[note.id] = new L.views.NoteView({model: note});
        }
        this.insertAt(index, view);
        if (index < this.renderNext) {
          this.renderNext += 1;
        }
        this.fixHeight();
        return true;
      } else if (index < this.renderNext) {
        // If I choose not to render, fix the render next index.
        this.renderNext = index;
        return false;
      }
    },
    insertAt: function(index, view) {
      var otherEl = this.$container.find('.note').eq(index);
      if (otherEl.length === 0) {
        this.$container.append(view.render().$el);
      } else {
        otherEl.before(view.render().$el);
      }
      this._lazyRefreshSortable();
    },
    // Delay removes just in case we are re-adding the note.
    removeNote: function(note, options) {
      var id = note.id || note,
          view = this.subViews[id];

      this.fixHeight();
      if (!view || !this._rendered) {
        return;
      }

      if (0 < this.$container.children('.note').index(view.$el) < this.renderNext) {
        this.renderNext--;
      }


      view.remove(options);
      this.lazyLoadMore();
    },
    fixHeight: _.throttle(function() {
      this.$container.css("min-height", 36*this.collection.size());
    }, 100),
    sort: _.debounce(function() {
      var that = this;
      this.collection.each(function(note, i) {
        var view = that.subViews[note.id];
        if (view) {
          view.remove();
          that.insertAt(i, view);
        }
      });
    }, 100),
    reset: function() {
      this.renderNext = 0;
      if (this._rendered) {
        this.$container.empty();
        // Bail early.
        this.collection.every(_.mask(_.bind(this.addNote, this), 0, 1));
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
        this.updateNoteShrinkState(L.preferences, L.preferences.get('shrinkNotes'));
        this.updateSearchStatus(L.sidebar, L.sidebar.searchFail);
      }
      _.defer(_.bind(this.reset, this));
      return this;
    }
  });

})(ListIt);
