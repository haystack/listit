(function(L) {
  'use strict';
  L.observers.OmniboxObserver = {
    condition: function(studies) {
      return studies.study2 && L.sidebar && L.omnibox;
    },
    start: function() {
      this.pendingEntries = [];
      // Record that the user triggered a search through the omnibox.
      L.omnibox.on("user:search", function(m, newSearch, searchID) {
        this.searchID = searchID;
      }, this);

      // Log completed searches:
      //   at most every .5 seconds
      //   if they were triggered by the omnibox
      L.sidebar.on("search:complete", _.debounce(function(terms, id) {
        if (this.searchID !== null && this.searchID === id) {
          if (terms === null) {
            if (this.pendingEntries.length > 0) {
              this.addPendingEntry({action: LogType.SEARCH_CLEAR});
              this.commitPendingEntries();
            }
          } else {
            this.addPendingEntry({
              action: LogType.SEARCH,
              terms: terms, // This has both positive and negative terms XXX: Might break stuff.
              noteids: L.sidebar.pluck('id')
            });
          }
          this.searchID = null;
        }
      }.bind(this), 500));

      L.omnibox.on("note-created", function(m, note) {
        this.clearPendingEntries();
        this.addEntry({
          action: LogType.CREATE_SAVE,
          noteid: note.id,
          contents: note.get('contents'),
          pinned: note.get('meta').pinned ? true : false
        });
      }, this);
    },
    stop: function() {
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

