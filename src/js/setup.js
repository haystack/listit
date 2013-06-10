(function(L) {

  'use strict';
  
  var setupActions = [
    function(barr) {
      debug("setup::begin");
      L.lvent.trigger('setup:before', L, barr);
    },
    function(barr) {
      debug("setup::migrate::begin");
      L.lvent.trigger('setup:migrate:before', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:migrate', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:migrate:after', L, barr);
      debug("setup::migrate::end");
    },
    function(barr) {
      debug("setup::models::begin");
      L.lvent.trigger('setup:models:before', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:models', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:models:after', L, barr);
      debug("setup::models::end");
    },
    function(barr) {
      barr.aquire();
      $(function() {
        debug("setup::views::begin");
        L.lvent.trigger('setup:views:before', L, barr);
        barr.release();
      });
    },
    function(barr) {
      L.lvent.trigger('setup:views', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:views:after', L, barr);
      debug("setup::views::end");
    },
    function(barr) {
      L.lvent.trigger('setup:after', L, barr);
      debug("setup::end");
    }
  ];

  var callSetupAction = function(i) {
    if (setupActions.length <= i) return;

    var barr = new Barrier();
    setupActions[i](barr);
    barr.wait(callSetupAction, i+1);
  };

  callSetupAction(0);
})(ListIt);
