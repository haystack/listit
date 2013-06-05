(function(L) {
  L.observers.PreferencesObserver = {
    condition: function() {
      return L.preferences;
    },
    addEntry: function(type, data) {
      L.logger.add(L.models.LogEvent.create(type, data));
    },
    setup: function() {
      var that = this;
      var notes = L.notebook.get('notes');
      L.preferences.on('change:shrinkNotes', function(model, state) {
        that.addEntry(LogType[state ? "SHRINK" : "EXPAND"]);
      });
    },
    destroy: function() {
      L.preferences.off(null, null, this);
    },
  }
})(ListIt);
