/*jshint unused: false*/
/*
* Common/basic metadata collectors.
*/
(function(L) {
    'use strict';

    $(document).ready(function() {
        // Collect date data
        L.gvent.on('note:request:parse:new', function(note) {
            var date = new Date();
            note.meta['created-day'] = date.getDay();
            note.meta['created-hour'] = date.getHours();
        });

        L.gvent.on('note:request:parse', function(note) {
            var text = _.str.trim(L.util.clean(note.contents));
            note.meta.pinned = text[0] === '!';
        });

        L.gvent.on('note:request:parse', function(note) {
            var n = $('<span>').html(note.contents);
            n.cut('span.listit_tag');
            var tags = [];
            note.contents = n.html().replace(/(?:^|.*[\s\(\[,])#([a-zA-Z][a-zA-Z0-9]{2,})\b/g, function(m, t) {

                tags.push(t);
                return '<span class="listit_tag">#' + t + '</span>';
            });
            note.meta.tags = tags;
        });

    });
})(ListIt);
