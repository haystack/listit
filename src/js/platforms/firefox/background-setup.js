/*globals Components: false*/
// Fixup cors
ListIt.lvent.on('setup:before', function() {
  'use strict';
  jQuery.ajaxSettings.xhr = function() {
    return Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
    .createInstance(Components.interfaces.nsIXMLHttpRequest);
  };
});
