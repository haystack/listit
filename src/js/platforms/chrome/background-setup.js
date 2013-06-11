/*global chrome:true */

ListIt.chrome = {
  views: {},
  models: {}
};


$(window).one('beforeunload', function() {
    ListIt.gvent.trigger('sys:quit');
});


ListIt.lvent.once('setup:models:after', function(L, barr) {
  'use strict';
  L.chrome.omnibox = new L.models.FilterableNoteCollection();

  L.gvent.on('log:request:data', function(logEntry) {
    //barr.aquire();
    chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
      var tab = tabs[0];
      logEntry.set('tabid', tab.id);
      if (!logEntry.get('url')) {
        logEntry.set('url', tab.url);
      }
      //barr.release();
    });
  });
});

ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  L.chrome.omniboxView = new L.chrome.views.ChromeOmniboxView({
    collection: L.chrome.omnibox
  });
  L.chrome.contextMenu = new L.chrome.views.ContextMenu();
});
