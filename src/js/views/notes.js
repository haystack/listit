/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false, ActionQueue: true, LogType: true*/
(function(L) {
    'use strict';

    L.views.NoteView = Backbone.View.extend({
        tagName: 'li',
        className: 'note hbox justified_box',
        initialize: function(options) {
            var that = this;
            this.editor = options.editor;
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                that.stopListening();
            });
            this.template = L.templates["note"];
            this.listenTo(this.model, 'change:contents', _.mask(this.updateContents, 2));
            this.listenTo(this.model, 'change:meta', _.mask(this.updateMeta, 2));
        },
        remove : function(options) {
            if (this._rendered) {
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
            this.$el.on('DOMNodeRemoved', _.bind(this.cleanupEditor, this));
            this.$el.attr("id", "note-"+this.model.id);

            if (this._rendered) {
                this.cleanupEditor();
                this.undelegateEvents();
                this.delegateEvents();
            } else {
                this._rendered = true;

                this.updateContents(options);
                this.updateMeta();
            }

            return this;
        },
        cleanupEditor: function() {
            if (this.editor) {
                this.$('.editor').html('<textarea></textarea>');
                delete this.editor;
            }
        },
        updateMeta: function(options) {
            this.$el.attr('class', this.className);
            if (this.model.get('meta').pinned) {
                this.$el.addClass('pinned');
            }
        },
        updateContents: function(options) {
            this.$el.html(this.template(this.model.toJSON()));
        },
        events: {
            'click .close-btn': 'onRemoveClicked',
            'click .contents': 'onClick',
            'click .contents a': 'onLinkOpen',
            'keyup .contents': 'onKeyUp',
            'blur .editor': 'onBlur'
        },
        getNoteText: function() {
            return this.$('.contents').html();
        },
        onLinkOpen: function(event) {
          L.gvent.trigger('user:open-bookmark', this.model, event.target.href);
        },
        onRemoveClicked: function() {
          L.notebook.trashNote(this.model);
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
                $editorEl = this.$('.editor');
            if (!this.editor) {
                var $textareaEl = $editorEl.children('textarea'),
                    toolbar = new L.views.Toolbar();

                $editorEl.append(toolbar.render().el);

                var txtbox = $textareaEl.get(0);
                var editor = new wysihtml5.Editor(txtbox, {
                  toolbar: toolbar.el,
                  parserRules: wysihtml5ParserRules,
                  style: false,
                  stylesheets: WYSIHTML5_CSS
                });

                var iframe = editor.composer.iframe;

                var resizeEditor = function() {
                  var body = $(iframe).contents().find('body'); // Needs document to be loaded.
                  _.delay(function() {
                    iframe.style.height = 'auto';
                    iframe.style.height = body.height() + 'px';
                    txtbox.style.height = iframe.style.height;
                  });
                };

                this.editor = editor;

                this.editor.on('keydown', resizeEditor);
                this.editor.on('change', resizeEditor);
                this.editor.on('load', resizeEditor);

                this.editor.on('blur', _.bind(this.onBlur, this));


                // Maintain a dialog count so that we don't close the editor with a dialog open.
                this.editor._dialogCount = 0;
                this.editor.on('show:dialog', function() {
                    editor._dialogCount++;
                });
                this.editor.on('save:dialog', function() {
                    editor._dialogCount--;
                });
                this.editor.on('cancel:dialog', function() {
                    editor._dialogCount--;
                });
            }
            this.editor.setValue($contentsEl.html());
            $editorEl.show();
            $contentsEl.hide();
            this.editor.focus();
        },
        onBlur: function() {
            var that = this;
            if (!this.editor || this.editor._dialogCount > 0) {
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
            this.model.changeContents(this.editor.getValue());
            this.collapse();
            this.$('.editor').hide();
            this.$('.contents').show();
        },
        onClick: function(e) {
            if (!e.target.href) {
                this.expand();
                this.openEditor();
            }
        },
        /**
        * Scroll List so note selected with tab is at top.
        */
        onKeyUp: function(event) {
            if (event.keyCode === 9) { // TAB
                event.target.scrollIntoView();
                $('#notes')[0].scrollTop -= 4;
            }
        },
        openLink: function() {
            window.debug('READY');
            L.openLinkTimer = setTimeout(function () {
                window.debug('FIRE');
                window.open(this.model.get('meta').fullURL);
            }, 50);
        }
    });

    L.views.NoteCollectionView = Backbone.View.extend({
        defaults: {
            noteHeight: '1.3em', //L.base.oneLineHeight, //'1.2em',
            lastFocusedNote: null
        },
        initialize: function() {
            var that = this;
            this.subViews = {}; // Note views
            this.delayedRemove = {}; // Delay removes to prevent flickering.
            this.listenTo(this.collection, 'add', _.mask(this.addNote, 0, 2))
            this.listenTo(this.collection, 'remove', function(note, col, options) {
              that.removeNote(note, _.defaults({animate: true}, options));
            });
            this.listenTo(this.collection, 'reset', _.mask(this.reset, 1));
            this.listenTo(this.collection, 'sort', _.mask(this.sort));
            this.listenTo(this.collection, 'search:paused', this.onPause);
            this.listenTo(L.preferences, 'change:shrinkNotes', this.updateNoteShrinkState);
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                that.stopListening();
            });
        },
        events: {
            'scroll': 'onScroll'
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
            if (this.checkLoadMore()) {
                this.collection.next();
            }
        },
        addNote: function(note, options) {
            clearTimeout(this.delayedRemove[note.id]);
            // Create the view iff it doesn't exist.
            var view = this.subViews[note.id];
            if (!view) {
                view = this.subViews[note.id] = new L.views.NoteView({model: note});
            }

            if (!this._rendered || view.isVisible()) {
                return;
            }
            var index = this.collection.indexOf(note, options && options.index);
            this.insertAt(index, view);
        },
        insertAt: function(index, view) {
            // XXX: BUG: options.index incorrect. Calculate manually.
            var otherEl = this.$el.children('#notes-container').find('.note').eq(index);
            if (otherEl.length === 0) {
                this.$el.children('#notes-container').append(view.render().$el);
            } else {
                otherEl.before(view.render().$el);
            }
        },
        onPause: function() {
            if (this.checkLoadMore()) {
                this.collection.next();
            }
        },
        // Delay removes just in case we are re-adding the note.
        removeNote: function(note, options) {
            var id = note.id || note;

            clearTimeout(this.delayedRemove[id]);

            try {
                this.delayedRemove[id] = setTimeout(_.bind(this._removeNote, this, note, options), 50);
            } catch (e) {
                this._removeNote(note, options);
            }
        },
        _removeNote: function(note, options) {
            var id = note.id || note,
                view = this.subViews[id];

            if (!view || !this._rendered) {
                return;
            }

            view.remove(options);
            // This is necessary as removes are delayed.
            if (this.checkLoadMore()) {
                this.collection.next();
            }
        },
        sort: function() {
          var that = this;
          this.collection.each(function(note, i) {
            var view = that.subViews[note.id];
            view.remove();
            that.insertAt(i, view);
          });
        },
        reset: function() {
            if (this._rendered) {
                //this.$el.children('#notes-container').empty();
                _.each(this.subViews, _.mask(_.bind(this.removeNote, this), 1));
                this.collection.each(_.mask(_.bind(this.addNote, this), 0));
            }
        },
        render: function() {
            if (!this._rendered) {
                var ul = $('<ul>');
                ul.attr({
                  'class': 'notelist', 'id': 'notes-container'
                });
                this.$el.html(ul);
                this.updateNoteShrinkState(L.preferences, L.preferences.get('shrinkNotes'));

                this._rendered = true;
            }
            this.collection.reset();
            return this;
        }
    });

})(ListIt);
