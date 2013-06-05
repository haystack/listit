(function(L) {
  L.observers.OmbiboxObserver = {
    condition: function() {
      return L.sidebar && L.omnibox;
    },
    setup: function() {
      var that = this;
      this.pendingEntries = [];
      // Record that the omnibox triggered a search.
      L.omnibox.on("search-requested", function(m, newSearch, searchID) {
        if (newSearch === '') {
          that.searchID = null;
          that.addPendingEntry(LogType.SEARCH_CLEAR);
          that.commitPendingEntries();
        } else {
          that.searchString = newSearch;
          that.searchID = searchID;
        }
      }, this);

      // Log completed searches:
      //   at most every .5 seconds
      //   if they were triggered by the omnibox
      L.sidebar.on("search:complete", _.debounce(function(terms, id) {
        if (that.searchID !== null && that.searchID === id) {
          that.addPendingEntry(LogType.SEARCH, {
            terms: that.searchString,
            noteids: L.sidebar.pluck('id')
          });
          that.searchID = null;
        }
      }, 500));

      L.omnibox.on("note-created", function(m, note) {
        that.clearPendingEntries();
        that.addEntry(LogType.CREATE_SAVE, {
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
    addPendingEntry: function(type, data) {
      this.pendingEntries.push(L.models.LogEvent.create(type, data));
    },
    addEntry: function(type, data) {
      L.logger.add(L.models.LogEvent.create(type, data));
    },
    commitPendingEntries: function() {
      var pending = this.clearPendingEntries();
      L.logger.add(pending);
      _.each(pending, function(m) {
        // TODO: Move to logger + autosave
        m.save();
      });
    },
    clearPendingEntries: function() {
      var pending = this.pendingEntries;
      this.pendingEntries = [];
      return pending;
    }
  };
})(ListIt);

