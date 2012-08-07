/*globals Android: true*/
(function(L) {
    'use strict';
    $(document).ready(function() {
        $('.editable, .clickable').fastclick();
        // Check if android.
        if (typeof Android === 'undefined') {
            return;
        }
        L.server.on('change:syncing', function(m, val) {
            Android.onSyncChanged(val);
        });
        L.options.on('change:shrinkNotes', function(m, val) {
            Android.onShrinkNotesChanged(val);
        });
    });
})(ListIt);
