(function(L) {
  'use strict';

  /*
   * The Options Page View
   */

  L.views.OptionsPage = Backbone.View.extend({
    id: 'page-options',
    className: 'page',
    initialize: function(options) {
      if (options && options.panels) {
        this.panels = options.panels;
      } else {
        // Default options panels
        this.panels = [
          new L.views.ServerView({model: L.server}),
          new L.views.InfoView(),
          new L.views.PreferencesView({model: L.preferences}),
          new L.views.ImportExportView(),
          new L.views.ColorSchemeView()
        ];
      }
    },
    render: function() {
      this.$el.html(L.templates["pages/options"]());
      var body = this.$('#options-body');

      _(this.panels).each(function(panel) {
        body.append(panel.render().el);
      });
      return this;
    },
    change_color: function(new_scheme){
      this.$el.attr("class", "page");
      this.$el.addClass(new_scheme);
    }
  });

})(ListIt);
