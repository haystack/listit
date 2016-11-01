
/*
* Main application.
*
* This needs to be run before local code and after libraries.
*/

// Setup debugging
// Also lets me throw errors without breaking things.


if (window.DEBUG_MODE && window.console && window.console.time) {
  window.console.time('load');
}

window.debug = function() {};
window.error = function() {};

if (window.console) {
  window.error = function() {
    'use strict';
    Array.prototype.unshift.call(arguments, "ERROR:");
    window.console.error.apply(window.console, arguments);
  };
  if (window.DEBUG_MODE) {
    window.debug = function() {
      'use strict';
      Array.prototype.unshift.call(arguments, "DEBUG:");
      window.console.log.apply(window.console, arguments);
    };
  }
}


window.ListIt = {VERSION: 1};

(function(L) {
  'use strict';

  /***********************
   *  Setup Environment  *
   ***********************/

  L.pages = {};
  L.views = {};
  L.models = {};
  L.observers = {};
  L.templates = {};

  /*******************
   *  Event Objects  *
   *******************/

  L.gvent = _.clone(Backbone.Events);
  L.lvent = _.clone(Backbone.Events);

  L.status = 'loading';
  L.setStatus = function(status) {
    L.status = status;
    L.lvent.trigger('status status:'+status, status);
  };

  /*************
   *  Cleanup  *
   *************/

  var beforeunloadFired = false;
  $(window).one('beforeunload', function() {
    beforeunloadFired = true;
    L.gvent.trigger('sys:window-closed', window);
  }).one('unload', function() {
    // Fake beforeunload for browsers that don't support it.
    if (!beforeunloadFired) {
      $(window).trigger('beforeunload');
      window.beforeunloadfired = true;
    }
  });


  /*************
   *  Helpers  *
   *************/


  // Global methods (instantiate somewhere else)?
  // These should be very small convenience functions.

  L.getVersion = function(callback) {
    if (callback) {
      L.store.get('version', {
        success: callback,
        error: function() {
          callback(0);
        }
      });
    }
  };

  // Add page adding/removing functions.
  L.addPage = function(name, view) {
    $('body').append(view.el);
    var gofn = _.partial(L.router.go, name);
    if (_.keys(L.pages).length === 0) {
      L.router.route('', name, gofn);
      L.router.stack[0] = name;
    }
    L.pages[name] = view;
    L.router.route(name, name, gofn);
  };

  L.removePage = function(name) {
    L.pages[name].remove();
    delete L.pages[name];
  };

  L.setVersion = function(version) {
    L.store.set('version', version);
  };
})(ListIt);
