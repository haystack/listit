
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
      $(window).one('beforeunload', function() {
        this.undelegateEvents();
        this.stopListening();
      }.bind(this));
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
            this.$el.find(sel).prop('checked', v);
          }.bind(this);
          setModel = function() {
            this.model.set(n, this.$el.find(sel).prop('checked'));
          }.bind(this);
          break;
        case 'number':
          setModel = function() {
            this.model.set(n, Number(this.$el.find(sel).val()));
          }.bind(this);
          break;
        }

        if (!setView) {
          setView = function(m, v) {
            this.$el.find(sel).val(v);
          }.bind(this);
        }

        if (!setModel) {
          setModel = function() {
            this.model.set(n, this.$el.find(sel).val());
          }.bind(this);
        }

        this.events[evt+' '+sel] = setModel;
        this.listenTo(this.model, 'change:'+n, setView);
      }, this);
      this.delegateEvents();
    },
    render: function() {
      var opts = _.map(this.model.schema, function(o, n) {
        return {
          name: n,
          value: this.model.get(n),
          description: o.description,
          type: o.type,
          attrs: _.reduce(o.attrs||{}, function(p, v, k) {
            return p + ' ' + k + '=\'' + v + '\'';
          }, '')
        };
      }, this);
      this.$el.html(L.templates["options/preferences"]({preferences: opts}));
      this.$('.hotkey-field').hotkeyinput();
      return this;
    }
  });

})(ListIt);
