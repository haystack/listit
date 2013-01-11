(function(L) {
    'use strict';
    L.models.LogEvent = Backbone.Model.extend({
        initialize: function(action, data) {
            this.set({action: action, data: data});
        }
    });

    L.models.Log = Backbone.Collection.extend({
        model: L.models.LogEvent
    });

    L.models.Logger = Backbone.Model.extend({
        initialize: function() {
            this.log = new L.models.Log();
        }
    });
})(ListIt);
