ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';
  // Make Pages
  L.addPage('main', new L.views.MainPage());
});
ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  // Fix options link on chrome.
  $('[href="#/options"]').attr({
    'target': '_new',
    'href': '/options.html'
  });
});
