/*global chrome:true, background:true */

(function(L) {
    'use strict';

    var bgL = background.ListIt;

    // Setup modules
    L.vent = bgL.vent;

    // Copy models.
    _.defaults(L.models, bgL.models);

    // Then everything else (doesn't include templates, etc)
    _.defaults(L, bgL);

    L.vent.on('setup:views:after', _.once(function() {
        // TODO: Report bug in chrome
        // selectors sometimes not applied (neither query not css work).
        // probably due to passing from background into sidebar.
        $('*').each(function() {
            this.id = this.id;
            this.className = this.className;
        });
        $('[href="#/options"]').attr('target', '_new'); // Open options in new page.
    }));
})(ListIt);
