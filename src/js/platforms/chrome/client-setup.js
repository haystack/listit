/*global chrome:true, background:true */

ListIt.lvent.once('setup:before', function(L, barr) {
  'use strict';
  $(window).one('beforeunload', function() {
    // TODO: Shouldn't be needed.
    L.gvent.off(null, null, window);
  });

  var backgroundWindow = window.chrome.extension.getBackgroundPage();
  var bgL = backgroundWindow.ListIt;
  window.console = backgroundWindow.console;

  // Setup modules
  L.gvent = bgL.gvent;

  // Copy models.
  _.defaults(L.models, bgL.models);

  // Then everything else (doesn't include templates, etc)
  _.defaults(L, bgL);
});


ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  // TODO: Report bug in chrome
  // selectors sometimes not applied (neither query not css work).
  // probably due to passing from background into sidebar.
  $('*').each(function() {
    this.id = this.id;
    this.className = this.className;
  });
});
