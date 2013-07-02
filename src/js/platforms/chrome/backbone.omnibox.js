/*global chrome:true */
/**
 * Create a generic backbone view for the chrome omnibox.
 *
 * Event delegation mimics backbone:
 *  start: fired once per input session before the change event.
 *  change: fired when the input changes.
 *  cancel: fired when the aborts the input.
 *  submit: fired when the user submits the input.
 *
 * Some methods have been copied from backbone.js and are copywrite 2010-2012
 * Jeremy Ashkenas, DocumentCloud Inc. See http://backbonejs.org
 *
 * This file is licenced under the MIT/X11 licence.
 * (c) 2012 Steven Allen, MIT
 *
 **/

(function() {
  'use strict';
  var _ = this._;
  var Backbone = this.Backbone;

  Backbone.ChromeOmniboxView = function(options) {
    this.cid = _.uniqueId('view');
    this._configure(options || {});
    this.initialize.apply(this, arguments);
    this.delegateEvents();
  };

  var eventMap = {
    'change': 'onInputChanged',
    'cancel': 'onInputCancelled',
    'submit': 'onInputEntered',
    'start': 'onInputStarted'
  };

  var viewOptions = ['model', 'collection', 'defaultSuggestion', 'omnibox'];

  var getValue = function(object, prop) {
    if (!(object && object[prop])) {
      return null;
    }
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
  };

  // Too different to bother inheriting
  _.extend(Backbone.ChromeOmniboxView.prototype, Backbone.Events, {
    initialize : function() {},
    _configure : function(options) {
      if (this.options) {
        options = _.extend({}, this.options, options);
      }
      var that = this;
      _.each(viewOptions, function(option) {
        if (options[option]) {
          that[option] = options[option];
        }
      });

      this.options = options;

      if (!this.omnibox) {
        this.omnibox = chrome.omnibox;
      }

      if (this.defaultSuggestion) {
        this.omnibox.setDefaultSuggestion({description: this.defaultSuggestion});
      }
    },
    delegateEvents: function(events) {
      if (!(events || (events = getValue(this, 'events'))))  {
        return;
      }

      var that = this;

      _.each(events, function(method, key) {
        var evt = eventMap[key];

        if (!evt) {
          throw new Error('Event "' + key + '" does not exist');
        }

        if (!_.isFunction(method)) {
          method = that[events[key]];
        }

        if (!method) {
          throw new Error('Method "' + events[key] + '" does not exist');
        }

        that.omnibox[evt].addListener(_.bind(method, that));
      });
    }
  });

  Backbone.ChromeOmniboxView.extend = Backbone.View.extend;

}).call(this);
