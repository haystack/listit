(function(L) {
  'use strict';
  L.models.Omnibox = Backbone.Model.extend({
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
    initialized: function() {
      var slowSearch = _.debounce(this.requestSearch, 100);
      var that = this;
      // Stop search when typing but don't start next search until stop.
      this.listenTo(this, 'change:text', function() {
        if (!this.get('searchState')) {
          slowSearch.call(that, {user: true});
        }
      });
      this.listenTo(this, 'change:searchText', function(m, text) {
        if (this.get('searchState')) {
          slowSearch.call(that, {user:true});
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
        slowSearch.call(that, {user:true});
      });
      this.listenTo(this, 'change', _.mask(this.throttledSave));
      this.requestSearch();
    },
    throttledSave: _.debounce(function() { this.save.apply(this, arguments); }, 500),
    requestSearch: function(options) {
      var text = L.util.clean(this.get(this.get('searchState') ? 'searchText' : 'text') || '');
      var searchID = L.sidebar.search(text);
      this.trigger("user:search", this, text, searchID);
    },
    saveNote: function(options, window) {
      options = options || {};
      var contents = L.util.strip(this.get('text'));
      var meta = options.meta || {};
      if (options.includeSearch) {
        var searchText = _.str.trim(this.get('searchText'));
        if (searchText) {
          contents = searchText + ' ' + contents;
        }
      }
      if (options.pinned) {
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
