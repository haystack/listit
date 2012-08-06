"use strict";

L.make.notes.NoteView = Backbone.View.extend({
    tagName: 'li',
    className: 'note',
    initialize: function() {
        _(this).bindAll();
        var that = this;
        $(window).one('beforeunload', function() {
            that.undelegateEvents();
            that.model.off(null, null, that);
        });
        this.template = L.templates.notes.note;
        this.className = 'note';
        this.model.on('change:contents', _.mask(this.updateContents, 2), this);
        this.model.on('change:meta', _.mask(this.updateMeta, 2), this);
    },
    remove : function(options) {
        if (this._rendered) {
            var el = this.$el;
            if ((options && options.action) === "delete") {
                el.stop().fadeOut({queue: false}, 200).slideUp(300, function() {
                    el.remove();
                });
            } else {
                el.remove();
            }
        }
    },
    isVisible: function() {
        // This assumes that el having a parent means that it is visible. Much
        // faster than checking $el.is(':visible') and speed is important here.
        return this.el && this.el.parentNode;
    },
    render: function(options) {
        var action = options && options.action;
        if (action === "new") {
            this.$el.bind('DOMNodeInserted', function() {
                var that = $(this);
                that.hide();
                setTimeout(function() {
                    that.stop().hide().fadeIn({queue: false}, 200).hide().slideDown(300);
                }, 1);
            });
        }
        if (this._rendered) {
            this.undelegateEvents();
            this.delegateEvents();
            return this;
        }
        this._rendered = true;

        this.updateContents();
        this.updateMeta();

        // Fade in new notes.
        return this;
    },
    updateMeta: function(options) {
        this.$el.attr("class", this.className);
        if (this.model.get('meta').pinned) this.$el.addClass("pinned");
    },
    updateContents: function(options) {
        this.$el.html(this.template(this.model.toJSON()));
    },
    events: {
        "focusin .contents": "handleFocus_",
        "focusout .contents": "handleBlur_",
        'click .close-btn': 'removeNote',
        'click .contents': 'handleClick_',
        'keyup .contents': 'handleKeyUp_',
        'keypress .contents': 'handleKeyPress_'
    },
    getNoteText: function() {
        return this.$('.contents').html();
    },

    removeNote: function() {
        this.model.moveTo(L.deletedNotes, {action: "delete"});
    },
    expand: function() {
        this.$el.css("height", 'auto');
    },
    collapse: function() {
        this.$el.css("height", '');
    },
    handleClick_: function(e) {
        if (e.target.href) return;
        this.$el.find('.contents').focus();
    },
    handleFocus_: function() {
        this.expand();
        this.$el.find('.contents').get()[0].contentEditable = true;
        this.$el.addClass('focus');
        $("#notes-container").scrollIntoView(this.$el);
        var contents = this.model.get('contents'); 
        L.log(LogType.NOTE_EDIT, {
                noteid: this.model.get('jid'),
                pinned: (contents.length > 0 && contents[0] === '!')
            });
    },
    handleBlur_: function() {
        this.collapse();
        this.$el.removeClass('focus');
        this.$el.find('.contents').get()[0].contentEditable = false;
        var newContents = this.getNoteText();

        if (newContents !== this.model.get('contents')) {
            this.model.changeContents(newContents);
        }
    },
    /**
    * Scroll List so note selected with tab is at top.
    */
    handleKeyUp_: function(event) {
        if (event.keyCode === 9) { // TAB
            event.target.scrollIntoView();
            $('#notes-container')[0].scrollTop -= 4;
        }
    },
    /**
    * Save note on shift-enter, without extra line.
    */
    handleKeyPress_: function(event) {
        if (event.shiftKey && event.keyCode === 13) {
            event.target.blur();
            event.preventDefault();
        }
    },
    openLink: function() {
        debug('READY');
        L.openLinkTimer = setTimeout(function () {
            debug('FIRE');
            window.open(this.model.get('meta').fullURL);
        }, 50);
    },
    /**
    * Show Dot/Pin and Delete Icon when note is moused over.
    */
    showIcons_: function(event) {
        this.$('.xIcon').css('display', '');
        //$('.note').live('hover', function(event) {window.e = event;  $('img', e.currentTarget).css('display', '')})
    },
    hideIcons_: function(event) {
        if (!this.model.get('focused')) {
            var that = this;
            setTimeout(function() {
                that.$('.xIcon').css('display', 'none');
            }, 60);
        }
    }
});

