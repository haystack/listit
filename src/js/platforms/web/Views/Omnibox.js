(function(L) {
  
  var oldOmniboxView = L.views.OmniboxView;
  L.views.OmniboxView = L.views.OmniboxView.extend({
    save: function(options) {
      oldOmniboxView.prototype.save.call(this, options);
      L.server.syncNotes();
    }
  });
  
})(ListIt);
