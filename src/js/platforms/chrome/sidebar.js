/*global chrome:true, background:true */

(function(L) {
    'use strict';

    var bgL = background.ListIt;

    // Setup modules
    L.vent = bgL.vent;

    // First copy models
    _.each(bgL.make, function(v, k) {
        if(_.isObject(bgL.make[k])) {
            var here = L.make[k],
                there = bgL.make[k];

            if (!here) {
                L.make[k] = there;
            } else if (there) {
                _.defaults(here, there);
            }
        } else {
            L.make[k] = L.make[k] || bgL.make[k];
        }
    });
    // Then everything else
    _.defaults(L, bgL);

    // TODO: Report bug in chrome
    // selectors sometimes not applied (neither query not css work).
    // probably due to passing from background into sidebar.
    $(document).ready(function() {
        // Delay till after all ready events.
        _.delay(function() {
            $('*').each(function() {
                this.id = this.id;
                this.className = this.className;
            });
        });
    });
})(ListIt);
