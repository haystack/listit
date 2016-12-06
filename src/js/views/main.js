/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false*/

(function(L) {
  'use strict';
  L.views.MainPage = Backbone.View.extend({
    id: 'page-main',
    className: 'page',
    initialize: function(options) {
      $(window).one('beforeunload', function() {
        this.undelegateEvents();
        this.stopListening();
      }.bind(this));

      if (options && options.panels) {
        this.panels = options.panels;
      } else {
        // Default panels
        this.panels  = {
          'omnibox':      new L.views.OmniboxView({model: L.omnibox}),
          'controls':     new L.views.ControlsView(),
          'notes':        new L.views.NoteCollectionView({collection: L.sidebar})
        };
      }
    },
    render: function() {
      if (!this._rendered) {
        this.$el.html(L.templates["pages/main"]());

        $(window).on('keydown', null, 'F5', function(event) {
          if (this.$el.is(':visible')) {
            event.preventDefault();
            L.server.syncNotes();
          }
        }.bind(this));

        _.each(this.panels, function(view, id) {
          this.$("#main-"+id).html(view.render().$el);
        }, this);
        this._rendered = true;
      } else {
        // Always re-render
        _.each(this.panels, function(view, id) {
          view.render();
        }, this);
      }
      return this;
    }
  });
})(ListIt);
