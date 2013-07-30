// Add notes on first upgrade.
ListIt.gvent.on('initialize', function(L, version, barr) {
  'use strict';
  var defaultNotes = [
    'Make new notes or search old ones by typing into the box above. Save ' +
      'a new note by clicking <img title="Save" src="img/actions/add.png">',
    'Pin notes to keep them at the top of your list. Pin a new note by ' +
      'clicking <img title="Pin" src="img/actions/add_pinned.png"> to save ' +
      'with a pin. Change whether an old note is pinned by clicking the star.',
    'Delete notes by clicking on <img title="x button" src="img/close.png">.',
    'Edit notes by clicking one and typing. They will save automatically.',
    'Reorder notes by clicking and dragging them to new locations.',
    'Make a List.it account by going to the options page. This will allow ' +
      'you to sync your notes onto our server. You can also opt in to our' +
      'studies on how people take notes. This will allow us to make a ' +
      'better program for you.',
    'Learn more about using List.it by clicking the question mark in the upper'+
      ' right corner of this sidebar to visit the help page.'
  ];
  L.lvent.once('setup:models:after', function(L, barr) {
    _.each(defaultNotes, function(s) {
      L.notebook.get('notes').create({'contents': s});
    });
    L.notebook.save();
  });
});
