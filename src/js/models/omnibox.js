(function(L) {
    'use strict';
    L.models.Omnibox = Backbone.Model.extend({
        // Singleton
        url : '/omnibox',
        isNew: function() {
            return false;
        },
        defaults: {
            text: ''
        },
        initialize: function() {
            var slowSearch = _.debounce(this.requestSearch, 100);
            var that = this;
            // Stop search when typing but don't start next search until stop.
            this.listenTo(this, 'change:text', function() {
                slowSearch.apply(that);
            });
            this.listenTo(L.gvent, 'user:search', this.requestSearch);
            this.listenTo(L.gvent, 'user:save-note', this.saveNote);
            this.listenTo(this, 'change', _.mask(this.throttledSave));

            this.fetch();
            this.requestSearch();
        },
        throttledSave: _.debounce(function() { this.save.apply(this, arguments); }, 500),
        requestSearch: function() {
            var text = L.util.clean(this.get('text') || '');
            L.sidebar.search(text);
        },
        saveNote: function(window) {
            return L.notebook.createNote(this.get('text'), {}, window);
        }
    });
})(ListIt);
