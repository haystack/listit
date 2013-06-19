ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';
  // Make Pages
  L.addPage('main', new L.views.MainPage());
});

ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  // Fix options link on chrome.
  $('[href="#/options"]').attr({
    'target': '_new',
    'href': '/options.html'
  });
  // Close on hotkey press.
  chrome.commands.getAll(function(cmds) {
    var cmd = _.findWhere(cmds, {name: "_execute_browser_action"});
    if (cmd && cmd.shortcut) {
      $(document).bind('keydown', cmd.shortcut, _.bind(window.close, window));
    }
  });
});
