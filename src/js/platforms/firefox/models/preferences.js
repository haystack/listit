(function(L) {
  'use strict';
  L.models.Preferences.prototype.schema = _.defaults({
    openHotkey: {
      type: 'hotkey',
      description: "Hotkey to open the sidebar"
    }
  }, L.models.Preferences.prototype.schema);

  L.models.Preferences.prototype.defaults = _.defaults({
    openHotkey: "ctrl+shift+l",
  }, L.models.Preferences.prototype.defaults);
})(ListIt);

