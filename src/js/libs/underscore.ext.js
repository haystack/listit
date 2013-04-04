(function() {
  var _ = this._;
  _.mixin({
    // Delete and return o[key]
    pop: function(o, key, def) {
      if (o.hasOwnProperty(key)) {
        var ret = o[key];
        delete o[key];
        return ret;
      } else {
        return def;
      }
    },
    // Like map but works on objects.
    kmap: function(obj, iterator, context) {
      var results = {};
      if (obj == null) return results;
      _.each(obj, function(value, key, object) {
        results[key] = iterator.call(context, value, key, object);
      });
      return results;
    },
    // Returns a function that will call it's wrapped function with the specified
    // arguments in order. Calling _.mask(f, 2, 0)(1, 2, 3) is equivalent to
    // calling f(3,1).
    mask: function(func) {
      var args = Array.prototype.slice.call(arguments, 1);
      var underscore = _;
      return function() {
        var callargs = arguments;
        return func.apply(this, underscore.map(args, function(i) { return callargs[i]; }));
      };
    },
    chunk: function(array, size) {
      var i = 0;
      var result = [];
      while (i < array.length) {
        result.push(array.slice(i, i+size));
        i += size;
      }
      return result;
    }
  });
})();
