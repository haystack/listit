/*jshint globalstrict: true*/
/*exported EXPORTED_SYMBOLS, ListItWM*/
/*globals Components: false, ListIt: true*/
/**
 * This module handles the setup/teardown of windows.
 *
 * I can't do this in XUL because (a) this is a bootstrapped extension and (b)
 * I need to be able to change things on the fly.
 *
 **/

'use strict';

var EXPORTED_SYMBOLS = ["ListItWM"];


var SIDEBAR_URL = "chrome://listit/content/extension/sidebar.xul";
var Cc = Components.classes,
    Ci = Components.interfaces,
    Cu = Components.utils;

var wm = Cc["@mozilla.org/appshell/window-mediator;1"]
         .getService(Ci.nsIWindowMediator),
    ListIt,
    ListItWM = {};

var eachWindow = function(fn) {
  var windows = wm.getEnumerator("navigator:browser");
  while (windows.hasMoreElements()) {
    var domWindow = windows.getNext().QueryInterface(Ci.nsIDOMWindow);
    fn.call(domWindow, domWindow);
  }
};

var setupBroadcaster = function(window) {
  var document = window.document;
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
};


var setupMenu = function(window) {
  var document = window.document;
  var menu = document.getElementById('viewSidebarMenu');
  var menuitem = document.createElement('menuitem');
  menuitem.setAttribute("command", "viewListitSidebar");
  menuitem.setAttribute("observes", "viewListitSidebar");
  menuitem.setAttribute("key", "key_viewListitSidebar");
  menuitem.classList.add("listit");
  menu.appendChild(menuitem);
};

var setupIcon = function(window) {
  Cu.import("chrome://listit/content/webapp/js/platforms/firefox/icon-manager.js", ListItWM);
  ListItWM.ListItIM.createButton(window);
};

var bindKey = function(keyEl, hotkey) {
  var pieces = hotkey.split('+');
  var key = pieces.pop();
  var modifiers = pieces.map(function(p) {
    if (p === "ctrl") {
      return "accel";
    } else {
      return p;
    }
  }).join(' ');
  keyEl.setAttribute('key', key.toUpperCase());
  keyEl.setAttribute('modifiers', modifiers);
};

var setupBrowserHotkey = function(window, hotkey) {
  var document = window.document;
  if (!hotkey) { return; }
  try {

    var hotkeys = document.getElementById("ListItKeys");
    if (hotkeys) {
      document.documentElement.removeChild(hotkeys);
    }
    hotkeys = document.createElement('keyset');
    hotkeys.setAttribute("id", "ListItKeys");
    hotkeys.classList.add('listit');

    var openHotkey = document.createElement('key');
    openHotkey.classList.add('listit');

    // Not my fault! addEventListener('command',...) doesn't work and I don't
    // want to leak references.
    openHotkey.setAttribute(
      'oncommand', "(function toggleOrFocusListItSidebar() {" +
      "var broadcaster = document.getElementById('viewListitSidebar');" +
      "var sidebar = document.getElementById('sidebar');" +
      "if (broadcaster.getAttribute('checked') === 'true' && !sidebar.contentDocument.hasFocus())" +
      "{sidebar.focus();} else {window.toggleSidebar('viewListitSidebar');}"+
      "})()");
    openHotkey.setAttribute("id", "key_viewListitSidebar");
    bindKey(openHotkey, hotkey);

    hotkeys.appendChild(openHotkey);
    document.documentElement.appendChild(hotkeys);

  } catch (e) { Cu.reportError(e); }
};

var setupPreferenceListener = function() {
  ListIt.preferences.on('change:openHotkey', function(m, hotkey) {
    eachWindow(function(domWindow) {
      setupBrowserHotkey(domWindow, hotkey);
    });
  });
};

var windowListener = {
  onOpenWindow: function(xulWindow) {
    // A new window has opened
    var domWindow = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor)
                             .getInterface(Ci.nsIDOMWindow);

    // Wait for it to finish loading
    domWindow.addEventListener("load", function listener() {
      domWindow.removeEventListener("load", listener, false);
      if (domWindow.document.documentElement.getAttribute("windowtype") === "navigator:browser") {
        ListItWM.setupBrowser(domWindow);
      }
    }, false);
  },
  onCloseWindow: function(xulWindow) {},
  onWindowTitleChange: function(xulWindow) {}
};


ListItWM.setupBrowser = function(window) {
  setupBroadcaster(window);
  setupMenu(window);
  setupIcon(window);
  setupBrowserHotkey(window, ListIt.preferences.get('openHotkey'));
};

ListItWM.teardownBrowser = function(window) {
  Array.slice(window.document.getElementsByClassName("listit"), 0).forEach(function(el) {
    el.parentNode.removeChild(el);
  });
};

ListItWM.setup = function(realListIt) {
  ListIt = realListIt;
  eachWindow(function(domWindow) {
    ListItWM.setupBrowser(domWindow);
  });
  setupPreferenceListener();
  wm.addListener(windowListener);
};

ListItWM.teardown = function(reason) {
  wm.removeListener(windowListener);
  eachWindow(function(domWindow) {
    var sidebarBox = domWindow.document.getElementById("sidebar-box");
    if (sidebarBox.getAttribute("sidebarcommand") === "viewListitSidebar") {
      domWindow.toggleSidebar();
    }
    ListItWM.teardownBrowser(domWindow);
    if (reason === 4) {
      ListItWM.ListItIM.destroyButton(domWindow);
    }
  });
};
