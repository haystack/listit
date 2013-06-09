/* Barrier.js
 * ==========
 *
 * Provides a simple barrier for synchronization.
 *
 * Source: https://github.com/Stebalien/barrier.js
 * Licence: MIT, Copyright (c) 2013 Steven Allen
 */

/**
 * Bind compatability snippet
 * From: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/bind
 **/
if (!Function.prototype.bind) {
  Function.prototype.bind = function (oThis) {
    if (typeof this !== "function") {
      // closest thing possible to the ECMAScript 5 internal IsCallable function
      throw new TypeError("Function.prototype.bind - what is trying to be bound is not callable");
    }
 
    var aArgs = Array.prototype.slice.call(arguments, 1),
        fToBind = this,
        fNOP = function () {},
        fBound = function () {
          return fToBind.apply(this instanceof fNOP && oThis
                                 ? this
                                 : oThis,
                               aArgs.concat(Array.prototype.slice.call(arguments)));
        };
 
    fNOP.prototype = this.prototype;
    fBound.prototype = new fNOP();
 
    return fBound;
  };
}

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

    // These funtions may be called passed arround. Bind them.
    this.aquire = this.aquire.bind(this);
    this.release = this.release.bind(this);
    this.isSet = this.isSet.bind(this);
    this.wait = this.wait.bind(this);
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
      } else if (n >= 0) {
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
