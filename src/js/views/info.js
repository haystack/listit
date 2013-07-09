/*globals LISTIT_CREDITS: false, LISTIT_EMAIL: false*/
(function(L) {
  'use strict';

  /*
   * The about pane
   */

  L.views.InfoView = Backbone.View.extend({
    id: 'options-info',
    className: 'options-item', // TODO:Change
    render: function() {
      this.$el.html(L.templates["options/info"](this.info));
      return this;
    },
    info : {
      credits: LISTIT_CREDITS,
      email: LISTIT_EMAIL
    }
  });
})(ListIt);
