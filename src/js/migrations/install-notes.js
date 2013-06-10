// Add notes on first upgrade.
ListIt.gvent.on('upgrade:version:1', function(L, desc, barr) {
  var defaultNotes = [
    'Open and close list.it by clicking on the <img alt="list-it" ' +
    'src="/img/listit-icon.png"> icon in the upper right hand ' +
    'corner of your screen.',
    'Make new notes or search old ones by typing into the box at the ' +
      'top of list.it\'s sidebar.',
    'Delete notes by clicking on <img alt="x button" src="/img/x.png">.',
    'Edit notes by clicking one and typing, when you select' +
      'something else, the note will automatically save.'
  ];
  L.lvent.once('setup:models:after', function(L, barr) {
    _.each(defaultNotes, function(s) {
      L.notebook.get('notes').create({'contents': s});
    });
    L.notebook.save();
  });
});
