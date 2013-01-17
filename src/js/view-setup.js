
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

    // FIXME: Put in main view (not needed for options)?
    // Why can't we have a css `height: fill;` attribute.
    // Don't need to debounce (cost(debounce) ~ cost(fixSize)).
    L.fixSize = function() {
      // Always run after render complete.
      setTimeout(function() {
        $('.page:visible').each(function() {
          $(this).children('.contents').height($(window).height() - $(this).children('.header').outerHeight());
        });
      }, 1);
    };
    $(window).resize(L.fixSize);
    L.fixSize();

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
