(function(L) {
  'use strict';

  L.views.HelpPage = Backbone.View.extend({
    id: 'page-help',
    className: 'page',
    initialize: function(options) {
      if (options) {
        this.platform = options.platform;
      }
    },
    render: function() {
      this.$el.html(L.templates["pages/help"]());

      if(this.platform) {
        var main = this.$('#help-main');
        var platformHelp = L.templates["help"]();
        main.append(platformHelp);
      }

      return this;
    },
    change_color: function(new_scheme){
      this.$el.attr("class", "page");
      this.$el.addClass(new_scheme);
    }
  });
})(ListIt);
