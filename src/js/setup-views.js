ListIt.lvent.once('setup:views:before', function(L, barr) {
  'use strict';
  L.router = new L.Router();

  // XXX Unfortunately, I need to do this here instead of in the editor as the
  // editor might not have access to the preferences (AddNotePage etc).
  // This is faster anyways.
  L.preferences.on('change:hideToolbar', function(m, v) {
    $(document.body).toggleClass('hide-toolbar', v);
  });
  $(document.body).toggleClass('hide-toolbar', L.preferences.get('hideToolbar'));
});
ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  Backbone.history.start();
});
