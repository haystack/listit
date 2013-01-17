
(function(L) {
  'use strict';
  L.vent.once('setup:views', function(window) {
    // Make Pages
    L.addPage('main', new L.views.MainPage());
    L.addPage('options', new L.views.OptionsPage());
  });
})(ListIt);
