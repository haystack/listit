ListIt.lvent.once('setup:views:before', function(L, barr) {
  'use strict';
  L.router = new L.Router();

  // XXX Unfortunately, I need to do this here instead of in the editor as the
  // editor might not have access to the preferences (AddNotePage etc).
  // This is faster anyways.
  L.preferences.on('change:hideToolbar', function(m, v) {
    $(document.body).toggleClass('hideWysihtml5Toolbar', v);
  });
  $(document.body).toggleClass('hideWysihtml5Toolbar', L.preferences.get('hideToolbar'));
});
ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  Backbone.history.start();
});
