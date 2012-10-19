(function(L) {
    'use strict';
    L.make.Router = Backbone.Router.extend({
        routes: {
            ':action': 'go',
            '': 'main'
        },
        stack : ['main'],
        go: function(action) {
            var page = $('#page-'+action),
                d1, d2;

            if (this.stack[this.stack.length-1] === action) {
                page.show();
            } else if (this.stack[this.stack.length-2] === action) {
                this.stack.pop();
                d1 = 'right';
                d2 = 'left';
            } else {
                this.stack.push(action);
                d1 = 'left';
                d2 = 'right';
            }

            // 404 page
            if (page.length === 0) {
                page = $('#page-404');
            }

            // Only slide if loaded
            if (this._loaded) {
                $('.page:visible').not(page).hide('slide', {direction: d1});
                page.show('slide', {direction: d2});
            } else {
                page.show();
            }

            this._loaded = true;
        },
        main: function() {this.go('main');}
    });
})(ListIt);
