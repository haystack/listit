/*globals Components: false*/
(function(L) {
  'use strict';
  var loginManager, LoginInfo;
  try {
    loginManager = Components.classes["@mozilla.org/login-manager;1"]
    .getService(Components.interfaces.nsILoginManager);
    LoginInfo = new Components.Constructor(
      "@mozilla.org/login-manager/loginInfo;1",
      Components.interfaces.nsILoginInfo,
      "init");
  } catch (e) {
    debug('Failed to load login manager.');
    return;
  }

  L.models.AuthManager = function() { };

  L.models.AuthManager.prototype = {
    domain: 'chrome://listit',
    realm: 'Token',
    getToken: function(callback) {
      var login = this._getLogin();
      if (login) {
        callback(login.password);
      } else {
        callback();
      }
    },
    setToken: function(token) {
      this.unsetToken();
      loginManager.addLogin(new LoginInfo(this.domain, null, this.realm, '', token, '', ''));
    },
    _getLogin: function() {
      var logins = loginManager.findLogins({}, this.domain, '', '', this.realm);
      if (logins.length > 0) {
        if (logins.length > 1) {
          error("This should never happen.");
        }
        return logins[0];
      }
      return null;
    },
    unsetToken: function() {
      var login = this._getLogin();
      if (login) {
        loginManager.removeLogin(login);
      }
    }
  };
})(ListIt);