L.make.notes.NoteCollectionView = Backbone.View.extend({
    tagName: "div",
    id: "notes-container",
    className: "container scroll",
    defaults: {
        noteHeight: '1.3em', //L.base.oneLineHeight, //'1.2em',
        lastFocusedNote: null
    },
    initialize: function() {
        _(this).bindAll(); // Maintain ref to this.
        var that = this;
        this.subViews = {}; // Note views
        this.delayedRemove = {}; // Delay removes to prevent flickering.
        this.collection.on('add', _.mask(this.add, 0, 2), this);
        this.collection.on('remove', _.mask(this.remove, 0, 2), this);
        this.collection.on('reset', _.mask(this.reset, 1), this);
        this.collection.on('search:paused', this._onPause, this);
        L.options.on("change:shrinkNotes", this.updateNoteShrinkState, this);
        $(window).one('beforeunload', function() {
            that.undelegateEvents();
            that.collection.off(null, null, that);
            L.options.off(null, null, that);
        });
    },
    events: {
        'scroll': 'onScroll'
    },
    updateNoteShrinkState : function(model, state) {
        if (!this._rendered) return;

        if (state) {
            this.$el.addClass("shrink");
        } else {
            this.$el.removeClass("shrink");
        }
    },
    onScroll: function() {
        // Load on scroll.
        if ((this.$el.scrollTop() + 2*this.$el.parent().height()) > this.$el.children('#notes').height()) {
            this.collection.next();
        }
    },
    add: function(note, options) {
        clearTimeout(this.delayedRemove[note.id]);
        // Create the view iff it doesn't exist.
        var view = this.subViews[note.id];
        if (!view) {
            view = this.subViews[note.id] = new L.make.notes.NoteView({model: note});
        }
        if (!this._rendered || view.isVisible()) return;

        // XXX: BUG: options.index incorrect. Calculate manually.
        var index = this.collection.indexOf(note);
        var otherEl = this.$el.children('#notes').find('.note').eq(index);
        if (otherEl.length === 0) {
            this.$el.children('#notes').append(view.render().$el);
        } else {
            otherEl.before(view.render().$el);
        }
        // Stop loading if we have enough notes.
        // I put this after the isVisible check so that I don't count loaded
        // notes. This could be changed.
    },
    _onPause: function() {
        if ((this.$el.scrollTop() + 2*this.$el.parent().height()) > this.$el.children('#notes').height()) {
            this.collection.next();
        }
    },
    // Delay removes just in case we are re-adding the note.
    remove: function(note, options) {
        var id = note.id || note;
        clearTimeout(this.delayedRemove[id]);
        try {
            this.delayedRemove[id] = setTimeout(_.bind(this._remove, this, note, options), 50);
        } catch (e) {
            this._remove(note, options);
        }
    },
    _remove: function(note, options) {
        var id = note.id || note;
        var view = this.subViews[id];
        if (!view || !this._rendered) return;
        view.remove(options);
        // This is necessary as removes are delayed.
        if ((this.$el.scrollTop() + 2*this.$el.parent().height()) > this.$el.children('#notes').height()) {
            this.collection.next();
        }
    },
    reset: function() {
        if (!this._rendered) return;
        //this.$el.children('#notes').empty();
        for (var k in this.subViews) {
            this.remove(k);
        }
        this.collection.each(_.mask(this.add, 0));
    },
    render: function() {
        if (!this._rendered) {
            this._rendered = true;
            this.updateNoteShrinkState(L.options, L.options.get("shrinkNotes"));
            this.$el.html(this.make('ul', {'class': 'notelist', 'id': 'notes'}));
        }
        this.collection.reset();
        return this;
    }
});
