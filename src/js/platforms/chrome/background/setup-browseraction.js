/*global chrome: false*/
ListIt.lvent.once("setup:views", function(L, barr) {
  'use strict';
  var currentSidebarId = null;
  var sidebar = L.chrome.sidebar = _.extend({
    // Does not check if open.
    _open: function(callback) {
      currentSidebarId = true;
      chrome.windows.getCurrent(function(mainWindow) {
        chrome.windows.create({
          url:"index.html",
          type: "popup",
          width: 350,
          height: mainWindow.height,
          left: mainWindow.left-360,
          top: mainWindow.top,
          focused: true
        }, function(sidebarWindow) {
          currentSidebarId = sidebarWindow.id;
          if (callback) {
            callback(sidebarWindow);
          }
          sidebar.trigger('open', sidebarWindow, mainWindow);
        });
      });
    },
    focus: function(callback) {
      if (currentSidebarId) {
        if (currentSidebarId === true) {
          // Opening, no point in focusing.
          if (callback) {
            callback(true);
          }
        } else {
          chrome.windows.update(currentSidebarId, {
            focused: true
          }, function(win) {
            if (!win) {
              // Window really didn't exist, fix it.
              var oldSidebarId = currentSidebarId;
              currentSidebarId = null;
              sidebar.trigger('close', oldSidebarId);
            }
            if (callback) {
              callback(!!win);
            }
          });
        }
      } else if (callback) {
        callback(false);
      }
    },
    openOrFocus: function() {
      if (currentSidebarId) {
        if (currentSidebarId !== true) {
          chrome.windows.get(currentSidebarId, function(currentSidebar) {
            if (currentSidebar.focused) {
              // if sidebar is focused, close it.
              sidebar.close();
            } else {
              // otherwise, focus it.
              chrome.windows.update(currentSidebarId, {
                focused: true
              }, function(win) {
                if (!win) {
                  // Window really didn't exist, fix it.
                  var oldSidebarId = currentSidebarId;
                  currentSidebarId = null;
                  sidebar.trigger('close', oldSidebarId);
                  sidebar._open();
                }
              });
            }
          });
        }
      } else {
        sidebar._open();
      }
    },
    isOpen: function(callback) {
      // Yes, this really does double check whether the sidebar is really open.
      // This would be a really bad place to have a bug.
      if (currentSidebarId) {
        if (currentSidebarId === true) {
          callback(true);
        } else {
          // Double check.
          chrome.windows.get(currentSidebarId, function(win) {
            // Fix error
            if (!win) {
              var oldSidebarId = currentSidebarId;
              currentSidebarId = null;
              sidebar.trigger('close', oldSidebarId);
            }
            callback(!!win);
          });
        }
      } else {
        callback(false);
      }
    },
    close: function(callback) {
      // Will fail if the sidebar is currently opening but it isn't worth it to
      // fix that.
      if (currentSidebarId && currentSidebarId !== true) {
        chrome.windows.remove(currentSidebarId, callback);
      } else if (callback) {
        callback();
      }
    }
  }, Backbone.Events);

  // Track sidebar close event
  chrome.windows.onRemoved.addListener(function(windowId) {
    if (windowId === currentSidebarId) {
      currentSidebarId = null;
      sidebar.trigger('close', windowId);
    }
  });


  chrome.browserAction.onClicked.addListener(function() {
    L.chrome.sidebar.openOrFocus();
  });

  L.preferences.on('change:popup', function(model, value) {
    chrome.browserAction.setPopup({popup: (value ? "index.html" : '')});
  });
  chrome.browserAction.setPopup({popup: (L.preferences.get('popup') ? "index.html" : '')});
});
