
(function(L) {
  'use strict';

  /*
   * The Settings Pane
   */

  L.views.PreferencesView = Backbone.View.extend({
    id: 'options-preferences',
    className: 'options-item',
    events: { },
    initialize: function() {
      var that = this;
      $(window).one('beforeunload', function() {
        that.undelegateEvents();
        that.stopListening();
      });
      _.each(this.model.schema, function(o,n) {
        var setView, setModel;
        var sel = '#'+n+'Field';
        var evt = 'change';
        switch(o.type) {
        case 'hotkey':
          evt = 'hotkey-changed';
          break;
        case 'boolean':
          setView = function(m, v) {
            that.$el.find(sel).prop('checked', v);
          };
          setModel = function() {
            that.model.set(n, that.$el.find(sel).prop('checked'));
          };
          break;
        case 'number':
          setModel = function() {
            that.model.set(n, Number(that.$el.find(sel).val()));
          };
          break;
        }

        if (!setView) {
          setView = function(m, v) {
            that.$el.find(sel).val(v);
          };
        }

        if (!setModel) {
          setModel = function() {
            that.model.set(n, that.$el.find(sel).val());
          };
        }

        that.events[evt+' '+sel] = setModel;
        that.listenTo(that.model, 'change:'+n, setView);
      });
      this.delegateEvents();
    },
    render: function() {
      var that = this;
      var opts = _.map(this.model.schema, function(o, n) {
        return {
          name: n,
          value: that.model.get(n),
          description: o.description,
          type: o.type,
          attrs: _.reduce(o.attrs||{}, function(p, v, k) {
            return p + ' ' + k + '=\'' + v + '\'';
          }, '')
        };
      });
      this.$el.html(L.templates["options/preferences"]({preferences: opts}));
      this.$('.hotkey-field').hotkeyinput();
      return this;
    }
  });

})(ListIt);
