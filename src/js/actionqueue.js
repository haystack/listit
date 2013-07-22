window.ActionQueue = (function() {
  'use strict';

  /**
   * Executes actions asynchrounlsy and in-order.
   *
   * Instead of simply chaining setTimeut(action, 0) calls, ActionQueue runs
   * the queued actions such that at least `timeSlice` milliseconds pass
   * before returning control to the browser. ActionQueues are useful for
   * running long chunkeable tasks.
   *
   * @param{int} timeSlice The minimum amount of time to run queued tasks before returning control to the browser.
   */

  var ActionQueue = function(timeSlice) {
    _(this).bindAll('_exec', 'start', 'stop', 'clear', 'add');
    this.timeSlice = (typeof(timeSlice) === 'undefined') ? 50 : timeSlice;
  };

  ActionQueue.prototype = {
    _queue: [],
    /**
     * Add functions to the action queue
     *
     * @param {Function} function The function to be queued.
     * @param {Object} ... the arguments to be passed to the function when called.
     **/
    add: function(/* function, ... */) {
      this._queue.push({
        func: _.first(arguments),
        args: _.rest(arguments)
      });
      this._queueNext();
    },
    _queueNext: function() {
      if (!this.running || this._timer) {
        return;
      }

      try {
        this._timer = window.setTimeout(this._exec, 0);
      } catch (e) {
        this._exec();
      }
    },
    running: false,
    /**
     * Start executing actions on the action queue
     **/
    start: function() {
      this.running = true;
      this._queueNext();
    },
    /**
     * Stop executing actions on the action queue
     **/
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
    /**
     * Clear all queued actions.
     **/
    clear: function() {
      window.clearTimeout(this._timer);
      delete this._timer;
      this._queue = [];
    }
  };

  return ActionQueue;
}());
