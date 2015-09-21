To install a debugging version of the Firefox extension:

  1. Run `ant debug` in this directory.
  2. Create a file called `listit@welist.it` (don't use another name) with the
     contents `/<absolute/path/to/listit>/debug/firefox/` in your [Firefox
     profile](http://kb.mozillazine.org/Profile_folder_-_Firefox)'s extension
     directory (`<profile>/extensions`).
  3. Restart Firefox and confirm the security warning.

To configure Firefox for extension debugging, see:
https://developer.mozilla.org/en-US/docs/Setting_up_extension_development_environment
