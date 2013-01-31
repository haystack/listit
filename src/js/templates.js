/* Generated Template */

ListIt.templates['forms/select'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<select id="'+
((__t=(id))==null?'':__t)+
'">\n    ';
 _.each(options, function(name, i) { 
__p+='\n    <option value="'+
((__t=(i))==null?'':__t)+
'">'+
((__t=(name))==null?'':__t)+
'</option>\n    ';
 }); 
__p+='\n</select>\n';
}
return __p;
};
ListIt.templates['note'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div class="icon draggable"></div>\n<div class="editable contents contents flex">'+
((__t=(contents))==null?'':__t)+
'</div>\n<div class="editor flex">\n    <textarea></textarea>\n</div>\n<div class="close-btn clickable"></div>\n';
}
return __p;
};
ListIt.templates['omnibox/controls'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<a class="clickable">\n    <img id="syncIcon" class="';
 if (syncState) print("spinner"); 
__p+=' settingIcon" src="img/arrowstill.png" width="16" height="16" title="Save a backup copy of your notes on our server.">\n</a>\n<a href="#/options" class="clickable">\n    <img id="optionsIcon" class="settingIcon" src="img/settings_white.png" width="16" height="16" title="View Options and Login to save a backup of your notes." >\n</a>\n<a class="clickable">\n    <img id="shrinkIcon" class="settingIcon" src="'+
((__t=(sizeIcon ))==null?'':__t)+
'" width="16" height="16" title="'+
((__t=(sizeTitle ))==null?'':__t)+
'" >\n</a>\n\n';
}
return __p;
};
ListIt.templates['omnibox/input'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<textarea id="omnibox-entry" class="omnibox-entry input-div flex editable" placeholder="Search or Create Note">'+
((__t=(text))==null?'':__t)+
'</textarea>\n<div id="omnibox-bottombar" class="hbox">\n    <div id="omnibox-icons" class="hbox">\n        <div class="iconTab box center_box clickable">\n            <img id="pinIconPlus" src="img/pin_plus.png" title="Keep this note at the top of my list.">\n        </div>\n        <div id="save-icon" class="clickable iconTab box center_box">\n            <img src="img/plus.png" title="Save this note!">\n        </div>\n    </div>\n</div>\n\n';
}
return __p;
};
ListIt.templates['options/account'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='\n<h3>Account Backup Service</h3>\n<ul class="list">\n    <li>Access your notes online at <a href="https://welist.it/zen/index.html">List-it Zen</a>.</li>\n\n    <li>Free backup: your notes are safe.</li>\n</ul>\n\n<form id="loginRegisterForm" class="loginForm" name=\n    "loginRegisterForm">\n    <p class="modal mode-connected bold">You are logged in as: <span id="emailDisplay">'+
((__t=( email ))==null?'':_.escape(__t))+
'</span></p>\n    <div class="modal mode-login mode-register">\n        <label for="email" class="inputLabel">Email:</label>\n        <input class="input" id="email" type="email" name="email" spellcheck="false" required="" autofocus="">\n\n        <label for="pw1" class="inputLabel">Password:</label>\n        <input class="input" id="pw1" type="password" name="pw1" spellcheck="false" required="">\n\n        <div class="modal mode-register">\n            <label for="pw2" class="inputLabel">Re-type Password:</label>\n            <input class="input" id="pw2" type="password" name="pw2" spellcheck="false" required="">\n        </div>\n    </div>\n\n    <div id="formStatus" class="modal formStatus" style="display:none;"></div>\n    <div class="modal mode-register">\n        <p>\n        <b>Contribute to science!</b>\n        </p>\n        <p>\n        We are conducting research on note taking.  If you give us (researchers\n        at MIT) permission to study your notes, you will be helping us to\n        better understand how people record information and enable us to build\n        better tools.\n        </p>\n        <p>\n        If you participate, your notes will be kept confidential to\n        <i>the list.it group</i> and will not be divulged to anyone outside\n        without your explicit (further) permission.\n        </p>\n\n        <input id="participate" class="studyOption" type="checkbox" checked="checked">\n        <label for="participate">Participate in research study?</label>\n    </div>\n    <div id="loginFormButtons">\n        <div class="modal mode-register noslide formButtons">\n            <div class="container">\n                <input id="createAccountButton" type="button" class="button" value="Create Account!">\n                <input id="cancelButton" type="button" class="button" value="Cancel">\n            </div>\n        </div>\n        <div class="modal mode-login noslide formButtons">\n            <div class="container">\n                <input id="loginButton" type="button" class="button" value="Login">\n                <input id="registerButton" type="button" class="button" value="New Account">\n            </div>\n        </div>\n        <div class="modal mode-connected noslide formButtons">\n            <div class="container">\n                <input id="logoutButton" type="button" class="button" value="Logout">\n            </div>\n        </div>\n        <div class="clear"></div>\n    </div>\n</form>\n';
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
ListIt.templates['options/settings'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<h3>Settings</h3>\n';
 _.each(options, function(opt) { 
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
ListIt.templates['pages/main'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div id="controls-container" class="header hbox">\n    <div id="omnibox" class="flex"></div>\n    <div id="controls"></div>\n</div>\n<div id="notes" class="contents flex"></div>\n';
}
return __p;
};
ListIt.templates['pages/options'] = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div id="options-header">\n    <h2 class="options-title">List.it</h2>\n    <a id="showListLink" href="#">Take me back to my notes</a>\n</div>\n<div id="options-body"></div>\n\n';
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
__p+='\n</ul>\n<div class="wysihtml5-dialogs">\n    <form data-wysihtml5-dialog="createLink" style="display: none;">\n        <label>Link: </label>\n        <input required="required" data-wysihtml5-dialog-field="href" value="http://" class="input" type="url" />\n        <input class="button" type="submit" data-wysihtml5-dialog-action="save" value="Save" />\n        <div class="close-btn clickable" data-wysihtml5-dialog-action="cancel"></div>\n    </form>\n</div>\n';
}
return __p;
};
