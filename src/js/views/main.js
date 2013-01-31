/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false*/

(function(L) {
    'use strict';
    L.views.MainPage = Backbone.View.extend({
        id: 'page-main',
        className: 'page vbox',
        initialize: function(options) {
          var that = this;

            $(window).one('beforeunload', function() {
              that.undelegateEvents();
              that.stopListening();
            });

            if (options && options.panels) {
              this.panels = options.panels;
            } else {
              // Default panels
              this.panels  = {
                'omnibox':      new L.views.OmniboxView({model: L.omnibox}),
                'controls':     new L.views.ControlsView(),
                'notes':  new L.views.NoteCollectionView({collection: L.sidebar})
              };
            }
        },
        render: function() {
            this.$el.html(L.templates["pages/main"]());

            var that = this;
            _.each(this.panels, function(view, id) {
              view.setElement(that.$("#"+id));
              view.render();
            });
            return this;
        }
    });
})(ListIt);
