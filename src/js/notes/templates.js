// Compiled templates
// Editing is futile.

L.templates.notes.note = function(obj){
var __t,__p='',__j=Array.prototype.join,print=function(){__p+=__j.call(arguments,'')};
with(obj||{}){
__p+='<div class="icon draggable left"></div>\n<div class="close clickable right"></div>\n<div class="editable contents">'+
((__t=(contents))==null?'':__t)+
'</div>\n';
}
return __p;
};
