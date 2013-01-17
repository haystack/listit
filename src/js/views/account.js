(function(L) {
    'use strict';
    L.views.AccountView = Backbone.View.extend({
        // View constants to be passed to the template.
        constants: {
            passwordValidationPattern : '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}'
        },
        // Define the modes declaritevly
        id: 'options-login',
        className: 'options-item', // TODO:Change
        events: {
            'click #loginButton': 'loginButtonClicked',
            'click #cancelButton': 'cancelButtonClicked',
            'click #registerButton': 'registerButtonClicked',
            'click #createAccountButton': 'createAccountButtonClicked',
            'click #logoutButton': 'logoutButtonClicked',
            'change #pw1': 'passwordUpdated',
            'keyup #pw1': 'passwordUpdated',
            'focus .field' : 'setFocus'
        },
        setFocus: function(ev) {
            this._focused = $(ev.target);
        },
        initialize: function() {
            _(this).bindAll();
            var that = this;
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                that.stopListening();
            });
            this.listenTo(this.model, 'change:mode', _.mask(this.setMode, 1));
            this.listenTo(this.model, 'change:error', _.mask(this.setError, 1));
            this.listenTo(this.model, 'change:email', _.mask(this.updateEmail, 1));
        },
        render: function() {
            this.$el.html(L.templates["options/account"](_.defaults(this.model.toJSON(), this.constants)));
            this.setMode(this.model.get('mode'));
            this._rendered = true;

            return this;
        },

        // Event handlers
        passwordUpdated: function(el) {
            // Set second password field validation pattern.
            this.$('#pw2').attr('pattern', el.target.value);
        },
        registerButtonClicked : function() {
            this.model.set('mode', 'register');
        },
        cancelButtonClicked : function() {
            this.model.set('mode', 'login');
        },
        logoutButtonClicked : function() {
            this.model.set('mode', 'login');
        },
        createAccountButtonClicked : function() {
            if (this.getPassword() !== this.getPassword2()) {
                this.model.set('error', 'Passwords do not match.');
                return false;
            }
            L.account.register(this.getUsername(), this.getPassword(), this.getPassword());
            return false;
        },
        loginButtonClicked : function() {
            L.account.login(this.getUsername(), this.getPassword(), this.getParticipate());
            return false;
        },

        // Field Getters
        getUsername: function() { return this.$('#email').val(); },
        getPassword: function() { return this.$('#pw1').val(); },
        getPassword2: function() { return this.$('#pw2').val(); },
        getParticipate : function() { return this.$('#participate').val() === 'on'; },

        // Render updates
        updateEmail : function(email) {
            this.$('#emailDisplay').text(email);
        },
        setError: function(error) {
            if (error) {
                this.$('#formStatus').text(error).fadeIn();
            } else {
                this.$('#formStatus').fadeOut(function() {$(this).text('');});
            }
        },
        setMode: function(mode) {
            // Find fields to be shown and hidden.
            // modal fields are toggled based on their mode-* fields
            var shown = this.$el.find('.modal.mode-'+mode);
            var hidden = this.$el.find('.modal:not(.mode-'+mode+')');

            // Slide
            // Disable/enable fields to disable validation.
            if (this._rendered) {
                shown.enableFields();
                L.util.slideSwitch(hidden, shown, _.bind(function() {
                    hidden.disableFields();
                    //Refocus
                    if (this._focused) {
                        if (this._focused.is(':visible')) {
                            this._focused.focus();
                        } else {
                            this._focused = this.$el.find('.field:first:visible');
                            this._focused.focus();
                        }
                    }
                }, this));
            } else {
                shown.enableFields().show();
                hidden.disableFields().hide();
            }

            // Used for css selectors.
            this.$el.attr('data-mode', mode);
        }
    });
})(ListIt);
