/*global chrome: false*/
ListIt.lvent.once("setup:models:after", function(L, barr) {
  'use strict';

  L.gvent.on('log:request:data', function(logEntry) {
    // Query optional permission.
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var tab = tabs[0];
      // Ignore incognito tabs.
      if (tab.incognito) {
        return;
      }
      logEntry.set('tabid', tab.id);
      if (!logEntry.get('url')) {
        logEntry.set('url', tab.url);
      }
    });
  });

});
