/**
 * Provides a simple barrier for synchronization.
 *
 * To use, aquire the barrier before initiating a asynchronous operation and
 * release the barrier after the asynchronous operation has completed.
 *
 * When all aquired barriers have been released waiting functions will be
 * called in order until either no waiting functions remain or a waiting
 * function takes the barrier.
 *
 * Ex:
 *
 *   var barr = new Barrier();
 *   var myCb = function() {
 *     barr.release();
 *   };
 *   barr.aquire(2);
 *   myAsynchrounousMethod(myCb)
 *   myAsynchrounousMethod2(myCb)
 *   barr.wait(function() {
 *     //continue
 *   });
 **/
window.Barrier = (function() {
  'use strict';

  /**
   * Instantiate the barrier
   *
   * Arguments:
   *   n - (optinal) initiate with n barriers pre-aquired.
   *
   * Throws:
   *   Error if n < 0
   **/
  var Barrier = function(n) {
    if (n < 0) {
      throw new RangeError("Invalid Argument");
    }
    this.value = n || 0;
    this.waiting = [];
    _.bindAll(this, 'aquire', 'release', 'isSet', 'wait');
  };

  Barrier.prototype = {
    /**
     * Check if the barrier is currently set.
     */
    isSet: function() {
      return this.value > 0;
    },
    /**
     * Aquire the barrier.
     *
     * Arguments:
     *   n - (optional) aquire n barriers
     *
     * Throws:
     *   Error if n <= 0
     *
     **/
    aquire: function(n) {
      if (arguments.length === 0) {
        this.value++;
      } else if (n > 0) {
        this.value += n;
      } else {
        throw new RangeError("Invalid Argument");
      }
      return this.value;
    },
    /**
     * Release the barrier.
     *
     * Arguments:
     *   n - (optional) release n barriers
     *
     * Throws:
     *   Error if n <= 0 or n > the number of barriers taken.
     */
    release: function(n) {
      if (!this.isSet()) {
        throw new Error("Barrier not set.");
      }
      if (arguments.length === 0) {
        this.value--;
      } else if (this.value >= n > 0) {
        this.value -= n;
      } else {
        throw new RangeError("Invalid Argument");
      }

      // Call waiting functions until set.
      var cb;
      while (!this.isSet() && this.waiting.length > 0) {
        cb = this.waiting.pop();
        cb.callback.apply(null, cb.args);
      }
    },
    /**
     * Call the passed function when all aquired barriers have been released.
     * If no barriers are currently taken, the function is called immediately.
     *
     * Arguments:
     *   fn - the callback
     **/
    wait: function(fn) {
      var args = Array.prototype.slice.call(arguments, 1);
      if (this.isSet()) {
        this.waiting.unshift({
          args: args,
          callback: fn
        });
      } else {
        fn.apply(null, args);
      }
    }
  };
  return Barrier;
})();
