ListIt.lvent.once('setup:migrate', function(L, barr) {
    'use strict';
    barr.aquire();
    L.getVersion(function(configVersion) {
      var programVersion = L.VERSION;
      
      if (configVersion === 0) {
        // Initialize
        var migrate_barr = new Barrier();
        L.setVersion(programVersion);
        L.gvent.trigger('initialize:prepare', L, programVersion, migrate_barr);
        migrate_barr.wait(function() {
          debug("migrate::initialize");
          L.gvent.trigger('initialize', L, programVersion, migrate_barr);
        });
        migrate_barr.wait(function() {
          L.gvent.trigger('initialize:complete', L, programVersion, migrate_barr);
        });
        migrate_barr.wait(function() {
          barr.release();
        });
      } else if (configVersion !== programVersion) {
        var migrate_barr = new Barrier();

        var range, action;
        if (configVersion < programVersion) {
          range = _.range(configVersion+1, programVersion+1, 1)
          action = "upgrade";
        } else {
          range = _.range(configVersion, programVersion, -1);
          action = "downgrade";
        }

        L.gvent.trigger(action+':prepare', L, {from: configVersion, to: programVersion}, migrate_barr);

        var prefix = action+':version '+action+':version:';
        _.each(range, function(v) {
          // I can do this because barriers can be re-taken to block future waiting functions.
          migrate_barr.wait(function() {
            L.setVersion(v);
            debug('migrate::'+action+'::'+v);
            L.gvent.trigger(prefix+v, L, {from: configVersion, to:programVersion, now: v}, migrate_barr);
          });
        });
        migrate_barr.wait(function() {
          L.gvent.trigger(action+":complete", L, {from: configVersion, to: programVersion}, migrate_barr);
        });
        migrate_barr.wait(function() {
          barr.release();
        });
      } else {
        barr.release();
      }
    });
});
