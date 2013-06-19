(function(L) {
  L.models.Preferences.prototype.schema.popup = {
    type: 'boolean',
    description: 'Use the chrome addon popup instead of a new window.'
  };

  L.models.Preferences.prototype.defaults.popup = false;
})(ListIt);

