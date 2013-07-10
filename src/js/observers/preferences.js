(function(L) {
  'use strict';
  L.observers.PreferencesObserver = {
    condition: function() {
      return L.preferences;
    },
    setup: function() {
      L.preferences.on('change:shrinkNotes', function(model, state) {
        L.logger.create({action: LogType[state ? "SHRINK" : "EXPAND"]});
      });
    },
    destroy: function() {
      L.preferences.off(null, null, this);
    }
  };
})(ListIt);
