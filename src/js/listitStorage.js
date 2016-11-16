(function(L) {
  'use strict';
  L.stores = {};

  // Helper functions from Backbone
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };


  if (Modernizr.localstorage) {
    var writeQueue = {};
    var flush = _.throttle(function() {
      var q = writeQueue;
      writeQueue = {};
      _.each(q, function(desc, key) {
        try {
          LocalStorage.store.setItem(key, JSON.stringify(desc.value));
          _.each(desc.success, function(fn) {
            fn();
          });
        } catch (e) {
          _.each(desc.error, function(fn) {
            fn(e);
          });
        }
      });
    }, 100);
    var LocalStorage = L.stores['local'] = {
      store: window.localStorage,
      set: function(key, object, options) {
        var entry = writeQueue[key];
        if (!entry) {
          entry = writeQueue[key] = {
            success: [],
            error: []
          };
        }
        entry.value = object;
        if (options) {
          if (options.success) {
            entry.success.push(options.success);
          }
          if (options.error) {
            entry.error.push(options.error);
          }
        }
        flush();
      },
      get: function(key, options) {
        var error, object;
        // Short-circuit.
        if (options) {
          var entry = writeQueue[key];
          if (entry) {
            if (_.has(entry, "value")) {
              if (options.success) options.success(entry.value);
            } else {
              if (options.error) options.error("NotFound");
            }
            return;
          }
        }
        try {
          var json = LocalStorage.store.getItem(key);
          if (json === null) {
            error = "Not Found";
          } else {
            object = JSON.parse(json);
          }
        } catch (e) {
          error = e;
        }

        if (options) {
          if (error !== undefined) {
            if (options.error) options.error(error);
          } else {
            if (options.success) options.success(object);
          }
        }
      },
      remove: function(key, options) {
        try {
          LocalStorage.store.removeItem(key);
          if (options && options.success) options.success();
        } catch (e) {
          if (options && options.error) options.error(e);
        }
      }
    };

    L.store = LocalStorage;
  }

  Backbone.sync = function(method, model, options) {

    var store = model.store || L.store;
    if (store === undefined) {
      if (options.error) {
        options.error("No viable storage mechanism specified.");
      }
    } else {
      var url = options.url || getValue(model, 'url') || urlError();
      var json;
      switch(method) {
      case "create":
        json = model.toJSON();
        json.id = Date.now();
        url += (url.charAt(url.length - 1) === '/' ? '' : '/') + encodeURIComponent(json.id);
        if (options && options.success) {
          // Pass json back to success to set id.
          options = _.defaults({success: _.partial(options.success, json)}, options);
        }
        store.set(url, json, options);
        break;
      case "update":
        json = model.toJSON();
        store.set(url, json, options);
        break;
      case "read":
        store.get(url, options);
        break;
      case "delete":
        store.remove(url, options);
        break;
      }
    }
  };
})(ListIt);
