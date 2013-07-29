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
        if (options && options.animate) {
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
      this.$el.prop("id", "note-"+this.model.id);
      this.$el.attr("data-note", this.model.id);

      if (this._rendered) {
        this.closeEditor();
        this.undelegateEvents();
        this.delegateEvents();
      } else {
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
      if (this.model.get('meta', {}).pinned) {
        this.$el.addClass('pinned');
      } else {
        this.$el.removeClass('pinned');
      }
    },
    updateContents: function(options) {
      this.$el.children('.contents').html(this.model.get('contents'));
    },
    events: {
      'click     .close-btn':             'onRemoveClicked',
      'click     .contents':              'onClick',
      'click     .contents a':            'onLinkOpen',
      'click     .contents .listit_tag':  'onTagClick',
      'keyup     .contents':              'onKeyUp',
      'blur      .editor':                'onBlur',
      'keydown   .editor':                'onKeyDown',
      'click     .pin-icon':              'onPinToggle',
      'resize    .editor':                'onResizeEditor',
      'mousedown .pin-icon':              function(event){event.preventDefault();}
    },
    onLinkOpen: function(event) {
      this.model.trigger('user:open-bookmark', this.model, this, event.target.href);
      this.stopPropagation();
    },
    onRemoveClicked: function() {
      L.notebook.trashNote(this.model);
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
    closeEditor: function() {
      var $contentsEl = this.$('.contents'),
          $editorEl = this.$('.editor-container');
      if ($editorEl.is(":visible")) {
        this.storeText();
        this.collapse();
        $editorEl.hide();
        this.$el.trigger('stopediting');
      }
      // Always show contents.
      $contentsEl.show();
    },
    onClick: function(e) {
      this.expand();
      this.openEditor();
    },
    /**
     * Scroll List so note selected with tab is at top.
     **/
    onKeyUp: function(event) {
      if (event.keyCode === KeyCode.TAB) {
        this.$el.scrollIntoView();
        $('#notes')[0].scrollTop -= 4;
      }
    },
    onKeyDown: function(event) {
      if ((
        event.keyCode === KeyCode.ESC ||
        (event.keyCode === KeyCode.ENTER && event.shiftKey) ||
        (event.which === KeyCode.S && event.ctrlKey)
        ) && this.editor && !this.editor.isShowingDialog()) {
        event.preventDefault();
        this.closeEditor();
      }
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
      this.$('#notes-container').sortable("disable");
    },
    onStopEditing: function() {
      this.$('#notes-container').sortable("enable");
    },
    updateNoteShrinkState : function(model, state) {
      if (!this._rendered) {
        return;
      }

      if (state) {
        this.$el.addClass('shrink');
      } else {
        this.$el.removeClass('shrink');
      }
    },
    checkLoadMore: function() {
      var scrollTop = this.$el.scrollTop(),
          containerHeight = this.$el.parent().height(),
          listHeight = this.$el.children('#notes-container').height();

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
      var scrollTop = this.$el.scrollTop(),
          containerHeight = this.$el.parent().height(),
          notes = this.$('#notes-container .note'),
          noteOffset;
      if (notes.length > index) {
        noteOffset = notes.eq(index).position().top;
      } else if (notes.length > 0) {
        noteOffset = notes.last().position().top;
      } else {
        noteOffset = 0;
      }
      return (scrollTop + 2*containerHeight) > noteOffset;
    },
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
      var otherEl = this.$el.children('#notes-container').find('.note').eq(index);
      if (otherEl.length === 0) {
        this.$el.children('#notes-container').append(view.render().$el);
      } else {
        otherEl.before(view.render().$el);
      }
    },
    // Delay removes just in case we are re-adding the note.
    removeNote: function(note, options) {
      var id = note.id || note,
          view = this.subViews[id];

      this.fixHeight();
      if (!view || !this._rendered) {
        return;
      }

      if (0 < this.$('#notes-container .note').index(view.$el) < this.renderNext) {
        this.renderNext--;
      }


      view.remove(options);
      this.lazyLoadMore();
    },
    fixHeight: _.throttle(function() {
      this.$('#notes-container').css("min-height", 36*this.collection.size());
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
        this.$el.children('#notes-container').empty();
        // Bail early.
        this.collection.every(_.mask(_.bind(this.addNote, this), 0, 1));
      }
    },
    render: function() {
      if (!this._rendered) {
        var ul = $('<ul>');
        ul.prop({ className: 'notelist', id: 'notes-container' });
        this.$el.html(ul);

        var collection = this.collection.backingCollection;

        // Prevent clicks from getting triggered when sorting.
        var sorting = false;
        ul.get(0).addEventListener("click", function(e) {
          if (sorting) {
            e.stopImmediatePropagation();
          }
        }, true);

        var current;
        ul.sortable({
          distance: 10,
          items: '.note:not(.pinned)',
          containment: 'parent',
          tolerance: 'intersect',
          revert: 100,
          start: function(event, ui) {
            sorting = true;
            ui.placeholder.height(ui.item.height() / 2);
            current = ui.placeholder.next();
          },
          change: function(event, ui) {
            current.css('margin-top', '2px');
            current = ui.placeholder.next();
            current.css('margin-top', ui.placeholder.height());
          },
          stop: function(event, ui) {
            current.css({'-webkit-transition': 'none',
                         '-moz-transition': 'none',
                         'transition': 'none',
                        'margin-top': '2px'});
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
      }
      _.defer(_.bind(this.reset, this));
      return this;
    }
  });

})(ListIt);
