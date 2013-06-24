(function(L) {
    'use strict';
    L.Router = Backbone.Router.extend({
        // History for sliding.
        stack : [],

        /**
         * Goes to the specified page.
         *
         * @param{String} pageName The name of the page to which to switch.
         **/
        go: function(pageName) {
            var page = $('#page-'+pageName),
                d1, d2;

            if (this.stack[this.stack.length-1] === pageName) {
                page.show();
            } else if (this.stack[this.stack.length-2] === pageName) {
                this.stack.pop();
                d1 = 'right';
                d2 = 'left';
            } else {
                this.stack.push(pageName);
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
        }
    });
})(ListIt);
