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
      var page = L.pages[pageName];
      var pageIndex = _.indexOf(this.stack, pageName);
      var pageEl;
      var sign;

      if (_.isUndefined(page)) {
        pageEl = $('#page-404');
      } else {
        pageEl = page.render().$el;
      }

      if (pageIndex == -1) {
        this.stack.push(pageName);
        sign = -1;
      } else if (pageIndex < (this.stack.length - 1)) {
        this.stack.splice(pageIndex + 1);
        sign = 1;
      }

      if (sign && this._initialPageLoaded) {
        // Manually using animate instead of slide to prevent jQueryUI
        // from taking the page out of the DOM (breaking the editor)
        $('.page:visible').not(pageEl).animate({
          left: sign*(100)+"%",
          right: sign*(-100)+"%"
        }, function() {
          $(this).css('visibility', 'hidden');
        });
        pageEl.css({
          visibility: 'visible',
          left: sign*(-100)+"%",
          right: sign*(100)+"%"
        }).animate({
          left: 0,
          right: 0
        });
      } else {
        // Don't animate on load.
        this._initialPageLoaded = true;
        $('.page:visible').not(pageEl).css({
          left: sign*(100)+"%",
          right: sign*(-100)+"%",
          visibility: 'hidden'
        });
        pageEl.css({
          left: 0,
          right: 0,
          visibility: 'visible'
        });
      }
    }
  });
})(ListIt);
