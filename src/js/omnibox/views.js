"use strict";
/**
 * @filedesc View: omnibox input. Provides search and note-creation.
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

L.make.omnibox.OmniboxView = Backbone.View.extend({
    id: "omnibox",
    className: "flex",
    initialize: function() {
        _(this).bindAll();
        var that = this;
        $(window).one('beforeunload', function() {
            that.undelegateEvents();
            that.model.off(null, null, that);
            that.model.set("selection", rangy.saveSelection().rangeInfos);
            that.storeText();
        });

        this.model.set('untouched', true); // View untouched by user.
        this.model.on('change:text', function(m, t, o) {
            if (o.source != this) this.setText(t); // Don't update on own event.
        }, this);
    },
    render: function() {
        this.$el.html(L.templates.omnibox.input({
            text: this.model.get("text") || ""
        }));
        return this;
    },
    events: {
        'click #save-icon': 'saveClicked_',
        'click #pinIconPlus': 'savePinClicked_',

        'keydown #omnibox-entry': 'keyDownHandler_',
        'keyup #omnibox-entry': 'keyUpHandler_',
        'paste #omnibox-entry': 'pasteHandler_',
        'blur #omnibox-entry': 'focusOutHandler_',
        'focus #omnibox-entry': 'focusInHandler_',
    },
    getTextbox : function() {
        return this.$("#omnibox-entry");
    },
    /**
    * Handles KEYPRESS event:
    *   Shift+Enter => create note.
    * @param {object}
    */
    keyDownHandler_: function(event) {
        event = event || window.event;
        var keyCode = event.keyCode || evt.which;
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
    keyPressHandler_: function(event) {
        if (this.isEmpty()) {
            this.clearInput();
        }
    },

    keyUpHandler_: function(event) {
        this.storeText();
    },
    pasteHandler_: function(event) {
        L.fixSize();
        this.storeText();
    },
    storeText: function() {
        this.model.set("text", this.getText(), {source: this});
    },

    /**
    * Handles new note focus event.
    * @param {Object} event The focus event.
    * @private
    */
    focusInHandler_: function(event) {
        this.$el.addClass('focus');

        if (this.model.get('untouched')) {
            // First focus is from autofocus.
            this.model.set('untouched', false);
            L.log(LogType.CREATE_AUTOFOCUS, {});
        } else {
            L.log(LogType.CREATE_FOCUS, {});
        }
        var selection = this.model.get("selection");
        if (selection) {
            rangy.restoreSelection({
                doc: document,
                win: window,
                rangeInfos: selection,
                restored: false,
            });
            this.model.unset("selection");
        }
    },
    /**
    * Handles new note blur event.
    * @param {Object} event The blur event.
    * @private
    */
    focusOutHandler_: function(event) {
        if (this.isEmpty()) {
            this.$el.removeClass('focus');
        } else {
            this.model.set("selection", rangy.saveSelection().rangeInfos);
            this.storeText();
        }
    },

    /**
    * Handles new-note save button click event.
    * @param {object} click event
    * @private
    */
    saveClicked_: function(event) {
        this.save();
    },
    /**
    * Handles New Note Save w/ Place & URL Relevance Info:
    * @param {object} event The click event.
    * @private
    */
    savePinClicked_: function(event) {
        this.getTextbox().prepend("!!");
        this.save();
    },
    save: function() {
        this.model.unset("selection");
        // Clean
        this.getTextbox().cut('.rangySelectionBoundry');
        this.storeText();
        L.vent.trigger("user:save-note");
        this.reset();
    },

    /**
    * Returns true if input element is empty.
    * @return {boolean}
    */
    isEmpty: function() {
        return this.getTextbox().html().replace(/<br\s*\/?>|\s*/g, '').length === 0;
    },
    /**
    * Returns true of new note box is 2+ lines long.
    * @return {boolean}
    */
    isOneLine: function() {
        var inputHTML = _.str.trim(this.getText());
        return inputHTML.search('<div>') === -1;
    },
    /**
    * Returns text of note-creation input.
    * @return {string} Text of note-creation input.
    */
    getText: function() {
        return this.getTextbox().html();
    },
    setText: function(text) {
        this.getTextbox().html(text);
    },

    /**
    * Clear NewNote's innerText.
    */
    clearInput: function() {
        this.getTextbox().text("");
        this.model.set("text", "");
        this.$el.removeClass('nonempty');
    },

    /**
    * Resets the field.
    */
    reset: function() {
        this.clearInput();
        this.focusInputWithCaret();
    },

    /**
    * Focuses row=1, col=1 of new note entry box.
    */
    focusInputWithCaret: function() {
        try {
            var el = this.$('#omnibox-entry')[0];
            var range = document.createRange();
            var sel = window.getSelection();
            range.setStart(el, 0); //row: el.childNodes[0], col: 0
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            el.focus();
        } catch (err) {
            debug('FAIL: focusInputWithCaret()');
        }
    }
});

// This view does not have a model
// (Technically it has several).
// TODO: Go all out MVVM? (make viewmodel)
L.make.omnibox.ControlsView = Backbone.View.extend({
    id: "optionsCol",
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
            syncState: L.server.get("syncing"),
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

