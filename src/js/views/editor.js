/*jshint jquery: true, browser: true*/
/*global _: false, Backbone: false, ActionQueue: true, LogType: true*/
(function(L) {
  'use strict';
  L.views.Editor = Backbone.View.extend({
    initialize: function(options) {
      this.initial_content = (options && options.text) || '';
      this.actions = (options && options.actions);
      this.toolbarItems = (options && options.toolbarItems) || undefined;
    },
    className: 'editor',
    render: function() {
      this.$el.html(L.templates["editor"]({ text: this.initial_content}));
      var $bottombar = this.$('.editor-bottombar');
      var $entry = this.$('.editor-entry');

      // Toolbar
      this.toolbar = new L.views.Toolbar({
        'className': 'editor-toolbar flex'
      });
      $bottombar.prepend(this.toolbar.render().el);
      if (this.actions) {
        $bottombar.find('.editor-icons').html(this.actions);
      }

      this.wysihtml5entry = new wysihtml5.Editor($entry.get(0), {
        toolbar: this.toolbar.el,
        parserRules: wysihtml5ParserRules,
        style: false,
        stylesheets: WYSIHTML5_CSS
      });

      var iframe = this.wysihtml5entry.composer.iframe;
      var txtbox = $entry.get(0);

      var that = this;
      var resizeEditor = function() {
        var body = $(iframe).contents().find('body'); // Needs document to be loaded.
        _.delay(function() {
          iframe.style.height = 'auto';
          iframe.style.height = body.height() + 'px';
          txtbox.style.height = iframe.style.height;
        });
      };

      // Forward events to parent and resize editor
      _.each(['keydown', 'keyup', 'blur', 'change', 'focus'], function(type) {
        that.wysihtml5entry.on(type, function(evt) {
          resizeEditor();
          if (evt)  {
            // It thinks it's propagating but it really isn't
            _.defer(function() {
              that.el.dispatchEvent(evt);
            });
          } else {
            that.$el.trigger(type);
          }
        });
      });

      // Focus after inserted.
      this.$el.on("DOMNodeInsertedIntoDocument", function() {
        _.defer(function() {
          iframe.contentDocument.body.focus();
        });
      });

      // Maintain a dialog count so that we don't close the editor with a dialog open.
      // Referance counts are ugly but work.
      this._dialogCount = 0;
      this.wysihtml5entry.on('show:dialog', function() {
        that._dialogCount++;
      });
      this.wysihtml5entry.on('save:dialog', function() {
        that._dialogCount--;
      });
      this.wysihtml5entry.on('cancel:dialog', function() {
        that._dialogCount--;
      });
      this._rendered = true;
      return this;
    },
    focus: function() {
      this.wysihtml5entry.focus();
    },
    getText: function() {
      return this.wysihtml5entry.getValue();
    },
    isShowingDialog: function() {
      return this._dialogCount > 0;
    },
    setText: function(text) {
      if (this._rendered) {
        this.wysihtml5entry.setValue(text);
      } else {
        this.initial_content = text;
      }
    },
    clear: function() {
      if (this._rendered) {
        this.wysihtml5entry.clear();
      } else {
        this.initial_content = "";
      }
    },
    remove: function() {
      this.wysihtml5entry.off();
      return Backbone.View.prototype.remove.call(this);
    }
  });
})(ListIt);
