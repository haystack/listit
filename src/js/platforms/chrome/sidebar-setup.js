/*global chrome: false*/
ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';
  // Make Pages
  L.addPage('main', new L.views.MainPage());
});

ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  L.router.route('options', 'options', function() {
    // Intercept options page request and open a new window.
    this.navigate('', {trigger: false});
    window.open('/options.html', '_new');
  });

  L.router.route('help', 'help', function() {
    this.navigate('', {trigger: false});
    window.open('/help.html', '_new');
  });

  // Close on hotkey press.
  chrome.commands.getAll(function(cmds) {
    var cmd = _.findWhere(cmds, {name: "_execute_browser_action"});
    if (cmd && cmd.shortcut) {
      $(document).bind('keydown', cmd.shortcut, _.bind(window.close, window));
    }
  });
});
