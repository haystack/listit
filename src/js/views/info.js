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
      credits: [
        'Wolfe Styke',
        'electronic max',
        'Prof. David Karger'
      ],
      email: 'listit@csail.mit.edu'
    }
  });
})(ListIt);
