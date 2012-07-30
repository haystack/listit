"use strict";

/*
 * Main application.
 *
 * This needs to be run before local code and after libraries.
 */

// Setup debugging
var DEBUG_MODE = (typeof window.location.host === 'string' &&
		  window.location.host.search(':8000') !== -1);
DEBUG_MODE = true; 

window.debug = function() {};

if (DEBUG_MODE && window.console) {
  window.debug = function(){
    console.log.apply(console, arguments);
  }
}

// Main app objects
var L = {};
L.pages = {};
L.make = {};
L.templates = {};

// Global event manager.
L.vent = _.clone(Backbone.Events);

/* Notes:
 *  Views and models/collections should share the same name. This makes
 *  overriding easier (independent).
 *
 *  All uninstantiated datatypes should go in L.make.
 *
 *  All global notifications (user, etc) should be handled by events through
 *  vent.
 *
 *  Instantiated views go in L.views, everything else goes in L.
 *
 */

// Global methods (instantiate somewhere else?
// These should be very small convenience functions.

L.addNote = function(text, meta) {
    var note = new L.make.notes.NoteModel({contents: text});
    var noteJSON = note.toJSON();
    noteJSON.meta = meta || {};
    L.vent.trigger("note:request:parse", noteJSON, window);
    L.vent.trigger("note:request:parse:new", noteJSON, window);
    note.set(noteJSON);
    L.notes.add(note, {action: "add"});
    note.save();
};

L.log = function(action, info) {
    var e = {action: action, info: info};
    L.vent.trigger("log", e);
    L.vent.trigger("log:"+e.action, e);
};

L.getNote = function(id) {
    return (L.deletedNotes.get(id) || L.notes.get(id));
};
