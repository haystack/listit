(function(L) {
  'use strict';
  L.observers.NotebookObserver = {
    condition: function() {
      return L.notebook;
    },
    setup: function() {
      var notes = L.notebook.get('notes');
      notes.on('user:save', function(model) {
        L.logger.add({
          action: LogType.NOTE_SAVE,
          noteid: model.id,
          pinned: model.get('meta').pinned
        });
      });
      notes.on('user:open-bookmark', function(model, view, url) {
        L.logger.add({
          action: LogType.BOOKMARK_OPEN,
          noteid: model.id,
          "bookmark-url": url
        });
      });
      notes.on('user:edit', function(model) {
        L.logger.add({
          action: LogType.NOTE_EDIT,
          noteid: model.id,
          pinned: model.get('meta').pinned
        });
      });
    },
    destroy: function() {
      L.notebook.get('notes').off(null, null, this);
    }
  };
})(ListIt);
