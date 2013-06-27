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

      if (!this._relationsInited) {
        this.initializeRelations();
      }
      // DO NOT PASS OPTIONS (will cause wierd behavior, multiple fetching, etc...)
      _.each(_.pick(attributes, _.keys(this.relations)), function(value, key) {
        if (value instanceof Backbone.Model || value instanceof Backbone.Collection) {
          that.set(key, value, options);
        } else if (_.isArray(value)) {
          that.get(key).set(_.map(value, _.bind(that._initRelObject, that, key)), options);
        } else {
          that.get(key).set(that._initRelObject(key, value), options);
        }
      });

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
              json[name] = value.map(function(m) { return m.get(relation.includeInJSON);});
            } else if (value instanceof Backbone.Model) {
              json[name] = value.get(relation.includeInJSON);
            } else {
              null;
            }
          } else if (_.isArray(value.includeInJSON)) {
            if (value instanceof Backbone.Collection) {
              json[name] = value.map(function(m) {
                return _.kmap(value.includeInJSON, function(k) {
                  return m.get(k);
                });
              });
            } else if (value instanceof Backbone.Model) {
              json[name] = _.kmap(value.includeInJSON, function(k) {
                return m.get(k);
              });
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
      var that = this;
      var complete_cb = options && options.complete;

      var fetchRelated = (options && _.has(options, "fetchRelated")) ?
        options.fetchRelated : this.autoFetchRelated;
      if (fetchRelated) {
        var to_fetch;
        if (_.isArray(fetchRelated)) {
          to_fetch = fetchRelated;
        } else if (_.isString(fetchRelated)) {
          to_fetch = [fetchRelated];
        } else if (_.isBoolean(fetchRelated)) {
          to_fetch = _.keys(this.relations);
        }

        options = _.defaults({
          complete: function() {
            if (complete_cb) {
              var result = {};
              var barr = new Barrier(to_fetch.length);
              _.each(to_fetch, function(key) {
                that.fetchRelated(key, _.defaults({
                  complete: function(fn, that, relation, res) {
                    result[key] = res;
                    barr.release();
                  }
                }, options));
              });
              barr.wait(_.partial(complete_cb, that, result));
            } else {
              _.each(to_fetch, function(key) {
                that.fetchRelated(key, options);
              });
            }
          }
        }, options);
      }
      RelModel.__super__.fetch.call(this, options);
    }
  });
  Backbone.RelModel = RelModel;
})();
