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
          callback(true);
        } else {
          chrome.windows.update(current_sidebar_id, {
            focused: true,
          }, function(win) {
            callback(!!win);
          });
        }
      } else {
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
              sidebar._open();
            }
          });
        }
      } else {
        sidebar._open();
      }
    },
    isOpen: function(callback) {
      chrome.windows.get(current_sidebar_id, function(win) {
        callback(!!win);
      });
    },
    close: function(callback) {
      chrome.windows.remove(current_sidebar_id, callback);
    }
  };

  chrome.browserAction.onClicked.addListener(function() {
    L.chrome.sidebar.openOrFocus();
  });

  L.preferences.on('change:popup', function(model, value) {
    chrome.browserAction.setPopup({popup: (value ? "index.html" : '')})
  });
  chrome.browserAction.setPopup({popup: (L.preferences.get('popup') ? "index.html" : '')})
});
