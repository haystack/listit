(function(L) {
  'use strict';

  L.models.SavedSearch = Backbone.Model.extend({
    defaults: {
      text: '',
      active: false
    }
  });
  L.models.SavedSearchCollection = Backbone.Collection.extend({
    model: L.models.SavedSearch,
    initialize: function() {
      this.listenTo(this, 'change:active',function() {
        this.trigger('search');
      });
      this.listenTo(this, 'change:text', function(model) {
        if (model.get('active')) {
          this.trigger('search');
        }
      });
      this.listenTo(this, 'add remove', function(model) {
        if (model.get('active')) {
          this.trigger('search');
        }
      });
    },
    text: function() {
      return _.map(this.where({'active': true}), function(m) { return m.get('text'); }).join(' ');
    }
  });
  L.models.Omnibox = Backbone.RelModel.extend({
    // Singleton
    autoFetch: true,
    url : '/omnibox',
    isNew: function() {
      return false;
    },
    defaults: {
      text: '',
      searchText: ''
    },
    relations: {
      savedSearches: {
        type: L.models.SavedSearchCollection,
        includeInJSON: true
      }
    },
    initialized: function() {
      // Stop search when typing but don't start next search until stop.
      this.listenTo(this, 'change:text', function() {
        if (!this.get('searchState')) {
          this.requestSearch();
        }
      });
      this.listenTo(this, 'change:searchText', function(m, text) {
        if (this.get('searchState')) {
          this.requestSearch();
        }
      });
      this.listenTo(this, 'change:searchState', function(m, state) {
        if (state) {
          // Default to current omnibox text.
          if (!this.get('searchText')) {
            this.set('searchText', _.str.trim(_.str.stripTags(this.get('text') || '')));
          }
        } else {
          this.set('searchText', '');
        }
        this.requestSearch();
      });
      this.listenTo(this, 'change', _.mask(this.throttledSave));
      this.listenTo(this.get('savedSearches'), 'change add remove', _.mask(this.throttledSave));
      this.listenTo(this.get('savedSearches'), 'search', this.requestSearch);
      this.listenTo(L.preferences, 'change:showSavedSearches', this.requestSearch);
      this.requestSearch();
    },
    throttledSave: _.debounce(function() { this.save.apply(this, arguments); }, 500),
    requestSearch: _.debounce(function() {
      var text = this.get(this.get('searchState') ? 'searchText' : 'text') || '';
      if (L.preferences.get('showSavedSearches')) {
        text = text + ' ' + this.get('savedSearches').text();
      }
      var searchText = L.util.clean(text);
      var searchID = L.sidebar.search(searchText);
      this.trigger("user:search", this, text, searchID);
    }, 100),
    saveNote: function(options, window) {
      options = options || {};
      var contents = L.util.strip(this.get('text'));
      var meta = options.meta || {};
      if (!options.excludeSearch) {
        // Do this by extracting terms to get rid of negative terms...
        var searchText = L.util.extractTerms(this.get('searchText')).positive.join(' ');
        if (searchText) {
          contents = searchText + '<br />' + contents;
        }
      }
      if (options.pinned && !_.str.startsWith(contents, '!')) {
        contents = '! ' + contents;
      }
      var note = L.notebook.createNote({
        contents: contents,
        meta: meta
      }, window);
      this.trigger("note-created", this, note);
      return note;
    },
    appendSearch: function(text) {
      var search = this.get('searchText') || "";
      if (search && !_.str.endsWith(search, " ")) {
        search += " ";
      }
      this.set({
        searchText: search + text,
        searchState: true
      });
    },
    tagToggle: function(text) {
      var searchText = this.get('searchText');
      if (searchText) {
        var newSearchText = searchText.replace(new RegExp("(^|\\s+)"+text+"(\\s+|)", 'i'), "$1");
        if (newSearchText !== searchText) {
          this.set('searchText', newSearchText);
          return;
        }
      }
      this.appendSearch(text);
    }
  });
})(ListIt);
