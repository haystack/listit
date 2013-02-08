(function(L) {
  'use strict';

  L.chrome.views.ChromeOmniboxView = Backbone.ChromeOmniboxView.extend({
    collection: L.chrome.omnibox,
    initialize: function() {
      this.collection.on('add remove reset', _.debounce(this.update, 100), this);
    },
    defaultSuggestion: 'Add Note: <match>%s</match>',
    events : {
      'change': 'onChange',
      'start': 'onStart',
      'cancel': 'onCancel',
      'submit': 'onSubmit'
    },
    onChange: function(text, suggest) {
      this.collection.stop();
      this.suggest = suggest;
      this.filter(text);
    },
    filter: _.debounce(function(text) {
      this.collection.search(text);
    }, 50),
    onStart: function() {
      this.collection.reset();
    },
    onCancel: function() {
      this.collection.reset();
    },
    onSubmit: function(text) {
      L.addNote(text, {});
    },
    update: function() {
      if (!this.suggest) {
        return;
      }

      var terms = this.collection._terms;

      this.suggest(this.collection.map(function(note) {
        var text = L.util.clean(note.get('contents'));
        var plain = text;
        var lower = text.toLowerCase();
        // TODO: there is probably a better wya to do this.
        if (terms) {
          _.each(terms.positive, function(t) {
            var i = lower.indexOf(t);
            if (i >= 0) {
              text = _.str.insert(
                text,
                i+t.length,
                '</match>'
              );
              text = _.str.insert(
                text,
                i,
                '<match>'
              );
              // Modify lower so that indexof works.
              lower = _.str.insert(
                lower,
                i+t.length,
                '</match>'
              );
              lower = _.str.insert(
                lower,
                i,
                '<match>'
              );
            }
          });
        }
        return {
          content: plain,
          description: text
        };
      }));
    }
  });
})(ListIt);
