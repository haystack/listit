ListIt.lvent.once('setup:views:before', function(L, barr) {
  L.router = new L.Router();
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
