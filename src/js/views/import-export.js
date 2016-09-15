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
      'click #exportButton': '_exportClicked',
      'click #importButton': '_importClicked'
    },
    _importClicked: function() {
      var type = this.$el.find('#importSelect').val();
      var file = this.$el.find('#importFile').get()[0].files[0];
      if (!file) {
        window.alert('Select a file first.');
      }
      var fr = new FileReader();
      fr.onload = function() {
        L.notebook.importString(fr.result, type);
      };
      fr.readAsText(file);
      return false;
    },
    _exportClicked: function() {
      var type = this.$('#exportSelect').val();
      //TODO: Set MIME type
      saveAs(new Blob([L.notebook.exportString(type)]), "listit-notes." + type);
    }
  });
})(ListIt);


