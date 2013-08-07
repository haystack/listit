/*jshint globalstrict: true*/
/*exported EXPORTED_SYMBOLS, ListItIM*/

// Handles the toolbar button.

'use strict';

var EXPORTED_SYMBOLS = ["ListItIM"];

var ListItIM = {};

// if extension is being first enabled, add the icon to the default position.
var useDefaultPosition = function(document, button) {
  var defaultToolbar = "addon-bar";
  var toolbar = document.getElementById(defaultToolbar);
  toolbar.insertItem(button.id);
  var currentset = toolbar.getAttribute("currentset") + "," + button.id;
  toolbar.setAttribute("currentset", currentset);
  toolbar.currentSet = currentset;
  document.persist(defaultToolbar, "currentset");
  toolbar.collapsed = false;
};

var addIcon = function(document, button, enabling) {
  // Check which (if any) toolbar the button should be located in.
  // When restarting firefox, this will allow the position of the icon to persist:
  var toolbars = document.querySelectorAll("toolbar");
  var toolbar, currentset, idx;
  for (var i = 0; i < toolbars.length; i++) {
    currentset = toolbars[i].getAttribute("currentset").split(",");
    idx = currentset.indexOf(button.id);
    if (idx !== -1) {
      toolbar = toolbars[i];
      break;
    }
  }

  // Puts the button into whichever toolbar it belongs in:
  if (toolbar) {
    var itemAfter = document.getElementById(currentset[idx+1]);
    toolbar.insertItem(button.id, itemAfter);
  } else if (enabling) {
    // If no toolbar contains the button and the extension is being enabled,
    // add the button to the default position:
    useDefaultPosition(document, button);
  }
};

ListItIM.createButton = function(window, enabling) {
  var document = window.document;
  var button = document.createElement("toolbarbutton");
  button.setAttribute("id", "listitButton");
  button.setAttribute("command", "viewListitSidebar");
  button.setAttribute("observes", "viewListitSidebar");
  button.setAttribute("key", "key_viewListitSidebar");
  button.setAttribute("image", "chrome://listit/content/webapp/img/icon16.png");
  button.setAttribute("class", "listit toolbarbutton-1 chromeclass-toolbar-additional");
  document.getElementById("navigator-toolbox").palette.appendChild(button);
  addIcon(document, button, enabling);
};
