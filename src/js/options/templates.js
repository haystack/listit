// Compiled templates
// Editing is futile.

L.templates.options.importexport = function(obj){
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
L.templates.options.info = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<h3>Getting started</h3>\n<span>Here are some tips to help you get going with list.it:</span>\n<ul class="list">\n    ';
 _.each(tips, function(item) { 
__p+='\n    <li>'+
((__t=(item))==null?'':__t)+
'</li>\n    ';
 }); 
__p+='\n</ul>\n<div>\n    If you have any questions, feel free to email\n    <a href="mailto:'+
((__t=(email))==null?'':__t)+
'">'+
((__t=(email))==null?'':__t)+
'</a>.\n</div>\n<br />\n<div> Looking forward to hearing from you,\n    <ul>\n        ';
 _.each(credits, function(credit) { 
__p+='\n        <li>'+
((__t=(credit))==null?'':__t)+
'</li>\n        ';
 }); 
__p+='\n        <li class="italic">List-it team at MIT CSAIL</li>\n    </ul>\n</div>\n    \n';
}
return __p;
};
L.templates.options.page = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div id="options-header">\n    <h2 class="options-title">List.it</h2>\n    <a id="showListLink" href="#">Take me back to my notes</a>\n</div>\n<div id="options-body"></div>\n\n';
}
return __p;
};
L.templates.options.select = function(obj){
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
L.templates.options.settings = function(obj){
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
