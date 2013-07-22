ListIt.lvent.once('setup:models', function(L, barr) {
  'use strict';
  // Setup Models

  L.notebook = new L.models.NoteBook();

  L.server      = new L.models.Server();
  L.sidebar     = new L.models.FilterableNoteCollection(null, {track: L.notebook.get('notes')}); // Not saved
  L.omnibox     = new L.models.Omnibox();
  L.preferences = new L.models.Preferences();
  L.authmanager = new L.models.AuthManager(); // Might not be a backbone model
  L.logger = new L.models.Logger();
});

ListIt.lvent.once('setup:models:after', function(L, barr) {
  'use strict';
  // Don't start logging or server until initialized.
  L.logger.ready(function() {
    L.logger.start();
  });

  // Delay syncing start 10 seconds.
  // No need to do this immediately
  _.delay(function() {
    L.server.ready(function() {
      L.server.start();
    });
  }, 10000);
});
