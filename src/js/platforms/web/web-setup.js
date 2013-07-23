ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';
  L.addPage('main', new L.views.MainPage());
  L.addPage('options', new L.views.OptionsPage());
  L.addPage('help', new L.views.HelpPage());

  // Ugly hack for firefox -moz-box. Need this event to fixup page header
  // (omnibox) /content (notelist) heights.
  // BUG: https://bugzil.la/579776 (the workarround doesn't work).
  if (!Modernizr.flexbox) {
    var fixSize = function() {
      var h = $(this);
      var p = h.parent();
      var c = p.children('.contents');
      c.height(p.innerHeight()-h.outerHeight());
    };
    $(".page>.header").on("resize", fixSize);

    _.defer(function() {
      $(".page>.header").each(function() {
        fixSize.apply(this);
        $(window).on('resize', _.bind(fixSize, this));
      });
    });
  }
});
