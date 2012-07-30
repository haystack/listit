"use strict";
L.templates.omnibox = {
    // Note Creation Box
    input : _.template([
        '<div id="omnibox-desc" class="flex">Search or Create Note</div>',
        '<div id="omnibox-entry" class="input-div flex editable" contenteditable=""><%=text%></div>',
        '<div class="iconRow hbox">',
        '    <div class="iconTab box center_box clickable">',
        '        <img id="pinIconPlus" src="img/pin_plus.png" title="Keep this note at the top of my list.">',
        '    </div>',
        '    <div id="save-icon" class="clickable iconTab box center_box">',
        '        <img src="img/plus.png" title="Save this note!">',
        '    </div>',
        '</div>'
        ].join('\n')),
    optioncol : _.template([
        '<a class="clickable"><img',
            'id="syncIcon"',
            'class="<% if (syncState) print("spinner"); %> settingIcon"',
            'src="img/arrowstill.png"',
            'width="16" height="16"',
            'title="Save a backup copy of your notes on our server."',
        '></a>',
        '<a href="#/options" class="clickable"><img',
            'id="optionsIcon"',
            'class="settingIcon"',
            'src="img/settings_white.png"',
            'width="16" height="16"',
            'title="View Options and Login to save a backup of your notes."',
        '></a>',
        '<a class="clickable"><img',
            'id="shrinkIcon"',
            'class="settingIcon"',
            'src="<%=sizeIcon %>"',
            'width="16" height="16"',
            'title="<%=sizeTitle %>"',
        '></a>'
        ].join(' '))
};
