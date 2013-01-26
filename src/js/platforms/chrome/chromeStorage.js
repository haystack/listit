(function(L) {
  var ChromeStorage =  {
    storage: chrome.storage.local,
    get: function(key, options) {
      ChromeStorage.storage.get(key, function(vals) {
        // Check for errors conditions.
        var error;
        if (options) {
          if (chrome.runtime.lastError) {
            if (options && options.error) {
              options.error(chrome.runtime.lastError);
            }
            error = chrome.runtime.lastError;
          } else if (!vals.hasOwnProperty(key)) {
            error = "Not Found";
          }

          if (error !== undefined) {
            if (options.error) options.error(error);
          } else {
            if (options.success) options.success(vals[key]);
          }
        }
      });
    },
    set: function(key, object, options) {
      var o = {};
      o[key] = object;
      ChromeStorage.storage.set(o, function() {
        if (options) {
          if (chrome.runtime.lastError) {
            if (options.error) options.error(chrome.runtime.lastError);
          } else {
            if (options.success) options.success(object);
          }
        }
      });
    },
    remove: function(key, options) {
      ChromeStorage.storage.remove(key, function() {
        if (options) {
          if (chrome.runtime.lastError) {
            if (options.error) options.error(chrome.runtime.lastError);
          } else {
            if (options.success) options.success();
          }
        }
      });
    },
    clear: function(options) {
      ChromeStorage.storage.clear(function() {
        if (options) {
          if (chrome.runtime.lastError) {
            if (options.error) options.error(chrome.runtime.lastError);
          } else {
            if (options.success) options.success();
          }
        }
      });
    }
  };

  L.store = ChromeStorage;
})(ListIt);
