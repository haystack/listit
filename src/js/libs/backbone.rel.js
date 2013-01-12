(function() {
  'use strict';
  Backbone.RelModel = Backbone.Model.extend({
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
      _.each(_.pick(attributes, _.keys(this.relations)), function(value, key) {
        if (value instanceof Backbone.Model || value instanceof Backbone.Collection) {
          that.set(key, value);
        } else if (_.isArray(value)) {
          that.get(key).update(_.map(value, _.bind(that._initRelObject, that, key)), options);
        } else {
          that.get(key).set(that._initRelObject(key, value), options);
        }
      });

      return Backbone.Model.prototype.set.call(this, _.omit(_.keys(attributes), this.relations), options);
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
              json[key] = value.map(function(m) { return m.get(relation.includeInJSON);});
            } else if (value instanceof Backbone.Model) {
              json[key] = value.get(relation.includeInJSON);
            } else {
              null;
            }
          } else if (_.isArray(value.includeInJSON)) {
            if (value instanceof Backbone.Collection) {
              json[key] = value.map(function(m) {
                return _.kmap(value.includeInJSON, function(k) {
                  return m.get(k);
                });
              });
            } else if (value instanceof Backbone.Model) {
              json[key] = _.kmap(value.includeInJSON, function(k) {
                return m.get(k);
              });
            } else {
              json[key] = null;
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
      if (relation instanceof Backbone.Collection) {
        relation.each(function(m) {
          m.fetch(options);
        });
      } else if (relation instanceof Backbone.Model) {
        relation.fetch(options);
      }
    }
  });
})();
