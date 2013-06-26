/*jshint globalstrict: true*/
/*globals Components: false*/
/*exported EXPORTED_SYMBOLS, AuthManager*/

'use strict';

var EXPORTED_SYMBOLS = ["AuthManager"];

var loginManager = Components.classes["@mozilla.org/login-manager;1"]
                   .getService(Components.interfaces.nsILoginManager);
var LoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
                                           Components.interfaces.nsILoginInfo,
                                           "init");

var domain = 'chrome://listit';
var realm = 'Token';

var getLogin = function() {
  var logins = loginManager.findLogins({}, domain, '', '', realm);
  if (logins.length > 0) {
    if (logins.length > 1) {
      error("This should never happen.");
    }
    return logins[0];
  }
  return null;
};

var getToken = function(callback) {
  var login = getLogin();
  if (login) {
    callback(login.password);
  } else {
    callback();
  }
};

var unsetToken = function() {
  var login = getLogin();
  if (login) {
    loginManager.removeLogin(login);
  }
};

var setToken = function(token) {
  unsetToken();
  loginManager.addLogin(new LoginInfo(domain, null, realm, '', token, '', ''));
};

// Keep the internal rep separate from the exposed interface. No way for the
// outside to mess with us.

var AuthManager = function() { };
AuthManager.prototype = {
  domain: domain,
  getToken: getToken,
  setToken: setToken,
  unsetToken: unsetToken
};

