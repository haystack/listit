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
      this.$el.css("visibility", "collapse");

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
        _.each(['keydown', 'keyup'], function(type) {
          that.squire.addEventListener(type, function(evt) {
            that._fixHeight();
            evt = $.event.fix(evt);
            evt.view = window;
            evt.target = that.el;
            that.$el.trigger(evt);
          });
        });

        var matchers = [
          {
            regex: /\b()([A-Za-z]{3,9}:(?:\/\/)?(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+(?:(?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)\b()/,
            action: function(document, text) {
              var link = document.createElement("a");
              link.href = text;
              link.spellcheck = false;
              return link;
            }
          },
          {
            regex: /(^|\s|&nbsp;)(#[a-zA-Z][a-zA-Z0-9]{2,}\b)()/,
            action: function(document, text) {
              var tag = document.createElement("span");
              tag.className = "listit_tag";
              return tag;
            }
          },
        ];

        function highlight(squire, matcher, node) {
          switch (node.nodeType) {
          case Node.ELEMENT_NODE:
            if ($(node).hasClass("auto_format")) {
              return;
            }
            for (var i = 0; i < node.childNodes.length; i++) {
              // If we wrap a node, we may check it twice but the `auto_format`
              // check above will catch that.
              highlight(squire, matcher, node.childNodes[i]);
            }
            return;
          case Node.TEXT_NODE:
            var match = matcher.regex.exec(node.textContent);
            if (!match) {
              return;
            }
            var start = match.index + match[1].length;
            var end = start + match[2].length;

            var currentRange = squire.getSelection();
            var matchedRange = squire.getDocument().createRange();
            matchedRange.setStart(node, start);
            matchedRange.setEnd(node, end);
            var element = matcher.action(squire.getDocument(), match[2]);
            $(element).addClass('auto_format');
            squire._saveRangeToBookmark(currentRange);
            matchedRange.surroundContents(element);
            squire._getRangeAndRemoveBookmark(currentRange);
            squire.setSelection(currentRange);
          }
        }
        // TODO: Extract
        // TODO: Handle flicker...

        var format = _.throttle(function() {
          that.squire.modifyDocument(function() {
            var range = that.squire.getSelection();
            that.squire._saveRangeToBookmark(range);
            $(that.squire.getRoot()).cut(".auto_format");
            that.squire._getRangeAndRemoveBookmark(range);
            that.squire.setSelection(range);
            _.each(matchers, function(matcher) {
              highlight(that.squire, matcher, that.squire.getRoot());
            });
          });
        }, 100);
        that.squire.addEventListener('input', function(e) {
          format();
          that._fixHeight();
          that.$el.trigger(e);
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

        that.$el.css("visibility", "visible");

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
        var html;
        return this.squire.getHTML();
      } else {
        // Remove selection bounds.
        var wrapper = $("<span>");
        wrapper.html(this.initialContent || "");
        wrapper.children("#squire-selection-start, #squire-selection-end").remove();
        return this.initialContent || ""; // wrapper.html();
      }
    },
    setText: function(text) {
      var that = this;
      if (this.squire) {
        that.squire.setHTML(text);
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
      // +1 for firefox. Why? Who knows...
      iframe.style.height = iframe.contentDocument.body.getClientRects()[0].bottom + 1 + "px";
      this.$(".editor").trigger("resize");
    }
  });
})(ListIt);
