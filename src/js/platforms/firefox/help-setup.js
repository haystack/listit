ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';
  L.addPage('options', new L.views.HelpPage({platform: "firefox"}));
});
