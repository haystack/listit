/*globals Components: false*/
(function(L) {
  'use strict';
  // TODO: Extend LocalStorage instead of rewrite
  var FirefoxStorage = L.stores['firefox'] = {
    store:  (function() {
      var ios = Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
      var ssm = Components.classes["@mozilla.org/scriptsecuritymanager;1"].getService(Components.interfaces.nsIScriptSecurityManager);
      var dsm = Components.classes["@mozilla.org/dom/storagemanager;1"].getService(Components.interfaces.nsIDOMStorageManager);

      var uri = ios.newURI("chrome://listit/content/webapp/", "", null);
      var principal = ssm.getNoAppCodebasePrincipal(uri);
      return dsm.getLocalStorageForPrincipal(principal, "");
    })(),
    set: function(key, object, options) {
      try {
        FirefoxStorage.store.setItem(key, JSON.stringify(object));
        if (options && options.success) options.success(object);
      } catch (e) {
        if (options && options.error) options.error(e);
      }
    },
    get: function(key, options) {
      var error, object;
      try {
        var json = FirefoxStorage.store.getItem(key);
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
    remove: function(key, object, options) {
      try {
        FirefoxStorage.store.removeItem(key);
        if (options && options.success) options.success();
      } catch (e) {
        if (options && options.error) options.error(e);
      }
    }
  };

  L.store = FirefoxStorage;
})(ListIt);
