ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';
  L.addPage('main', new L.views.MainPage());
  L.addPage('options', new L.views.OptionsPage());
  L.addPage('help', new L.views.HelpPage());
  L.addPage('trashbin', new L.views.TrashbinPage());
});
