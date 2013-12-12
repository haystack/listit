(function(L) {
  'use strict';

  L.views.ColorSchemeView = Backbone.View.extend({
    id: 'options-color-scheme',
    className: 'options-item', 
    render: function() {
      this.$el.html(L.templates["options/color-scheme"]());
      return this;
    },

    events: {
      'click #color-scheme-red': 'red',
      'click #color-scheme-blue': 'blue',
      'click #color-scheme-green': 'green'
    },

    red: function(event){
      L.pages['options'].change_color("scheme-red");
      // L.pages['help'].change_color("scheme-red");
      // L.pages['main'].change_color("scheme-red");
    },

    blue: function(event){
      L.pages['options'].change_color("scheme-blue");
      // L.pages['help'].change_color("scheme-blue");
      // L.pages['main'].change_color("scheme-blue");
    },

    green: function(event){
      L.pages['options'].change_color("scheme-green");
      // L.pages['help'].change_color("scheme-green");
      // L.pages['main'].change_color("scheme-green");
    }

  });
})(ListIt);