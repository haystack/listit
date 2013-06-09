(function(L) {
    'use strict';
    L.models.LogEvent = Backbone.Model.extend({
      urlRoot: '/logentries',
      defaults: function() {
        return {
          when: Date.now(),
          info: {}
        };
      }
    }, {
      create: function(action, data) {
        var item = new L.models.LogEvent({action: action, info: data});
        L.gvent.trigger('log:request:data', item);
        return item;
      }
    });

    L.models.Log = Backbone.Collection.extend({
      model: L.models.LogEvent
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
      add: function() {
        var log = this.get('log');
        log.add.apply(log, arguments);
      },
      create: function() {
        log.create.apply(log, arguments);
      },
    });
})(ListIt);
