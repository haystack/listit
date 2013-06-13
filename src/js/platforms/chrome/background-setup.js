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
  var current_popup_id = null;
  var open_popup = function() {
    current_popup_id = true;
    chrome.windows.getCurrent(function(cwin) {
      chrome.windows.create({
        url:"index.html",
        type: "popup",
        width: 400,
        height: cwin.height,
        left: cwin.left-410,
        top: cwin.top,
        focused: true
      }, function(win) {
        current_popup_id = win.id;
      });
    });
  };

  chrome.browserAction.onClicked.addListener(function() {
    if (current_popup_id) {
      chrome.windows.get(current_popup_id, function(win) {
        if (win && current_popup_id) {
          chrome.windows.remove(win.id);
          current_popup_id = null;
        } else {
          open_popup()
        }
      });
    } else {
      open_popup()
    }
  });
  L.preferences.on('change:popup', function(model, value) {
    chrome.browserAction.setPopup({popup: (value ? "index.html" : '')})
  });
  chrome.browserAction.setPopup({popup: (L.preferences.get('popup') ? "index.html" : '')})
});

ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  L.chrome.omniboxView = new L.chrome.views.ChromeOmniboxView({
    collection: L.chrome.omnibox
  });
  L.chrome.contextMenu = new L.chrome.views.ContextMenu();
});
