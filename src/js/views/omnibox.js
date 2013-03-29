(function(L) {
    'use strict';
    /**
    * @filedesc View: omnibox input. Provides search and note-creation.
    *
    * @author: wstyke@gmail.com - Wolfe Styke
    */

    L.views.OmniboxView = Backbone.View.extend({
        id: 'omnibox',
        className: 'flex',
        initialize: function() {
            var that = this;
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                that.stopListening();
                //that.model.set('selection', rangy.saveSelection().rangeInfos);
                that.storeText();
            });

            this.model.set('untouched', true); // View untouched by user.
            this.listenTo(this.model, 'change:text', function(m, t, o) {
                // Don't update on own event.
                if (o.source !== this) {
                    this.setText(t);
                }
            });
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

            this.toolbar = new L.views.Toolbar({
                'id': 'omnibox-toolbar',
                'className': 'flex'
            });
            this.$el.html(L.templates["omnibox/input"]({ text: this.model.get('text') || '' }));
            this.$('#omnibox-bottombar').prepend(this.toolbar.render().el);
            this.editor = new wysihtml5.Editor(this.$el.find('#omnibox-entry').get()[0], {
                toolbar: this.toolbar.el,
                parserRules: wysihtml5ParserRules,
                style: false,
                stylesheets: WYSIHTML5_CSS
            });

            var iframe = this.editor.composer.iframe;
            var txtbox = this.$("#omnibox-entry").get(0);

            var resizeEditor = function() {
                var body = $(iframe).contents().find('body'); // Needs document to be loaded.
                _.delay(function() {
                    iframe.style.height = 'auto';
                    iframe.style.height = body.height() + 'px';
                    txtbox.style.height = iframe.style.height;
                });
            };


            this.editor.on('keydown', resizeEditor);
            this.editor.on('change', resizeEditor);
            this.editor.on('load', resizeEditor);

            this.editor.on('keydown', _.bind(this._onKeyDown, this));
            this.editor.on('keyup', _.bind(this._onKeyUp, this));
            this.editor.on('change', _.bind(this.storeText, this));

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
            this.model.saveNote(window);
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
    L.views.ControlsView = Backbone.View.extend({
        id: 'controls',
        initialize: function() {
            var that = this;
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                L.preferences.off(null, null, that);
                L.server.off(null, null, that);
            });
            this.listenTo(L.preferences, 'change:shrinkNotes', this.render);
            this.listenTo(L.server, 'change:syncingNotes', this.render);
        },
        render: function() {
            var shrink = L.preferences.get('shrinkNotes');
            this.$el.html(L.templates["omnibox/controls"]({
                sizeIcon: shrink ?  'img/p-arrow-left.png': 'img/p-arrow-down.png',
                sizeTitle: shrink ?  'Expand Notes': 'Minimize Notes',
                syncState: L.server.get('syncingNotes')
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
            L.preferences.toggleShrink();
        }
    });


})(ListIt);
