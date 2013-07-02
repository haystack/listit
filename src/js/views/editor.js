(function(L) {
  'use strict';
  L.views.Editor = Backbone.View.extend({
    initialize: function(options) {
      if (!options) {
        options = {};
      }
      this.initialContent = options.text || '';
      this.actions = options.actions;
      this.toolbarItems = options.toolbarItems;
      this.autoResize = _.isUndefined(options.autoResize) ? true : options.autoResize;
    },
    className: 'editor',
    _fixHeight: function() {
      if (!(this._rendered && this.autoResize)) {
        return;
      }
      var that = this;
      var iframe = this.wysihtml5entry.composer.iframe;
      var $body = $(iframe).contents().find('body'); // Needs document to be loaded.
      var txtbox = this.wysihtml5entry.textareaElement;
      _.delay(function() {
        if (that.wysihtml5entry.currentView === that.wysihtml5entry.composer) {
          // Using composer
          iframe.style.height = 'auto';
          // TODO: Don't hardcode height here.
          iframe.style.height = $body.height() + 16 + 'px';
          txtbox.style.height = iframe.style.height;
        } else {
          // Not using composer
          txtbox.style.height = 'auto';
          txtbox.style.height = txtbox.scrollHeight + 16 + 'px';
          iframe.style.height = txtbox.style.height;
        }
        if ($.browser.mozilla) {
          // Ugly hack for firefox -moz-box. Need this event to fixup page header
          // (omnibox) /content (notelist) heights.
          // BUG: https://bugzil.la/579776 (the workarround doesn't work).
          $(txtbox).trigger("resize");
        }
      });
    },
    render: function() {
      var that = this;
      this.$el.html(L.templates["editor"]({ text: this.initialContent}));
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


      // Forward events to parent and resize editor
      _.each(['keydown', 'keyup', 'blur', 'change', 'focus'], function(type) {
        that.wysihtml5entry.on(type, function(evt) {
          that._fixHeight();
          if (evt)  {
            // It thinks it's propagating but it really isn't
            // Duplicate and edit.
            evt = $.event.fix(evt);
            evt.view = window;
            evt.target = that.el;
            that.$el.trigger(evt);
          } else {
            that.$el.trigger(type);
          }
        });
      });

      // Focus after inserted.
      this.wysihtml5entry.on('load', function() {
        _.defer(function() {
          that.focus();
        });
      });

      // Maintain a dialog count so that we don't close the editor with a dialog open.
      // Referance counts are ugly but work.
      this._dialogCount = 0;
      this.wysihtml5entry.on('show:dialog', function() {
        that._dialogCount++;
      });
      this.wysihtml5entry.on('hide:dialog', function() {
        that._dialogCount--;
      });
      this._rendered = true;
      return this;
    },
    focus: function() {
      this.wysihtml5entry.focus(true);
    },
    blur: function() {
      // Not provided by wysihtml5.
      this.wysihtml5entry.currentView.element.blur();
    },
    getText: function() {
      if (this._rendered) {
        return this.wysihtml5entry.getValue();
      } else {
        return this.initialContent || "";
      }
    },
    isShowingDialog: function() {
      return this._dialogCount > 0;
    },
    setText: function(text) {
      if (this._rendered) {
        this.wysihtml5entry.setValue(text);
        // Always focus after setting text. Also puts the cursor after the added text.
        this.wysihtml5entry.focus(true);
        this._fixHeight();
      } else {
        this.initialContent = text;
      }
    },
    appendText: function(text) {
      if (this._rendered) {
        this.wysihtml5entry.appendValue(text);
        this._fixHeight();
      } else {
        this.initialContent += text;
      }
    },
    prependText: function(text) {
      if (this._rendered) {
        this.wysihtml5entry.prependValue(text);
        this._fixHeight();
      } else {
        this.initialContent = text+this.initialContent;
      }
    },
    replaceText: function(a, b) {
      if (this._rendered) {
        this.wysihtml5entry.replaceValue(a, b);
        this._fixHeight();
      } else {
        this.initialContent = this.initialContent.replace(a, b);
      }
    },
    clear: function() {
      if (this._rendered) {
        this.wysihtml5entry.clear();
      } else {
        this.initialContent = "";
      }
    },
    remove: function() {
      this.wysihtml5entry.off();
      return Backbone.View.prototype.remove.call(this);
    }
  });
})(ListIt);
