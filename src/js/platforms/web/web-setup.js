ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';

  var OldMainPage = L.views.MainPage;
  L.views.MainPage = L.views.MainPage.extend({
    initialize: function() {
      OldMainPage.prototype.initialize.call(this);
      this.listenTo(L.server, 'change:registered', function(){
        this.togglePopUpAlert();
      });
    },

    render: function() {
      OldMainPage.prototype.render.call(this);
      this.$el.prepend(L.templates['warn-persistence']());
      if (!L.server.get('registered')) {
        this.$el.addClass('not-logged-in');
      }
      return this;
    },

    togglePopUpAlert: function() {
      this.$el.toggleClass('not-logged-in', !L.server.get('registered'));
    }
  });

  L.addPage('main', new L.views.MainPage());
  L.addPage('options', new L.views.OptionsPage());
  L.addPage('help', new L.views.HelpPage());
});
