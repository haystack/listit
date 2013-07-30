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
      //$(document).bind('keydown', cmd.shortcut, _.bind(window.close, window));
      // $(window).bind('keydown', cmd.shortcut, function() {
        // console.log("you're pressing the command dawg");
        // document.close();
      // });
      // $(window).on('keydown', null, cmd.shortcut.toLocaleLowerCase(), function() {
        // console.log("you pressed the key, yay");
        // document.close();
        // });
      $(document).on('keydown', null, cmd.shortcut, function() {
        window.close();
      });
      $(document).on('keydown', null, "Ctrl+t", function() {
        window.close();
      });
      $(window).on('keydown', null, "ctrl+shift+l", function() {
        window.close();
      });
      $(document).bind('keydown', "ctrl+m", _.bind(window.close, window));
    }
  });
});
