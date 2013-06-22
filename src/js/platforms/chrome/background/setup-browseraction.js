/*global chrome: false*/
ListIt.lvent.once("setup:views:after", function(L, barr) {
  'use strict';
  var currentSidebarId = null;
  var currentSidebarResizer = null;
  var sidebar = L.chrome.sidebar = {
    // Does not check if open.
    _open: function(callback) {
      currentSidebarId = true;
      chrome.windows.getCurrent(function(cwin) {
        chrome.windows.create({
          url:"index.html",
          type: "popup",
          width: 350,
          height: cwin.height,
          left: cwin.left-360,
          top: cwin.top,
          focused: true
        }, function(win) {
          if (L.preferences.get('sidebarTrackWindow', false)) {
            currentSidebarResizer = setInterval(function() {
              chrome.windows.get(cwin.id, function(mainWindow) {
                chrome.windows.get(win.id, function(sidebarWindow) {
                  if (mainWindow.height !== cwin.height || mainWindow.left !== cwin.left || mainWindow.top !== cwin.top || sidebarWindow.width !== win.width) {
                    chrome.windows.update(win.id, {
                      top: mainWindow.top,
                      left: mainWindow.left - sidebarWindow.width-10,
                      height: mainWindow.height
                    }, function() {
                      win = sidebarWindow;
                    });
                  }
                  cwin = mainWindow;
                });
              });
            }, 500);
          }
          currentSidebarId = win.id;
          if (callback) {
            callback(win);
          }
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
              currentSidebarId = null;
              clearInterval(currentSidebarResizer);
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
          chrome.windows.update(currentSidebarId, {
            focused: true
          }, function(win) {
            if (!win) {
              // Window really didn't exist, fix it.
              currentSidebarId = null;
              clearInterval(currentSidebarResizer);
              sidebar._open();
            }
          });
        }
      } else {
        sidebar._open();
      }
    },
    isOpen: function(callback) {
      // Yes, this really do double check whether the sidebar is really
      // open. This would be a really bad place to have a bug.
      if (currentSidebarId) {
        if (currentSidebarId === true) {
          callback(true);
        } else {
          // Double check.
          chrome.windows.get(currentSidebarId, function(win) {
            // Fix error
            if (!win) {
              currentSidebarId = null;
              clearInterval(currentSidebarResizer);
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
  };

  // Track sidebar close event
  chrome.windows.onRemoved.addListener(function(windowId) {
    if (windowId === currentSidebarId) {
      currentSidebarId = null;
      clearInterval(currentSidebarResizer);
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
