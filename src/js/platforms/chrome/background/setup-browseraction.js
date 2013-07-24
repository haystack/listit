/*global chrome: false*/
ListIt.lvent.once("setup:views:after", function(L, barr) {
  'use strict';
  var currentSidebarId = null;
  var currentSidebarResizer = null;
  var sidebar = L.chrome.sidebar = {
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
          /**
           * This is window the tracking code.
           *
           * Please put this somewhere else. I don't care enough.
           *
           **/
          if (L.preferences.get('sidebarTrackWindow', false)) {
            var resizing = false;
            var lastResize = Date.now();
            var resizer = function() {
              chrome.windows.get(mainWindow.id, function(newMainWindow) {
                // This can get triggered before it can be turned off.
                try {
                  chrome.windows.get(sidebarWindow.id, function(newSidebarWindow) {
                    if (!newSidebarWindow) {
                      clearInterval(currentSidebarResizer);
                      resizing = false;
                      return;
                    }
                    if ( newMainWindow.height   !== mainWindow.height
                      || newMainWindow.left     !== mainWindow.left
                      || newMainWindow.top      !== mainWindow.top
                      || newSidebarWindow.width !== sidebarWindow.width
                    ) {
                      try {
                        chrome.windows.update(sidebarWindow.id, {
                          top: newMainWindow.top,
                          left: newMainWindow.left - newSidebarWindow.width-10,
                          height: newMainWindow.height
                        }, function(newSidebarWindow) {
                          sidebarWindow = newSidebarWindow;
                        });
                      } catch (e) {
                        clearInterval(currentSidebarResizer);
                        resizing = false;
                        return;
                      }

                      mainWindow = newMainWindow;

                      lastResize = Date.now();
                      if (!resizing) {
                        debug('Fast sidebar tracking ON');
                        resizing = true;
                        clearInterval(currentSidebarResizer);
                        currentSidebarResizer = setInterval(resizer, 10);
                      }
                    } else if (resizing && lastResize + 500 < Date.now()) {
                      debug('Fast sidebar tracking OFF');
                      resizing = false;
                      clearInterval(currentSidebarResizer);
                      currentSidebarResizer = setInterval(resizer, 500);
                    }
                  });
                } catch (e) {
                  clearInterval(currentSidebarResizer);
                  resizing = false;
                  return;
                }
              });
            };
            currentSidebarResizer = setInterval(resizer, 500);
          }
          currentSidebarId = sidebarWindow.id;
          if (callback) {
            callback(sidebarWindow);
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
