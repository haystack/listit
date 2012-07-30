"use strict";
// Author: Wolfe Styke
// Utility Functions that span most/all files

/**
 * Global setting for allowing debug messages.
 * Localhost:8000 defaults to true, otherwise false.
 * @type {boolean}
 * @private
 */


/**
 * Prints arguments if debugging is on 
 * and window.console is available.
 */


/**
 * Sets cursor at end of content editable element.
 * @param contentEditableElement
 * @see Geowa4's soln: http://stackoverflow.com/questions/1125292/how-to-move-cursor-to-end-of-contenteditable-entity
 */
L.util = (function() {
    var util = {};
    util.setCursorAtEnd = function(contentEditableElement) {
        var range,selection;
        if (document.createRange) {//Firefox, Chrome, Opera, Safari, IE 9+
            //Create a range (a range is a like the selection but invisible)
        range = document.createRange();

        //Select the entire contents of the element with the range
        range.selectNodeContents(contentEditableElement);
        range.collapse(false);//collapse the range to the end point. 
        //false means collapse to end rather than the start

        //get the selection object (allows you to change selection)
        selection = window.getSelection();
        selection.removeAllRanges(); //remove any selections already made
        //make the range you have just created the visible selection
        selection.addRange(range);

        } else if(document.selection) {//IE 8 and lower
            //Create a range (a range is a like the selection but invisible)
            range = document.body.createTextRange();
            //Select the entire contents of the element with the range
            range.moveToElementText(contentEditableElement);
            //collapse the range to the end point. false means collapse to end rather than the start
            range.collapse(false);
            range.select();//Select the range (make it the visible selection
        }
    };

    /**
    * Returns host from url string, else "" if failed to find host.
    * @param {string} url The url string.
    * @return {string} The host part of the url string.
    */
    util.getHostname = function(url) {
        var re = new RegExp('^(?:f|ht)tp(?:s)?\://([^/]+)', 'im');
        var matches = url.match(re);
        var result = ""
        if (matches != null && matches.length >= 2) {
            result = matches[1].toString();
        }
        return result;
    }

    /**
    * Returns hashpass from email and password combo.
    * @param {string} email The user's email address.
    * @param {string} password The user's password.
    */
    util.makeHashpass = function(email, password) {
        var token = email + ':' + password;
        var hashpass = 'Basic ' + util.encodeBase(token);
        hashpass = encodeURIComponent(hashpass);
        return hashpass;
    };

    /***  Base64 encode / decode http://www.webtoolkit.info/ * **/
    var keyStr = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

    /**
    * Public method for encoding a string.
    * @param {string} string The string to encode.
    * @return {string} utftext The encoded string.
    */
    util.utfEncode = function(string)  {
        string = string.replace(/\r\n/g,'\n');
        var utftext = '';

        for (var n = 0; n < string.length; n++) {
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
        }
        return utftext;
    };

    /**
    * Encodes string in base64.
    * @param {string} input The string to encode.
    * @return {string} output The encoded string.
    */
    util.encodeBase = function(input) {
        var output = '';
        var chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        var i = 0;
        input = util.utfEncode(input);
        while (i < input.length) {
            chr1 = input.charCodeAt(i++);
            chr2 = input.charCodeAt(i++);
            chr3 = input.charCodeAt(i++);

            enc1 = chr1 >> 2;
            enc2 = ((chr1 & 3) << 4) | (chr2 >> 4);
            enc3 = ((chr2 & 15) << 2) | (chr3 >> 6);
            enc4 = chr3 & 63;

            if (isNaN(chr2)) {
                enc3 = enc4 = 64;
            } else if (isNaN(chr3)) {
                enc4 = 64;
            }
            output = output + keyStr.charAt(enc1) + keyStr.charAt(enc2) + keyStr.charAt(enc3) + keyStr.charAt(enc4);
        }
        return output;
    };


    util.isTrue = function(input) {
        if (typeof(input) === "string") {
            input = input.toLowerCase();
            return input === "true" || input === "yes" || input === "1";
        } else {
            return input ? true : false
        }
    };

    // Slides 'hide' out and 'show' in calling 'cb' once on completion.
    util.slideSwitch = function(hide, show, cb) {
        hide = hide || $();
        show = show || $();
        cb = cb ? _.after(show.length+hide.length, cb) : $.noop;
        show.not(":visible").stop(true, true).fadeIn({queue: false}).not(".noslide").css('display', 'none').slideDown(cb);
        hide.stop(true, true).fadeOut({queue: false}).not(".noslide").slideUp(cb);
    };

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
    util.extractTerms = function(text) {
        text = _.str.trim(text);
        if (text.length === 0) {
            return null;
        }

        var terms = text.match(/[^\s",]+|"[^"]+"/g);
        var negativeTerms = [];
        var positiveTerms = [];

        for (var i in terms) {
            var term = _.str.trim(terms[i]);
            if (term[0] === "-") {
                term = _.str.trim(term.substring(1), '"').toLowerCase();
                if (term.length > 0) negativeTerms.push(term);
            } else {
                term = _.str.trim(term, '"').toLowerCase();
                if (term.length > 0) positiveTerms.push(term);
            }
        }

        return {
            positive: positiveTerms,
            negative: negativeTerms
        };
    };

    /**
    * Matches the given terms object against text.
    * Returns true if terms is null.
    **/
    util.matchTerms = function(terms, text) {
        return !terms || _.all(terms.negative, function(term) {
            return text.indexOf(term) < 0;
        }) && _.all(terms.positive, function(term) {
            return text.indexOf(term) >= 0;
        });
    };

    util.clean = function(text) {
        text = text.replace(/<[^>]*>?/g, '');
        text = text.replace('&nbsp;', ' ');
        text = _.str.unescapeHTML(text);
        return text;
    }
    return util;
})();

(function($) {
    $.fn.enableFields = function() {
        this.filter("input").removeAttr("disabled");
        this.find("input").removeAttr("disabled");
        return this;
    };

    $.fn.disableFields = function() {
        this.filter("input").attr("disabled", "disabled");
        this.find("input").attr("disabled", "disabled");
        return this;
    };
    $.fn.scrollIntoView = function(toShow, toScroll) {
        toScroll = toScroll || toShow.parent();
        var offset = toShow.position().top - toScroll.position().top;
        if (this.position().top + this.innerHeight() > toShow.position().top + toShow.outerHeight() + 5) {
            this.scrollTop(offset - 5);
        } else {
            this.scrollTop(offset - this.innerHeight() + toShow.outerHeight() + 5);
        }

        return this;
    };

    $.fn.cut = function(selector) {
        this.find(selector).contents().unwrap();
        this.find(selector).remove();
        return this;
    };
})(jQuery);

