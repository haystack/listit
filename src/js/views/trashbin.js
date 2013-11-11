(function(L) {
  'use strict';

  L.views.TrashbinNoteView = Backbone.View.extend({
    initialize: function(options) {
      this.listenTo(this.model, 'change:contents', _.mask(this.updateContents, 2));
    },

    render: function() {
      this.$el.html('<div class="trashbin-note" >'
        + '<button class="restore-trash-note">Restore</button>' 
        + '<div class="contents">' 
        + this.model.attributes.contents
        + '</div>'
        
        + '</div>');
      return this;
    },

    events: {
      'click .restore-trash-note': 'restore'
    },

    restore: function(event){
      L.notebook.untrashNote(this.model, {user: true});
      this.$el.stop().fadeOut({queue: false}, 200).slideUp(300, function() {
        el.remove();
      });
    }
  });

  L.views.TrashbinPage = Backbone.View.extend({
    id: 'page-trashbin',
    className: 'page',
    initialize: function(options) {
    },
    render: function() {
      this.$el.html(L.templates["pages/trashbin"]());
      this.addAll();
      return this;
    },

    addAll: function() {
      var deleted_notes = L.notebook.get('deletedNotes');
      var that = this;
      deleted_notes.each(function(note) {
        var noteview = new L.views.TrashbinNoteView({model: note})
        noteview.render();
        that.$el.children('#trashbin-body').append(noteview.$el);
      });

    }

  });

})(ListIt);