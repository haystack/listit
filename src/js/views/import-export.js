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
          options: _.kmap(L.notebook.exporters, function(value) {
            return value.display;
          })
        }),
        importSelect: L.templates["forms/select"]({
          id: 'importSelect',
          options: _.kmap(L.notebook.importers, function(value) {
            return value.display;
          })
        })
      }));
      return this;
    },
    events: {
      'click #exportButton': 'exportClicked',
      'click #importButton': 'importClicked'
    },
    importClicked: function() {
      var type = this.$el.find('#importSelect').val();
      var file = this.$el.find('#importFile').get()[0].files[0];
      if (!file) {
        alert('Select a file first.');
      }
      var fr = new FileReader();
      fr.onload = function() {
        L.notebook.import(type, fr.result);
      };
      fr.readAsText(file);
      return false;
    },
    exportClicked: function() {
      var type = this.$el.find('#exportSelect').val();
      var blob = new BlobBuilder();
      blob.append(L.notebook.export(type));
      saveAs(blob.getBlob('text/plain;charset=utf-8'), "listit-notes." + type);
    }
  });
})(ListIt);


