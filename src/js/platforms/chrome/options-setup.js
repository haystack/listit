(function(L) {
  'use strict';
  // Setup views

  L.vent.once('setup:views', function(window) {
    // Make Pages
    L.addPage('options', new L.views.OptionsPage());
  }, window);
})(ListIt);
