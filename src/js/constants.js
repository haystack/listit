// The features array
(function() {
  'use strict';
  window.Features = {
    /********
     * Text *
     ********/

    // Date
    TEXT_TODAY: 101,        // Date in text matched today
    TEXT_TOMORROW: 102,     // Date in text matched tomorrow

    // Search
    TEXT_SEARCH: 103,       // Text matches search filter

    // Web
    TEXT_WEBSITE: 104,      // Text matches website (url)
    TEXT_DOMAIN: 105,       // Text matches website (domain)

    // Location
    TEXT_LOCATION: 106,     // The text mentiones this location

    /********
     * Date *
     ********/

    // Date
    DATE_DAY: 201,          // Note created on this day of the week
    DATE_HOUR: 202,         // Note created at this hour


    /********
     * Meta *
     ********/

    // Website
    META_URL: 301,          // Note was created while viewing this url
    META_DOMAIN: 302,       // Note was created while on this domain

    // Flags
    META_IMPORTANT: 303,    // Important flag set

    META_LOCATION: 304      // Near where the note was taken.
  };

  window.Constants = {
    MAX_VALUE: -Number.MAX_VALUE.toFixed(0) // toFixed makes this work with floats... Probabbly buggy
  };


  window.KeyCode = {
    ENTER: 13, ESC: 27, BS: 8, TAB: 9, DEL:46,
    A: 65, B: 66, C: 67, D: 68, E: 69, F: 70, G: 71, H: 72, I: 73, J: 74, K: 75, L: 76, M: 77,
    N: 78, O: 79, P: 80, Q: 81, R: 82, S: 83, T: 84, U: 85, V: 86, W: 87, X: 88, Y: 89, Z: 90
  };

  // All Logs Record
  // when INT - Date.now()
  // action TEXT - ie: db.Logs.LogType.SIDEBAR_OPEN
  // tabid INT - The unique identifier for the tab list-it is open in (for chrome ext only)
  // noteid INT - Optional: Note action is related to, if any.
  // info TEXT - json blob for action specific info
  window.LogType = {
    // Sidebar Interaction:
    SIDEBAR_OPEN: 'sidebar-open',
    // url Text - The url of last focused page (for ext only)
    // method Text - 'hotkey', 'browserAction'

    SIDEBAR_CLOSE: 'sidebar-close',
    // url Text - The url of last focused page (for ext only)
    // method Text - 'hotkey', 'browserAction'


    // Sidebar Opened & Note Creation box was auto-focused
    CREATE_AUTOFOCUS: 'create-autofocus',

    // Note Create Box Focuses:
    CREATE_FOCUS: 'create-focus',
    // tabid
    // url



    CREATE_SAVE: 'create-save', // info: click save button or shift-enter?
    // noteid
    // tabid
    // url text - The url of the last focused page (for ext only)
    // contents - The text of the note.
    // pinned boolean - If note is pinned.

    CREATE_CLEAR: 'create-clear',

    // Note Interaction:
    NOTE_EDIT: 'note-edit', // Note in list is selected
    // noteid int - The note's jid.
    // pinned boolean - True if selected note is pinned.

    NOTE_SAVE: 'note-save',
    // noteid int - The note's jid
    // pinned boolean - True if saved note is pinned.
    // url text - The url of the last focused page (for ext only)

    NOTE_DELETE: 'note-delete',
    // noteid int - The note's jid
    // pinned boolean - True if saved note is pinned.
    // url text - The url of the last focused page (for ext only)



    // Search Interaction
    SEARCH: 'search',
    // url Text - The url of the last focused page (for ext only)
    // terms Text - The search string
    // noteids List[int] - List of noteids matching search

    SEARCH_CLEAR: 'search-clear',


    // Note List Interaction:
    //ORDER_CHANGE: 'order-change',

    // Options Page Interaction:
    LOGIN: 'login',
    LOGOUT: 'logout',

    // Special Commands:
    EXPAND: 'expand',
    // url text - The url of the last focused page (for ext only)
    SHRINK: 'shrink',
    // url text - The url of the last focused page (for ext only)

    BOOKMARK_OPEN: 'bookmark-open'
    // url text - The url the bookmark holds.

  };
})();
