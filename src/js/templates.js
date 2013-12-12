/* Generated Template */

ListIt.templates['blockquote'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='';
 if (typeof source !== "undefined") { 
__p+='<span class="source">'+
((__t=( source ))==null?'':__t)+
'</span>';
 } 
__p+='\n<blockquote>\n  '+
((__t=( content ))==null?'':_.escape(__t))+
'\n</blockquote>\n';
}
return __p;
};
ListIt.templates['create-actions'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div class="pin-icon iconTab box center_box clickable">\n    <img src="img/actions/add_pinned.png" title="Keep this note at the top of my list." height="22" width="22">\n</div>\n<div class="save-icon clickable iconTab box center_box">\n    <img src="img/actions/add.png" title="Save this note!" height="22" width="22">\n</div>\n\n';
}
return __p;
};
ListIt.templates['editor'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<textarea class="editor-entry input-div editable" placeholder="Search or Create Note">'+
((__t=(text))==null?'':__t)+
'</textarea>\n<div class="editor-bottombar hbox">\n    <div class="editor-icons hbox"></div>\n</div>\n\n';
}
return __p;
};
ListIt.templates['exported-notes'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<html>\n  <head>\n    <meta charset="UTF-8">\n    <style>\n      /* http://meyerweb.com/eric/tools/css/reset/ \n      v2.0 | 20110126\n      License: none (public domain)\n       */\n\n      html, body, div, span, applet, object, iframe,\n      h1, h2, h3, h4, h5, h6, p, blockquote, pre,\n      a, abbr, acronym, address, big, cite, code,\n      del, dfn, em, img, ins, kbd, q, s, samp,\n      small, strike, strong, sub, sup, tt, var,\n      b, u, i, center,\n      dl, dt, dd, ol, ul, li,\n      fieldset, form, label, legend,\n      table, caption, tbody, tfoot, thead, tr, th, td,\n      article, aside, canvas, details, embed, \n      figure, figcaption, footer, header, hgroup, \n      menu, nav, output, ruby, section, summary,\n      time, mark, audio, video {\n        margin: 0;\n        padding: 0;\n        border: 0;\n        font-size: 100%;\n        font: inherit;\n        vertical-align: baseline;\n      }\n      /* HTML5 display-role reset for older browsers */\n      article, aside, details, figcaption, figure, \n      footer, header, hgroup, menu, nav, section {\n        display: block;\n      }\n      body {\n        line-height: 1;\n      }\n      ol, ul {\n        list-style: none;\n      }\n      blockquote, q {\n        quotes: none;\n      }\n      blockquote:before, blockquote:after,\n      q:before, q:after {\n        content: \'\';\n        content: none;\n      }\n      table {\n        border-collapse: collapse;\n        border-spacing: 0;\n      }\n      body {\n        background-color: #F5F5F5;\n      }\n\n      #content {\n        width: 80%;\n        margin: 20px auto 0px;\n        padding: 10px 20px;\n        background-color: rgb(255, 255, 245);\n        border: 1px solid rgb(156, 156, 156);\n        border-radius: 5px;\n        font-family: \'Helvetica Neue Ultralight\', \'Helvetica Neue\', Helvetica, sans-serif;\n        font-size: 14px;\n      }\n\n      li {\n        background-color: white;\n        border: 1px solid #B9B9B9;\n        border-radius: 5px;\n        padding: 3px;\n        margin-bottom: .5em;\n      }\n\n      b {\n        font-weight: bold;\n      }\n\n      u {\n        text-decoration: underline;\n      }\n\n      i {\n        font-style: italic;\n      }\n\n      .wysiwyg-color-gray {\n        color: gray;\n      }\n      \n      .wysiwyg-color-red {\n        color: red;\n      }\n      \n      .wysiwyg-color-white {\n        color: white;\n      }\n      \n      .wysiwyg-color-green {\n        color: green;\n      }\n      \n      .wysiwyg-color-yellow {\n        color: yellow;\n      }\n      \n      .wysiwyg-color-maroon {\n        color: maroon;\n      }\n      \n      .wysiwyg-color-navy {\n        color: navy;\n      }\n      \n      .wysiwyg-color-blue {\n        color: blue;\n      }\n      \n      .wysiwyg-color-purple {\n        color: purple;\n      }\n      \n      .listit_tag {\n        color: #1B649F;\n      }\n\n      blockquote {\n        border-left: 3px solid lightgray;\n        margin: 5px;\n        padding: 5px;\n        color: #222;\n        background: #fefefe;\n        outline: 1px solid #f0f0f0;\n        white-space: normal;\n      }\n    </style>\n  </head>\n  <body>\n    <div id="content">\n      <ul>\n        ';
 _.each(noteContents, function(noteContent) { 
__p+='\n        <li>'+
((__t=( noteContent ))==null?'':__t)+
'</li>\n        ';
 }) 
__p+='\n      </ul>\n    </div>\n  </body>\n</html>\n';
}
return __p;
};
ListIt.templates['forms/select'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<select id="'+
((__t=(id))==null?'':__t)+
'">\n    ';
 _.each(options, function(name, key) { 
__p+='\n    <option value="'+
((__t=(key))==null?'':__t)+
'">'+
((__t=(name))==null?'':__t)+
'</option>\n    ';
 }); 
__p+='\n</select>\n';
}
return __p;
};
ListIt.templates['link'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<a rel="nofollow" target="_blank" href="'+
((__t=( url ))==null?'':_.escape(__t))+
'">';
 if (typeof icon === "string" ) { 
__p+='<img class="favicon" width="16" height="16" src="'+
((__t=( icon ))==null?'':_.escape(__t))+
'"/>';
 } 
__p+='';
 if (typeof title === "string") { 
__p+=''+
((__t=( title ))==null?'':_.escape(__t))+
'';
 } else { 
__p+=''+
((__t=( url ))==null?'':_.escape(__t))+
'';
 } 
__p+='</a>\n';
}
return __p;
};
ListIt.templates['note'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div class="pin-icon icon clickable"></div>\n<div class="editable contents flex">'+
((__t=(contents))==null?'':__t)+
'</div>\n<div class="editor-container flex">\n</div>\n<div class="close-btn clickable"></div>\n';
}
return __p;
};
ListIt.templates['omnibox/controls'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<a class="clickable">\n    <img id="searchIcon" width="14" height="14" class="settingIcon searchIcon\n    ';
 if (searchState) { 
__p+='\n      activeSearch"\n    ';
 } else { 
__p+='\n      inactiveSearch"\n    ';
 } 
__p+='\n    ';
 if (searchFail) { 
__p+='\n      title="Search stopped because your terms found no notes."\n      src="img/controls/search-fail.png"\n    ';
 } else { 
__p+='\n      src="img/controls/search.png"\n      ';
 if (searchState) { 
__p+='\n        title="Close separate searchbar, note creator will now search again."\n      ';
 } else { 
__p+='\n        title="Open a separate searchbar."\n      ';
 } 
__p+='\n    ';
 } 
__p+='\n    >\n</a>\n';
 if (loginState) { 
__p+='\n  <a class="clickable">\n    <img id="syncIcon" class="';
 if (syncState) print("spinner"); 
__p+=' settingIcon"\n    src="img/controls/sync.png" width="16" height="16"\n    title="Save a backup copy of your notes on our server.">\n  </a>\n';
 } else { 
__p+='\n  <img id="syncIcon" class="settingIcon"\n  src="img/controls/sync-disabled.png" width="16" height="16"\n  title="Syncing is disabled. Please login to enable syncing.">\n';
 } 
__p+='\n<a href="#/options" class="clickable">\n    <img id="optionsIcon" class="settingIcon" src="img/controls/options.png" width="16" height="16" title="View Options and Login to save a backup of your notes." >\n</a>\n<a href="#/help" class="clickable">\n    <img id="helpIcon" class="settingIcon" src="img/controls/help.png" width="13" height="16" title="View the help page.">\n</a>\n\n';
}
return __p;
};
ListIt.templates['omnibox/searchbar'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<textarea class="searchbar" placeholder="Search">'+
((__t=( text ))==null?'':_.escape(__t))+
'</textarea>\n\n';
}
return __p;
};
ListIt.templates['options/color-scheme'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<h3>Change Your Color Scheme</h3>\n<ul class="color-scheme hlist">\n  <li class="color-item" id="color-scheme-red"></li>\n  <li class="color-item" id="color-scheme-green"></li>\n  <li class="color-item" id="color-scheme-blue"></li>\n</ul>';
}
return __p;
};
ListIt.templates['options/importexport'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<h3>Import/Export</h3>\n<form class="tableform">\n<fieldset>\n<legend>Import: </legend>\n  <div class="field">\n    <label for="importSelect">Format: </label>\n    '+
((__t=( importSelect ))==null?'':__t)+
'\n  </div>\n  <div class="field">\n    <label for="importFile">File: </label>\n    <input class="input" id="importFile" type="file" value="Import"/>\n  </div>\n  <div class="status"></div>\n  <input class="input" type="submit" value="Import" id="importButton"/>\n</fieldset>\n<fieldset>\n<legend>Export: </legend>\n  <div class="field">\n    <label for="exportSelect">Format: </label>\n    '+
((__t=( exportSelect ))==null?'':__t)+
'\n  </div>\n  <div class="status"></div>\n  <input class="input" type="submit" value="Export" id="exportButton"/>\n</fieldset>\n</form>\n    \n';
}
return __p;
};
ListIt.templates['options/info'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<h3>About</h3>\n<p>\n<a href="http://listit.csail.mit.edu/">List.it</a> is a\n<a href="http://code.google.com/p/list-it">free and open-source</a>\nnote-taking tool from <a href="http://www.csail.mit.edu/">MIT CSAIL</a>\nthat lets you safely, quickly, and easily write stuff down.\n</p>\n<p>\n    If you have any questions, feel free to email\n    <a href="mailto:'+
((__t=(email))==null?'':__t)+
'">'+
((__t=(email))==null?'':__t)+
'</a>.\n</p>\n<br />\n<p> Looking forward to hearing from you,\n    <ul>\n        ';
 _.each(credits, function(credit) { 
__p+='\n        <li>'+
((__t=(credit))==null?'':__t)+
'</li>\n        ';
 }); 
__p+='\n        <li class="italic">List-it team at MIT CSAIL</li>\n    </ul>\n</p>\n    \n';
}
return __p;
};
ListIt.templates['options/preferences'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<h3>Settings</h3>\n';
 _.each(preferences, function(opt) { 
__p+='\n<div>\n    ';
 switch(opt.type) { case "boolean": 
__p+='\n    <input '+
((__t=(opt.attrs ))==null?'':__t)+
' id="'+
((__t=(opt.name))==null?'':__t)+
'Field" class="input" type="checkbox" name="'+
((__t=(opt.name))==null?'':__t)+
'" ';
 if (opt.value) { 
__p+=' checked="checked" ';
}
__p+=' />\n    <label for="'+
((__t=(opt.name))==null?'':__t)+
'Field">'+
((__t=(opt.description))==null?'':__t)+
'</label>\n    ';
 break; case "hotkey": 
__p+='\n    <label for="'+
((__t=(opt.name))==null?'':__t)+
'Field">'+
((__t=(opt.description))==null?'':__t)+
'</label>: \n    <input '+
((__t=(opt.attrs ))==null?'':__t)+
' name="'+
((__t=(opt.name))==null?'':__t)+
'" class="hotkey-field input center" type="input" placeholder="No Hotkey" id="'+
((__t=(opt.name))==null?'':__t)+
'Field" value="'+
((__t=(opt.value))==null?'':__t)+
'" />\n    ';
 break; case "text": 
__p+='\n    <label for="'+
((__t=(opt.name))==null?'':__t)+
'Field">'+
((__t=(opt.description))==null?'':__t)+
'</label>: \n    <input '+
((__t=(opt.attrs ))==null?'':__t)+
' name="'+
((__t=(opt.name))==null?'':__t)+
'" class="input" type="input" id="'+
((__t=(opt.name))==null?'':__t)+
'Field" value="'+
((__t=(opt.value))==null?'':__t)+
'" />\n    ';
 break; case "number": 
__p+='\n    <label for="'+
((__t=(opt.name))==null?'':__t)+
'Field">'+
((__t=(opt.description))==null?'':__t)+
'</label>: \n    <input '+
((__t=(opt.attrs ))==null?'':__t)+
' name="'+
((__t=(opt.name))==null?'':__t)+
'" class="input" type="number" id="'+
((__t=(opt.name))==null?'':__t)+
'Field" value="'+
((__t=(opt.value))==null?'':__t)+
'" />\n    ';
 break; } 
__p+='\n</div>\n';
 }); 
__p+='\n\n';
}
return __p;
};
ListIt.templates['options/server'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='\n<h3>Account Backup Service</h3>\n<ul class="list">\n    <li>Access your notes online at <a href="https://welist.it/zen/index.html">List-it Zen</a>.</li>\n\n    <li>Free backup: your notes are safe.</li>\n</ul>\n\n<form id="logoutForm" name="logoutForm" style="display:none;">\n  <p class="bold">You are logged in as: <span id="emailDisplay">'+
((__t=( email ))==null?'':_.escape(__t))+
'</span></p>\n  <input id="logoutButton" type="submit" class="button" value="Logout">\n</form>\n\n\n<form id="loginForm" name= "loginRegisterForm" style="display:none;">\n    <div class="modal mode-login mode-register">\n        <label for="email" class="inputLabel">Email:</label>\n        <input class="input" id="email" type="email" name="email" spellcheck="false" required="" autofocus="">\n\n        <label for="pw1" class="inputLabel">Password:</label>\n        <input class="input" id="pw1" type="password" name="pw1" spellcheck="false" required="">\n\n        <div class="modal mode-register">\n            <label for="pw2" class="inputLabel">Re-type Password:</label>\n            <input class="input" id="pw2" type="password" name="pw2" spellcheck="false" required="">\n        </div>\n    </div>\n\n    <div id="formStatus" class="modal formStatus" style="display:none;"></div>\n    <div class="modal mode-register">\n        <p>\n        <b>Contribute to science!</b>\n        </p>\n        <p>\n        We are conducting research on note taking.  If you give us (researchers\n        at MIT) permission to study your notes, you will be helping us to\n        better understand how people record information and enable us to build\n        better tools.\n        </p>\n        <p>\n        If you participate, your notes will be kept confidential to\n        <i>the list.it group</i> and will not be divulged to anyone outside\n        without your explicit (further) permission.\n        </p>\n\n        <input id="participate" class="studyOption" type="checkbox" checked="checked">\n        <label for="participate">Participate in research study?</label>\n    </div>\n    <div id="loginFormButtons">\n        <div class="modal mode-register noslide formButtons">\n            <div class="container">\n                <input id="createAccountButton" type="submit" class="button" value="Create Account!">\n                <input id="cancelButton" type="button" class="button" value="Cancel">\n            </div>\n        </div>\n        <div class="modal mode-login noslide formButtons">\n            <div class="container">\n                <input id="loginButton" type="submit" class="button" value="Login">\n                <input id="registerButton" type="button" class="button" value="New Account">\n            </div>\n        </div>\n        <div class="clear"></div>\n    </div>\n</form>\n';
}
return __p;
};
ListIt.templates['pages/help'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div id="help-header">\n    <h2 class="help-title">List.it</h2>\n    <a id="showListLink" href="#">Take me back to my notes</a>\n</div>\n<div id="title-circle"></div>\n<div id="help-body">\n    <div id="help-main">\n        <h3>Help</h3>\n        <p>\n            <a href="http://listit.csail.mit.edu/">List.it</a> is a\n            <a href="http://code.google.com/p/list-it">free and open-source</a>\n            note-taking tool from <a href="http://www.csail.mit.edu/">MIT CSAIL</a>\n            that lets you safely, quickly, and easily write stuff down.\n        </p>\n        <h4>Writing A Note</h4>\n        <p>\n            You use the same text editor to create new notes and edit old ones. These buttons are used in both:\n        </p>\n        <table>\n            <tr><th>Button</th><th>Description</th></tr>\n            <tr><td class="imgtd"><img height="16" width="16" title="HTML" src="img/toolbar/text-html.png"></td><td><b>Enter raw HTML mode.</b> \n            This will allow you to edit the HTML of your note.</td></tr>\n            <tr><td class="imgtd"><img height="16" width="16" title="Bold" src="img/toolbar/format-text-bold.png"></td><td><b>Make selected text \n            bold.</b></td></tr>\n            <tr><td class="imgtd"><img height="16" width="16" title="Italic" src="img/toolbar/format-text-italic.png"></td><td><b>Make selected \n            text italicized.</b></td></tr>\n            <tr><td class="imgtd"><img height="16" width="16" title="Underline" src="img/toolbar/format-text-underline.png"></td><td><b>\n            Make selected text underlined.</b></td></tr>\n            <tr><td class="imgtd"><img height="16" width="16" title="Color" src="img/toolbar/format-text-color.png"></td><td><b>Change the color \n            of the selected text.</b></td></tr>\n            <tr><td class="imgtd"><img height="16" width="16" title="Hyperlink" src="img/toolbar/link.png"></td><td><b>Add a hyperlink.</b></td></tr>\n        </table>\n        <p>\n            There are also several hotkeys you can use while writing a note:\n        </p>\n        <table>\n            <tr><th>Hotkey</th><th>Description</th></tr>\n            <tr><td><b>Control+S</b></td><td><b>Save the note.</b></td></tr>\n            <tr><td><b>Shift+Enter</b></td><td><b>Save the note.</b></td></tr>\n            <tr><td><b>Control+B</b></td><td><b>Make selected text bold.</b></td></tr>\n            <tr><td><b>Control+I</b></td><td><b>Make selected text italicized.</b></td></tr>\n            <tr><td><b>Control+U</b></td><td><b>Make selected text underlined.</b></td></tr>\n            <tr><td><b>Control+Z</b></td><td><b>Undo.</b> Removes your last change.</td></tr>\n            <tr><td><b>Control+Y</b></td><td><b>Redo.</b> Adds back in a removed change.</td></tr>\n        </table>\n        <h4>Creating A New Note</h4>\n        <p>\n            Just type into the top box to start creating a new note. When you are done, save the note\n            to add it to your notelist.\n        </p>\n        <p>\n            List.it has several features to help you find old notes later. You can include tags to help you \n            search for the note. Just type a hashtag "#" in front of a word and it becomes a tag. You can also \n            pin a note, which keeps it at the top of your note list. You can use the button to save it with a \n            pin, or you can type an exclamation point "!" at the beginning of your note and it will be \n            automatically pinned.\n        </p>\n        <p>\n            Here are the buttons specific to the note creator:\n        </p>\n        <table>\n            <tr><th>Button</th><th>Description</th></tr>\n            <tr><td class="imgtd"><img height="22" width="22" title="Pin Save" src="img/actions/add_pinned.png"></td><td><b>Save note with\n            a pin.</b> This will keep your note pinned to the top of your notelist.</td></tr>\n            <tr><td class="imgtd"><img height="22" width="22" title="Save" src="img/actions/add.png"></td><td><b>Save the note.</b></td></tr>\n        </table>\n        <p>\n            Here are the hotkeys used in the note creator:\n        </p>\n        <table>\n            <tr><th>Hotkey</th><th>Description</th></tr>\n            <tr><td><b>Escape</b></td><td><b>Clear the contents of the note creator.</b></td></tr>\n            <tr><td><b>Control+Enter</b></td><td><b>Save the note with the contents of the searchbar.</b> \n            If you have the separate searchbar open, this will add your search terms to the beginning \n            of your note and save it.</td></tr>\n        </table>\n        <h4>Searching Your Notes</h4>\n        <p>\n            As you create a note, your notelist is automatically searched. You can search by tags and words  \n            and for a phrase by wrapping it in quotation marks. If you want to exclude a certain word or tag, \n            you can type a minus sign "-" in front of it to filter it out.\n        </p>\n        <h4>Separate Searchbar</h4>\n        <p>\n            You also have the option of opening a separate searchbar. While it is open, your notelist will \n            be filtered by the contents of the searchbar. Typing in the note creator will no longer filter  \n            your notes. If you start writing a new note and then open the searchbar, the contents of your \n            note will automatically be added to the searchbar. This way you can keep your notes filtered \n            while you write the rest of your new note.\n        </p>\n        <p>\n            You can open and close the searchbar by pressing the button in the controls, or you can use the \n            following hotkeys anywhere in List.it:\n        </p>\n        <table>\n            <tr><th>Hotkey</th><th>Description</th></tr>\n            <tr><td><b>Control+F</b></td><td><b>Open the searchbar.</b></td></tr>\n            <tr><td><b>Control+X</b></td><td><b>Close the separate searchbar.</b> Now the note creator will\n            go back to searching your notelist.</td></tr>\n        </table>\n        <p>\n           Here are the hotkeys used in the searchbar:\n        </p>\n        <table>\n            <tr><th>Hotkey</th><th>Description</th></tr>\n            <tr><td><b>Esc</b></td><td><b>Close the searchbar.</b></td></tr>\n            <tr><td><b>Control+F</b></td><td><b>Select contents of searchbar.</b></td></tr>\n            <tr><td><b>Control+X</b></td><td><b>Close the searchbar.</b></td></tr>\n        </table>\n        <h4>Controls</h4>\n        <p>\n            To the right of the note creator there is a control bar. It contains these buttons:\n        </p>\n        <table>\n            <tr><th>Button</th><th>Description</th></tr>\n            <tr><td class="controltd"><img height="16" width="16" class="inactive" title="search" src="img/controls/search.png"></td>\n                <td><b>Open the separate searchbar.</b></td>\n            </tr>\n            <tr><td class="controltd"><img height="16" width="16" title="search" src="img/controls/search.png"></td><td><b>Close \n            searchbar.</b></td></tr>\n            <tr><td class="controltd"><img height="16" width="16" title="Not Searching" src="img/controls/search-fail.png"></td>\n            <td><b>Searching has stopped.</b> This is letting you know that your search terms didn\'t \n            match any notes, so List.it stopped filtering them. You can still click this to open/close \n            the searchbar. You\'ll also notice your note list becomes grayer when a search fails.</td></tr>\n            <tr><td class="controltd"><img height="16" width="16" title="Not syncing" src="img/controls/sync-disabled.png"></td>\n            <td><b>Sync is disabled.</b> This is letting you know that you\'re currently not logged in so\n            your notes aren\'t syncing. If you want to sync your notes, go to the options page to log in.\n            </td></tr>\n            <tr><td class="controltd"><img height="16" width="16" title="Sync" src="img/controls/sync.png"></td><td><b>Sync your \n            notes.</b> If you have a list.it account, this will allow you to sync your notes onto our server. \n            This means you\'ll be able to access them from multiple places and if something happens to your \n            notes, you\'ll be able to recover them. While logged in, your notes will occasionally sync\n            automatically, but you can click this to force them to sync. This button will spin while your\n            notes are being synced.</td></tr>\n            <tr><td class="controltd"><img height="16" width="16" title="Options" src="img/controls/options.png"></td><td><b>Go to \n            the options page.</b> Here you\'ll be able to sign up for an account or log in. You can also set  \n            some of your preferences. If you want to import or export your notes, you can also do that on the \n            options page.</td></tr>\n        </table>\n        <h4>Your Notes</h4>\n        <p>\n            Below the note creator you can see a list of all of the notes you have created. They are \n            organized by when they were created, with your newest notes appearing higher in the list. \n            Pinned notes stay at the very top. You can change whether or not a note is pinned by \n            clicking on the star. You can reorganize your notes by clicking and dragging them to a new \n            location, but you can\'t drag pinned notes.\n        </p>\n        <p>\n            You\'ll notice that tags in your notes look like links. If you click them, they\'ll be added\n            to the searchbar. If they were already in the searchbar, then they will be removed. This  \n            will make it easier to filter your notes.\n        </p>\n        <p>\n            Here are the buttons you will use while viewing your notelist:\n        </p>\n        <table>\n          <tr><th>Button</th><th>Description</th></tr>\n          <tr><td class="imgtd"><img height="10" width="10" title="delete" src="img/close.png"></td><td><b>Delete this note.</b></td></tr>\n          <tr><td class="imgtd"><img height="16" width="16" title="pinned" src="img/note/star-active.png"></td><td><b>Unpin this note.</b></td></tr>\n          <tr><td class="imgtd"><img height="16" width="16" title="unpinned" src="img/note/star-inactive.png"></td><td><b>Pin this note.</b></td></tr>\n        </table>\n        <h4>Editing A Note</h4>\n        <p>\n            You can click on the contents of a note to edit it. If you click outside of the note, it \n            will automatically save. This hotkey is unique to the editor:\n        </p>\n        <table>\n            <tr><th>Hotkey</th><th>Description</th></tr>\n            <tr><td><b>Escape</b></td><td><b>Close the editor.</b> This saves the note.</td></tr>\n        </table>\n        <h4>The Studies</h4>\n        <p>\n            The team here at MIT CSAIL created List.it as a simple note-taking tool, but we\'re also \n            interested in studying the way people take notes. These studies help us to make a better \n            program for you! When you sign up for a List.it account you can choose to opt in to our study. \n            Our researchers will be able to study your notes. No one outside of our research group will be \n            able to access any of your information unless you give us explicit permission.\n        </p>\n        <p>\n            Get more information about the studies <a href="https://welist.it/study/study.html">here</a>.\n        </p>\n        <h4>Settings</h4>\n        <p>\n            On the options page you can customize List.it by setting your preferences. There is an option\n            to \'Collapse Notes.\' By default, the List.it sidebar shows the full text of each of your\n            notes. If you check this option then you will only see the first line of each note. This will\n            allow you to see more of your notes at once. You will still be able to click on a note to\n            expand and edit it.\n        </p>\n        <p>\n            There is another option to \'Hide text format buttons.\' If you check this, the editor buttons that\n            exist while creating and editing a note will no longer appear. This will make List.it look much\n            simpler. The hotkeys for formatting text will still work without the buttons. You may need to\n            reopen the List.it sidebar before this change will take effect.\n        </p>\n    </div>\n</div>\n';
}
return __p;
};
ListIt.templates['pages/main'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div id="controls-container" class="header hbox">\n    <div id="omnibox" class="note-creator vbox flex"></div>\n    <div id="controls"></div>\n</div>\n<div id="notes" class="contents flex"></div>\n';
}
return __p;
};
ListIt.templates['pages/options'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div id="options-header">\n    <h2 class="options-title">List.it</h2>\n    <a id="showListLink" href="#">Take me back to my notes</a>\n</div>\n<div id="title-circle"></div>\n<div id="options-body"></div>\n\n';
}
return __p;
};
ListIt.templates['toolbar'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<ul class="wysihtml5-toolbar-buttons hlist">\n';
 _.each(items, function(item) { 
__p+='\n    ';
 switch(item) { case "italic": 
__p+='<li title="Italic (ctrl-i)" data-wysihtml5-command="italic"></li>\n    ';
 break; case "underline": 
__p+='<li title="Underline (ctrl-u)" data-wysihtml5-command="underline"></li>\n    ';
 break; case "bold": 
__p+='<li title="Bold (ctrl-b)" data-wysihtml5-command="bold"></li>\n    ';
 break; case "mode": 
__p+='<li title="Toggle raw HTML mode" data-wysihtml5-action="change_view"></li>\n    ';
 break; case "link": 
__p+='<li title="Insert a link." data-wysihtml5-command="createLink"></li>\n    ';
 break; case "spacer": 
__p+='<li class="spacer"></li>\n    ';
 break; case "foreground": 
__p+='\n    <li data-wysihtml5-command-group="foreColor" class="fore-color" title="Color the selected text">\n    <ul>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="gray"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="maroon"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="red"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="purple"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="green"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="yellow"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="navy"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="blue"></li>\n    </ul>\n    </li>\n';
 }}); 
__p+='\n</ul>\n<div class="wysihtml5-dialogs">\n  <form data-wysihtml5-dialog="createLink" style="display: none;">\n    <label>Text: </label>\n    <input data-wysihtml5-dialog-field="text" class="input" type="text" placeholder="(optional)" />\n    <label>Link: </label>\n      <input required="required" data-wysihtml5-dialog-field="href" value="http://" class="input" type="url" />\n    <div class="linkButtons">\n      <input class="button" type="submit" data-wysihtml5-dialog-action="cancel" value="Cancel">\n      <input class="button" type="submit" data-wysihtml5-dialog-action="save" value="Save" />\n    </div>\n  </form>\n</div>\n';
}
return __p;
};
