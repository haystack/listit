(function() {
  'use strict';
  var RelModel = Backbone.Model.extend({
    relations: {},
    initializeRelations: function() {
      var that = this;
      this._relationsInited = true;
      _.each(this.relations, function(rel, name) { 
        that.attributes[name] = new rel.type();
      });
    },
    set: function(key, value, options) {
      var attributes;
      var that = this;

      if (_.isObject(key) || key == null) {
        attributes = key;
        options = value;
      } else {
        attributes = {};
        attributes[key] = value;
      }
      options = options || {};

      if (options.fetching) {
        this._fetching = false;
      }

      if (!this._relationsInited) {
        this.initializeRelations();
      }

      if (this._fetching) {
        throw new Error("Set called during fetch");
      }

      var rels = _.pick(attributes, _.keys(this.relations))
      if (_.keys(rels).length > 0) {
        // Not omitting these causes issues (don't pass through bad callbacks)
        var relOptions = _.omit(options, "fetchRelated", "success", "error");
        relOptions.sort = false;
        relOptions.fetch = options.fetchRelated;

        _.each(rels, function(value, key) {

          if (value instanceof Backbone.Model || value instanceof Backbone.Collection) {
            that.set(key, value, relOptions);
          } else if (_.isArray(value)) {
            that.get(key).reset(_.map(value, _.bind(that._initRelObject, that, key)), relOptions);
          } else {
            that.get(key).set(that._initRelObject(key, value), relOptions);
          }
        });
      }

      return Backbone.Model.prototype.set.call(this, _.omit(attributes, _.keys(this.relations)), options);
    },
    _initRelObject: function(key, o) {
      var result;

      if (_.isObject(o)) {
        result = o;
      } else {
        var idAttr;
        result = {};
        if (this.get(key) instanceof Backbone.Collection) {
          idAttr =  this.relations[key].type.prototype.model.prototype.idAttribute;
        } else {
          idAttr = this.relations[key].type.prototype.idAttribute;
        }
        result[idAttr || "id"] = o;
      }
      return result;
    },
    toJSON: function(options) {
      var json = Backbone.Model.prototype.toJSON.call(this, options);
      var that = this;

      if (!(options && options.include)) {
        _.each(this.relations, function(relation, name) {
          var value = that.get(name);
          if (relation.includeInJSON === true) {
            return;
          } else if (_.isString(relation.includeInJSON)) {
            if (value instanceof Backbone.Collection) {
              // Filter out unsaved
              var models;
              if (!relation.includeUnsaved) {
                models = value.filter(function(m) { return !m.isNew(); });
              } else {
                models = value.models;
              }
              json[name] = _.map(models, function(m) { return m.get(relation.includeInJSON);});
            } else if (value instanceof Backbone.Model) {
              if (!relation.includeUnsaved && value.isNew()) {
                json[name] = null;
              } else {
                json[name] = value.get(relation.includeInJSON);
              }
            } else {
              null;
            }
          } else if (_.isArray(value.includeInJSON)) {
            if (value instanceof Backbone.Collection) {
              var models;
              if (!relation.includeUnsaved) {
                models = value.filter(function(m) { return !m.isNew(); });
              } else {
                models = value.models;
              }
              json[name] = _.map(models, function(m) {
                return _.kmap(value.includeInJSON, function(k) {
                  return m.get(k);
                });
              });
            } else if (value instanceof Backbone.Model) {
              if (!relation.includeUnsaved && value.isNew()) {
                json[name] = null;
              } else {
                json[name] = _.kmap(value.includeInJSON, function(k) {
                  return m.get(k);
                });
              }
            } else {
              json[name] = null;
            }
          }
        });
      }
      _.each(json, function(value, key) {
        json[key] = (value && value.toJSON) ? value.toJSON() : value;
      });
      return json;
    },
    fetchRelated: function(key, options) {
      var relation = this.get(key);
      var that = this;
      if (relation instanceof Backbone.Collection) {
        if (options && options.complete) {
          var result = {
            succeeded: [],
            failed: []
          };
          var barr = new Barrier(relation.size());
          barr.wait(_.partial(options.complete, this, relation, result));
          options = _.defaults({
            complete: function(model, succeeded) {
              result[succeeded ? "succeeded" : "failed"].push(model);
              barr.release();
            }
          }, options);
        }

        relation.each(function(m) {
          m.fetch(options);
        });
      } else if (relation instanceof Backbone.Model) {
        relation.fetch(options);
      }
    },
    fetch: function(options) {
      options = _.clone(options);
      if (!_.has(options, "fetchRelated")) {
        options.fetchRelated = this.autoFetchRelated;
      }

      if (options.fetchRelated && options.complete) {
        var complete_cb = options.complete;
        options = _.defaults({
          complete: function(that, result) {
            var result = {};
            var barr = new Barrier();
            var cb = _.mask(barr.release);
            _.each(_.keys(that.relations), function(key) {
              var col = that.get(key)
              barr.aquire(col.size());
              col.each(function(m) {
                m.ready(cb);
              });
            });
            barr.wait(_.partial(complete_cb, that, result));
          }
        }, options);
      }
      RelModel.__super__.fetch.call(this, options);
    }
  });
  Backbone.RelModel = RelModel;
})();
