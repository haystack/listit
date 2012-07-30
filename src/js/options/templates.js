"use strict";

// Options View (Feature Toggles in Settings Page)
L.templates.options = {
    settings : _.template([
        '<h3>Settings</h3>',
        '<% _.each(options, function(opt) { %>',
        '<div>',
        '<% switch(opt.type) { case "boolean": %>',
        '  <input <%=opt.attrs %> id="<%=opt.name%>Field" type="checkbox" name="<%=opt.name%>" <% if (opt.value) { %> checked="checked" <%}%> />',
        '  <label for="<%=opt.name%>Field"><%=opt.description%></label>',
        '<% break; case "hotkey": %>',
        '  <label for="<%=opt.name%>Field"><%=opt.description%></label>: ',
        '  <input <%=opt.attrs %> name="<%=opt.name%>" class="hotkey-field input center" type="input" placeholder="No Hotkey" id="<%=opt.name%>Field" value="<%=opt.value%>" />',
        '<% break; case "text": %>',
        '  <label for="<%=opt.name%>Field"><%=opt.description%></label>: ',
        '  <input <%=opt.attrs %> name="<%=opt.name%>" class="input" type="input" id="<%=opt.name%>Field" value="<%=opt.value%>" />',
        '<% break; case "number": %>',
        '  <label for="<%=opt.name%>Field"><%=opt.description%></label>: ',
        '  <input <%=opt.attrs %> name="<%=opt.name%>" class="input" type="number" id="<%=opt.name%>Field" value="<%=opt.value%>" />',
        '<% break; } %>',
        '</div>',
        '<% }); %>'
        ].join('')),
    page : _.template([
        '<div id="options-header">',
        '<h2 class="options-title">List.it</h2>',
        '<a id="showListLink" href="#">Take me back to my notes</a>',
        '</div>',
        '<div id="options-body"></div>'
    ].join(' ')),
    info : _.template([
        '<h3>Getting started</h3>',
        '<span>Here are some tips to help you get going with list.it:</span>',
        '<ul class="list">',
        '  <li>',
        '    Open and close list.it by clicking on the',
        '    <img alt="list-it" src="img/listit-icon.png"> icon',
        '    in the upper right hand corner of your screen.',
        '  </li>',
        '  <li>',
        '    Make new notes or search old ones by typing',
        '    into the box at the top of list.it\'s sidebar.',
        '  </li>',
        '  <li>',
        '    Delete notes by clicking on <img alt="x button" src="img/x.png">.',
        '  </li>',
        '  <li>',
        '    Edit notes by clicking one and typing, when you select',
        '    something else, the note will automatically save.',
        '  </li>',
        '</ul>',
        '<div>',
        '  If you have any questions, feel free to email',
        '  <a href="mailto:listit@csail.mit.edu">listit@csail.mit.edu</a>.',
        '</div>',
        '<br />',
        '<div> Looking forward to hearing from you, <br /> <br />',
            'Wolfe Styke <br />',
        'electronic max <br />',
        'Prof. David Karger',
        '<br /><br />',
        'List-it team at MIT CSAIL',
        '</div>'
    ].join(' ')),
    importexport : _.template([
        '<h3>Import/Export</h3>',
        '<form class="tableform">',
        '<fieldset>',
        '<legend>Import: </legend>',
        '  <div class="field">',
        '    <label for="importSelect">Format: </label>',
        '    <%= importSelect %>',
        '  </div>',
        '  <div class="field">',
        '    <label for="importFile">File: </label>',
        '    <input id="importFile" type="file" value="Import"/>',
        '  </div>',
        '  <div class="status"></div>',
        '  <input type="submit" value="Import" id="importButton"/>',
        '</fieldset>',
        '<fieldset>',
        '<legend>Export: </legend>',
        '  <div class="field">',
        '    <label for="exportSelect">Format: </label>',
        '    <%= exportSelect %>',
        '  </div>',
        '  <div class="status"></div>',
        '  <input type="submit" value="Export" id="exportButton"/>',
        '</fieldset>',
        '</form>'
    ].join(' ')),
    // TODO: Make a common widget template library.
    select: _.template(
        '<select id="<%=id%>">' +
        '<% _.each(options, function(name, i) { %>' +
        '<option value="<%=i%>"><%=name%></option>' +
        '<% }); %>' +
        '</select>')
};
