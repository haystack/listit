(function(L) {
  'use strict';
  L.views.Toolbar = Backbone.View.extend({
    className: 'wysihtml5-toolbar',
    tagName: 'div',
    attributes: {'style': 'display: none;'}, // css isn't working for some reason
    initialize: function() {
      var that = this;
      $(window).one('beforeunload', function() {
        that.undelegateEvents();
        that.stopListening();
      });
    },
    render: function() {
      this.$el.html(L.templates["toolbar"]({
        items: ['mode',
          'bold',
          'italic',
          'underline',
          'foreground',
          'link'
        ]
      }));
      this._rendered = true;
      return this;
    }
  });
})(ListIt);
