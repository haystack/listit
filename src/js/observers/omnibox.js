(function(L) {
  'use strict';
  L.observers.OmniboxObserver = {
    condition: function() {
      return L.sidebar && L.omnibox;
    },
    setup: function() {
      var that = this;
      this.pendingEntries = [];
      // Record that the user triggered a search through the omnibox.
      L.omnibox.on("user:search", function(m, newSearch, searchID) {
        that.searchID = searchID;
      }, this);

      // Log completed searches:
      //   at most every .5 seconds
      //   if they were triggered by the omnibox
      L.sidebar.on("search:complete", _.debounce(function(terms, id) {
        if (that.searchID !== null && that.searchID === id) {
          if (terms === null) {
            if (that.pendingEntries.length > 0) {
              that.addPendingEntry({action: LogType.SEARCH_CLEAR});
              that.commitPendingEntries();
            }
          } else {
            that.addPendingEntry({
              action: LogType.SEARCH,
              terms: terms, // This has both positive and negative terms XXX: Might break stuff.
              noteids: L.sidebar.pluck('id')
            });
          }
          that.searchID = null;
        }
      }, 500));

      L.omnibox.on("note-created", function(m, note) {
        that.clearPendingEntries();
        that.addEntry({
          action: LogType.CREATE_SAVE,
          noteid: note.id,
          contents: note.get('contents'),
          pinned: note.get('meta').pinned ? true : false
        });
      }, this);
    },
    destroy: function() {
      L.omnibox.off(null, null, this);
      L.sidebar.off(null, null, this);
    },
    addPendingEntry: function(data) {
      this.pendingEntries.push(new L.models.LogEvent(data));
    },
    addEntry: function(data) {
      L.logger.create(data);
    },
    commitPendingEntries: function() {
      var pending = this.clearPendingEntries();
      _.each(pending, function(p) {
        L.logger.create(p);
      });
    },
    clearPendingEntries: function() {
      var pending = this.pendingEntries;
      this.pendingEntries = [];
      return pending;
    }
  };
})(ListIt);

