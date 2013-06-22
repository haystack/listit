// Fixup cors
ListIt.backgroundReady = false;

ListIt.lvent.on('setup:before', function() {
  jQuery.ajaxSettings.xhr = function() {
    return Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
    .createInstance(Components.interfaces.nsIXMLHttpRequest); 
  }
});
