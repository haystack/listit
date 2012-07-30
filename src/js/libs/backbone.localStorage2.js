/**
 * Backbone localStorage Adapter
 * https://github.com/jeromegn/Backbone.localStorage
 */

(function() {
// A simple module to replace `Backbone.sync` with *localStorage*-based
// persistence. Models are given GUIDS, and saved into a JSON object. Simple
// as that.

// Hold reference to Underscore.js and Backbone.js in the closure in order
// to make things work even if they are removed from the global namespace
var _ = this._;
var Backbone = this.Backbone;

// Generate four random hex digits.
function S4() {
   return (((1+Math.random())*0x10000)|0).toString(16).substring(1);
};

// Generate a pseudo-GUID by concatenating random hexadecimal.
function guid() {
   return (S4()+S4()+"-"+S4()+"-"+S4()+"-"+S4()+"-"+S4()+S4()+S4());
};

// Helper functions from Backbone
var getValue = function(object, prop) {
    if (!(object && object[prop])) return null;
    return _.isFunction(object[prop]) ? object[prop]() : object[prop];
};

// Throw an error when a URL is needed, and none is supplied.
var urlError = function() {
    throw new Error('A "url" property or function must be specified');
};

var blockSize = 500; // Localstorage isn't that slow.

var loadMany = function(urls, objs, offset, options) {
    var end = offset + blockSize;
    for (var i = offset; i < end; i++) {
        var url = urls[i];
        if (!url) {
            (options.success || $.noop)(objs);
            return;
        }
        var obj = JSON.parse(localStorage.getItem(url));

        if (!obj) continue;

        if (obj instanceof Array) {
            (options.error || $.noop)("Models must not be arrays.");
            return;
        }

        objs.push(obj);
    }
    setTimeout(function() {
        loadMany(urls, objs, end, options);
    }, 0);
};

var actions = {
    "create": function(url, json, options) {
        json.id = guid();
        url += (url.charAt(url.length - 1) == '/' ? '' : '/') + encodeURIComponent(json.id);
        try {
            localStorage.setItem(url, JSON.stringify(json));
        } catch (e) {
            (options.error || $.noop)(e);
            return;
        }
        (options.success || $.noop)(json);
    },
    "read": function(url, json, options) {
        var object = JSON.parse(localStorage.getItem(url));
        // Cleanup non-existant (moved) models on read.
        if (object instanceof Array) {
            loadMany(object, [], 0, options);
        } else {
            (options.success || $.noop)(object);
        }
    },
    "update": function(url, json, options) {
        localStorage.setItem(url, JSON.stringify(json));
        (options.success || $.noop)(json);
    },
    "delete": function(url, json, options) {
        localStorage.removeItem(url);
        (options.success || $.noop)({});
    }
};


Backbone.sync = function(method, model, options) {
    options || (options = {});
    var url = options.url || getValue(model, 'url') || urlError();
    var json = (model instanceof Backbone.Collection)
            ? model.map(function(m) {return m.url();})
            : model.toJSON();
    actions[method](url,json, options);
};


Backbone.Collection.prototype.save = function(options) {
    options = options ? _.clone(options) : {};

    // After a successful server-side save, the client is (optionally)
    // updated with the server-side state.
    var collection = this;
    var success = options.success;
    options.success = function(resp, status, xhr) {
        var serverAttrs = collection.parse(resp, xhr);
        if (success) {
            success(collection, resp);
        } else {
            collection.trigger('sync', collection, resp, options);
        }
    };

    // Finish configuring and sending the Ajax request.
    options.error = Backbone.wrapError(options.error, collection, options);
    //var method = this.isNew() ? 'create' : 'update';
    var method = "update"; // FIXME: not bad but not good
    var xhr = (this.sync || Backbone.sync).call(this, method, this, options);
    return xhr;
};

}).call(this);
