ListIt.lvent.once('setup:models', function(L, barr) {
  'use strict';
  // Setup Models

  // Wait until the models have been fetched.
  // Oh lovely async...
  barr.aquire(6);

  var options = {
    fetch: true,
    fetchRelated: true,
    complete: _.mask(barr.release)
  };

  L.notebook = new L.models.NoteBook(null, options);

  L.server      = new L.models.Server(null, options);
  L.sidebar     = new L.models.FilterableNoteCollection(null, {track: L.notebook.get('notes')}); // Not saved
  L.omnibox     = new L.models.Omnibox(null, options);
  L.preferences = new L.models.Preferences(null, options);
  L.authmanager = new L.models.AuthManager(null, options);
  L.logger = new L.models.Logger(null, options);
});

ListIt.lvent.once('setup:models:after', function(L, barr) {
  'use strict';
  // Don't start logging until initialized.
  L.logger.start();
  // Start syncing after models completely initialized.
  // This should go somewhere else
  L.server.listenTo(L.server, 'change:registered', function(m, registered) {
    if (registered) {
      m.start();
    } else {
      m.stop();
    }
  });
  if (L.server.get('registered')) {
    L.server.start();
  }
});
