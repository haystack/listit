(function(L) {
    'use strict';
    L.Router = Backbone.Router.extend({
        routes: {
            ':page_name': 'go',
            '': 'main'
        },
        // Default start page.
        stack : ['main'],

        /**
         * Goes to the specified page.
         *
         * @param{String} page_name The name of the page to which to switch.
         **/
        go: function(page_name) {
            var page = $('#page-'+page_name),
                d1, d2;

            if (this.stack[this.stack.length-1] === page_name) {
                page.show();
            } else if (this.stack[this.stack.length-2] === page_name) {
                this.stack.pop();
                d1 = 'right';
                d2 = 'left';
            } else {
                this.stack.push(page_name);
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
