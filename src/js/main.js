
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
        Array.prototype.unshift.call(arguments, "DEBUG:");
        window.console.log.apply(window.console, arguments);
    };
}

window.ListIt = {VERSION: 1};

(function(L) {
    'use strict';

    L.pages = {};
    L.make = {};
    L.templates = {};

    L.vent = _.clone(Backbone.Events),

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

    L.getVersion = function() {
        return localStorage.getItem('version') || 0;
    };

    L.setVersion = function(version) {
        localStorage.setItem('version', version);
    };

    L.log = function(action, info) {
        var e = {action: action, info: info};
        L.vent.trigger('log', e);
        L.vent.trigger('log:' + e.action, e);
    };

    L.addNote = function(text, meta) {
      return L.notebook.addNote(text, meta, window);
    };

    L.getNote = function(id) {
        return L.notebook.getNote(id);
    };

    L.initModule = function(name) {
        L.templates[name] = L.templates[name] || {};
        L.make[name] = L.make[name] || {};
    };


})(ListIt);
