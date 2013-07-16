(function($) {
    var Hotkey = function(def) {
        this.reset();

        if (typeof(def) === "string") {
            var parts = def.toLowerCase().split('+');
            this.key = parts.pop();
            for (var part in parts) {
                this[part] = true;
            }
        } else {
            def || (def = {});
            this.ctrl = def.ctrl || false;
            this.alt = def.alt || false;
            this.shift = def.shift || false;
            this.key = def.key || "";
        }
    };

    Hotkey.prototype.toString = function() {
        return ((this.alt ? "alt+" : "") +
            (this.ctrl ? "ctrl+" : "") +
            (this.shift ? "shift+" : "") +
            (this.key || ""));
    };

    Hotkey.prototype.isValid = function() {
        return (this.alt || this.ctrl) && typeof(this.key) === "string" && this.key.length > 0;
    };

    Hotkey.prototype.reset = function() {
        this.alt = this.ctrl = this.shift = false;
        this.key = "";
    };

    Hotkey.prototype.isBlank = function() {
        return !(this.alt || this.ctrl || this.shift || (this.key && this.key.length === 1));
    };

    var refresh = function(el) {
        $(el).val(el.tmp_key.toString());
    }

    var specialKeys = {
        8: "backspace", 9: "tab", 13: "return", 16: "shift", 17: "ctrl", 18: "alt",
        19: "pause", 20: "capslock", 27: "esc", 32: "space",
        33: "pageup", 34: "pagedown", 35: "end", 36: "home",
        37: "left", 38: "up", 39: "right", 40: "down",
        45: "insert", 46: "del",
        96: "0", 97: "1", 98: "2", 99: "3", 100: "4",
        101: "5", 102: "6", 103: "7", 104: "8", 105: "9",
        106: "*", 107: "+", 109: "-", 110: ".", 111: "/",
        112: "f1", 113: "f2", 114: "f3", 115: "f4", 116: "f5", 117: "f6",
        118: "f7", 119: "f8", 120: "f9", 121: "f10", 122: "f11", 123: "f12",
        144: "numlock", 145: "scroll",
        186: ";", 187: "=", 188: ",", 189: "-", 190: ".", 191: "/", 192: "`",
        219: "[", 220: "\\", 221: "[", 222: "'",
        224: "meta"
    };

    $.fn.hotkeyinput = function() {

        this.on("keydown.hotkeyinput", function(evt) {
            this.tmp_key || (this.tmp_key = new Hotkey(this.key || {}));

            switch(evt.which) {
                case 0:
                case 9:
                    return true;
                case 8:
                    delete this.key;
                    this.tmp_key = new Hotkey();
                    refresh(this);
                    return false;
                case 27:
                    this.tmp_key = new Hotkey(this.key || {});
                    $(this).blur();
                    refresh(this);
                    return false;
            }

            this.tmp_key.alt   = evt.altKey   || false;
            this.tmp_key.ctrl  = evt.ctrlKey  || false;
            this.tmp_key.shift = evt.shiftKey || false;
            this.tmp_key.key = "";

            var special = specialKeys[evt.which] || "auto";

            switch(special) {
                case "shift":
                    this.tmp_key.shift = true;
                    break;
                case "alt":
                    this.tmp_key.alt = true;
                    break;
                case "ctrl":
                    this.tmp_key.ctrl = true;
                    break;
                case "meta":
                    break; // Ignore for compat.
                case "auto":
                    this.tmp_key.key = String.fromCharCode(evt.which).toLowerCase();
                    break;
                default:
                    this.tmp_key.key = special;
            }

            if (this.tmp_key.isValid()) {
                this.key = new Hotkey(this.tmp_key);
                refresh(this);
                $(this).trigger("hotkey-changed");
            } else {
                refresh(this);
            }
            return false;
        }).on("keyup.hotkeyinput", function(evt) {
            this.tmp_key || (this.tmp_key = new Hotkey(this.key));

            if (this.tmp_key.isValid()) return true;
            switch(evt.keyCode) {
                case 0:
                case 9:
                    return true;
                case 8:
                    this.tmp_key.reset()
                    delete this.key;
                    refresh(this);
                    $(this).trigger("hotkey-changed");
                    return false;
                case 16:
                    this.tmp_key.shift = false;
                    break;
                case 17:
                    this.tmp_key.ctrl = false;
                    break;
                case 18:
                    this.tmp_key.alt = false;
                    break;
                default:
                    this.tmp_key.key = "";
            }

            if (!this.tmp_key || this.tmp_key.isBlank()) {
                this.tmp_key = new Hotkey(this.key|| {});
            }
            refresh(this);
            return false;
        }).on("blur.hotkeyinput", function(evt) {
            this.tmp_key = new Hotkey(this.key || {});
            refresh(this);
        });
    };
})(jQuery);

        

