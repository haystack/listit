
(function(L) {
    'use strict';
    // Setup views
    $(document).ready(function() {
        L.vent.trigger('setup:views:before');
        var optionsPanes = [
                new L.make.account.AccountView({model: L.account}),
                new L.make.options.InfoView(),
                new L.make.options.SettingsView({model: L.options}),
                new L.make.options.ImportExportView()
            ],
            mainPanes = {
                'controls-left': new L.make.omnibox.OmniboxView({model: L.omnibox}),
                'controls-right': new L.make.omnibox.ControlsView(),
                'content-container': new L.make.notes.NoteCollectionView({collection: L.sidebar})
            };

        // Make Pages
        L.pages  = {
            main : new L.make.main.MainPageView({panels: mainPanes}),
            options : new L.make.options.OptionsPageView({panels: optionsPanes})
        };

        // Render Pages
        $('body').append(_.map(L.pages, function(p) {return p.render().el;}));

        // Why can't we have a css `height: fill;` attribute.
        // Don't need to debounce (cost(debounce) ~ cost(fix_size)).
        L.fixSize = function() {
            $('.page:visible').each(function() {
                $(this).children('.contents').height($(window).height() - $(this).children('.header').height());
            });
        };
        $(window).resize(L.fixSize);
        // Put at the bottom of the call stack to wait for rendering.
        setTimeout(L.fixSize, 1);
        $(window).one('beforeunload', function() {
            window.beforeunloadfired = true;
        });
        $(window).one('unload', function() {
            // Fake beforeunload for browsers that don't support it.
            if (!window.beforeunloadfired) {
                $(window).trigger('beforeunload');
                window.beforeunloadfired = true;
            }
            L.vent.trigger('sys:window-closed', window);
        });

        // Open links in a new tab without accidentally modifying notes.
        $(document).on('click', 'a', function(e) {
            var $el = $(this),
            href = $el.attr('href');

            if (!href ||
                href === '' ||
                href[0] === '#' ||
                $el.attr('target') ||
                _.str.startsWith(href, 'javascript')) {
                return;
            }

            window.open(href, '_blank');
            e.preventDefault();
        });


        L.router = new L.make.Router();

        $(window).one('beforeunload', function() {
            L.vent.trigger('sys:quit');
        });

        Backbone.history.start();

        L.vent.trigger('setup:views setup:views:after');
    });
})(ListIt);
