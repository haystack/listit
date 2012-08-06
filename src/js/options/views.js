"use strict";

L.make.options.SettingsView = Backbone.View.extend({
    id: "options-settings",
    className: "options-item",
    events: { },
    initialize: function() {
        _(this).bindAll();
        var that = this;
        $(window).one('beforeunload', function() {
            that.model.off(null, null, that);
            that.undelegateEvents();
        });
        _.each(this.model.options, function(o,n) {
            var set_view, set_model;
            var sel = "#"+n+"Field";
            var evt = "change";
            switch(o.type) {
                case "hotkey":
                    evt = "hotkey-changed";
                    break;
                case "boolean":
                    set_view = function(m, v) {
                        if (v) {
                            that.$el.find(sel).attr('checked', 'checked');
                        } else {
                            that.$el.find(sel).removeAttr('checked');
                        }
                    };
                    set_model = function() {
                        that.model.set(n, that.$el.find(sel).is(":checked"));
                    };
                    break;
                case "number":
                    set_model = function() {
                        that.model.set(n, Number(that.$el.find(sel).val()));
                    };
                    break;
            }

            if (!set_view) {
                set_view = function(m, v) {
                    that.$el.find(sel).val(v);
                };
            }

            if (!set_model) {
                set_model = function() {
                    that.model.set(n, that.$el.find(sel).val());
                };
            }

            that.events[evt+" "+sel] = set_model;
            that.model.on("change:"+n, set_view);
        });
        this.delegateEvents();
        $(".hotkey-field").hotkeyinput();
    },
    render: function() {
        var that = this;
        var opts = _.map(this.model.options, function(o, n) {
            return {
                name: n,
                value: that.model.get(n),
                description: o.description,
                type: o.type,
                attrs: _.reduce(o.attrs||{}, function(p, v, k) {
                    return p + " " + k + "='" + v + "'";
                }, "")
            };
        });
        this.$el.html(L.templates.options.settings({options: opts}));
        return this;
    },
    openHotkeyChanged: function(evt) {
        this.model.set("openHotkey", this.$("#openHotkey").val());
    },
    shrinkToggled: function(evt) {
        this.model.set("shrinkNotes", this.$("#shrink").val());
    }
});

/**
 * @filedesc View for column of options (sync/options/shrink+expand).
 *
 * @author: wstyke@gmail.com - Wolfe Styke
 */

L.make.options.OptionsPageView = Backbone.View.extend({
    id: "page-options",
    className: "page",
    initialize: function(options) {
        this.panels = _.isArray(options.panels) ? options.panels : [];
    },
    render: function() {
        this.$el.html(L.templates.options.page());
        var body = this.$('#options-body');

        _(this.panels).each(function(panel) {
            body.append(panel.render().el);
        });
        return this;
    }
});

L.make.options.InfoView = Backbone.View.extend({
    id: "options-info",
    className: "options-item", // TODO:Change
    render: function() {
        this.$el.html(L.templates.options.info(this.info));
        return this;
    },
    info : {
        tips: [
            'Open and close list.it by clicking on the <img alt="list-it" ' +
                'src="img/listit-icon.png"> icon in the upper right hand ' +
                'corner of your screen.',
            'Make new notes or search old ones by typing into the box at the ' +
                'top of list.it\'s sidebar.',
            'Delete notes by clicking on <img alt="x button" src="img/x.png">.',
            'Edit notes by clicking one and typing, when you select',
            'something else, the note will automatically save.'
        ],
        credits: [
            'Wolfe Styke',
            'electronic max',
            'Prof. David Karger'
        ],
        email: 'listit@csail.mit.edu'
    }
});

L.make.options.ImportExportView = Backbone.View.extend({
    id: "importexport-info",
    className: "options-item", // TODO:Change
    render: function() {
        this.$el.html(L.templates.options.importexport({
                        exportSelect: L.templates.options.select({
                            id: "exportSelect",
                            options: _.chain(this.types)
                            .filter(function(t) {
                                return t['exporter'];
                            })
                            .map(function(t) {
                                return t['display'];
                            }).value()
                        }),
                        importSelect: L.templates.options.select({
                            id: "importSelect",
                            options: _.chain(this.types)
                            .filter(function(t) {
                                return t['importer'];
                            })
                            .map(function(t) {
                                return t['display'];
                            }).value()
                        })
        }));
        return this;
    },
    events: {
        "click #exportButton": "exportClicked",
        "click #importButton": "importClicked"
    },
    // TODO: Should probably define these elsewhere
    types: [
        {
            fname : "listit-notes.json",
            display : "JSON",
            exporter: function() {
                return JSON.stringify({
                    notes: L.notes.toJSON(),
                    deleted: L.deletedNotes.toJSON()
                });
            },
            importer : function(string) {
                var obj = JSON.parse(string);
                if (obj.notes) L.notes.add(obj.notes);
                if (obj.deleted) L.deletedNotes.add(obj.deleted);
            }
        },
        {
            fname : "listit-notes.txt",
            display : "Text",
            exporter: function() {
                return L.notes.reduce(function(txt, n) {
                    return txt + "* " + L.util.clean(n.get('contents')).replace(/\n/g, '\n  ') + "\n";
                }, "");
            }
        }
    ],
    importClicked: function() {
        var type = this.types[this.$el.find("#importSelect").val()];
        var file = this.$el.find("#importFile").get()[0].files[0];
        if (!file) {
            alert("Select a file first.");
        }
        var fr = new FileReader();
        fr.onload = function() {
            if (type.importer(fr.result)) {
                //notify good.
            }
        };
        fr.readAsText(file);
    },
    exportClicked: function() {
        var type = this.types[this.$el.find("#exportSelect").val()];
        var blob = new BlobBuilder();
        blob.append(type.exporter());
        saveAs(blob.getBlob("text/plain;charset=utf-8"), type.fname);
    },
});
