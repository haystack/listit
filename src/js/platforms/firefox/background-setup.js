/*globals ListItAddons: false*/
ListIt.lvent.once('setup:before', function(L, barr) {
  'use strict';
  L.store = ListItAddons.FirefoxStorage;
  L.models.AuthManager = ListItAddons.AuthManager;
});

