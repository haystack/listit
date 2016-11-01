// Author: Wolfe Styke
// Utility Functions that span most/all files

/**
 * Global setting for allowing debug messages.  Localhost:8000 defaults to
 * true, otherwise false.
 * @type {boolean}
 * @private
 */


/**
 * Prints arguments if debugging is on and window.console is available.
 */


/**
 * Sets cursor at end of content editable element.
 * @param contentEditableElement
 * @see Geowa4's soln:
 * http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
 */
(function(L) {
  'use strict';
  var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

  /***  Base64 encode / decode http://www.webtoolkit.info/ * **/

  /**
   * Public method for encoding a string.
   * @param {string} string The string to encode.
   * @return {string} utftext The encoded string.
   */
  var utfEncode = function(string)  {
    var utftext = '';

    string = string.replace(/\r\n/g,'\n');

    for (var n = 0; n < string.length; n++) {
      /*jshint bitwise: false*/
      var c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      }
      else if((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
      /*jshint bitwise: true*/
    }
    return utftext;
  };

  /**
   * Encodes string in base64.
   * @param {string} input The string to encode.
   * @return {string} output The encoded string.
   */
  var encodeBase =  function(input) {
    var output = '';
    var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
    var i = 0;
    input = utfEncode(input);
    while (i < input.length) {
      chr1 = input.charCodeAt(i++);
      chr2 = input.charCodeAt(i++);
      chr3 = input.charCodeAt(i++);

      /*jshint bitwise: false*/
      enc1 = chr1 >> 2;
      enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
      enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
      enc4 = chr3 & 63;
      /*jshint bitwise: true*/

      if (isNaN(chr2)) {
        enc3 = enc4 = 64;
      } else if (isNaN(chr3)) {
        enc4 = 64;
      }
      output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
    }
    return output;
  };

  L.util = {
    /**
     * Returns hashpass from email and password combo.
     * @param {string} email The user's email address.
     * @param {string} password The user's password.
     */
    makeHashpass: function(email, password) {
      return encodeURIComponent('Basic ' + encodeBase(email + ':' + password));
    },

    /**
     * Takes a string and an object and appends the object to the string as a
     * series of meta tags (where the values are JSON encoded).
     **/
    metaJoin: function(contents, meta) {
      return meta ? contents + _.map(meta, function(value, key) {
        // Let the browser do the escaping.
        var m = $("<meta>");
        m.attr("name", key);
        // Support non string values.
        m.attr("content", JSON.stringify(value));
        return m[0].outerHTML;
      }).join("") : contents;
    },
    /**
     * Takes an html fragment and extracts (and removes) top-level meta tag
     * data.
     **/
    metaSplit: function(str) {
      var doc = $("<div>").html($.parseHTML(str));
      var meta = {};
      doc.children("meta").each(function(index, node) {
        var $node = $(node);
        var content = $node.attr("content");
        var name = $node.attr("name");
        if (_.isUndefined(name) || _.isUndefined(content)) {
          return;
        }

        try {
          content = JSON.parse(content);
        } catch (e) { }

        meta[name] = content;
      }).remove();
      return {
        contents: doc.html(),
        meta: meta
      };
    },
    // Slides 'hide' out and 'show' in calling 'cb' once on completion.
    slideSwitch: function(hide, show, cb) {
      hide = hide || $();
      show = show || $();
      cb = cb ? _.after(show.length+hide.length, cb) : $.noop;
      show.not(':visible').stop(true, true).fadeIn({queue: false}).not('.noslide').css('display', 'none').slideDown(cb);
      hide.stop(true, true).fadeOut({queue: false}).not('.noslide').slideUp(cb);
    },

    /**
     * Extracts search terms from `text`. Returns null if `text` consists
     * only of whitespace.
     *
     * Input:  ' my   "search terms" -your -"bad terms" '
     * Output: {
     *           positive: [ 'my', 'search terms'],
     *           negative: [ 'your', 'bad terms']
     *         }
     *
     **/
    extractTerms: function(text) {
      text = _.str.trim(text);
      if (text.length === 0) {
        return {
          positive: [],
          negative: []
        };
      }

      var terms = text.match(/[^\s",]+|"[^"]+"/g),
          negativeTerms = [],
          positiveTerms = [],
          term;

      for (var i = 0; i < terms.length; i++) {
        term = _.str.trim(terms[i]);
        if (term[0] === '-') {
          term = _.str.trim(term.substring(1), '"').toLowerCase();
          if (term.length > 0) {
            negativeTerms.push(term);
          }
        } else {
          term = _.str.trim(term, '"').toLowerCase();
          if (term.length > 0) {
            positiveTerms.push(term);
          }
        }
      }

      return {
        positive: positiveTerms,
        negative: negativeTerms
      };
    },

    /**
     * Matches the given terms object against text.
     * Returns true if terms is null.
     **/
    matchTerms: function(terms, text) {
      return !terms || _.all(terms.negative, function(term) {
        return text.indexOf(term) < 0;
      }) && _.all(terms.positive, function(term) {
        return text.indexOf(term) >= 0;
      });
    },
    /**
     * Remove html from text.
     **/
    clean: function(text) {
      text = _.str.stripTags(text);
      text = text.replace('&nbsp;', ' ');
      text = _.str.unescapeHTML(text);
      return text;
    },
    /**
     * Strip breaks/spaces/etc. from the ends of a string.
     **/
    strip: function(text) {
      text = text.replace(/^(<\/?br\s*>|<br\s*\/?>|&nbsp;|\s)+/, '');
      text = text.replace(/(<\/?br\s*>|<br\s*\/?>|&nbsp;|\s)+$/, '');
      return text;
    }
  };
})(ListIt);

(function($) {
  'use strict';
  $.fn.enableFields = function() {
    this.filter('input').prop('disabled', false);
    this.find('input').prop('disabled', false);
    return this;
  };

  $.fn.disableFields = function() {
    this.filter('input').prop('disabled', true);
    this.find('input').prop('disabled', true);
    return this;
  };
  $.fn.scrollIntoView = function(container) {
    container = container || this.parent();
    var parent = container.parent();

    var containerTop = parent.position().top - container.position().top;
    var containerBottom = containerTop + parent.innerHeight();
    var elTop = this.position().top;
    var elBottom = elTop + this.outerHeight();

    if (elTop < containerTop) {
      this.get(0).scrollIntoView();
    } else if (elBottom > containerBottom) {
      this.get(0).scrollIntoView(false);
    }

    return this;
  };

  $.fn.cut = function(selector) {
    this.find(selector).contents().unwrap();
    this.find(selector).remove();
    return this;
  };
})(jQuery);
