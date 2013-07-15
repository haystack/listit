/***
 * Adapted from:
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
  _ready: false,
  _timer: Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer),
  _cbs: [],
  _startCb: function() {
    Cu.import("chrome://listit/content/background.jsm", ListItManager);
    if (ListItManager.ListIt.status === "ready") {
      ListItManager._ready = true;
      var cbs = ListItManager._cbs;
      ListItManager._cbs = [];
      cbs.forEach(function(cb) {
        cb(ListItManager.ListIt);
      });
    } else {
      ListItManager.ListIt.lvent.on('status:ready', function() {
        var cbs = ListItManager._cbs;
        ListItManager._cbs = [];
        cbs.forEach(function(cb) {
          cb(ListItManager.ListIt);
        });
      });
    }
  },
  ready: function(cb) {
    if (ListItManager._ready) {
      cb(ListItManager.ListIt);
    } else {
      ListItManager._cbs.push(cb);
    }
  },
  start: function() {
    if (!ListItManager._inited) {
      ListItManager._inited = true;
      ListItManager._timer.initWithCallback(
        ListItManager._startCb, 10, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    }
  },
  stop: function() {
    try {
      if (ListItManager._inited) {
        ListItManager._ready = false;
        ListItManager._inited = false;
        ListItManager.ListIt.destroy();
        delete ListItManager.ListIt;
      }
    } catch (e) {}
  }
};


var WindowListener = {
  setupBrowserUI: function(window) {
    let document = window.document;

    var broadcasters = document.getElementById('mainBroadcasterSet');
    var broadcaster = document.createElement('broadcaster');
    broadcaster.classList.add("listit");
    broadcaster.setAttribute("id", "viewListitSidebar");
    broadcaster.setAttribute("label", "list.it");
    broadcaster.setAttribute("type", "checkbox");
    broadcaster.setAttribute("autoCheck", "false");
    broadcaster.setAttribute("group", "sidebar");
    broadcaster.setAttribute("sidebarurl", SIDEBAR_URL);
    broadcaster.setAttribute("sidebartitle", "list.it");
    broadcaster.setAttribute("oncommand", "toggleSidebar('viewListitSidebar')");
    broadcasters.appendChild(broadcaster);

    var menu = document.getElementById('viewSidebarMenu');
    var menuitem = document.createElement('menuitem');
    menuitem.setAttribute("observes", "viewListitSidebar");
    menuitem.setAttribute("key", "key_viewListitSidebar");
    menuitem.classList.add("listit");
    menu.appendChild(menuitem);


    ListItManager.ready(function(L) {
      var cb = function() {
        try {
          var hotkey = L.preferences.get('openHotkey');
          if (!hotkey) {
            return;
          }
          var pieces = hotkey.split('+');
          var key = pieces.pop();
          var modifiers = pieces.map(function(p) {
            if (p === "ctrl") {
              return "accel";
            } else {
              return p;
            }
          }).join(' ');

          var hotkeys = document.getElementById("ListItKeys");
          if (hotkeys) {
            document.documentElement.removeChild(hotkeys);
          }
          hotkeys = document.createElement('keyset');
          hotkeys.setAttribute("id", "ListItKeys");
          hotkeys.classList.add('listit');

          var openHotkey = document.createElement('key');

          openHotkey.classList.add('listit');
          openHotkey.setAttribute("command", "viewListitSidebar");
          openHotkey.setAttribute("id", "key_viewListitSidebar");

          openHotkey.setAttribute("key", key.toUpperCase());
          openHotkey.setAttribute("modifiers", modifiers);

          hotkeys.appendChild(openHotkey);

          document.documentElement.appendChild(hotkeys);
        } catch (e) {
          Cu.reportError(e);
        }
      };
      var hotkey = L.preferences.get('openHotkey');
      if (hotkey) {
        cb(hotkey);
      }
      L.preferences.on('change:openHotkey', cb);
    });
  },

  tearDownBrowserUI: function(window) {
    let document = window.document;
    var sidebarWindow = document.getElementById("sidebar").contentWindow;
    if (sidebarWindow.location.href === SIDEBAR_URL) {
      window.toggleSidebar();
    }
    Array.slice(document.getElementsByClassName("listit"), 0).forEach(function(el) {
      el.parentNode.removeChild(el);
    });

  },

  // nsIWindowMediatorListener functions
  onOpenWindow: function(xulWindow) {
    // A new window has opened
    let domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                             .getInterface(Ci.nsIDOMWindow);

    // Wait for it to finish loading
    domWindow.addEventListener("load", function listener() {
      domWindow.removeEventListener("load", listener, false);
      // Only start after a window has been loaded (the hidden window needs to
      // be loaded). Also, don't block.
      ListItManager.start();

      // If this is a browser window then setup its UI
      if (domWindow.document.documentElement.getAttribute("windowtype") == "navigator:browser")
        WindowListener.setupBrowserUI(domWindow);
    }, false);
  },

  onCloseWindow: function(xulWindow) {
  },

  onWindowTitleChange: function(xulWindow, newTitle) {
  }
};

function startup(data, reason) {
  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
           getService(Ci.nsIWindowMediator);

  // Get the list of browser windows already open
  let windows = wm.getEnumerator("navigator:browser");
  if (windows.hasMoreElements()) {
    ListItManager.start();
  }

  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);

    WindowListener.setupBrowserUI(domWindow);
  }

  // Wait for any new browser windows to open
  wm.addListener(WindowListener);
}

function shutdown(data, reason) {

  // When the application is shutting down we normally don't have to clean
  // up any UI changes made
  if (reason == APP_SHUTDOWN)
    return;

  let wm = Cc["@mozilla.org/appshell/window-mediator;1"].
           getService(Ci.nsIWindowMediator);

  // Get the list of browser windows already open
  let windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);

    WindowListener.tearDownBrowserUI(domWindow);
  }

  // Stop listening for any new browser windows to open
  wm.removeListener(WindowListener);
  ListItManager.stop();
}
