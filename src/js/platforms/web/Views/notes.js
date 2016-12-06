(function(L) {
  
  var oldNoteView = L.views.NoteView;
  L.views.NoteView = L.views.NoteView.extend({
    closeEditor: function() {
      oldNoteView.prototype.closeEditor.call(this);
      if (this._editorOpen) {
        L.server.syncNotes();
      }
    }
  });
  
})(ListIt);
