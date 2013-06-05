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
      initialize: function() {
        var that = this;
        this.observers = [];
        this.fetch({
          success: function() {
            // Fetch contents.
            _.each(that.relations, _.mask(_.bind(that.fetchRelated, that), 1));
          }
        });
        var debouncedSave = _.debounce(_.bind(that.save, that), 100);
        _.each(that.relations, function(v, k) {
          that.get(k).on('add remove', function(model, collection, options) {
            if (!(options && options.nosave)) {
              debouncedSave();
            }
          });
        });
        _.each(L.observers, function(obs) {
          if (_.result(obs, "condition")) {
            var ctor = function() {};
            ctor.prototype = obs;
            var inst = new ctor();
            that.observers.push(inst);
            inst.setup();
          }
        });
        L.gvent.on('sys:exit', function() {
          _.each(that.observers, function(inst) {
            inst.destroy();
          });
        });
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
