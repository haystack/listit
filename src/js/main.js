
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

  /***********
   *  Setup  *
   ***********/
  
  var setupActions = [
    function(lock) {
      L.lvent.trigger('setup:before', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:upgrade:before', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:upgrade', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:upgrade:after', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:models:before', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:models', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:models:after', L, lock);
    },
    function(lock) {
      lock.aquire();
      $(function() {
        L.lvent.trigger('setup:views:before', L, lock);
        lock.release();
      });
    },
    function(lock) {
      L.lvent.trigger('setup:views', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:views:after', L, lock);
    },
    function(lock) {
      L.lvent.trigger('setup:after', L, lock);
    }
  ];

  var callSetupAction = function(i) {
    if (setupActions.length <= i) return;

    var lock = new Lock();
    setupActions[i](lock);
    lock.wait(callSetupAction, i+1);
  };

  // Must defer (call after all scripts loaded).
  _.defer(callSetupAction, 0);
})(ListIt);
