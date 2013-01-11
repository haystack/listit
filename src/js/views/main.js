/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false*/

(function(L) {
    'use strict';
    L.views.MainPage = Backbone.View.extend({
        id: 'page-main',
        className: 'page vbox',
        initialize: function(options) {
            _(this).bindAll();
            $(window).one('beforeunload', this.undelegateEvents);
            this.panels = options.panels;
        },
        render: function() {
            this.$el.html(L.templates["pages/main"]());

            var that = this;
            _.each(this.panels, function(view, id) {
                that.$('#'+id).html(view.render().el);
            });
            return this;
        }
    });
})(ListIt);
