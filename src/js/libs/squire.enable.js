( function(win, doc) {
  // alternative to DOMContentLoaded event
  document.addEventListener("DOMContentLoaded", function(event) {
    window.editor = new Squire( document );
  });
}() );
