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
  // Open links in a new tab without accidentally modifying notes.
  $(document).on('click', 'a', function(e) {
    var $el = $(this),
        href = $el.attr('href');

    if (!href || href === '' || href[0] === '#' || $el.attr('target') || _.str.startsWith(href, 'javascript')) {
      return;
    }

    window.open(href, '_blank');
    e.preventDefault();
  });
  Backbone.history.start();
});
