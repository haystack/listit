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

var ListItContext = {
  inited: false,
  timer: Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer),
  start: function() {
    Cu.import("chrome://listit/content/background.jsm", ListItContext);
  }
};

var startBackground = function() {
  if (!ListItContext.inited) {
    ListItContext.inited = true;
    ListItContext.timer.initWithCallback(
      ListItContext.start, 10, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
  }
};

var stopBackground = function() {
  try {
    if (ListItContext.inited) {
      ListItContext.inited = false;
      ListItContext.ListIt.destroy();
      delete ListItContext.ListIt;
    }
  } catch (e) {}
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
    broadcaster.setAttribute("sidebarurl", "chrome://listit/content/extension/sidebar.xul");
    broadcaster.setAttribute("sidebartitle", "list.it");
    broadcaster.setAttribute("oncommand", "toggleSidebar('viewListitSidebar')");
    broadcasters.appendChild(broadcaster);

    var menu = document.getElementById('viewSidebarMenu');
    var menuitem = document.createElement('menuitem');
    menuitem.setAttribute("observes", "viewListitSidebar");
    menuitem.classList.add("listit");
    menu.appendChild(menuitem);


  },

  tearDownBrowserUI: function(window) {
    let document = window.document;
    // TODO: Close things.
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
      startBackground();

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
    startBackground();
  }

  while (windows.hasMoreElements()) {
    let domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);

    WindowListener.setupBrowserUI(domWindow);
  }

  // Wait for any new browser windows to open
  wm.addListener(WindowListener);
}

function shutdown(data, reason) {
  stopBackground();

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
}
