(function(L) {
    'use strict';
    // Setup Models
    L.vent.trigger('setup:models:before');
    L.notebook = new L.models.NoteBook();

    L.server      = new L.models.Server();
    L.sidebar     = new L.models.FilterableNoteCollection();
    L.omnibox     = new L.models.Omnibox();
    L.options     = new L.models.Options();
    L.authmanager = new L.models.AuthManager();
    L.account     = new L.models.Account();
    L.vent.trigger('setup:models setup:models:after');
})(ListIt);
