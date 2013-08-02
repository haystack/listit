// Add notes on first upgrade.
ListIt.gvent.on('initialize', function(L, version, barr) {
  'use strict';
  var defaultNotes = [
    'Make new notes or search old ones by typing into the box above. Save ' +
      'a new note by clicking <img title="Save" width="22" height="22" src="img/actions/add.png">',
    'Pin notes to keep them at the top of your list. Pin a new note by ' +
      'clicking <img title="Pin" width="22" height="22" src="img/actions/add_pinned.png"> to save ' +
      'with a pin. Change whether an old note is pinned by clicking the star.',
    'Delete notes by clicking on <img width="10" height="10" title="x button" src="img/close.png">.',
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
    L.notebook.ready(function() {
      var nts = L.notebook.get('notes');
      _.each(defaultNotes, function(s, i) {
        // Give them consistant IDs so they are deleted correctly on sync.
        // Also, don't bother syncing these notes unless they have been
        // changed. Setting modified to false also ensures that they are
        // correctly deleted as we don't delete modified notes on sync.
        // Also, id 0 is a bad idea (we do some sloppy checks).
        nts.create({'contents': s, 'id': i+1, 'modified': false});
      });
      L.notebook.save();
    });
  });
});
