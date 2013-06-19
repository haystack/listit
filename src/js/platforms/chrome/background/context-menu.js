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
        title: 'Add bookmark to List.it',
        contexts: ['page'],
        onclick: function(info, tab) {
          L.chrome.appendToCurrentNote(L.templates.link({
            url: info.pageUrl,
            title: tab.title,
            icon: tab.favIconUrl
          }), tab.id);
        }
      },
      link: {
        title: 'Add link to List.it',
        contexts: ['link'],
        onclick: function(info, tab) {
          L.chrome.appendToCurrentNote(L.templates.link({
            url: info.linkUrl
          }), tab.id);
        }
      },
      image: {
        title: 'Add image to List.it',
        contexts: ['image'],
        onclick: function(info, tab) {
          this.mediaHandler(tab, info, 'img');
        }
      },
      video: {
        title: 'Add video to List.it',
        contexts: ['video'],
        onclick: function(info, tab) {
          this.mediaHandler(tab, info, 'video');
        }
      },
      audio: {
        title: 'Add audio to List.it',
        contexts: ['audio'],
        onclick: function(info, tab) {
          this.mediaHandler(tab, info, 'audio');
        }
      },
      text: {
        title: 'Add selection to List.it',
        contexts: ['selection'],
        onclick: function(info, tab) {
          L.chrome.appendToCurrentNote(L.templates.blockquote({
            content: L.util.strip(info.selectionText),
            source: L.templates.link({
              url: info.pageUrl,
              title: tab.title,
              icon: tab.favIconUrl
            })
          }), tab.id);
        }
      }
    },
    mediaHandler: function(tab, info, tag) {
      L.chrome.appendToCurrentNote(L.templates.link({
        url: tab.pageUrl,
        title: tab.title,
        icon: tab.favIconUrl
      })+'<br />'+this.mkMedia(tag, info.srcUrl), tab.id);
    },
    mkMedia: function(tag, src) {
      return '<'+tag+ ' controls="controls" src="'+src+'"/>';
    },
  };
})(ListIt);
