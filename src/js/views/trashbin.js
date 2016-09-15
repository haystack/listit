(function(L) {
  'use strict';

  L.views.TrashbinNoteView = Backbone.View.extend({
    initialize: function(options) {
      this.listenTo(this.model, 'change:contents', _.mask(this.render));
    },

    render: function() {
      this.$el.html(L.templates["trashbin-note"]({contents: this.model.get('contents')}));
    },

    events: {
      'click .restore-trash-note': 'restore',
      'click .destroy-trash-note': 'destroy'
    },

    restore: function(event){
      L.notebook.untrashNote(this.model, {user: true});
      this.$el.stop().fadeOut({queue: false}, 200).slideUp(300, function() {
        this.remove();
      });
    },

    destroy: function(event){
      this.$el.stop().fadeOut({queue: false}, 200).slideUp(300, function() {
        this.remove();
      });
      L.notebook.destroyNote(this.model);
    }
  });

  L.views.TrashbinPage = Backbone.View.extend({
    id: 'page-trashbin',
    className: 'page',
    initialize: function(options) {
      this.collection = L.notebook.get('deletedNotes');
      this.listenTo(this.collection, 'add', _.mask(this.addNote, 0));
    },

    addNote: function(note) {
      var noteview = new L.views.TrashbinNoteView({model: note});
      noteview.render();
      this.$el.children('#trashbin-body').prepend(noteview.$el);
    },

    render: function() {
      this.$el.html(L.templates["pages/trashbin"]());
      this.addAll();
      return this;
    },

    addAll: function() {
      var that = this;
      this.collection.each(function(note) {
        that.addNote(note);
      });

    }

  });

})(ListIt);
