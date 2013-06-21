/*global chrome:true */

ListIt.chrome = {
  views: {},
  models: {},
  ports: {}
};


$(window).one('beforeunload', function() {
  'use strict';
  ListIt.gvent.trigger('sys:quit');
});


ListIt.lvent.once('setup:models:after', function(L, barr) {
  'use strict';
  // Create omnibox.
  L.chrome.omnibox = new L.models.FilterableNoteCollection(null, {track: L.notebook.get('notes')});

  // Handle ports.
  chrome.runtime.onConnect.addListener(function(port) {
    var portHandler = L.chrome.ports[port.name];
    if (portHandler) {
      portHandler(port);
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
