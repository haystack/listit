(function(L) {
  L.observers.NotebookObserver = {
    condition: function() {
      return L.notebook;
    },
    addEntry: function(type, data) {
      L.logger.add(L.models.LogEvent.create(type, data));
    },
    setup: function() {
      var that = this;
      var notes = L.notebook.get('notes');
      notes.on('user:save', function(model) {
        that.addEntry(LogType.NOTE_SAVE, {
          noteid: model.id,
          pinned: model.get('meta').pinned
        });
      });
      notes.on('user:open-bookmark', function(model, view, url) {
        that.addEntry(LogType.BOOKMARK_OPEN, {
          noteid: model.id,
          bookmark-url: url
        });
      });
      notes.on('user:edit', function(model) {
        console.log('edit');
        that.addEntry(LogType.NOTE_EDIT, {
          noteid: model.id,
          pinned: model.get('meta').pinned
        });
      });
    },
    destroy: function() {
      L.notebook.get('notes').off(null, null, this);
    },
  }
})(ListIt);
