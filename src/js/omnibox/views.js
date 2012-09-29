(function(L) {
    'use strict';
    /**
    * @filedesc View: omnibox input. Provides search and note-creation.
    *
    * @author: wstyke@gmail.com - Wolfe Styke
    */

    L.make.omnibox.OmniboxView = Backbone.View.extend({
        id: 'omnibox',
        className: 'flex',
        initialize: function() {
            var that = this;
            _(this).bindAll();
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                that.model.off(null, null, that);
                //that.model.set('selection', rangy.saveSelection().rangeInfos);
                that.storeText();
            });

            this.model.set('untouched', true); // View untouched by user.
            this.model.on('change:text', function(m, t, o) {
                // Don't update on own event.
                if (o.source !== this) {
                    this.setText(t);
                }
            }, this);
        },
        assertRendered: function() {
            if (!this._rendered) {
                throw new Error('View not rendered.');
            }
        },
        render: function() {
            if (this._rendered) {
                return this;
            }

            this.toolbar = new L.make.omnibox.ToolbarView({
                'id': 'omnibox-toolbar'
            });
            this.$el.html(L.templates.omnibox.input({ text: this.model.get('text') || '' }));
            this.$('#omnibox-bottombar').prepend(this.toolbar.render().el);
            this.editor = new wysihtml5.Editor(this.$el.find('#omnibox-entry').get()[0], {
                toolbar: this.toolbar.el,
                parserRules: wysihtml5ParserRules,
                stylesheets: WYSIHTML5_CSS
            });

            var iframe = this.editor.composer.iframe;

            var resizeIframe = function() {
                var body = $(iframe).contents().find('body'); // Needs document to be loaded.
                _.delay(function() {
                    iframe.style.height = 'auto';
                    iframe.style.height = body.height() + 'px';
                });
            };


            this.editor.on('keydown', resizeIframe);
            this.editor.on('blur', resizeIframe);
            this.editor.on('focus', resizeIframe);
            this.editor.on('change', resizeIframe);

            this.editor.on('keydown', this._onKeyDown);
            this.editor.on('keyup', this._onKeyUp);
            this.editor.on('change', this.storeText);

            this._rendered = true;
            return this;
        },
        events: {
            'click #save-icon': '_onSaveClicked',
            'click #pinIconPlus': '_onSavePinClicked'
        },
        // Handle esc/shift-enter
        _onKeyDown: function(event) {
            var keyCode;
            event = event || window.event;
            keyCode = event.keyCode || event.which;
            switch(keyCode) {
                case KeyCode.ENTER:
                    if (event.shiftKey) {
                        this.save();
                        event.preventDefault(); // Let model update
                    }
                    break;
                case KeyCode.ESC:
                    this.reset();
                    break;
            }
            setTimeout(L.fixSize, 1);
        },
        // Store text on change.
        _onKeyUp: function(event) {
            this.storeText();
        },
        storeText: function() {
            this.assertRendered();
            this.model.set('text', this.getText(), {source: this});
        },

        /**
        * Handles new-note save button click event.
        * @param {object} click event
        * @private
        */
        _onSaveClicked: function(event) {
            this.save();
        },
        /**
        * Handles New Note Save w/ Place & URL Relevance Info:
        * @param {object} event The click event.
        * @private
        */
        _onSavePinClicked: function(event) {
            this.editor.setValue('!! ' + this.editor.getValue());
            this.save();
        },
        save: function() {
            this.assertRendered();
            this.model.unset('selection');
            // Clean
            this.storeText();
            L.vent.trigger('user:save-note');
            this.reset();
        },

        /**
        * Returns text of note-creation input.
        * @return {string} Text of note-creation input.
        */
        getText: function() {
            this.assertRendered();
            return this.editor.getValue();
        },

        setText: function(text) {
            this.assertRendered();
            this.editor.setValue(text);
        },

        /**
        * Resets the field.
        */
        reset: function() {
            this.assertRendered();
            this.editor.clear();
            this.storeText();
        }
    });

    // This view does not have a model
    // (Technically it has several).
    // TODO: Go all out MVVM? (make viewmodel)
    L.make.omnibox.ControlsView = Backbone.View.extend({
        id: 'optionsCol',
        initialize: function() {
            var that = this;
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                L.options.off(null, null, that);
                L.server.off(null, null, that);
            });
            L.options.on('change:shrinkNotes', this.render, this);
            L.server.on('change:syncing', this.render, this);
        },
        render: function() {
            var shrink = L.options.get('shrinkNotes');
            this.$el.html(L.templates.omnibox.optioncol({
                sizeIcon: shrink ?  'img/p-arrow-left.png': 'img/p-arrow-down.png',
                sizeTitle: shrink ?  'Expand Notes': 'Minimize Notes',
                syncState: L.server.get('syncing')
            }));
            return this;
        },
        events: {
            'click #syncIcon': 'syncClicked',
            'click #shrinkIcon': 'shrinkClicked'
        },
        syncClicked: function(event) {
            L.server.syncNotes();
        },
        shrinkClicked: function(event) {
            L.options.toggleShrink();
        }
    });


    L.make.omnibox.ToolbarView = Backbone.View.extend({
        className: 'wysihtml5-toolbar',
        tagName: 'div',
        attributes: {'style': 'display: none;'}, // css isn't working for some reason
        initialize: function() {
            var that = this;
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                L.options.off(null, null, that);
            });
            L.options.on('change:toolbar', this.redraw, this);
        },
        redraw: function() {
            if (this._rendered) {
                this.render();
            }
        },
        render: function() {
            this.$el.html(L.templates.omnibox.toolbar({
                'items': L.options.get('toolbarItems')
            }));
            this._rendered = true;
            return this;
        }
    });
})(ListIt);
