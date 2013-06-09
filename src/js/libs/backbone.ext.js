(function() {
  'use strict';
  var Model = Backbone.Model.extend({
    constructor: function(attributes, options) {
      // Need to omit complete, fetch, fetchRelated as we handle them here.
      var cleaned_options = _.omit(options, 'complete', 'fetch');
      Model.__super__.constructor.call(this, attributes, cleaned_options);
      var that = this;
      if (options) {
        if (options.fetch) {
          this.fetch(_.defaults({
            complete: _.wrap(options.complete, function(fn) {
              that.initialized(attributes, cleaned_options);
              if (fn) {
                fn.apply(this, _.rest(arguments));
              }
            })
          }, _.omit(options, 'fetch'))); // Prevent unecessary recursion.
        } else {
          this.initialized(attributes, cleaned_options);
          if (options.complete) {
            options.complete(this, true);
          }
        }
      } else {
        this.initialized(attributes, cleaned_options);
      }
    },
    initialized: function() { },
    fetch: function(options) {
      if (options && options.complete) {
        var that = this;
        var complete_cb = options.complete;
        options = _.defaults({
          complete: function() {},
          success: _.wrap(options.success, function(func) {
            if (func) {
              func(this, _.rest(arguments));
            }
            complete_cb(that, true);
          }),
          error: _.wrap(options.error, function(func) {
            if (func) {
              func(this, _.rest(arguments));
            }
            complete_cb(that, false);
          }),
        }, options);
      }
      Model.__super__.fetch.call(this, options);
    }
  });
  Backbone.Model = Model;
})();
