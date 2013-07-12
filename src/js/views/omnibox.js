(function(L) {
  'use strict';
  /**
   * @filedesc View: omnibox input. Provides search and note-creation.
   *
   * @author: wstyke@gmail.com - Wolfe Styke
   */

  L.views.OmniboxView = Backbone.View.extend({
    id: 'omnibox',
    className: 'flex note-creator',
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

      this.editor = new L.views.Editor({
        text: this.model.get('text')||'',
        actions: L.templates['create-actions']()
      });
      this.$el.html(this.editor.render().el);
      this._rendered = true;
      return this;
    },
    events: {
      'click .save-icon': '_onSaveClicked',
      'click .pin-icon': '_onSavePinClicked',
      'keydown .editor': '_onKeyDown',
      'keyup .editor': '_onKeyUp',
      'change .editor': 'storeText'
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
      case KeyCode.A:
        if (event.ctrlKey){
          event.preventDefault();
          this.save();
        }
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
      if (this.getText() !== "") {
        this.save();
      }
    },
    /**
     * Handles New Note Save w/ Place & URL Relevance Info:
     * @param {object} event The click event.
     * @private
     */
    _onSavePinClicked: function(event) {
      if (this.getText() !== "") {
        var contents = L.util.strip(this.editor.getText());
        if (contents[0] !== '!') {
          contents = '! ' + contents;
        }
        this.editor.setText(contents);
        this.save();
      }
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
      return this.editor.getText();
    },

    setText: function(text) {
      this.assertRendered();
      this.editor.setText(text);
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
      this.$el.html(L.templates["omnibox/controls"]({
        shrinkState: L.preferences.get('shrinkNotes'),
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
