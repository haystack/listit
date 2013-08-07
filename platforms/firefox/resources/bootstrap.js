/***
 * Inspiration from:
 * http://www.oxymoronical.com/blog/2011/01/Playing-with-windows-in-restartless-bootstrapped-extensions
 * By: Dave Townsend (http://www.oxymoronical.com/blog/author/Mossop)
 *
 * Origionally licenced as "feel free".
 *
 **/
const Cc = Components.classes;
const Ci = Components.interfaces;
const Cu = Components.utils;

const SIDEBAR_URL = "chrome://listit/content/extension/sidebar.xul";

var ListItManager = {
  _inited: false,
  ready: false,
  _timer: Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer),
  _startCb: function() {
    Cu.import("chrome://listit/content/background.jsm", ListItManager);
    Cu.import("chrome://listit/content/webapp/js/platforms/firefox/window-manager.js", ListItManager);
    if (ListItManager.ListIt.status === "ready") {
      ListItManager.ready = true;
      ListItManager.ListItWM.setup(ListItManager.ListIt, ListItManager.enabling);
    } else {
      ListItManager.ListIt.lvent.on('status:ready', function() {
        ListItManager.ready = true;
        ListItManager.ListItWM.setup(ListItManager.ListIt, ListItManager.enabling);
      });
    }
  },
  start: function(reason) {
    if (!ListItManager._inited) {
      ListItManager._inited = true;

      var wm = Cc["@mozilla.org/appshell/window-mediator;1"].
               getService(Ci.nsIWindowMediator);
      var windows = wm.getEnumerator("navigator:browser");
      if (windows.hasMoreElements()) {
        ListItManager._timer.initWithCallback(
          ListItManager._startCb, 10, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
      } else {
        var launchListener = {
          onOpenWindow: function(xulWindow) {
            wm.removeListener(launchListener);
            let domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
            .getInterface(Ci.nsIDOMWindow);
            domWindow.addEventListener("load", function listener() {
              domWindow.removeEventListener("load", listener, false);
              ListItManager._timer.initWithCallback(
                ListItManager._startCb, 10, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
            });
          },
          onCloseWindow: function(xulWindow) {},
          onWindowTitleChang: function(xulWindow) {}
        };
        wm.addListener(launchListener);
      }
    }
  },
  stop: function() {
    try {
      if (ListItManager._inited) {
        ListItManager._timer.cancel();
        if (ListItManager.ready) {
          ListItManager.ListItWM.teardown();
        }
        ListItManager.ready = false;
        ListItManager._inited = false;
        Cu.unload("chrome://listit/content/webapp/platforms/firefox/window-manager.js");
        ListItManager.ListIt.destroy();
        Cu.unload("chrome://listit/content/background.jsm");
        delete ListItManager.ListIt;
      }
    } catch (e) {}
  }
};

function startup(data, reason) {
  if (reason === ADDON_ENABLE) {
    ListItManager.enabling = true;
  }
  ListItManager.start();
}

function shutdown(data, reason) {

  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (reason == APP_SHUTDOWN)
    return;

  ListItManager.stop();
}
