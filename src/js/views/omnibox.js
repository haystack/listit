(function(L) {
  'use strict';
  /**
   * @filedesc View: omnibox input. Provides search and note-creation.
   *
   * @author: wstyke@gmail.com - Wolfe Styke
   */

  L.views.OmniboxView = Backbone.View.extend({
    id: 'omnibox',
    className: 'flex vbox note-creator',
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
        if (search === "") {
          this.$searchbarClear.hide();
        } else {
          this.$searchbarClear.show();
        }
        if (o && o.source !== this) {
          this.setSearch(search);
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

      // Searchbar
      this.$el.append(L.templates['omnibox/searchbar']({text: this.model.get('searchText')}));
      this.$searchbarContainer = this.$('.searchbar');
      this.$searchbarClear = this.$searchbarContainer.children('.clear-btn');
      this.$searchbar = this.$searchbarContainer.children('input');

      if (!this.model.get('searchState')) {
        this.$searchbarContainer.hide();
      }

      // Editor
      this.editor = new L.views.Editor({
        text: this.model.get('text')||'',
        actions: L.templates['create-actions']()
      });
      this.editor.render();

      this.$el.append(this.editor.el);

      // Saved Searches
      this.$el.append(new L.views.SavedSearchBarView({collection: this.model.get('savedSearches')}).render().$el);

      // Done
      this._rendered = true;

      // Bind
      var that = this;
      $(window).on('keydown', null, 'ctrl+f', function(event) {
        if (that.$el.is(':visible')) {
          event.preventDefault(); // Don't open the findbar
          that.model.set('searchState', true);
          that.$searchbar.select().focus();
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
      // Buttons
      'click                  .save-icon' : '_onSaveTriggered',
      'click                  .pin-icon'  : '_onSavePinTriggered',

      // Hotkeys
      'keydown[shift+return]  .editor'    : '_onSaveTriggered',
      'keydown[ctrl+s]        .editor'    : '_onSaveTriggered',
      'keydown[ctrl+return]   .editor'    : '_onSaveWithoutSearchTriggered',
      'keydown[esc]           .editor'    : '_onResetTriggered',
      'keydown[esc]           .searchbar input' : '_onHideSearchbarTriggered',
      'click                  .searchbar .clear-btn' : '_onSearchClear',

      // Autosave
      'keyup                  .searchbar input' : 'storeSearch',
      'change                 .searchbar input' : 'storeSearch',
      'keyup                  .editor'    : 'storeText',
      'change                 .editor'    : 'storeText'
    },
    _onHideSearchbarTriggered: function(event) {
      this.model.set('searchState', false);
    },
    // Handle esc/shift-enter
    _onResetTriggered: function(event) {
      this.reset();
    },
    // Store text on change.
    _onKeyUp: function(event) {
      this.storeText();
    },
    _onSearchClear: function() {
      this.model.set('searchText', '');
    },
    storeText: function() {
      this.assertRendered();
      this.model.set('text', this.getText(), {source: this});
    },
    storeSearch: function() {
      this.model.set('searchText', this.getSearch(), {source: this});
    },
    /**
     * Handles new-note save trigger events.
     * @param {object} event event
     * @private
     */
    _onSaveTriggered: function(event) {
      this.save();
      event.preventDefault();
    },
    _onSaveWithoutSearchTriggered: function(event) {
      this.save({excludeSearch: true});
      event.preventDefault();
    },
    /**
     * Handles New Note Save w/ Place & URL Relevance Info:
     * @param {object} event The click event.
     * @private
     */
    _onSavePinTriggered: function(event) {
      this.save({pinned: true});
      event.preventDefault();
    },
    save: function(options) {
      this.assertRendered();
      this.storeText();
      this.model.saveNote(options||{}, window);
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
    showSearch: function() {
      this.$searchbarContainer.slideDown('fast');
    },
    hideSearch: function() {
      this.$searchbarContainer.slideUp('fast');
    },
    getSearch: function() {
      return this.$searchbar[0].value;
    },
    setSearch: function(text) {
      this.$searchbar.val(text);
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
      this.listenTo(L.server, 'change:syncingNotes', this.render);
      this.listenTo(L.sidebar, 'change:searchFail', this.render);
    },
    render: function() {
      this.$el.html(L.templates["omnibox/controls"]({
        searchFail: L.sidebar.searchFail,
        searchState: L.omnibox.get('searchState'),
        loginState: L.server.get('registered'),
        syncState: L.server.get('syncingNotes')
      }));
      return this;
    },
    events: {
      'click #searchIcon': 'searchClicked',
      'click #syncIcon': 'syncClicked'
    },
    searchClicked: function(event) {
      L.omnibox.set('searchState', !L.omnibox.get('searchState'));
    },
    syncClicked: function(event) {
      L.server.syncNotes();
    }
  });

  L.views.SavedSearchBarView = Backbone.View.extend({
    template: L.templates['omnibox/savedsearchbar'],
    id: 'savedSearchBar',
    className: 'hbox',
    initialize: function() {
      this.subViews = {};
    },
    updateShowSavedSearches: function(model, value) {
      this.$el.toggle(value);
    },
    _getOrCreateSubview: function(model) {
      return this.subViews[model.cid] || (
        this.subViews[model.cid] = new L.views.SavedSearchView({model: model})
      );
    },
    _removeSubview: function(model) {
      var subview = this.subViews[model.cid];
      if (subview) {
        subview.remove();
        delete this.subViews[model.cid];
      }
    },
    events: {
      'click #savedSearchEditButton': 'toggleEditing',
      'click #savedSearchAddButton': 'addSavedSearch'
    },
    addSavedSearch: function() {
      this.collection.add(new L.models.SavedSearch());
    },
    toggleEditing: function() {
      this.editing = !this.editing;
      this.$el.toggleClass("editing", this.editing);
      _.each(this.subViews, function(v) {
        v.toggleEditing(this.editing);
      }, this);
    },
    render: function() {
      this.$el.html(this.template());
      this.collection.each(function(model) {
        var view = this._getOrCreateSubview(model);
        this.$("#savedSearches").append(view.render().$el);
      }, this);
      if (!L.preferences.get('showSavedSearches')) {
        this.$el.hide();
      }

      this.stopListening();
      this.listenTo(L.preferences, 'change:showSavedSearches', this.updateShowSavedSearches);
      this.listenTo(this.collection, 'add', function(model) {
        var view = this._getOrCreateSubview(model);
        this.$("#savedSearches").append(view.render().$el);
        // Auto focus empty saved searches on add.
        if (this.editing) {
          view.toggleEditing(true);
          if (model.get("text") === "") {
            view.focus();
          }
        }
      });
      this.listenTo(this.collection, 'remove', function(model) {
        this._removeSubview(model);
      });
      return this;
    }
  });

  L.views.SavedSearchView = Backbone.View.extend({
    className: 'hbox savedSearch',
    template: L.templates['omnibox/savedsearch'],
    initialize: function() {
      $(window).one('beforeunload', function() {
        this.undelegateEvents();
        this.stopListening();
        this.toggleEditing(false);
      }.bind(this));
    },
    events: {
      'click .text': 'onClick',
      'click .close-btn': 'onDelete'
    },
    onClick: function() {
      if (!this.editing) {
        this.model.set('active', !this.model.get('active'));
      }
    },
    focus: function() {
      this.$(".text").focus();
    },
    onDelete: function() {
      this.model.destroy();
    },
    toggleEditing: function(value) {
      if (arguments.length > 0) {
        if (this.editing === value) {
          return;
        }
        this.editing = value;
      } else {
        this.editing = !this.editing;
      }
      this.$(".text").attr('contenteditable', this.editing);
      if (!this.editing) {
        this.model.set("text", this.$(".text").text());
      }
    },
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      this.$el.toggleClass("active", this.model.get("active"));
      if (this.editing) {
        this.$(".text").attr('contenteditable', true);
      }

      this.stopListening();
      this.listenTo(this.model, {
        'change:active': function(model, active) {
          this.$el.toggleClass("active", active);
        },
        'change:text': function(model, text) {
          this.$(".text").text(text);
        }
      });
      return this;
    }
  });

})(ListIt);
