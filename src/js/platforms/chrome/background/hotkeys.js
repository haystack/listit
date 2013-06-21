/*global chrome: false*/
ListIt.lvent.once('setup:models:after', function(L, barr) {
  'use strict';
  var commands = {
    "create-page-note": function() {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        var tab = tabs[0];
        L.chrome.appendToCurrentNote(L.templates.link({
          url: tab.url,
          title: tab.title,
          icon: tab.favIconUrl
        }), tab.id);
      });
    },
    "create-note": function() {
      L.chrome.appendToCurrentNote();
    }
  };
  chrome.commands.onCommand.addListener(function(command) {
    var cb = commands[command];
    if (!cb) {
      return debug("Invalid Command Triggered: " + command);
    }
    cb();
  });
});

