"use strict";
var LogEvent = Backbone.Model.extend({
    initialize: function(action, data) {
        this.set({action: action, data: data});
    }
});

var Log = Backbone.Collection.extend({
    model: LogEvent
});

var Logger = Backbone.Model.extend({
    initialize: function() {
        this.log = new Log();
    }
});

