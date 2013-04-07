(function(L) {

  'use strict';
  
  var setupActions = [
    function(barr) {
      L.lvent.trigger('setup:before', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:upgrade:before', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:upgrade', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:upgrade:after', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:models:before', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:models', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:models:after', L, barr);
    },
    function(barr) {
      barr.aquire();
      $(function() {
        L.lvent.trigger('setup:views:before', L, barr);
        barr.release();
      });
    },
    function(barr) {
      L.lvent.trigger('setup:views', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:views:after', L, barr);
    },
    function(barr) {
      L.lvent.trigger('setup:after', L, barr);
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
