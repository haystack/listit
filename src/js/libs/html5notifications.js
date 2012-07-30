/**
 * An implementation of the HTML5 desktop notification spec in HTML.
 * @see: http://www.w3.org/TR/notifications/
 *
 * Requires jQuery because I am lazy.
 *
 * Copyright (c) 2012 Steven Allen
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to
 * deal in the Software without restriction, including without limitation the
 * rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
 * sell copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS
 * IN THE SOFTWARE.
 */


window.HTMLNotification = (function(win, $) {
    "use strict";

    /**
    * EventTarget class (because browsers don't expose this for some odd reason).
    * *Slightly modified (by steven)*
    *
    * Copyright (c) 2010 Nicholas C. Zakas. All rights reserved.
    *
    * MIT License
    * @source: http://www.nczonline.net/blog/2010/03/09/custom-events-in-javascript/
    **/
    var EventTarget = function(){
        this._listeners = {};
    };

    EventTarget.prototype = {

        constructor: EventTarget,

        addListener: function(type, listener){
            if (typeof this._listeners[type] == "undefined"){
                this._listeners[type] = [];
            }

            this._listeners[type].push(listener);
        },

        fire: function(event){
            if (typeof event == "string"){
                event = { type: event };
            }
            if (!event.target){
                event.target = this;
            }

            if (!event.type){  //falsy
                throw new Error("Event object missing 'type' property.");
            }

            if (this._listeners[event.type] instanceof Array){
                var listeners = this._listeners[event.type];
                for (var i=0, len=listeners.length; i < len; i++){
                    listeners[i].call(this, event);
                }
            }

            // Modification: call on* methods
            var attrhandler = this["on"+event.type];
            if (typeof attrhandler === "function") attrhandler.call(this, event);
        },

        removeListener: function(type, listener){
            if (this._listeners[type] instanceof Array){
                var listeners = this._listeners[type];
                for (var i=0, len=listeners.length; i < len; i++){
                    if (listeners[i] === listener){
                        listeners.splice(i, 1);
                        break;
                    }
                }
            }
        }
    };

    var container;
    $(win.document).ready(function() {
        container = $("<div>");
        container.attr("id", "notification-container");
        container.css({
            "width": "100px",
            "position": "fixed",
            "bottom": "10px",
            "right": "10px",
            "padding": "0px",
            "margin": "10px"
        });
        container.appendTo(win.document.body);
    });
            
        
    var Notification = function(title, options) {
        if (arguments.length < 1) {
            throw new TypeError("Not enough arguments.");
        } else if (arguments.length > 1 && ! options instanceof Object) {
            throw new TypeError("Not an object.");
        }

        EventTarget.call(this);
        var that = this;
        
        options || (options = {});

        options.onclick && (this.onclick = options.onclick);
        options.onshow  && (this.onshow  = options.onshow);
        options.onclose && (this.onclose = options.onclose);
        options.onerror && (this.onerror = options.onerror);

        // Container
        var containerEl = this.el = $('<article>');
        // Set gradient (can't use css() due to overrides).'
        containerEl.get()[0].style.cssText = " background: #fafafa; background: -moz-linear-gradient(top, #eaeaea 0%, #fafafa 35%, #fafafa 100%); background: -webkit-gradient(linear, left top, left bottom, color-stop(0%,#eaeaea), color-stop(35%,#fafafa), color-stop(100%,#fafafa)); background: -webkit-linear-gradient(top, #eaeaea 0%,#fafafa 35%,#fafafa 100%); background: -o-linear-gradient(top, #eaeaea 0%,#fafafa 35%,#fafafa 100%); background: -ms-linear-gradient(top, #eaeaea 0%,#fafafa 35%,#fafafa 100%); background: linear-gradient(to bottom, #eaeaea 0%,#fafafa 35%,#fafafa 100%); filter: progid:DXImageTransform.Microsoft.gradient( startColorstr='#eaeaea', endColorstr='#fafafa',GradientType=0 );";

        containerEl.css({
            "border": "1px solid #ccc",
            "border-radius": "2px",
            "margin": "2px",
            "position": "relative"
        });

        containerEl.addClass("notification");

        if (options.tag) {
            containerEl.attr("id", "notification-"+options.tag);
        }

        // Title
        var titleEl = $("<h1>");
        titleEl.text(title);
        titleEl.css({
            "font-size": "1em",
            "margin": "0",
            "padding": "2px"
        });
        titleEl.addClass("notification-title");
        if (options.titleDir) titleEl.attr('dir', options.titleDir);
        titleEl.appendTo(containerEl);

        // Icon
        if (options.iconUrl) {
            var iconEl = $("<img>");
            iconEl.attr('src', options.iconUrl);
            iconEl.addClass("notification-icon");
            iconEl.css({"float": "left"});
            iconEl.appendTo(containerEl);
        }

        // Close button
        var closeEl = $('<a>');
        closeEl.text('x');
        closeEl.css({
            "float": "right",
            "position": "absolute",
            "top": "0px",
            "right": "0px",
            "padding": "2px",
            "text-decoration": "none",
            "color": "gray",
            "vertical-align": "middle",
            "font-family": "monospace"
        });
        closeEl.attr('href', 'javascript:void(0);');
        closeEl.addClass("notification-closebtn");
        closeEl.click(function() {
            that.close();
            return false;
        });
        closeEl.appendTo(containerEl);

        // Body
        if (options.body) {
            var bodyEl = $('<p>');
            bodyEl.css({
                "padding": "2px",
                "border-top": "1px solid gray",
                "margin": "0",
                "color": "#444"
            });
            bodyEl.text(options.body);
            bodyEl.addClass("notification-body");
            if (options.bodyDir) bodyEl.attr('dir', options.bodyDir);
            bodyEl.appendTo(containerEl);
        }
        this.el.click(this.fire.bind(this));
    };

    Notification.prototype = new EventTarget();
    Notification.prototype.constructor = Notification;
    Notification.prototype.close = function() {
        if (this.hidden) return;
        this.hidden = true;
        this.el.fadeOut(100, this.el.remove.bind(this.el));
        this.fire("close");
    };
    Notification.prototype.show = function() {
        if (this.shown) return;
        this.shown = true;
        var id = this.el.attr('id');
        if (id) {
            var existing = $("#"+id);
            if (existing.length)  {
                existing.replaceWith(this.el);
                this.fire("show");
                return;
            }
        }
        this.el.hide();
        container.prepend(this.el);
        this.el.fadeTo(100, .95);
        this.fire("show");
    };
    return Notification;
})(window, jQuery);

// Setup
window.Notification || (window.Notification = window.HTMLNotification);
