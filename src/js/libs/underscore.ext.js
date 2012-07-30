_.mixin({
    pop: function(o, key) {
        var ret = o[key];
        delete o[key];
        return ret;
    }
});
