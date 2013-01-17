
(function(L) {
  'use strict';
  // Setup views

  L.vent.once('setup:views', function(window) {
    // Make Pages
    L.addPage('main', new L.views.MainPage());
  });
  L.vent.once('setup:views:after', function(window) {
    // Fix options link on chrome.
    $('[href="#/options"]').attr({
      'target': '_new',
      'href': '/options.html'
    });
  });
})(ListIt);
