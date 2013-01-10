/**
 * A Backbone localStorage adapter.
 *
 * Originally:
 * https://github.com/jeromegn/Backbone.localStorage
 */

(function() {
  // A simple module to replace `Backbone.sync` with *localStorage*-based
  // persistence. Models are given GUIDS, and saved into a JSON object. Simple
  // as that.

  // Hold reference to Underscore.js and Backbone.js in the closure in order
  // to make things work even if they are removed from the global namespace
  var _ = this._;
  var Backbone = this.Backbone;

  // Generate four random hex digits.
  function S4() {
    return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
  };

  // Generate a pseudo-GUID by concatenating random hexadecimal.
  function guid() {
    return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
  };

  // Helper functions from Backbone
  var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Throw an error when a URL is needed, and none is supplied.
  var urlError = function() {
    throw new Error('A "url" property or function must be specified');
  };

  var actions = {
    "create": function(url, json, options) {
      var success_cb = options.success || $.noop;
      var error_cb = options.error || $.noop;

      json.id = guid();
      url += (url.charAt(url.length - 1) == '/' ? '' : '/') + encodeURIComponent(json.id);

      try {
        localStorage.setItem(url, JSON.stringify(json));
        success_cb(json);
      } catch (e) {
        error_cb(e);
      }
    },
    "read": function(url, json, options) {
      var success_cb = options.success || $.noop;
      var error_cb = options.error || $.noop;

      var item = localStorage.getItem(url);
      if (item !== null) {
        try {
          success_cb(JSON.parse(item));
        } catch (e) {
          error_cb("Invalid JSON");
        }
      } else {
        error_cb("Not Found");
      }
    },
    "update": function(url, json, options) {
      localStorage.setItem(url, JSON.stringify(json));
      (options.success || $.noop)(json);
    },
    "delete": function(url, json, options) {
      localStorage.removeItem(url);
      (options.success || $.noop)({});
    }
  };


  Backbone.sync = function(method, model, options) {
    options || (options = {});
    var url = options.url || getValue(model, 'url') || urlError();
    var json = model.toJSON();
    actions[method](url, json, options);
  };

}).call(this);
