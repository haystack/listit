// Compiled templates
// Editing is futile.

L.templates.omnibox.input = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div id="omnibox-desc" class="flex">Search or Create Note</div>\n<div id="omnibox-entry" class="input-div flex editable" contenteditable="">'+
((__t=(text))==null?'':__t)+
'</div>\n<div id="omnibox-bottombar">\n    <div id="omnibox-icons" class="hbox">\n        <div class="iconTab box center_box clickable">\n            <img id="pinIconPlus" src="img/pin_plus.png" title="Keep this note at the top of my list.">\n        </div>\n        <div id="save-icon" class="clickable iconTab box center_box">\n            <img src="img/plus.png" title="Save this note!">\n        </div>\n    </div>\n</div>\n\n';
}
return __p;
};
L.templates.omnibox.optioncol = function(obj){
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
L.templates.omnibox.toolbar = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<ul id="'+
((__t=(obj.id))==null?'':__t)+
'" class="wysihtml5-toolbar '+
((__t=(obj.className))==null?'':__t)+
'" style="display: none;">\n';
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
 break; case "spacer": 
__p+='<li class="spacer"></li>\n    ';
 break; case "foreground": 
__p+='\n    <li data-wysihtml5-command-group="foreColor" class="fore-color" title="Color the selected text">\n    <ul>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="gray"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="maroon"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="red"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="purple"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="green"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="yellow"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="navy"></li>\n        <li data-wysihtml5-command="foreColor" data-wysihtml5-command-value="blue"></li>\n    </ul>\n    </li>\n';
 }}); 
__p+='\n</ul>\n';
}
return __p;
};
