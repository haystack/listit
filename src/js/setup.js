(function(L) {

  'use strict';
  
  var setupActions = [
    function(lock) {
      L.lvent.trigger('setup:before', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:upgrade:before', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:upgrade', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:upgrade:after', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:models:before', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:models', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:models:after', L, lock);
    },
    function(lock) {
      lock.aquire();
      $(function() {
        L.lvent.trigger('setup:views:before', L, lock);
        lock.release();
      });
    },
    function(lock) {
      L.lvent.trigger('setup:views', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:views:after', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:after', L, lock);
    }
  ];

  var callSetupAction = function(i) {
    if (setupActions.length <= i) return;

    var lock = new Lock();
    setupActions[i](lock);
    lock.wait(callSetupAction, i+1);
  };

  callSetupAction(0);
})(ListIt);
