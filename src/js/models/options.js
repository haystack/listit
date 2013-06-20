(function(L) {
    'use strict';
    L.models.Preferences = Backbone.Model.extend({
        defaults: {
            shrinkNotes: true,
            expandVariables: true,
            openHotkey: '',
            notificationTimeout: 5
        },
        /**
         * Specify user settable preferences here. The view will automatically
         * format/display them.
         *
         * Format:
         *   
         *   <var_name>: {
         *     type: '<var_type>'
         *     description: '<var_description>'
         *   }
         *
         * where type is one of: boolean, number, hotkey, text
         **/
        schema: {
            shrinkNotes: {
                type: 'boolean',
                description: 'Collapse Notes' // TODO:Better desc
            },
            /* Not used
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
            */
        },
        // Singleton
        url : '/preferences',
        isNew: function() {
            return false;
        },
        initialized: function() {
            this.on('change', _.mask(this.save), this);
        },
        toggleShrink: function() {
            this.set('shrinkNotes', !this.get('shrinkNotes'));
        }
    });
})(ListIt);
