(function(L) {
  var port = chrome.runtime.connect({name: "addnote"});
  var view;
  port.onMessage.addListener(function(contents) {
    if (_.isUndefined(contents) || _.isNull(contents)) {
      port.disconnect();
      if (view) {
        view.remove();
      }
      return;
    }
    if (!view) {
      var note = new L.models.Note({contents: contents+"<br />"});
      view = new L.views.AddnotePage({model: note});
      note.save = function(attrs, options) {
        var old_view = view;
        view = null;
        port.postMessage(this.toJSON(attrs, options));
        old_view.$el.toggle("drop", {direction:"right"}, function() {
          old_view.remove();
        });
      };
      note.destroy = function() {
        var old_view = view;
        view = null;
        port.postMessage(null);
        old_view.$el.toggle("drop", {direction:"down"}, function() {
          old_view.remove();
        })
      }
      view.render();
      view.$el.hide();
      $(document.body).append(view.el)
      _.defer(function() {
        view.$el.slideDown(200);
      });
    } else {
      view.editor.appendText("<br />"+contents+"<br />");
    }
  });
})(ListIt);
