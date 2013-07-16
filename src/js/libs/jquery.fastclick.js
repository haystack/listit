(function($) {
    $.fn.fastclick = function(selector) {
        this.on({ 'touchstart.fastclick' : handler }, selector);
        return this;
    };

    var clickbuster = {
        coordinates: [],
        preventGhostClick : function(x, y) {
            clickbuster.coordinates.push(x, y);
            window.setTimeout(clickbuster.pop, 2500);
        },
        pop: function() {
            clickbuster.coordinates.splice(0, 2);
        },
        onClick: function(event) {
            for (var i = 0; i < clickbuster.coordinates.length; i += 2) {
                var x = clickbuster.coordinates[i];
                var y = clickbuster.coordinates[i + 1];
                if (Math.abs(event.clientX - x) < 25 && Math.abs(event.clientY - y) < 25) {
                    event.stopPropagation();
                    event.preventDefault();
                }
            }
        }
    };

    $(document).on('click', clickbuster.onClick);

    var handler = function(event) {
        event.stopPropagation();

        var that = this;
        that.fastclick = {
            touchmove : function(event) {
                if (Math.abs(event.originalEvent.touches[0].clientX - that.fastclick.startX) > 10 ||
                Math.abs(event.originalEvent.touches[0].clientY - that.fastclick.startY) > 10) {
                    that.remove();
                }

            },
            remove : function() {
                $(this).off('touchend.fastclick', that.fastclick.touchend);
                $(this).off('click.fastclick', that.fastclick.remove);
                $.off('touchmove.fastclick', that.fastclick.touchmove);
                delete that.fastclick;
            },
            touchend: function(event) {
                $(that).trigger('click');
                clickbuster.preventGhostClick(that.fastclick.startX, that.fastclick.startY);
            }
        };
                

        $(this).on({
            'touchend.fastclick': this.touchend,
            'click.fastclick': this.remove
        });

        $(document).on('touchmove.fastclick', this.touchmove);

        that.fastclick.startX = event.originalEvent.touches[0].clientX;
        that.fastclick.startY = event.originalEvent.touches[0].clientY;
    };
})(jQuery);
