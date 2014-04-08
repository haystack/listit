(function(L) {
  'use strict';

  L.views.HelpPage = Backbone.View.extend({
    id: 'page-help',
    className: 'page',
    render: function() {
      this.$el.html(L.templates["pages/help"]());
      if (L.templates["help"] !== undefined){ // has platform-specific help messages
        var platformHelp = L.templates["help"]();
        this.$("#help-main").append(platformHelp);
      }
      return this;
    }
  });
})(ListIt);
