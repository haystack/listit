/*global chrome: false*/
(function(L) {
  'use strict';

  L.chrome.views.ContextMenu = function() {
    var that = this;
    this.menuIds = _.kmap(this.menus, function(m) {
      m = _.clone(m);
      _.each(_.functions(m), function(f) {
        m[f] = _.bind(m[f], that);
      });
      return chrome.contextMenus.create(m);
    });
  };
  L.chrome.views.ContextMenu.prototype = {
    menus: {
      page: {
        title: 'Add to List.it (page)',
        contexts: ['page'],
        onclick: function(info, tab) {
          L.notebook.createNote({
            contents: this.mkLink(info.pageUrl, tab.title)
          });
        }
      },
      link: {
        title: 'Add to List.it (link)',
        contexts: ['link'],
        onclick: function(info, tab) {
          L.notebook.createNote({
            contents: this.mkLink(info.linkUrl, info.linkUrl)
          });
        }
      },
      image: {
        title: 'Add to List.it (image)',
        contexts: ['image'],
        onclick: function(info, tab) {
          this.mediaHandler(info.pageUrl, tab.title, 'img', info.srcUrl);
        }
      },
      video: {
        title: 'Add to List.it (video)',
        contexts: ['video'],
        onclick: function(info, tab) {
          this.mediaHandler(info.pageUrl, tab.title, 'video', info.srcUrl);
        }
      },
      audio: {
        title: 'Add to List.it (audio)',
        contexts: ['audio'],
        onclick: function(info, tab) {
          this.mediaHandler(info.pageUrl, tab.title, 'audio', info.srcUrl);
        }
      },
      text: {
        title: 'Add to List.it (plain text)',
        contexts: ['selection'],
        onclick: function(info, tab) {
          L.notebook.createNote({
            contents: this.mkLink(info.pageUrl, tab.title) + '<br />' + _.str.escapeHTML(info.selectionText)
          });
        }
      },
      html: {
        title: 'Add to List.it (raw html)',
        contexts: ['selection'],
        onclick: function(info, tab) {
          L.notebook.createNote({
            contents: this.mkLink(info.pageUrl, tab.title) + '<br />' + info.selectionText
          });
        }
      }
    },
    mediaHandler: function(url, title, tag, src) {
      L.notebook.createNote({
        contents: this.mkLink(url, title)+'<br />'+this.mkMedia(tag, src)
      });
    },
    mkMedia: function(tag, src) {
      return '<'+tag+ ' controls="controls" src="'+src+'"/>';
    },
    mkLink: function(url, title) {
      return '<a target="_blank" href="'+url+'">'+title+'</a>';
    }
  };
})(ListIt);
