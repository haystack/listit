"use strict";
L.templates.notes.note = _.template([
    '<div class="icon draggable left"></div>',
    '<div class="close clickable right"></div>',
    '<div class="editable contents"><%=contents%></div>'
    ].join("\n"));

