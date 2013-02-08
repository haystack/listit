window.Lock = (function() {
  'use strict';

  var Lock = function() {
    this.value = 0;
    this.waiting = [];
    _.bindAll(this, 'aquire', 'release', 'isSet', 'wait');
  };

  Lock.prototype = {
    isSet: function() {
      return this.value > 0;
    },
    aquire: function() {
      return ++this.value;
    },
    release: function() {
      if (!this.isSet()) {
        throw Error("Lock not set.");
      };
      this.value--;
      if (!this.isSet()) {
        var cb;
        while (cb = this.waiting.pop()) {
          cb.callback.apply(null, cb.args);
        }
      }
    },
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
  return Lock;
})();
