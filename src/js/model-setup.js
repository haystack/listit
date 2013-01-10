(function(L) {
    'use strict';
    // Setup Models
    L.vent.trigger('setup:models:before');
    L.notebook = new L.make.notes.NoteBook();

    L.server = new L.make.server.ServerModel();
    L.sidebar = new L.make.notes.FilterableNoteCollection();
    L.omnibox = new L.make.omnibox.OmniboxModel();
    L.options = new L.make.options.OptionsModel();
    L.authmanager = new L.make.server.AuthManager();
    L.account = new L.make.account.AccountModel();
    L.vent.trigger('setup:models setup:models:after');
})(ListIt);
