"use strict";

var ActionQueue = function(timeSlice) {
    _.bindAll(this);
    this.timeSlice = (typeof(timeSlice) === "undefined") ? 50 : timeSlice;
};

ActionQueue.prototype = {
    _queue: [],
    add: function() {
        this._queue.push({
            func: _.first(arguments),
            args: _.rest(arguments)
        });
        this._queue_next();
    },
    _queue_next: function() {
        if (!this.running || this._timer) return;
        try {
            this._timer = setTimeout(this._exec, 0)
        } catch (e) {
            this._exec();
        }
    },
    running: false,
    start: function() {
        this.running = true;
        this._queue_next();
    },
    stop: function() {
        clearTimeout(this._timer);
        delete this._timer;
        this.running = false;
    },
    _exec: function(num) {
        var start = Date.now();
        while (this.running && ((Date.now() - start) < this.timeSlice)) {
            var task = this._queue.shift();
            if (!task) {
                delete this._timer;
                return;
            }
            task.func.apply(task.func, task.args);
        }
        // can't do this at the beginning because we call a user-defined function.
        delete this._timer;
        this._queue_next();
    },
    clear: function() {
        clearTimeout(this._timer);
        delete this._timer;
        this._queue = [];
    }
};
