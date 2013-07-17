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
        that.storeSearch();
      });

      this.model.set('untouched', true); // View untouched by user.
      this.listenTo(this.model, 'change:text', function(m, t, o) {
        // Don't update on own event.
        if (o.source !== this) {
          this.setText(t);
        }
      });
      this.listenTo(this.model, 'change:searchText', function(m, search, o) {
        if (o.source !== this) {
          this.model.set('searchState', true);
          this.setSearch(search);
          this._fixSearchHeight();
        }
      });
      this.listenTo(this.model, 'change:searchState', function(m,state) {
        if (state) {
          this.showSearch();
          this.$searchbar.focus();
        } else {
          this.hideSearch();
          this.editor.focus();
        }
      });
      this.initialSearchState = this.model.get('searchState');
      this.initialSearch = this.model.get('searchText') || '';
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

      this.$el.html(L.templates['omnibox/searchbar']());
      this.$searchbar = this.$('.searchbar');
      if (this.initialSearchState) {
        this.setSearch(this.initialSearch);
      } else {
        this.hideSearch();
      }

      this.editor = new L.views.Editor({
        text: this.model.get('text')||'',
        actions: L.templates['create-actions']()
      });
      this.$el.append(this.editor.render().el);
      this._rendered = true;
      var that = this;
      $(window).on('keydown', null, 'ctrl+f', function(event) {
        if (that.$el.is(':visible')) {
          event.preventDefault();
          that.toggleSearch();
        }
      });
      $(window).on('keydown', null, 'ctrl+x', function(event) {
        if (that.$el.is(':visible')) {
          that.model.set('searchState', false);
        }
      });
      return this;
    },
    events: {
      'click .save-icon': '_onSaveClicked',
      'click .pin-icon': '_onSavePinClicked',
      'keydown .editor': '_onKeyDown',
      'keyup .editor': '_onKeyUp',
      'change .editor': 'storeText',
      'keydown .searchbar': '_onSearchKeyDown',
      'keyup .searchbar': 'storeSearch'
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
        } else if (event.ctrlKey) { // control+enter for save with search text
          this.saveWithSearch();
          event.preventDefault();
        }
        break;
      case KeyCode.ESC:
        this.reset();
        break;
      case KeyCode.S:
        if (event.ctrlKey){
          event.preventDefault();
          this.save();
        }
        break;
      }
    },
    _onSearchKeyDown: function(event) {
      this._fixSearchHeight();
      var keyCode;
      event = event || window.event;
      keyCode = event.keyCode || event.which;
      switch(keyCode) {
      case KeyCode.X:
        if (event.ctrlKey) {
          this.model.set('searchState', false);
        }
        break;
      case KeyCode.ESC:
        this.model.set('searchState', false);
        break;
      case KeyCode.F:
        if (event.ctrlKey) {
          event.preventDefault();
          this.toggleSearch();
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
    storeSearch: function() {
      this.model.set('searchText', this.getSearch(), {source: this});
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
    saveWithSearch: function() {
      var contents = this.editor.getText();
      var searchContents = this.getSearch();
      this.editor.setText(searchContents + "<br>" + contents);
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
    },
    _fixSearchHeight: function() {
      _.delay(function() {
        var $searchbar = $('.searchbar');
        $searchbar.height("12px");
        $searchbar.height($searchbar[0].scrollHeight);
      });
    },
    toggleSearch: function() {
      if (!this.model.get('searchState')) {
        this.model.set('searchState', true);
        if (this.getText()) {
          this.setSearch(L.util.clean(this.getText()));
        } else {
          this.$searchbar.focus();
        }
      } else {
        this.$searchbar.select();
        this.$searchbar.focus();
      }
    },
    showSearch: function() {
      this.$searchbar.slideDown('fast');
      this._fixSearchHeight();
    },
    hideSearch: function() {
      this.setSearch("");
      this.$searchbar.slideUp('fast');
    },
    getSearch: function() {
      return this.$searchbar[0].value;
    },
    setSearch: function(text) {
      this.$searchbar[0].value = text;
      this.storeSearch();
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
      this.listenTo(L.omnibox, 'change:searchState', this.render);
      this.listenTo(L.preferences, 'change:shrinkNotes', this.render);
      this.listenTo(L.server, 'change:syncingNotes', this.render);
    },
    render: function() {
      this.$el.html(L.templates["omnibox/controls"]({
        searchState: L.omnibox.get('searchState'),
        shrinkState: L.preferences.get('shrinkNotes'),
        syncState: L.server.get('syncingNotes')
      }));
      return this;
    },
    events: {
      'click #searchIcon': 'searchClicked',
      'click #syncIcon': 'syncClicked',
      'click #shrinkIcon': 'shrinkClicked'
    },
    searchClicked: function(event) {
      L.omnibox.set('searchState', !L.omnibox.get('searchState'));
    },
    syncClicked: function(event) {
      L.server.syncNotes();
    },
    shrinkClicked: function(event) {
      L.preferences.toggleShrink();
    }
  });


})(ListIt);
