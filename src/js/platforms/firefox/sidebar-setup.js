ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';
  L.addPage('main', new L.views.MainPage());
});
ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  $('[href="#/options"]').attr({
    'target': '_blank',
    'href': 'chrome://listit/content/webapp/options.html'
  });
  var fixSize = function() {
    var h = $(this);
    var p = h.parent();
    var c = p.children('.contents');
    c.height(p.innerHeight()-h.outerHeight());
  }
  $(".page>.header").on("resize", fixSize);

  _.defer(function() {
    $(".page>.header").each(function() {
      fixSize.apply(this);
      $(window).on('resize', _.bind(fixSize, this));
    });
  });
});
