
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
      Array.prototype.unshift.call(arguments, "DEBUG:");
      window.console.log.apply(window.console, arguments);
    };
}

window.ListIt = {VERSION: 1};

(function(L) {
    'use strict';

    // Base Objects
    L.pages = {};
    L.views = {};
    L.models = {};
    L.templates = {};

    // Main event handler
    L.vent = _.clone(Backbone.Events);

    // Attach unload event.
    var beforeunloadFired = false;
    $(window).one('beforeunload', function() {
      beforeunloadFired = true;
      L.vent.trigger('sys:window-closed', window);
    }).one('unload', function() {
      // Fake beforeunload for browsers that don't support it.
      if (!beforeunloadFired) {
        $(window).trigger('beforeunload');
        window.beforeunloadfired = true;
      }
    });

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
})(ListIt);
