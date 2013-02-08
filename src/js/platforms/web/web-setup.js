ListIt.lvent.once('setup:views', function(L, lock) {
  'use strict';
  L.addPage('main', new L.views.MainPage());
  L.addPage('options', new L.views.OptionsPage());
});
