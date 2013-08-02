/*globals chrome: false*/
(function(L) {
  'use strict';
  L.models.Preferences.prototype.schema = _.defaults({
    popup: {
      type: 'boolean',
      description: 'Use the chrome addon popup instead of a new window.'
    },
    sidebarTrackWindow: {
      type: 'boolean',
      description: "Make list.it's window track the main window (may drain battery)"
    },
    recordActiveTab: {
      type: 'boolean',
      description: "Record the active tab's URL in note metadata on creation."
    }
  }, L.models.Preferences.prototype.schema);

  L.models.Preferences.prototype.defaults = _.defaults({
    popup: false,
    sidebarTrackWindow: false,
    recordActiveTab: false
  }, L.models.Preferences.prototype.defaults);
})(ListIt);

ListIt.lvent.once('setup:models:after', function(L, barr) {
  'use strict';
  L.preferences.ready(function() {
    L.preferences.on('change:recordActiveTab', function(m, v) {
      try {
        if (v) {
          // This only works from event callbacks. This shouldn't be a problem
          // but is kind of hacky.
          chrome.permissions.request({
            permissions: ['tabs']
          }, function(granted) {
            if (!granted) {
              L.preferences.set('recordActiveTab', false);
            }
          });
        } else {
          chrome.permissions.remove({
            permissions: ['tabs']
          });
        }
      } catch (e) {}
    });
  });
});

