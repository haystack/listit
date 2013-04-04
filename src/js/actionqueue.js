window.ActionQueue = (function() {
    'use strict';

    var ActionQueue = function(timeSlice) {
        _(this).bindAll('_exec', 'start', 'stop', 'clear', 'add');
        this.timeSlice = (typeof(timeSlice) === 'undefined') ? 50 : timeSlice;
    };

    ActionQueue.prototype = {
        _queue: [],
        add: function() {
            this._queue.push({
                func: _.first(arguments),
                args: _.rest(arguments)
            });
            this._queueNext();
        },
        _queueNext: function() {
            if (!this.running && this._timer) {
                return;
            }

            try {
                this._timer = window.setTimeout(this._exec, 0);
            } catch (e) {
                this._exec();
            }
        },
        running: false,
        start: function() {
            this.running = true;
            this._queueNext();
        },
        stop: function() {
            window.clearTimeout(this._timer);
            delete this._timer;
            this.running = false;
        },
        _exec: function() {
            var task, start = Date.now();
            while (this.running && ((Date.now() - start) < this.timeSlice)) {
                task = this._queue.shift();
                if (!task) {
                    delete this._timer;
                    return;
                }
                task.func.apply(task.func, task.args);
            }
            // can't do this at the beginning because we call a user-defined function.
            delete this._timer;
            this._queueNext();
        },
        clear: function() {
            window.clearTimeout(this._timer);
            delete this._timer;
            this._queue = [];
        }
    };

    return ActionQueue;
}());
