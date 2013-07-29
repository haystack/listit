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
    save: function() {
      if (this._fetching) {
        throw new Error("Save called during fetch");
      }
      return Model.__super__.save.apply(this, arguments);
    },
    set: function(key, value, options) {
      var attributes;

      if (_.isObject(key) || key == null) {
        attributes = key;
        options = value;
      } else {
        attributes = {};
        attributes[key] = value;
      }
      if (options && options.fetching) {
        this._fetching = false;
      }
      if (this._fetching) {
        throw new Error("Set called during fetch");
      }
      return Model.__super__.set.call(this, attributes, options);
    },
    initialized: function() { },
    fetch: function(options) {
      // Don't fetch twice
      if (this._fetching) {
        throw new Error("Fetch in progress");
      }
      this._fetching = true;
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
            that._fetching = false;
            if (func) {
              func(that, _.rest(arguments));
            }
            complete_cb(that, false);
          }),
        }, _.omit(options, 'complete'));
      } else {
        options = _.defaults({fetching: true}, options);
      }
      return Model.__super__.fetch.call(this, options);
    }
  });
  Backbone.Model = Model;
})();
