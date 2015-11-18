ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';
  L.addPage('main', new L.views.MainPage());
});
ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  L.router.route('options', 'options', function() {
    // Intercept options page request and open a new window.
    this.navigate('', {trigger: false});
    // TODO: reuse open preferences.
    var browser = window.top.getBrowser();
    browser.selectedTab = browser.addTab('chrome://listit/content/webapp/options.html');
  });
  L.router.route('help', 'help', function() {
    this.navigate('', {trigger: false});
    var browser = window.top.getBrowser();
    browser.selectedTab = browser.addTab('chrome://listit/content/webapp/help.html');
  });
  L.router.route('trashbin', 'trashbin', function() {
    this.navigate('', {trigger: false});
    var browser = window.top.getBrowser();
    browser.selectedTab = browser.addTab('chrome://listit/content/webapp/trashbin.html');
  });
});
