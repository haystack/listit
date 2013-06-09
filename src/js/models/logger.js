(function(L) {
    'use strict';
    L.models.LogEvent = Backbone.Model.extend({
      urlRoot: '/logentries',
      defaults: function() {
        return {
          time: Date.now(),
        };
      },
      initialize: function() {
        if (this.isNew()) {
          L.gvent.trigger('log:request:data', this);
        }
        var debouncedSave = _.debounce(_.bind(this.save, this), 100);
        this.listenTo(this, "change", function(m) {
          if (!this.isNew()) {
            debouncedSave();
          }
        });
      }
    });

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

    L.models.Logger = Backbone.RelModel.extend({
      url: '/log',
      isNew: function() {
        return false;
      },
      initialize: function(models, options) {
        // Call destructors on exit
        this.listenTo(L.gvent, 'sys:exit', this.stop);
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
        this.listenTo(that.get('log'), 'add', function(m, c) {
          m.save();
        });
      },
      start: function() {
        if (this._started) {
          return;
        }
        this.observers = _.chain(
          L.observers
        ).filter(function(obs) {
          return _.result(obs, "condition");
        }).map(function(obs) {
          var ctor = function() {};
          ctor.prototype = obs;
          var inst = new ctor();
          inst.setup();
          return inst;
        });
      },
      stop: function() {
        _.each(that.observers, function(inst) {
          inst.destroy();
        });
        delete that.observers;
      },
      relations: {
        log: {
          type: L.models.Log,
          includeInJSON: "id"
        }
      },
      clearUntil: function() {
        var log = this.get('log');
        return log.clearUntil.apply(log, arguments);
      },
      add: function() {
        var log = this.get('log');
        return log.add.apply(log, arguments);
      }
    });
})(ListIt);
