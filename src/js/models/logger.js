(function(L) {
    'use strict';
    /**
     * The log event.
     *
     * @param{Object} object The initial attributes of this log event.
     **/
    L.models.LogEvent = Backbone.Model.extend({
      urlRoot: '/logentries',
      defaults: function() {
        return {
          time: Date.now()
        };
      },
      initialize: function() {
        var that = this;
        if (this.isNew()) {
          L.gvent.trigger('log:request:data', this);
        }
        var debouncedSave = _.debounce(_.bind(this.save, this), 100);
        this.listenTo(this, "change", function(m) {
          if (!that.isNew()) {
            debouncedSave();
          }
        });
      }
    });

    /**
     * The actual log collection. Never used by itself.
     **/
    L.models.Log = Backbone.Collection.extend({
      model: L.models.LogEvent,
      initialize: function() {
      },
      clearUntil: function(time) {
        this.chain()
        .filter(function(e) {
          return e.get('time') <= time;
        })
        .each(function(e) {
          e.destroy();
        });
      }
    });

    /**
     * The logger model.
     *
     * A singleton.
     *
     **/
    L.models.Logger = Backbone.RelModel.extend({
      url: '/log',
      relations: {
        log: {
          type: L.models.Log,
          includeInJSON: "id"
        }
      },
      isNew: function() {
        return false;
      },
      initialize: function(models, options) {
        // Call destructors on exit
        this.listenTo(L.gvent, 'sys:exit', _.bind(this.stop, this));
      },
      initialized: function(models, options) {
        var that = this;
        var debouncedSave = _.debounce(_.bind(that.save, that), 100);
        // Autosave
        _.each(this.relations, function(v, k) {
          that.get(k).on('add remove', function(model, collection, options) {
            if (!(options && options.nosave)) {
              debouncedSave();
            }
          });
        });
        this.listenTo(this.get('log'), 'add', function(m, c) {
          m.save();
        });
      },
      /**
       * Start logging
       *
       * Starts the logging observers.
       **/
      start: function() {
        if (this._started) {
          return;
        }
        this.observers = _.chain(
          L.observers
        ).filter(function(obs) {
          return _.result(obs, "condition");
        }).map(function(obs) {
          var Ctor = function() {};
          Ctor.prototype = obs;
          var inst = new Ctor();
          inst.setup();
          return inst;
        });
      },
      /**
       * Stop logging
       *
       * Stops the logging observers.
       **/
      stop: function() {
        _.each(this.observers, function(inst) {
          inst.destroy();
        });
        delete this.observers;
      },
      /**
       * Clear log events before and including time.
       **/
      clearUntil: function(/* time */) {
        var log = this.get('log');
        return log.clearUntil.apply(log, arguments);
      },
      /**
       * Add the passed LogEvent models to the log.
       *
       * @see Backbone.Collection#add
       **/
      add: function(/* model[s], [options] */) {
        var log = this.get('log');
        return log.add.apply(log, arguments);
      }
    });
})(ListIt);
