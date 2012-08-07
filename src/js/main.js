
/*
* Main application.
*
* This needs to be run before local code and after libraries.
*/

// Setup debugging
//

window.DEBUG_MODE = true;

window.debug = function() {};
if (window.DEBUG_MODE && window.console) {
    window.debug = function() {
        'use strict';
        window.console.log.apply(window.console, arguments);
    };
}

window.ListIt = (function() {
    'use strict';
    var L = {
        'vent': _.clone(Backbone.Events),
        'pages': {},
        'make': {},
        'templates': {}
    };

    /* Notes:
    *  Views and models/collections should share the same name. This makes
    *  overriding easier (independent).
    *
    *  All uninstantiated datatypes should go in L.make.
    *
    *  All global notifications (user, etc) should be handled by events through
    *  vent.
    *
    */

    // Global methods (instantiate somewhere else)?
    // These should be very small convenience functions.

    L.addNote = function(text, meta) {
        var note = new L.make.notes.NoteModel({contents: text}),
        noteJSON = note.toJSON();

        noteJSON.meta = meta || {};
        L.vent.trigger('note:request:parse', noteJSON, window);
        L.vent.trigger('note:request:parse:new', noteJSON, window);
        note.set(noteJSON);
        L.notes.add(note, {action: 'add'});
        note.save();
    };

    L.log = function(action, info) {
        var e = {action: action, info: info};
        L.vent.trigger('log', e);
        L.vent.trigger('log:' + e.action, e);
    };

    L.getNote = function(id) {
        return (L.deletedNotes.get(id) || L.notes.get(id));
    };

    L.initModule = function(name) {
        L.templates[name] = L.templates[name] || {};
        L.make[name] = L.make[name] || {};
    };

    return L;
})();
