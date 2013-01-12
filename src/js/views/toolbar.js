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
        L.options.off(null, null, that);
      });
      L.options.on('change:toolbar', this.redraw, this);
    },
    redraw: function() {
      if (this._rendered) {
        this.render();
      }
    },
    render: function() {
      this.$el.html(L.templates["toolbar"]({
        'items': L.options.get('toolbarItems')
      }));
      this._rendered = true;
      return this;
    }
  });
})(ListIt);
