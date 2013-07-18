// Add notes on first upgrade.
ListIt.gvent.on('initialize', function(L, version, barr) {
  'use strict';
  var defaultNotes = [
    'Open and close list.it by clicking on the <img alt="list-it" ' +
    'src="/img/listit-icon.png"> icon in the upper right-hand ' +
    'corner of your browser.',
    'Make new notes or search old ones by typing into the box at the ' +
      'top of list.it\'s sidebar.',
    'Delete notes by clicking on <img alt="x button" src="/img/close.png">.',
    'Edit notes by clicking one and typing.'
  ];
  L.lvent.once('setup:models:after', function(L, barr) {
    _.each(defaultNotes, function(s) {
      L.notebook.get('notes').create({'contents': s});
    });
    L.notebook.save();
  });
});
