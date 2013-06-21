(function(L) {
  'use strict';
  L.observers.PreferencesObserver = {
    condition: function() {
      return L.preferences;
    },
    setup: function() {
      var notes = L.notebook.get('notes');
      L.preferences.on('change:shrinkNotes', function(model, state) {
        L.logger.add({action: LogType[state ? "SHRINK" : "EXPAND"]});
      });
    },
    destroy: function() {
      L.preferences.off(null, null, this);
    }
  };
})(ListIt);
