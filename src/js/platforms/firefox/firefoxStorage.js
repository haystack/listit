/*globals Components: false, FileUtils: false, NetUtil: false*/
(function(L) {
  'use strict';
 // Access using [] as import is technically a reserved word.
  Components.utils['import']("resource://gre/modules/FileUtils.jsm");
  Components.utils['import']("resource://gre/modules/NetUtil.jsm");
  var converter = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].
    createInstance(Components.interfaces.nsIScriptableUnicodeConverter);
  converter.charset = "UTF-8";
  var fileCache = {};
  var getFile = function(path) {
    var file = fileCache[path];
    if (!file) {
      file = fileCache[path] = FileUtils.getFile("ProfD", _.compact(("listit/"+path).split('/')));
    }
    return file;
  };

  var FirefoxStorage = L.stores['firefox'] = {
    set: function(key, object, options) {
      var cb;
      if (options && (options.success || options.error)) {
        cb = function(status) {
          if (Components.isSuccessCode(status)) {
            if (options.success) {
              options.success(object);
            }
          } else if (options.error) {
            options.error(status);
          }
        };
      }
      var file = getFile(key);
      var istream = converter.convertToInputStream(JSON.stringify(object));
      var ostream = FileUtils.openSafeFileOutputStream(file);
      NetUtil.asyncCopy(istream, ostream, cb);
    },
    get: function(key, options) {
      var error, object;
      if (!options || !(options.success || options.error)) {
        return;
      }

      var file = getFile(key);
      var channel = NetUtil.newChannel(file);
      channel.contentType = "application/json";
      NetUtil.asyncFetch(channel, function(istream, status) {
        var error;
        try {
          if (Components.isSuccessCode(status)) {
            if (options.success) {
              options.success(JSON.parse(NetUtil.readInputStreamToString(istream, istream.available())));
            }
            return;
          }
        } catch (e) {
          error = e;
        }
        if (options.error) {
          options.error(error);
        }
      });
    },
    remove: function(key, object, options) {
      try {
        getFile(key).remove();
        if (options && options.success) options.success();
      } catch (e) {
        if (options && options.error) options.error(e);
      }
    },
    clear: function(options) {
      try {
        getFile("/").remove(true);
        if (options && options.success) options.success();
      } catch (e) {
        if (options && options.error) options.error(e);
      }
    }
  };

  L.store = FirefoxStorage;
})(ListIt);
