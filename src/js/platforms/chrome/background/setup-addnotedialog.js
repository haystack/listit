ListIt.lvent.once("setup:models:after", function(L, barr) {
  var addnote_pages = {};
  L.chrome.ports.addnote = function(port) {
    if (!(port.sender && port.sender.tab)) {
      port.disconnect();
      return;
    }

    var tab_id = port.sender.tab.id;
    var addnote_page = addnote_pages[tab_id];

    if (!addnote_page || addnote_page.port) {
      port.disconnect();
      return;
    }
    addnote_page.port = port;

    port.onMessage.addListener(function(msg) {
      if (addnote_page.outstanding) {
        addnote_page.outstanding = false;
        // Allow cancelling outstanding note with empty message.
        if (msg) {
          L.notebook.createNote(msg);
        }
      }
    });
    port.onDisconnect.addListener(function() {
      delete addnote_pages[tab_id];
    });
    _.each(addnote_page.pending, function(note_contents) {
      addnote_page.outstanding = true;
      port.postMessage(note_contents);
    });
  };

  // ONLY CALL FROM USER ACTION CALLBACK
  // DEPENDS ON activeTab permission
  L.chrome.appendToCurrentNote = function(contents, from_tab_id) {
    contents = contents || "";
    // Try to focus the sidebar
    L.chrome.sidebar.focus(function(succ) {
      if (succ) {
        // If the sidebar was focused (is open), append to the omnibox.
        var text = L.omnibox.get('text', '');
        var trimmed_text = _.str.trim(text);
        if (trimmed_text !== '' || trimmed_text.match(/<br[^>]>$/)) {
          contents = '<br/>'+contents;
        }
        contents += '<br/>';
        L.omnibox.set({text: text+contents});
      } else {
        // Otherwise, open a note in the current tab.
        L.chrome.appendToCurrentNoteDialog(contents, from_tab_id);
      }
    });
  };
  L.chrome.appendToCurrentNoteDialog = function(contents, from_tab_id) {
    // Allow calling without knowing the current tab id
    if (!from_tab_id) {
      chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
        L.chrome.appendToCurrentNoteDialog(contents, tabs[0].id);
      });
      return;
    }

    var addnote_page = addnote_pages[from_tab_id];
    if (!addnote_page) {
      addnote_pages[from_tab_id] = {
        outstanding: false,
        pending: [contents]
      };
      chrome.tabs.insertCSS(from_tab_id, {
        code:
          ".listit-iframe {" +
          "display: none; margin: 0 !important; padding: 0 !important;" + 
          "border-style: none !important; background-color: transparent !important;" +
          "position: fixed !important; right: 0 !important; bottom: 0 !important;" +
          "z-index: 9001 !important;" +
          "}"
      });

      chrome.tabs.executeScript(from_tab_id, {
        code:
          "var iframe = window.document.createElement('iframe');" +
          "iframe.className = 'listit-iframe';" +
          "iframe.height = '300';" +
          "iframe.src = chrome.extension.getURL('addnotebox.html');" +
          "iframe.onload = function() { window.setTimeout(function() { iframe.style['display'] = 'block'; },0) };" + // Prevents flickering.
          "document.body.appendChild(iframe);"
      });
    } else if (!addnote_page.port) {
      addnote_page.pending.push(contents);
    } else {
      addnote_page.outstanding = true;
      addnote_page.port.postMessage(contents);
    }
  };
});
