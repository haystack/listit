(function(L) {
  'use strict';

  L.views.TrashbinNoteView = L.views.AbstractNoteView.extend({
    initialize: function(options) {
      this.listenTo(this.model, 'change:contents', _.mask(this.render));
    },
    events: {
      'click .restore-trash-note': '_onRestoreClicked',
      'click .destroy-trash-note': '_onDestroyClicked'
    },
    render: function() {
      this.$el.html(L.templates["trashbin-note"]({contents: this.model.get('contents')}));
      if (this._rendered) {
        // Always reset animations on render.
        this.$el.stop().css({
          height: "",
          opacity: ""
        });
        // Reconnect events
        this.delegateEvents();
      }
      this._rendered = true;
      return this;
    },
    remove: function(options) {
      this.undelegateEvents();
      var el = this.$el;
      if (options && options.filtered) {
        el.remove();
      } else {
        // Do not use `slideUp`. We don't want to set `display` here.
        el.stop().animate({
          opacity: 0,
          height: 0
        }, {
          queue: false,
          duration: 200,
          complete: function() {
            el.remove();
          }
        });
      }
    },
    _onRestoreClicked: function(event){
      L.notebook.untrashNote(this.model);
    },
    _onDestroyClicked: function(event){
      L.notebook.destroyNote(this.model);
    }
  });

  L.views.TrashbinPage = Backbone.View.extend({
    id: 'page-trashbin',
    className: 'page',
    initialize: function(options) {
      this.collection = new L.views.NoteCollectionView({
        collection: new L.models.FilterableNoteCollection(null, {track: L.notebook.get('deletedNotes')}),
        noteView: L.views.TrashbinNoteView
      });
    },
    render: function() {
      this.$el.append(this.collection.render().$el);
      return this;
    }
  });

})(ListIt);
