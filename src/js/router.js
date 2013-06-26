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
            var page = $('#page-'+pageName);
            var sign;

            if (this.stack[this.stack.length-1] === pageName) {
                page.show();
            } else if (this.stack[this.stack.length-2] === pageName) {
                this.stack.pop();
                sign = 1;
            } else {
                this.stack.push(pageName);
                sign = -1;
            }

            // 404 page
            if (page.length === 0) {
                page = $('#page-404');
            }

            // Only slide if loaded
            if (this._loaded) {
              // Manually using animate instead of slide to prevent jQueryUI
              // from taking the page out of the DOM (breaking wysihtml5)
                page.css({
                  left: sign*(-100)+"%",
                  right: sign*(100)+"%",
                  display: 'block'
                });
                $('.page:visible').not(page).animate({
                  left: sign*(100)+"%",
                  right: sign*(-100)+"%"
                });
                page.animate({
                  left: 0,
                  right: 0
                });
            } else {
                page.show();
            }

            this._loaded = true;
        }
    });
})(ListIt);
