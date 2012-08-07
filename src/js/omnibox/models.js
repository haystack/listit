(function(L) {
    'use strict';
    L.make.omnibox.OmniboxModel = Backbone.Model.extend({
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
            this.on('change:text', function() {
                slowSearch.apply(that);
            }, this);
            L.vent.on('user:search', this.requestSearch, this);
            L.vent.on('user:save-note', this.saveNote, this);
            this.on('change', this.throttledSave, this);
            this.fetch();
            this.requestSearch();
        },
        throttledSave: _.debounce(function() { this.save(); }, 500),
        requestSearch: function() {
            var text = L.util.clean(this.get('text') || '');
            L.sidebar.search(text);
        },
        saveNote: function(meta) {
            L.addNote(this.get('text'), meta);
        }
    });
})(ListIt);
