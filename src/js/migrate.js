ListIt.lvent.once('setup:migrate', function(L, barr) {
    'use strict';
    barr.aquire();
    L.getVersion(function(configVersion) {
      var programVersion = L.VERSION;

      if (configVersion != programVersion) {
        var action = (configVersion < programVersion) ? "upgrade" : "downgrade";
        L.gvent.trigger(action+":prepare", L, {from: configVersion, to: programVersion}, barr);
        var prefix = action+":version "+action+":version:";
        _.each(_.range(configVersion, programVersion+1), function(ver) {
          L.gvent.trigger(prefix+ver, L, {from: configVersion, to: programVersion, now: ver}, barr);
          L.setVersion(ver);
        });
        L.gvent.trigger(action+":complete", L, {from: configVersion, to: programVersion}, barr);
      }
      barr.release();
    });
});
