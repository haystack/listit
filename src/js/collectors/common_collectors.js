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
      note.meta.pinned = _.str.startsWith(text, '!');
    });

    L.gvent.on('note:request:parse', function(note) {
      return;
      var n = $('<span>').html(note.contents);
      n.cut('span.listit_tag');
      var tags = [];
      note.contents = n.html().replace(
        /* This regex matches either of the following:
         * 1. The beginning of the line and then a tag.
         * 2. a space, nonbreaking space, a tag, or any of `([<,{"'`
         *    any number of tags without "content";
         *    and then a tag.
         *    and then nothing or not a tag.
         *
         * Where a tag is #[letters and numbers].
         *   The first character must be a letter
         *   there must be three letters
         */
        /(^|(?:(?:&nbsp;|<[^>]*>|[\s\(\[<,{"'])))#([a-zA-Z][a-zA-Z0-9]{2,})\b/g,
        function(match, prefix, tag) {

          tags.push(tag);
          return prefix+'<span class="listit_tag">#' + tag + '</span>';
        }
      );
      note.meta.tags = tags;
    });

  });
})(ListIt);
