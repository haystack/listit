(function(L) {
  'use strict';

  L.views.ColorSchemeView = Backbone.View.extend({
    id: 'options-color-scheme',
    className: 'options-item', 
    render: function() {
      this.$el.html(L.templates["options/color-scheme"]());
      return this;
    }
  });
})(ListIt);