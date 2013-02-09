
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

  /***********************
   *  Setup Environment  *
   ***********************/
  
  L.pages = {};
  L.views = {};
  L.models = {};
  L.templates = {};

  /*******************
   *  Event Objects  *
   *******************/
  
  L.gvent = _.clone(Backbone.Events);
  L.lvent = _.clone(Backbone.Events);

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
    $('body').append(view.render().el);
    if (_.keys(L.pages).length === 0) {
      view.$el.show();
    } else {
      view.$el.hide();
    }
    L.pages[name] = view
  };

  L.removePage = function(name) {
    L.pages[name].remove();
    delete L.pages[name];
  }

  L.setVersion = function(version) {
    L.store.set('version', version);
  };

  L.log = function(action, info) {
    var e = {action: action, info: info};
    L.gvent.trigger('log', e);
    L.gvent.trigger('log:' + e.action, e);
  };

  L.addNote = function(text, meta) {
    return L.notebook.addNote(text, meta, window);
  };
})(ListIt);
