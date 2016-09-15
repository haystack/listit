/*global chrome: false*/
ListIt.lvent.once("setup:models:after", function(L, barr) {
  'use strict';
  var addnotePages = {};
  L.chrome.ports.addnote = function(port) {
    if (!(port.sender && port.sender.tab)) {
      port.disconnect();
      return;
    }

    var tabId = port.sender.tab.id;
    var addnotePage = addnotePages[tabId];

    if (!addnotePage || addnotePage.port) {
      port.disconnect();
      return;
    }
    addnotePage.port = port;

    port.onMessage.addListener(function(msg) {
      if (addnotePage.outstanding) {
        addnotePage.outstanding = false;
        // Allow cancelling outstanding note with empty message.
        if (msg) {
          L.notebook.createNote(msg);
        }
      }
    });
    port.onDisconnect.addListener(function() {
      delete addnotePages[tabId];
    });
    _.each(addnotePage.pending, function(noteContents) {
      addnotePage.outstanding = true;
      port.postMessage(noteContents);
    });
  };

  // ONLY CALL FROM USER ACTION CALLBACK
  // DEPENDS ON activeTab permission
  L.chrome.appendToCurrentNote = function(contents, fromTabId) {
    contents = contents || "";
    // Try to focus the sidebar
    L.chrome.sidebar.focus(function(succ) {
      if (succ) {
        // If the sidebar was focused (is open), append to the omnibox.
        var text = L.omnibox.get('text', '');
        var trimmedText = _.str.trim(text);
        if (trimmedText !== '' || trimmedText.match(/<br[^>]>$/)) {
          contents = '<br/>'+contents;
        }
        contents += '<br/>';
        L.omnibox.set({text: text+contents});
      } else {
        // Otherwise, open a note in the current tab.
        L.chrome.appendToCurrentNoteDialog(contents, fromTabId);
      }
    });
  };
  L.chrome.appendToCurrentNoteDialog = function(contents, fromTabId) {
    // Allow calling without knowing the current tab id
    if (!fromTabId) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        L.chrome.appendToCurrentNoteDialog(contents, tabs[0].id);
      });
      return;
    }

    var addnotePage = addnotePages[fromTabId];
    if (!addnotePage) {
      addnotePages[fromTabId] = {
        outstanding: false,
        pending: [contents]
      };
      chrome.tabs.insertCSS(fromTabId, {
        code:
          ".listit-iframe {" +
          "display: none; margin: 0 !important; padding: 0 !important;" +
          "border-style: none !important; background-color: transparent !important;" +
          "position: fixed !important; right: 0 !important; bottom: 0 !important;" +
          "z-index: 9001 !important;" +
          "}"
      });

      chrome.tabs.executeScript(fromTabId, {
        code:
          "var iframe = window.document.createElement('iframe');" +
          "iframe.className = 'listit-iframe';" +
          "iframe.height = '300';" +
          "iframe.src = chrome.extension.getURL('addnotebox.html');" +
          "iframe.onload = function() { window.setTimeout(function() { iframe.style['display'] = 'block'; },0) };" + // Prevents flickering.
          "document.body.appendChild(iframe);"
      }, function(results) {
        if (_.isUndefined(results)) {
          delete addnotePages[fromTabId];
        }
      });
    } else if (!addnotePage.port) {
      addnotePage.pending.push(contents);
    } else {
      addnotePage.outstanding = true;
      addnotePage.port.postMessage(contents);
    }
  };
});
