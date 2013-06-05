/*global chrome:true */
// Proxy background events.

(function(L) {
    'use strict';

    $(window).one('beforeunload', function() {
        L.gvent.trigger('sys:quit');
    });

    // I can't find the memory leak so, for now, shred stuff.
    var shred = function(o) {
      for (var k in o) {
        if (o.hasOwnProperty(k)) {
          try {
            delete o[k];
          } catch (e) {}
        }
      }
    };

    L.gvent.on('sys:window-closed', function(win) {
      _.defer(function() {
        // Remove reference to background.
        delete win['background'];
        // Shred attached objects
        for (var k in win) {

          if (win.hasOwnProperty(k)) {
            shred(win[k]);
          }
        }
        // Shred window
        shred(win);
      });
    });
    L.chrome = {
      views: {},
      models: {}
    };
    L.lvent.once('setup:models:after', function(L) {
      L.chrome.omnibox = new L.models.FilterableNoteCollection();
    });

    L.lvent.once('setup:views:after', function(L) {
      L.chrome.omniboxView = new L.chrome.views.ChromeOmniboxView({
        collection: L.chrome.omnibox
      });
      L.chrome.contextMenu = new L.chrome.views.ContextMenu();
    });

    L.gvent.on('log:request:data', function(logEntry) {
      //barr.aquire();
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        logEntry.set('tabid', tab.id);
        var info = logEntry.get('info');
        if (!info.url) {
          info.url = tab.url;
        }
        //barr.release();
      });
    });

})(ListIt);
