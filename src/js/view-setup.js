
(function(L) {
  'use strict';
  // Setup views
  $(document).ready(function() {

    // Bind unload events.
    L.pages = {}
    L.addPage = function(name, view) {
      $('body').append(view.render().el);
      if (_.keys(L.pages).length === 0) {
        view.$el.show();
      } else {
        view.$el.hide();
      }
      L.pages[name] = view
    };
    L.removePage = function(name) {
      L.pages[name].remove();
      delete L.pages[name];
    }

    L.vent.trigger('setup:views:before setup:views', window);

    // Open links in a new tab without accidentally modifying notes.
    $(document).on('click', 'a', function(e) {
      var $el = $(this),
      href = $el.attr('href');

      if (!href ||
          href === '' ||
            href[0] === '#' ||
              $el.attr('target') ||
                _.str.startsWith(href, 'javascript')) {
        return;
      }

      window.open(href, '_blank');
      e.preventDefault();
    });

    L.vent.trigger('setup:views:after', window);

    L.router = new L.Router();

    Backbone.history.start();
  });
})(ListIt);
