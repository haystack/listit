(function(L) {
  'use strict';
  L.views.Editor = Backbone.View.extend({
    initialize: function(options) {
      if (!options) {
        options = {};
      }
      this.initialContent = options.text || '';
      this.actions = options.actions;
      this.toolbarItems = options.toolbarItems || [
        'bold', 'italic', 'underline', 'foreground', 'link'
      ];
      this.autoResize = _.isUndefined(options.autoResize) ? true : options.autoResize;
    },
    className: 'editor',
    render: function() {
      var that = this;
      this.$el.html(L.templates["editor"]({
        content: this.initialContent,
        items: this.toolbarItems
      }));

      var $bottombar = this.$('.editor-bottombar');
      var $entry = this.$('.editor-entry');

      if (this.actions) {
        $bottombar.find('.editor-icons').html(this.actions);
      }

      $entry[0].addEventListener("load", function() {
        var iframe = this;
        var iframeDoc = iframe.contentDocument;
        _.each(SQUIRE_CSS, function(css) {
          var link = iframeDoc.createElement("link");
          link.rel  = 'stylesheet';
          link.type = 'text/css';
          link.href = css;
          link.media = 'all';
          iframeDoc.head.appendChild(link);
        });
        that.squire = new Squire(iframeDoc);
        that.squire.setHTML(that.initialContent);
        that._fixHeight();

        // Forward events to parent and resize editor
        _.each(['keydown', 'keyup', 'input'], function(type) {
          that.squire.addEventListener(type, function(evt) {
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

        that.squire.addEventListener('pathChange', _.bind(that._updateFormatState, that));
        that._updateFormatState();

        // Manually bind focus. Squire has problems...
        // FIXME: Clean this up!!! (focus *entire* editor).
        that._hasFocus = document.activeElement === iframe;
        iframeDoc.body.addEventListener("blur", function(evt) {
          // Defer to see if activeElement changes.
          _.defer(function() {
            if (that._hasFocus && document.activeElement !== iframe) {
              that._hasFocus = false;
              that.$el.trigger("focusout");
            }
          });
        });
        iframeDoc.body.addEventListener("focus", function() {
          if (!that._hasFocus) {
            that._hasFocus = true;
            that.$el.trigger("focusin");
          }
        });

        // Finally, focus.
        that.focus();
      });
      return this;
    },
    events: {
      'click .editor-button': '_onEditorButtonPressed',
      'click *': 'focus' // Keep focus.
    },
    formats: {
      bold: { tag: "b" },
      italic: { tag: "i" },
      underline: { tag: "u" },
      link: { tag: "a", action: '_linkDialog' }
    },
    _updateFormatState: function(evt) {
      var that = this;
      _.each(this.formats, function(desc, format) {
        var button = that.$('.editor-button[data-editor-command="' + format + '"]');
        var hasFormat = that.squire.hasFormat(desc.tag);
        button.toggleClass("editor-command-active", hasFormat);
        if (desc.action) {
          that[desc.action](hasFormat);
        }
      });
    },
    _linkDialog: function(isLink) {
      console.log(isLink);
    },
    _onEditorButtonPressed: function(evt) {
      console.log("button press", document.activeElement);
      var command = $(evt.target).data('editor-command');
      var desc = this.formats[command];
      if (_.isUndefined(desc)) {
        return;
      }
      if (this.squire.hasFormat(desc.tag)) {
        this.squire.changeFormat(null, {tag: desc.tag});
      } else {
        this.squire.changeFormat({tag: desc.tag}, null);
      }
    },
    focus: function() {
      this.squire.focus();
    },
    blur: function() {
      this.squire.blur();
    },
    getText: function() {
      if (this.squire) {
        return this.squire.getHTML();
      } else {
        // Remove selection bounds.
        var wrapper = $("<span>");
        wrapper.html(this.initialContent || "");
        wrapper.children("#squire-selection-start, #squire-selection-end").remove();
        return wrapper.html();
      }
    },
    setText: function(text) {
      if (this.squire) {
        var selection = this.squire.getSelection();
        this.squire.setHTML(text);
        // Try to restore selection.
        this.squire.setSelection(selection);
        this._fixHeight();
      } else {
        this.initialContent = text;
      }
    },
    appendText: function(text) {
      if (this.squire) {
        var selection = this.squire.getSelection();
        this.squire.moveCursorToEnd();
        this.squire.insertHTML(text);
        this.squire.setSelection(selection);
        this._fixHeight();
      } else {
        this.initialContent += text;
      }
    },
    prependText: function(text) {
      if (this.squire) {
        var selection = this.squire.getSelection();
        this.squire.moveCursorToStart();
        this.squire.insertHTML(text);
        this.squire.setSelection(selection);
        this._fixHeight();
      } else {
        this.initialContent = text + this.initialContent;
      }
    },
    clear: function() {
      if (this.squire) {
        this.squire.setHTML("");
        this._fixHeight();
      } else {
        this.initialContent = "";
      }
    },
    remove: function() {
      this.squire.destroy();
      delete this.squire;
      return Backbone.View.prototype.remove.call(this);
    },
    _fixHeight: function() {
      if (!(this.squire && this.autoResize)) {
        return;
      }
      var iframe = this.$(".editor-entry")[0];
      iframe.style.height = "";
      iframe.style.height = iframe.contentDocument.body.getClientRects()[0].bottom + "px";
      this.$(".editor").trigger("resize");
    }
  });
})(ListIt);
