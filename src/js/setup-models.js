ListIt.lvent.on('setup:models', function(L, lock) {
  'use strict';
  // Setup Models
  L.notebook = new L.models.NoteBook();

  L.server      = new L.models.Server();
  L.sidebar     = new L.models.FilterableNoteCollection();
  L.omnibox     = new L.models.Omnibox();
  L.preferences = new L.models.Preferences();
  L.authmanager = new L.models.AuthManager();
  L.account     = new L.models.Account();
});
