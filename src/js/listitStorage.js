(function(L) {
  'use strict';
  L.stores = [];

  // Helper functions from Backbone
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  try {
    var LocalStorage = L.stores['local'] = {
      store: window.localStorage,
      set: function(key, object, options) {
        try {
          LocalStorage.store.setItem(key, JSON.stringify(object));
          if (options && options.success) options.success(object);
        } catch (e) {
          if (options && options.error) options.error(e);
        }
      },
      get: function(key, options) {
        var error, object;
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
  } catch (e) { }

  Backbone.sync = function(method, model, options) {
    options = options || {};

    var success = options.success;
    if (success) {
      options.success = function(resp) {
        if (success) success(model, resp, options);
        model.trigger('sync', model, resp, options);
      };
    }

    var error = options.error;
    if (error) {
      options.error = function(e) {
        if (e) error(model, e, options);
        model.trigger('error', model, e, options);
      };
    }

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
