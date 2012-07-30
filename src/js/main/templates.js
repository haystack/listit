"use strict";
L.templates.main = {
    page : _.template([
        '<div id="controls-container" class="header">',
        '    <div id="controls-left"></div>',
        '    <div id="controls-right"></div>',
        '    <div id="controls-bottom"></div>',
        '</div>',
        '<div id="content-container" class="contents"></div>'
    ].join(" "))
}
