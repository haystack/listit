/*global chrome:true, background:true */

(function(L) {
    'use strict';

    var bgL = background.ListIt;

    // Setup modules
    L.vent = bgL.vent;
    $(window).one('beforeunload', function() {
      L.vent.off(null, null, window);
    });

    // Copy models.
    _.defaults(L.models, bgL.models);

    // Then everything else (doesn't include templates, etc)
    _.defaults(L, bgL);

    L.vent.once('setup:views:after', function() {
        // TODO: Report bug in chrome
        // selectors sometimes not applied (neither query not css work).
        // probably due to passing from background into sidebar.
        $('*').each(function() {
            this.id = this.id;
            this.className = this.className;
        });
    }, window);
})(ListIt);
