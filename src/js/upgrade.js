ListIt.lvent.once('setup:upgrade', function(L, lock) {
    'use strict';
    lock.aquire();
    L.getVersion(function(configVersion) {
      var programVersion = L.VERSION,
          defaultNotes = [
            'Open and close list.it by clicking on the <img alt="list-it" ' +
            'src="/img/listit-icon.png"> icon in the upper right hand ' +
            'corner of your screen.',
            'Make new notes or search old ones by typing into the box at the ' +
              'top of list.it\'s sidebar.',
            'Delete notes by clicking on <img alt="x button" src="/img/x.png">.',
            'Edit notes by clicking one and typing, when you select' +
              'something else, the note will automatically save.'
          ],
          upgradeFunctions = {
            1: function(from, to) {
              console.log("Here?");
              L.lvent.once('setup:models:after', function(L, lock) {

                _.each(defaultNotes, function(s) {
                  L.notebook.get('notes').create({'contents': s});
                });
                L.notebook.save();
              });
            }
          };

      if (configVersion > programVersion) {
        // TODO: Display an error to the user.
      }

      for (var ver = configVersion + 1; ver <= L.VERSION; ver++) {
        upgradeFunctions[ver](configVersion, programVersion);
        L.setVersion(ver);
      }
      lock.release();
    });
});
