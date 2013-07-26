(function() {
  'use strict';
  var Model = Backbone.Model.extend({
    constructor: function(attributes, options) {
      // Need to omit complete, fetch as we handle them here.
      //
      // Omit silent because it doesn't make sense. Allowing silent prevents
      // change events from getting fired.
      var cleaned_options = _.omit(options, 'complete', 'fetch', 'silent');
      this.isReady = false;
      Model.__super__.constructor.call(this, attributes, cleaned_options);
      if ((options && _.has(options, "fetch")) ? options.fetch : this.autoFetch) {
        var that = this;
        this.fetch(_.defaults({
          complete: _.wrap(options && options.complete, function(fn) {
            that.initialized(attributes, cleaned_options);
            if (fn) {
              fn.apply(this, _.rest(arguments));
            }
            that.isReady = true;
            that.trigger('ready', that);
          })
        }, cleaned_options));
      } else {
        this.initialized(attributes, cleaned_options);
        if (options && options.complete) {
          options.complete(this, true);
        }
        this.isReady = true;
        this.trigger('ready', this);
      }
    },
    ready: function(cb, context) {
      if (_.isUndefined(context)) {
        context = this;
      }
      if (this.isReady) {
        cb.call(context, this);
      } else {
        this.once('ready', cb, context);
      }
    },
    initialized: function() { },
    fetch: function(options) {
      if (options && options.complete) {
        var that = this;
        var complete_cb = options.complete;
        options = _.defaults({
          fetching: true,
          success: _.wrap(options.success, function(func) {
            if (func) {
              func(that, _.rest(arguments));
            }
            complete_cb(that, true);
          }),
          error: _.wrap(options.error, function(func) {
            if (func) {
              func(that, _.rest(arguments));
            }
            complete_cb(that, false);
          }),
        }, _.omit(options, 'complete'));
      } else {
        options = _.defaults({fetching: true}, options);
      }
      Model.__super__.fetch.call(this, options);
    }
  });
  Backbone.Model = Model;
})();
