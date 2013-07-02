ListIt.lvent.once('setup:migrate', function(L, barr) {
  'use strict';
  barr.aquire();
  L.getVersion(function(configVersion) {
    var programVersion = L.VERSION;

    if (configVersion !== programVersion) {
      var migrateBarr = new Barrier();
      if (configVersion === 0) {
        // Initialize
        migrateBarr = new Barrier();
        L.setVersion(programVersion);
        L.gvent.trigger('initialize:prepare', L, programVersion, migrateBarr);
        migrateBarr.wait(function() {
          debug("migrate::initialize");
          L.gvent.trigger('initialize', L, programVersion, migrateBarr);
        });
        migrateBarr.wait(function() {
          L.gvent.trigger('initialize:complete', L, programVersion, migrateBarr);
        });
        migrateBarr.wait(function() {
          barr.release();
        });
      } else {
        migrateBarr = new Barrier();

        var range, action;
        if (configVersion < programVersion) {
          range = _.range(configVersion+1, programVersion+1, 1);
          action = "upgrade";
        } else {
          range = _.range(configVersion, programVersion, -1);
          action = "downgrade";
        }

        L.gvent.trigger(action+':prepare', L, {from: configVersion, to: programVersion}, migrateBarr);

        var prefix = action+':version '+action+':version:';
        _.each(range, function(v) {
          // I can do this because barriers can be re-taken to block future waiting functions.
          migrateBarr.wait(function() {
            L.setVersion(v);
            debug('migrate::'+action+'::'+v);
            L.gvent.trigger(prefix+v, L, {from: configVersion, to:programVersion, now: v}, migrateBarr);
          });
        });
        migrateBarr.wait(function() {
          L.gvent.trigger(action+":complete", L, {from: configVersion, to: programVersion}, migrateBarr);
        });
        migrateBarr.wait(function() {
          barr.release();
        });
      }
    } else {
      barr.release();
    }
  });
});
