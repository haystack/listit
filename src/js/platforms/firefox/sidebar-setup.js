ListIt.lvent.once('setup:views', function(L, barr) {
  'use strict';
  L.addPage('main', new L.views.MainPage());
});
ListIt.lvent.once('setup:views:after', function(L, barr) {
  'use strict';
  L.router.route('options', 'options', function() {
    // Intercept options page request and open a new window.
    this.navigate('', {trigger: false});
    window.open('/options.html', '_new');
  });
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
});
