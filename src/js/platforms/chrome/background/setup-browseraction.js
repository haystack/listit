ListIt.lvent.once("setup:views:after", function(L, barr) {

  var current_sidebar_id = null;
  var sidebar = L.chrome.sidebar = {
    // Does not check if open.
    _open: function(callback) {
      current_sidebar_id = true;
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
          current_sidebar_id = win.id;
          if (callback) {
            callback(win);
          }
        });
      });
    },
    focus: function(callback) {
      if (current_sidebar_id) {
        if (current_sidebar_id === true) {
          // Opening, no point in focusing.
          if (callback) {
            callback(true);
          }
        } else {
          chrome.windows.update(current_sidebar_id, {
            focused: true,
          }, function(win) {
            if (!win) {
              // Window really didn't exist, fix it.
              current_sidebar_id = null;
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
      if (current_sidebar_id) {
        if (current_sidebar_id !== true) {
          chrome.windows.update(current_sidebar_id, {
            focused: true
          }, function(win) {
            if (!win) {
              // Window really didn't exist, fix it.
              current_sidebar_id = null;
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
      if (current_sidebar_id) {
        if (current_sidebar_id === true) {
          callback(true);
        } else {
          // Double check.
          chrome.windows.get(current_sidebar_id, function(win) {
            // Fix error
            if (!win) {
              current_sidebar_id = null;
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
      if (current_sidebar_id && current_sidebar_id !== true) {
        chrome.windows.remove(current_sidebar_id, callback);
      } else if (callback) {
        callback();
      }
    }
  };

  // Track sidebar close event
  chrome.windows.onRemoved.addListener(function(win_id) {
    if (win_id === current_sidebar_id) {
      current_sidebar_id = null;
    }
  });


  chrome.browserAction.onClicked.addListener(function() {
    L.chrome.sidebar.openOrFocus();
  });

  L.preferences.on('change:popup', function(model, value) {
    chrome.browserAction.setPopup({popup: (value ? "index.html" : '')})
  });
  chrome.browserAction.setPopup({popup: (L.preferences.get('popup') ? "index.html" : '')})
});
