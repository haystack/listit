(function(L) {
    'use strict';
    L.make.options.OptionsModel = Backbone.Model.extend({
        defaults: {
            shrinkNotes: true,
            expandVariables: true,
            openHotkey: '',
            notificationTimeout: 5,
            toolbarItems: [
                'mode',
                'bold',
                'italic',
                'underline',
                'foreground',
                'link'
            ]
        },
        // Specify user settable options here. The view will automatically
        // format/display them.
        options: {
            shrinkNotes: {
                type: 'boolean',
                description: 'Collapse Notes' // TODO:Better desc
            },
            expandVariables: {
                type: 'boolean',
                description: 'Expand variables' // TODO: Add help.
            },
            openHotkey: {
                type: 'hotkey',
                description: 'Open Hotkey'
            },
            notificationTimeout: {
                type: 'number',
                description: 'Notification Timeout (s)'
            }
        },
        // Singleton
        url : '/options',
        isNew: function() {
            return false;
        },
        initialize: function() {
            this.fetch();
            this.on('change', this.save, this);
        },
        toggleShrink: function() {
            this.set('shrinkNotes', !this.get('shrinkNotes'));
        }
    });
})(ListIt);
