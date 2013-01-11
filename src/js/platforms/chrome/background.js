/*global chrome:true */
// Proxy background events.

(function(L) {
    'use strict';

    $(window).one('beforeunload', function() {
        L.vent.trigger('sys:quit');
    });
    L.chrome = {
      views: {},
      models: {}
    };
    L.chrome.views.ChromeOmniboxView = Backbone.ChromeOmniboxView.extend({
        collection: L.chrome.omnibox,
        initialize: function() {
            this.collection.on('add remove reset', _.debounce(this.update, 100), this);
        },
        defaultSuggestion: 'Add Note: <match>%s</match>',
        events : {
            'change': 'onChange',
            'start': 'onStart',
            'cancel': 'onCancel',
            'submit': 'onSubmit'
        },
        onChange: function(text, suggest) {
            this.collection.stop();
            this.suggest = suggest;
            this.filter(text);
        },
        filter: _.debounce(function(text) {
            this.collection.search(text);
        }, 50),
        onStart: function() {
            this.collection.reset();
        },
        onCancel: function() {
            this.collection.reset();
        },
        onSubmit: function(text) {
            L.addNote(text, {});
        },
        update: function() {
            if (!this.suggest) {
                return;
            }

            var terms = this.collection._terms;

            this.suggest(this.collection.map(function(note) {
                var text = L.util.clean(note.get('contents'));
                var plain = text;
                var lower = text.toLowerCase();
                // TODO: there is probably a better wya to do this.
                if (terms) {
                    _.each(terms.positive, function(t) {
                        var i = lower.indexOf(t);
                        if (i >= 0) {
                            text = _.str.insert(
                                text,
                                i+t.length,
                                '</match>'
                            );
                            text = _.str.insert(
                                text,
                                i,
                                '<match>'
                            );
                            // Modify lower so that indexof works.
                            lower = _.str.insert(
                                lower,
                                i+t.length,
                                '</match>'
                            );
                            lower = _.str.insert(
                                lower,
                                i,
                                '<match>'
                            );
                        }
                    });
                }
                return {
                    content: plain,
                    description: text
                };
            }));
        }
    });

    L.chrome.omnibox = new L.models.FilterableNoteCollection();
    L.chrome.omniboxView = new L.chrome.views.ChromeOmniboxView({collection: L.chrome.omnibox});

    L.chrome.ContextMenu = function() {
        var that = this;
        this.menuIds = _.kmap(this.menus, function(m) {
            m = _.clone(m);
            _.each(_.functions(m), function(f) {
                m[f] = _.bind(m[f], that);
            });
            return chrome.contextMenus.create(m);
        });
    };
    L.chrome.ContextMenu.prototype = {
        menus: {
            page: {
                title: 'Add to List.it (page)',
                contexts: ['page'],
                onclick: function(info, tab) {
                    L.addNote(this.mkLink(info.pageUrl, tab.title));
                }
            },
            link: {
                title: 'Add to List.it (link)',
                contexts: ['link'],
                onclick: function(info, tab) {
                    L.addNote(this.mkLink(info.linkUrl, info.linkUrl));
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
                    L.addNote(this.mkLink(info.pageUrl, tab.title) + '<br />' + _.str.escapeHTML(info.selectionText));
                }
            },
            html: {
                title: 'Add to List.it (raw html)',
                contexts: ['selection'],
                onclick: function(info, tab) {
                    L.addNote(this.mkLink(info.pageUrl, tab.title) + '<br />' + info.selectionText);
                }
            }
        },
        mediaHandler: function(url, title, tag, src) {
            L.addNote(this.mkLink(url, title)+'<br />'+this.mkMedia(tag, src));
        },
        mkMedia: function(tag, src) {
            return '<'+tag+ ' controls="controls" src="'+src+'"/>';
        },
        mkLink: function(url, title) {
            return '<a target="_blank" href="'+url+'">'+title+'</a>';
        }
    };

    L.chrome.contextMenu = new L.chrome.ContextMenu();
})(ListIt);
