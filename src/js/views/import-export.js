(function(L) {
  'use strict';

  /*
   * The Import/Export pane.
   *
   */

  L.views.ImportExportView = Backbone.View.extend({
    id: 'importexport-info',
    className: 'options-item', // TODO:Change
    render: function() {
      this.$el.html(L.templates["options/importexport"]({
        exportSelect: L.templates["forms/select"]({
          id: 'exportSelect',
          options: _.chain(this.types)
          .filter(function(t) {
            return t.exporter;
          })
          .map(function(t) {
            return t.display;
          }).value()
        }),
        importSelect: L.templates["forms/select"]({
          id: 'importSelect',
          options: _.chain(this.types)
          .filter(function(t) {
            return t.importer;
          })
          .map(function(t) {
            return t.display;
          }).value()
        })
      }));
      return this;
    },
    events: {
      'click #exportButton': 'exportClicked',
      'click #importButton': 'importClicked'
    },
    // TODO: Should probably define these elsewhere
    types: [
      {
        filename : 'listit-notes.json',
        display : 'JSON',
        exporter: function() {
          return JSON.stringify(L.notebook.toJSON({include: true}));
        },
        importer : function(string) {
          var obj = JSON.parse(string);
          if (obj.notes) {
            L.notebook.get('notes').add(obj.notes);
          }
          if (obj.deleted) {
            L.notebook.get('deletedNotes').add(obj.notes);
          }
          L.notebook.get('notes').each(function(n) {
            n.save();
          });
          L.notebook.get('deletedNotes').each(function(n) {
            n.save();
          });
          L.notebook.save();
        }
      },
      {
        filename : 'listit-notes.txt',
        display : 'Text',
        exporter: function() {
          return L.notebook.get('notes').reduce(function(txt, n) {
            return txt + '* ' + L.util.clean(n.get('contents')).replace(/\n/g, '\n  ') + '\n';
          }, '');
        }
      }
    ],
    importClicked: function() {
      var type = this.types[this.$el.find('#importSelect').val()];
      var file = this.$el.find('#importFile').get()[0].files[0];
      if (!file) {
        alert('Select a file first.');
      }
      var fr = new FileReader();
      fr.onload = function() {
        if (type.importer(fr.result)) {
          //notify good.
        }
      };
      fr.readAsText(file);
      return false;
    },
    exportClicked: function() {
      var type = this.types[this.$el.find('#exportSelect').val()];
      var blob = new BlobBuilder();
      blob.append(type.exporter());
      saveAs(blob.getBlob('text/plain;charset=utf-8'), type.filename);
    }
  });
})(ListIt);
