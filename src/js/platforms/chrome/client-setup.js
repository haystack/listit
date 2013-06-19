/*global chrome:true, background:true */

ListIt.lvent.once('setup:before', function(L, barr) {
  'use strict';
  $(window).one('beforeunload', function() {
    // TODO: Shouldn't be needed.
    L.gvent.off(null, null, window);
  });

  var background_window = window.chrome.extension.getBackgroundPage();
  var bgL = background_window.ListIt;
  window.console = background_window.console;

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
  // Close on hotkey press.
  chrome.commands.getAll(function(cmds) {
    var cmd = _.findWhere(cmds, {name: "_execute_browser_action"});
    if (cmd && cmd.shortcut) {
      $(document).bind('keydown', cmd.shortcut, _.bind(window.close, window));
    }
  });
});
