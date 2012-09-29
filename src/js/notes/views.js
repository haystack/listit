/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false, ActionQueue: true, LogType: true*/
(function(L) {
    'use strict';

    L.make.notes.NoteView = Backbone.View.extend({
        tagName: 'li',
        className: 'note hbox justified_box',
        initialize: function(options) {
            _(this).bindAll();
            var that = this;
            this.editor = options.editor;
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                that.model.off(null, null, that);
            });
            this.template = L.templates.notes.note;
            this.model.on('change:contents', _.mask(this.updateContents, 2), this);
            this.model.on('change:meta', _.mask(this.updateMeta, 2), this);
        },
        remove : function(options) {
            if (this._rendered) {
                var el = this.$el;
                if ((options && options.action) === 'delete') {
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
            var action = options && options.action;

            if (action === 'new') {
                this.$el.one('DOMNodeInserted', function() {
                    var that = $(this);
                    that.hide();
                    setTimeout(function() {
                        that.stop().hide().fadeIn({queue: false}, 200).hide().slideDown(300);
                    }, 1);
                });
            }

            this.$el.bind('DOMNodeRemoved', this.cleanupEditor);

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
            'click .close-btn': 'removeNote',
            'click .contents': 'onClick',
            'keyup .contents': 'onKeyUp',
            'blur .editor': 'onBlur'
        },
        getNoteText: function() {
            return this.$('.contents').html();
        },

        removeNote: function() {
            this.model.moveTo(L.deletedNotes, {action: 'delete'});
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

            var $contentsEl = this.$('.contents'),
                $editorEl = this.$('.editor');
            if (!this.editor) {
                var $textareaEl = $editorEl.children('textarea'),
                    toolbar = new L.make.omnibox.ToolbarView();

                $editorEl.append(toolbar.render().el);

                var editor = new wysihtml5.Editor($textareaEl.get(0), {
                        toolbar: toolbar.el,
                        parserRules: wysihtml5ParserRules,
                        stylesheets: WYSIHTML5_CSS
                    }),
                    iframe = editor.composer.iframe,
                    resizeIframe = function() {
                        var body = $(iframe).contents().find('body'); // Needs document to be loaded.
                        _.delay(function() {
                            iframe.style.height = 'auto';
                            iframe.style.height = body.height() + 'px';
                        });
                    };

                this.editor = editor;

                this.editor.on('keydown', resizeIframe);
                this.editor.on('focus', resizeIframe);
                this.editor.on('change', resizeIframe);
                this.editor.on('blur', this.onBlur);


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
                $('#notes-container')[0].scrollTop -= 4;
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

    L.make.notes.NoteCollectionView = Backbone.View.extend({
        tagName: 'div',
        id: 'notes-container',
        className: 'container scroll',
        defaults: {
            noteHeight: '1.3em', //L.base.oneLineHeight, //'1.2em',
            lastFocusedNote: null
        },
        initialize: function() {
            _(this).bindAll(); // Maintain ref to this.
            var that = this;
            this.subViews = {}; // Note views
            this.delayedRemove = {}; // Delay removes to prevent flickering.
            this.collection.on('add', _.mask(this.add, 0, 2), this);
            this.collection.on('remove', _.mask(this.remove, 0, 2), this);
            this.collection.on('reset', _.mask(this.reset, 1), this);
            this.collection.on('search:paused', this.onPause, this);
            L.options.on('change:shrinkNotes', this.updateNoteShrinkState, this);
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                that.collection.off(null, null, that);
                L.options.off(null, null, that);
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
                listHeight = this.$el.children('#notes').height();

            return (scrollTop + 2*containerHeight) > listHeight;
        },
        onScroll: function() {
            // Load on scroll.
            if (this.checkLoadMore()) {
                this.collection.next();
            }
        },
        add: function(note, options) {
            clearTimeout(this.delayedRemove[note.id]);
            // Create the view iff it doesn't exist.
            var view = this.subViews[note.id];
            if (!view) {
                view = this.subViews[note.id] = new L.make.notes.NoteView({model: note});
            }

            if (!this._rendered || view.isVisible()) {
                return;
            }

            // XXX: BUG: options.index incorrect. Calculate manually.
            var index = this.collection.indexOf(note);
            var otherEl = this.$el.children('#notes').find('.note').eq(index);
            if (otherEl.length === 0) {
                this.$el.children('#notes').append(view.render().$el);
            } else {
                otherEl.before(view.render().$el);
            }
            // Stop loading if we have enough notes.
            // I put this after the isVisible check so that I don't count loaded
            // notes. This could be changed.
        },
        onPause: function() {
            if (this.checkLoadMore()) {
                this.collection.next();
            }
        },
        // Delay removes just in case we are re-adding the note.
        remove: function(note, options) {
            var id = note.id || note;

            clearTimeout(this.delayedRemove[id]);

            try {
                this.delayedRemove[id] = setTimeout(_.bind(this._remove, this, note, options), 50);
            } catch (e) {
                this._remove(note, options);
            }
        },
        _remove: function(note, options) {
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
        reset: function() {
            if (this._rendered) {
                //this.$el.children('#notes').empty();
                _.each(this.subViews, _.mask(this.remove, 1));
                this.collection.each(_.mask(this.add, 0));
            }
        },
        render: function() {
            if (!this._rendered) {
                this.$el.html(this.make('ul', {'class': 'notelist', 'id': 'notes'}));
                this.updateNoteShrinkState(L.options, L.options.get('shrinkNotes'));

                this._rendered = true;
            }
            this.collection.reset();
            return this;
        }
    });

})(ListIt);
