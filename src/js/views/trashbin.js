(function(L) {
  'use strict';

  L.views.TrashbinNoteView = Backbone.View.extend({
    initialize: function(options) {
      this.listenTo(this.model, 'change:contents', _.mask(this.updateContents, 2));
    },

    render: function() {
      if(!this.model.get('deleted') == true){
        this.$el.html(L.templates["trashbin-note"]({contents: this.model.get('contents')}));
      }
    },

    events: {
      'click .restore-trash-note': 'restore',
      'click .destroy-trash-note': 'destroy'
    },

    restore: function(event){
      L.notebook.untrashNote(this.model, {user: true});
      this.$el.stop().fadeOut({queue: false}, 200).slideUp(300, function() {
        el.remove();
      });
    },

    destroy: function(event){
      this.model.attributes.contents = "";
      this.model.attributes.deleted = true;
      this.$el.stop().fadeOut({queue: false}, 200).slideUp(300, function() {
        el.remove();
      });
    }


  });

  L.views.TrashbinPage = Backbone.View.extend({
    id: 'page-trashbin',
    className: 'page',
    // initialize: function(options) {
    //   this.listenTo(this.collection, 'add', _.mask(this.addNote, 0));
    // },

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