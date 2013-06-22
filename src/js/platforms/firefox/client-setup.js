ListIt.lvent.once('setup:before', function(L, barr) {
  'use strict';
  var backgroundWindow = {};
  Components.utils.import("chrome://listit/content/background.jsm", backgroundWindow);

  var bgL = backgroundWindow.ListIt;
  // Wait until ready
  if (bgL.status !== 'ready') {
    barr.aquire();
    bgL.lvent.once('status:ready', function() {
      L.gvent = bgL.gvent;
      _.defaults(L.models, bgL.models);
      _.defaults(L, bgL);
      barr.release();
    });
  } else {
    L.gvent = bgL.gvent;
    _.defaults(L.models, bgL.models);
    _.defaults(L, bgL);
  }
});
