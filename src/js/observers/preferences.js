(function(L) {
  'use strict';
  L.observers.PreferencesObserver = {
    condition: function(studies) {
      return studies.study1 && L.preferences;
    },
    start: function() {
      L.preferences.on('change:shrinkNotes', function(model, state) {
        L.logger.create({action: LogType[state ? "SHRINK" : "EXPAND"]});
      });
    },
    stop: function() {
      L.preferences.off(null, null, this);
    }
  };
})(ListIt);
