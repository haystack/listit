(function(L) {
  'use strict';

  L.views.AddnotePage = Backbone.View.extend({
    className: 'note-creator',
    id: 'addnote',
    events: {
      'click                  .save-icon' : '_onSaveTriggered',
      'click                  .close-icon': '_onCloseTriggered',
      'click                  .pin-icon'  : '_onPinTriggered',
      'keydown[shift+return]  .editor'    : '_onSaveTriggered',
      'keydown[ctrl+s]        .editor'    : '_onSaveTriggered',
      'keydown[esc]           .editor'    : '_onCloseTriggered'
    },
    initialize: function() {
      var that = this;
      window.onbeforeunload = function(e) {
        if (that._rendered) {
          var message = "You have an unsaved list.it note open.";
          e.returnValue = message;
          return message;
        } else {
          return undefined;
        }
      };
    },
    saveNote: function() {
      this.model.set({contents: L.util.strip(this.editor.getText())});
      this.model.save();
    },
    remove: function() {
      if (this._rendered) {
        this.editor.remove();
        Backbone.View.prototype.remove.call(this);
        this._rendered = false;
      }
      return this;
    },
    render: function(options) {
      if (!this._rendered) {
        this.editor = new L.views.Editor({
          text: this.model.get('contents'),
          actions: L.templates['create-actions']()
        });
        this.$el.append(
          '<div class="header">' +
            '<h1 class="title">List.it: Add Note</h1>' +
            '<span class="clickable close-icon">' +
              '<img src="img/close.png" />' +
            '</span>' +
          '</div>'
        );
        this.$el.append(this.editor.render().el);
      }
      this._rendered = true;
      return this;
    },
    _onSaveTriggered: function(event) {
      event.preventDefault();
      this.saveNote();
    },
    _onCloseTriggered: function(event) {
      event.preventDefault();
      this.model.destroy();
    },
    _onPinTriggered: function(event) {
      event.preventDefault();
      this.editor.setText('! ' + this.editor.getText());
      this.saveNote();
    }
  });

})(ListIt);
