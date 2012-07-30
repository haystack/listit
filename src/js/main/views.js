"use strict";
L.make.main.MainPageView = Backbone.View.extend({
    id: "page-main",
    className: "page",
    initialize: function(options) {
        _(this).bindAll();
        $(window).one('beforeunload', this.undelegateEvents);
        this.panels = options.panels;
    },
    render: function() {
        this.$el.html(L.templates.main.page());

        var that = this;
        _.each(this.panels, function(view, id) {
            that.$("#"+id).html(view.render().el);
        });
        return this;
    }
});
