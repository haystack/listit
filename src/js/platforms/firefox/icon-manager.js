// Handles the toolbar button.

'use strict';

var EXPORTED_SYMBOLS = ["ListItIM"];

var ListItIM = {};

// creates the dom element for the toolbar button, and the basis for adding it to a toolbar.
var createIcon = function(window, enabling) {
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

var addIcon = function(document, button, enabling) {
  // check which (if any) toolbar the button should be located in:
  // when restarting firefox, this will allow the position of the icon to persist:
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
  
  // put the button into the toolbar it belongs in.
  if (toolbar) {
    // inserts the button into the toolbar before the item after it.
    var itemAfter = document.getElementById(currentset[idx+1]);
    toolbar.insertItem(button.id, itemAfter);
    // toolbar.setAttribute("currentset", toolbar.currentSet);
    //currentset.splice(idx, 0, button.id);
    //toolbar.setAttribute("currentset", currentset.join(","));
  } else if (enabling) {
    useDefaultPosition(document, button);
  }
};

// if extension is being first enabled, add the icon to the default position.
var useDefaultPosition = function(document, button) {
  var defaultToolbar = "addon-bar";
  var toolbar = document.getElementById(defaultToolbar);
  toolbar.insertItem(button.id);
  // I don't need to make this an array, if it is a string I can just append. [well. concat. you know.]
  var currentset = toolbar.getAttribute("currentset").split(",");
  currentset.push(button.id);
  toolbar.setAttribute("currentset", currentset.join(","));
  toolbar.currentSet = currentset.join(",");
  document.persist(defaultToolbar, "currentset");
  toolbar.collapsed = false;
};

ListItIM.createButton = function(window, enabling) { // I don't know if this level of functionwhatnotexportationshit is actually necessary. Womp womp womp.
  createIcon(window, enabling);
};
