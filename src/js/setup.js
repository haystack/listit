(function(L) {

  'use strict';

  var barr = new Barrier();
  if (DEBUG) {
    var start_time = Date.now();
  }
  _.each([
    function() {
      L.setStatus('setup');

      debug("setup::begin");
      L.lvent.trigger('setup:before', L, barr);
    },
    function() {
      debug("setup::migrate::begin");
      L.lvent.trigger('setup:migrate:before', L, barr);
    },
    function() {
      L.lvent.trigger('setup:migrate', L, barr);
    },
    function() {
      L.lvent.trigger('setup:migrate:after', L, barr);
      debug("setup::migrate::end");
    },
    function() {
      debug("setup::models::begin");
      L.lvent.trigger('setup:models:before', L, barr);
    },
    function() {
      L.lvent.trigger('setup:models', L, barr);
    },
    function() {
      L.lvent.trigger('setup:models:after', L, barr);
      debug("setup::models::end");
    },
    function() {
      barr.aquire();
      $(function() {
        debug("setup::views::begin");
        L.lvent.trigger('setup:views:before', L, barr);
        barr.release();
      });
    },
    function() {
      L.lvent.trigger('setup:views', L, barr);
    },
    function() {
      L.lvent.trigger('setup:views:after', L, barr);
      debug("setup::views::end");
    },
    function() {
      L.lvent.trigger('setup:after', L, barr);
      debug("setup::end");
    }, function() {
      L.setStatus('ready');
      if (DEBUG) {
        debug("Startup took "+(Date.now()-start_time)+"ms.");
      }
    }
  ], function(fn) {
    barr.wait(fn);
  });
})(ListIt);
