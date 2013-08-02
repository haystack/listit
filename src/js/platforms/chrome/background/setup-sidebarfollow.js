ListIt.lvent.once("setup:views:after", function(L, barr) {
  'use strict';
  var currentSidebarResizer = null;
  
  L.chrome.sidebar.on('open', function(sidebarWindow, mainWindow) {
    if (!L.preferences.get('sidebarTrackWindow')) {
      return;
    }
    var resizing = false;
    var lastResize = Date.now();
    var resizer = function() {
      chrome.windows.get(mainWindow.id, function(newMainWindow) {
        // This can get triggered before it can be turned off.
        try {
          chrome.windows.get(sidebarWindow.id, function(newSidebarWindow) {
            if (!newSidebarWindow) {
              clearInterval(currentSidebarResizer);
              resizing = false;
              return;
            }
            if ( newMainWindow.height   !== mainWindow.height ||
                newMainWindow.left     !== mainWindow.left ||
                  newMainWindow.top      !== mainWindow.top ||
                    newSidebarWindow.width !== sidebarWindow.width
               ) {
                 try {
                   chrome.windows.update(sidebarWindow.id, {
                     top: newMainWindow.top,
                     left: newMainWindow.left - newSidebarWindow.width-10,
                     height: newMainWindow.height
                   }, function(newSidebarWindow) {
                     sidebarWindow = newSidebarWindow;
                   });
                 } catch (e) {
                   clearInterval(currentSidebarResizer);
                   resizing = false;
                   return;
                 }

                 mainWindow = newMainWindow;

                 lastResize = Date.now();
                 if (!resizing) {
                   debug('Fast sidebar tracking ON');
                   resizing = true;
                   clearInterval(currentSidebarResizer);
                   currentSidebarResizer = setInterval(resizer, 10);
                 }
               } else if (resizing && lastResize + 500 < Date.now()) {
                 debug('Fast sidebar tracking OFF');
                 resizing = false;
                 clearInterval(currentSidebarResizer);
                 currentSidebarResizer = setInterval(resizer, 500);
               }
          });
        } catch (e) {
          clearInterval(currentSidebarResizer);
          resizing = false;
          return;
        }
      });
    };
    currentSidebarResizer = setInterval(resizer, 500);
  });

  L.chrome.sidebar.on('close', function() {
    if (currentSidebarResizer) {
      clearInterval(currentSidebarResizer);
    }
  });
});
