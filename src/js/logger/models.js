(function(L) {
    'use strict';
    L.make.logger.LogEvent = Backbone.Model.extend({
        initialize: function(action, data) {
            this.set({action: action, data: data});
        }
    });

    L.make.logger.Log = Backbone.Collection.extend({
        model: L.make.logger.LogEvent
    });

    L.make.logger.Logger = Backbone.Model.extend({
        initialize: function() {
            this.log = new L.make.logger.Log();
        }
    });
})(ListIt);
