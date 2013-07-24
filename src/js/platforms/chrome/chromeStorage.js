
/*global chrome: false*/
(function(L) {
  "use strict";
  var ChromeStorage = L.stores['chrome'] = {
    storage: chrome.storage.local,
    /* Old non-batched versions.
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
            if (options.success) options.success();
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
    */
    // Batched Get
    get: _.debounceReduce(function(map, key, options) {
      if (!(options && (options.success || options.error))) {
        return; // Nothing to do
      }
      if (!map) {
        map = {};
      }
      var cbs = map[key];
      if (!cbs) {
        cbs = map[key] = [];
      }
      cbs.push(options);
      return map;
    },function(map) {
      if (!map) {
        return;
      }
      ChromeStorage.storage.get(_.keys(map), function(values) {
        if (chrome.runtime.lastError) {
          // Everyone gets an error.
          _.chain(map)
          .flatten()
          .pluck('error')
          .compact()
          .each(function(cb) {
            cb(chrome.runtime.lastError);
          });
        } else {
          _.each(map, function(callbacks, key) {
            if (values.hasOwnProperty(key)) {
              var value = values[key];
              _.chain(callbacks).pluck('success').compact().each(function(cb) {
                cb(value);
              });
            } else {
              _.chain(callbacks).pluck('error').compact().each(function(cb) {
                cb('Not Found');
              });
            }
          });
        }
      });
    }, 10, {}),
    set: _.debounceReduce(function(struct, key, object, options) {
      if (!struct) {
        struct = {
          values: {},
          callbacks: []
        };
      }
      struct.values[key] = object;
      if (options && (options.success || options.error)) {
        struct.callbacks.push(options);
      }
      return struct;
    },function(struct) {
      ChromeStorage.storage.set(struct.values, function() {
        if (chrome.runtime.lastError) {
          // Everyone gets an error.
          var error = chrome.runtime.lastError;
          _.chain(struct.callbacks).pluck('error').compact().each(function(cb) {
            cb(error);
          });
        } else {
          _.chain(struct.callbacks).pluck('success').compact().each(function(cb) {
            cb();
          });
        }
      });
    }, 10, {}),
    remove: _.debounceReduce(function(struct, key, options) {
      if (!struct) {
        struct = {
          callbacks: [],
          keys: []
        };
      }
      struct.keys.push(key);
      if (options && (options.success || options.error)) {
        struct.callbacks.push(options);
      }
      return struct;
    }, function(struct) {
      ChromeStorage.storage.remove(struct.keys, function() {
        if (chrome.runtime.lastError) {
          // Everyone gets an error.
          var error = chrome.runtime.lastError;
          _.chain(struct.callbacks).pluck('error').compact().each(function(cb) {
            cb(error);
          });
        } else {
          _.chain(struct.callbacks).pluck('success').compact().each(function(cb) {
            cb();
          });
        }
      });
    }, 10, {}),
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
