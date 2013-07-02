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
      text: ''
    },
    initialized: function() {
      var slowSearch = _.debounce(this.requestSearch, 100);
      var that = this;
      // Stop search when typing but don't start next search until stop.
      this.listenTo(this, 'change:text', function() {
        slowSearch.call(that, {user: true});
      });
      this.listenTo(this, 'change', _.mask(this.throttledSave));
      this.requestSearch();
    },
    throttledSave: _.debounce(function() { this.save.apply(this, arguments); }, 500),
    requestSearch: function(options) {
      var text = L.util.clean(this.get('text') || '');
      var searchID = L.sidebar.search(text);
      this.trigger("user:search", this, text, searchID);
    },
    saveNote: function(window) {
      var note = L.notebook.createNote({
        contents: L.util.strip(this.get('text')),
        meta: {}
      }, window);
      this.trigger("note-created", this, note);
      return note;
    }
  });
})(ListIt);
