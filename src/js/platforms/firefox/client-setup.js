/*globals Components: false*/
ListIt.lvent.once('setup:before', function(L, barr) {
  'use strict';
  // For security, this should go at the top.
  // After importing the background window, we should be able to ditch Components.
  var backgroundWindow = {};
  Components.utils['import']("chrome://listit/content/background.jsm", backgroundWindow);

  var bgL = backgroundWindow.ListIt;
  // Wait until ready
  if (bgL.status !== 'ready') {
    barr.aquire();
    bgL.lvent.once('status:ready', function() {
      L.gvent = bgL.gvent;
      _.defaults(L.models, bgL.models);
      _.defaults(L, bgL);
      barr.release();
    });
  } else {
    L.gvent = bgL.gvent;
    _.defaults(L.models, bgL.models);
    _.defaults(L, bgL);
  }

  // Open bookmarks in new tabs.
  L.views.NoteView.prototype.events['click.firefox .contents a'] = function(e) {
    var browser = window.top.getBrowser();
    browser.selectedTab = browser.addTab(e.target.href);
    e.preventDefault();
  };
});
