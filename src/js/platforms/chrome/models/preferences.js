(function(L) {
  'use strict';
  L.models.Preferences.prototype.schema = _.defaults({
    popup: {
      type: 'boolean',
      description: 'Use the chrome addon popup instead of a new window.'
    },
    sidebarTrackWindow: {
      type: 'boolean',
      description: "Make list.it's window track the main window (may drain battery)"
    }
  }, L.models.Preferences.prototype.schema);

  L.models.Preferences.prototype.defaults = _.defaults({
    popup: false,
    sidebarTrackWindow: false
  }, L.models.Preferences.prototype.defaults);
})(ListIt);

