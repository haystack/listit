/*global chrome:true */

ListIt.chrome = {
  views: {},
  models: {},
  ports: {}
};


$(window).one('beforeunload', function() {
    ListIt.gvent.trigger('sys:quit');
});


ListIt.lvent.once('setup:models:after', function(L, barr) {
  'use strict';
  // Create omnibox.
  L.chrome.omnibox = new L.models.FilterableNoteCollection();

  // Handle ports.
  chrome.runtime.onConnect.addListener(function(port) {
    var port_handler = L.chrome.ports[port.name];
    if (port_handler) {
      port_handler(port);
    } else {
      port.disconnect();
    }
  });
});

ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  L.chrome.omniboxView = new L.chrome.views.ChromeOmniboxView({
    collection: L.chrome.omnibox
  });
  L.chrome.contextMenu = new L.chrome.views.ContextMenu();
});
