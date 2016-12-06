(function(L) {
  'use strict';
  L.views.Editor = Backbone.View.extend({
    toolbarItems: [
      'bold', 'italic', 'underline', 'color', 'highlight'
    ],
    colors: [
      "white", "maroon",
      "red", "orange", "yellow",
      "green", "blue", "purple"
    ],
    highlights: [
      "black", "maroon",
      "red", "orange", "yellow",
      "green", "blue", "purple"
    ],
    className: 'editor',
    initialContent: '',
    initialize: function(options) {
      if (!options) {
        options = {};
      }
      this.actions = options.actions;
      if (_.has(options, "text")) {
        this.initialContent = options.text;
      }
      if (_.has(options, "toolbarItems")) {
        this.toolbarItems = options.toolbarItems;
      }
      if (_.has(options, "colors")) {
        this.colors = options.colors;
      }
      if (_.has(options, "highlights")) {
        this.highlights = options.highlights;
      }
    },
    attributes: function() {
      if (_.has(this.options, "spellcheck")) {
        return { spellcheck: this.options.spellcheck };
      } else {
        return {};
      }
    },
    render: function() {
      this.$el.html(L.templates["editor"]({
        content: this.initialContent,
        toolbarItems: this.toolbarItems,
        colors: this.colors,
        highlights: this.highlights
      }));

      var $bottombar = this.$('.editor-bottombar');
      var $entry = this.$('.editor-entry');

      if (this.actions) {
        $bottombar.find('.editor-icons').html(this.actions);
      }

      this.squire = new Squire($entry.get(0));
      this.squire.setHTML(this.initialContent);
      this.squire.moveCursorToStart();

      var matchers = [
        {
          regex: /()((:?(:?[A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)(:?(?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)()/,
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
            tag.spellcheck = false;
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
      this.squire.addEventListener('input', function(e) {
        this.squire.modifyDocument(function() {
          var range = this.squire.getSelection();
          this.squire._saveRangeToBookmark(range);
          $(this.squire.getRoot()).cut(".auto_format");
          this.squire._getRangeAndRemoveBookmark(range);
          this.squire.setSelection(range);
          _.each(matchers, function(matcher) {
            highlight(this.squire, matcher, this.squire.getRoot());
          }.bind(this));
        }.bind(this));
        this.$el.trigger(e);
      }.bind(this));

      this.squire.addEventListener('pathChange', this._updateFormatState.bind(this));
      this._updateFormatState();

      return this;
    },
    events: {
      'mousedown': '_keepFocus',
      'click .editor-toolbar-buttons .editor-toggle': '_onEditorFormatToggle',
      'click .editor-toolbar-buttons .editor-select .editor-option': '_onEditorFormatSelect'
    },
    _keepFocus: function(e) {
      if (!jQuery.contains(this.$(".editor-entry").get(0), e.target)) {
        e.preventDefault();
        this.focus();
      }
    },
    /**
     * Enable or disable spellchecking for this editor. Call without the `state`
     * argument to query the current spellchecking state.
     **/
    spellcheck: function(state) {
      return this.$(".editor-entry").prop("spellcheck", state);
    },
    _updateFormatState: function(evt) {
      var fontInfo = this.squire.getFontInfo();
      this.$(".editor-toolbar-buttons .editor-toggle").each(function(idx, el) {
        var tag = $(el).data("tag");
        var hasFormat = this.squire.hasFormat(tag);
        $(el).toggleClass("active", hasFormat);
      }.bind(this));
      this.$(".editor-toolbar-buttons .editor-select").each(function(idx, el) {
        var prop = $(el).data("property");
        var currentValue = fontInfo[prop];
        $(".editor-option", el).removeClass("active");
        if (!!currentValue) {
          // Using jquery doesn't work here. WTF?
          el.dataset.value = currentValue;
          $(el).addClass("active");
          $(".editor-option[data-value=" + currentValue + "]", el).addClass("active");
        } else {
          delete el.dataset["value"];
          $(el).removeClass("active");
          $(".editor-option:not([data-value])", el).addClass("active");
        }
      }.bind(this));
    },
    _onEditorFormatSelect: function(evt) {
      evt.preventDefault();
      var value = $(evt.target).data("value");
      var property = $(evt.target).closest(".editor-select").data("property");
      this.squire.setFontProperty(property, value);
    },
    _onEditorFormatToggle: function(evt) {
      evt.preventDefault();
      var tag = $(evt.target).data("tag");
      if (this.squire.hasFormat(tag)) {
        this.squire.changeFormat(null, {tag: tag});
      } else {
        this.squire.changeFormat({tag: tag}, null);
      }
    },
    focus: function() {
      if (!this.$(".editor-entry").is(":focus")) {
        this.squire.focus();
      }
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
      if (this.squire) {
        this.squire.setHTML(text);
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
      } else {
        this.initialContent = text + this.initialContent;
      }
    },
    clear: function() {
      if (this.squire) {
        this.squire.setHTML("");
        // Otherwise, it gets put on the next line?
        this.squire.moveCursorToStart();
      } else {
        this.initialContent = "";
      }
    },
    remove: function() {
      this.squire.destroy();
      delete this.squire;
      return Backbone.View.prototype.remove.call(this);
    }
  });
})(ListIt);
