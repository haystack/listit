(function(L) {
    'use strict';
    L.views.ServerView = Backbone.View.extend({
        // View constants to be passed to the template.
        constants: {
            passwordValidationPattern : '(?=.*[0-9])(?=.*[a-z])(?=.*[A-Z]).{8,}'
        },
        // Define the modes declaritevly
        id: 'options-login',
        className: 'options-item', // TODO:Change
        events: {
            'submit #loginForm': 'submitLoginForm',
            'submit #logoutForm': 'doLogout',
            'click #loginButton': 'doLogin',
            'click #cancelButton': 'showLoginForm',
            'click #registerButton': 'showRegisterForm',
            'click #createAccountButton': 'doRegister',
            'change #pw1': 'passwordUpdated',
            'keyup #pw1': 'passwordUpdated',
            'focus .field' : 'setFocus'
        },
        setFocus: function(ev) {
            this._focused = $(ev.target);
        },
        initialize: function() {
            var that = this;
            $(window).one('beforeunload', function() {
                that.undelegateEvents();
                that.stopListening();
            });
            this.listenTo(this.model, 'change:error', _.mask(this.updateError, 1));
            this.listenTo(this.model, 'change:registered', _.mask(this.updateRegistered, 1));
            this.listenTo(this.model, 'change:email', _.mask(this.updateEmail, 1));
        },
        updateRegistered: function(registered) {
          var shown, hidden;
          if (registered) {
            hidden = this.$('#loginForm');
            shown = this.$('#logoutForm');
          } else {
            hidden = this.$('#logoutForm');
            shown = this.$('#loginForm');
          }
          hidden.fadeOut(function() {
            hidden.hide();
            shown.show().fadeIn();
          });
        },
        render: function() {
            this.$el.html(L.templates["options/server"](_.defaults(this.model.toJSON(), this.constants)));
            this.setMode('login');
            this.updateRegistered(this.model.get('registered'));
            return this;
        },

        // Event handlers
        passwordUpdated: function(el) {
            // Set second password field validation pattern.
            this.$('#pw2').attr('pattern', el.target.value);
        },
        showRegisterForm : function() {
            this.setMode('register');
        },
        showLoginForm : function() {
            this.setMode('login');
        },
        submitLoginForm : function() {
          switch(this.mode) {
            case 'login':
              this.doLogin();
              break;
            case 'register':
              this.doRegister();
              break;
            default:
              throw new Error("Invalid Mode");
          }
        },
        doRegister : function() {
            if (this.getPassword() !== this.getPassword2()) {
                this.model.set('error', 'Passwords do not match.');
                return false;
            }
            L.server.register(this.getUsername(), this.getPassword(), this.getParticipate());
            return false;
        },
        doLogin : function() {
            L.server.login(this.getUsername(), this.getPassword());
            return false;
        },
        doLogout : function() {
            this.model.logout();
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
        updateError: function(error) {
            if (error) {
                this.$('#formStatus').text(error).fadeIn();
            } else {
                this.$('#formStatus').fadeOut(function() {$(this).text('');});
            }
        },
        setMode: function(mode) {
            if (this.mode === mode) {
              return;
            } else {
              this.mode = mode;
            }
            // Find fields to be shown and hidden.
            // modal fields are toggled based on their mode-* fields
            var shown = this.$el.find('.modal.mode-'+mode);
            var hidden = this.$el.find('.modal:not(.mode-'+mode+')');
            var that = this;

            // Slide
            // Disable/enable fields to disable validation.
            if (this._rendered) {
                shown.enableFields();
                L.util.slideSwitch(hidden, shown, function() {
                    hidden.disableFields();
                    //Refocus
                    if (that._focused) {
                        if (that._focused.is(':visible')) {
                            that._focused.focus();
                        } else {
                            that._focused = that.$el.find('.field:first:visible');
                            that._focused.focus();
                        }
                    }
                });
            } else {
                shown.enableFields().show();
                hidden.disableFields().hide();
            }

            // Used for css selectors.
            this.$el.attr('data-mode', mode);
        }
    });
})(ListIt);
