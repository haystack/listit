/*global chrome:true */
window.background = chrome.extension.getBackgroundPage();
window.console = window.background.console;
