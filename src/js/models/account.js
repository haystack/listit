(function(L) {
    'use strict';
    L.models.Account = Backbone.Model.extend({
        initialize: function() {
            this.fetch();
            this.listenTo(this, 'change', _.mask(this.save), this);
        },
        // Singleton
        url: '/account',
        isNew: function() {
            return false;
        },
        defaults : {
            mode: 'login',
            email: ''
        },
        login: function(email, password) {
            var hashpass = L.util.makeHashpass(email, password);
            var that = this;
            L.server.validateUser(hashpass, {
                success: function() {
                    that.set({
                        email: email,
                        mode: 'connected'
                    });
                    L.authmanager.setToken(hashpass);
                },
                error: function(jqXHR) {
                    that.set('mode', 'login');
                    if (jqXHR.status === 401) {
                        that.set('error', 'Invalid email or password.');
                    } else {
                        that.set('error', 'Connection Error.');
                    }
                }
            });
        },
        register: function(email, password, couhes) {
            var that = this;
            L.server.registerUser(email, password, couhes, {
                success: function() {
                    that.set({
                        mode: 'connected',
                        email: email
                    });
                    L.authmanager.setToken(L.util.makeHashpass(email, password));
                },
                error: function() {
                    that.set('mode', 'register');
                    // TODO: better error
                    that.set('error', 'Failed to register user.');
                }
            });
        }
    });
})(ListIt);
