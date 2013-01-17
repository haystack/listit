(function(L) {
    'use strict';
    var configVersion = L.getVersion(),
        programVersion = L.VERSION,
        defaultNotes = [
            'Open and close list.it by clicking on the <img alt="list-it" ' +
            'src="img/listit-icon.png"> icon in the upper right hand ' +
            'corner of your screen.',
            'Make new notes or search old ones by typing into the box at the ' +
                'top of list.it\'s sidebar.',
            'Delete notes by clicking on <img alt="x button" src="img/x.png">.',
            'Edit notes by clicking one and typing, when you select' +
            'something else, the note will automatically save.'
        ],
        upgradeFunctions = {
          1: function(from, to) {
            var cb = _.once(function() {
              L.notebook.get('notes').reset(_.map(defaultNotes, function(s) {
                return {'contents': s};
              }));
              L.notebook.save();
              L.vent.off(null, cb);
            });
            L.vent.on('setup:models:after', cb);
          }
        };

    if (configVersion > programVersion) {
        // TODO: Display an error to the user.
    }

    for (var ver = configVersion + 1; ver <= L.VERSION; ver++) {
        upgradeFunctions[ver](configVersion, programVersion);
        L.setVersion(ver);
    }

})(ListIt);
