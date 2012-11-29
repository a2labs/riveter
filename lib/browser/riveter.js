/*
 riveter
 © 2012 - Copyright appendTo, LLC
 Author(s): Jim Cowart, Nicholas Cloud
 License: Dual licensed MIT (http://opensource.org/licenses/MIT) & GPL (http://opensource.org/licenses/GPL-2.0)
 Version 0.1.0
 */
(function ( root, factory ) {
  if ( typeof define === "function" && define.amd ) {
    // AMD. Register as an anonymous module.
    define( ["underscore"], function ( _ ) {
      return factory( _, root );
    } );
  } else {
    // Browser globals
    root.riveter = factory( root._, root );
  }
}( this, function ( _, global, undefined ) {

  var riveter = {};
  
  riveter.ensureHelpers = function(fn) {
    if(!fn.hasOwnProperty('extend')) {
      fn.extend = riveter.extend;
    }
    if(!fn.hasOwnProperty('mixin')) {
      fn.mixin = riveter.mixin;
    }
  };
  
  riveter.inherits = function(parent, sub, ctorProps) {
    var childProto;
    var TmpCtor = function() {};
    var Child = function() { parent.apply(this, arguments); };
    if(typeof sub === 'object') {
      if(sub.hasOwnProperty('constructor')) {
        Child = sub.constructor;
      }
      childProto = sub;
    } else {
      childProto = sub.prototype;
    }
    _.extend(Child, parent, ctorProps);
    TmpCtor.prototype = parent.prototype;
    Child.prototype = new TmpCtor();
    _.extend(Child.prototype, childProto, { constructor: Child });
    Child.__super__ = parent.prototype;
    Child.prototype.parent = parent.prototype;
    Child.prototype.parent.constructor = parent;
    riveter.ensureHelpers(Child);
    return Child;
  };
  
  riveter.extend = function (props, ctorProps) {
    return riveter.inherits(this, props, ctorProps);
  };
  
  riveter.mixin = function() {
    var ctor = this;
    riveter.ensureHelpers(ctor);
    var mixin = _.reduce(Array.prototype.slice.call(arguments, 0), function(memo, val){
      if(val.hasOwnProperty("_preInit")) {
        memo.preInit.push(val._preInit);
      }
      if(val.hasOwnProperty("_postInit")) {
        memo.postInit.push(val._postInit);
      }
      val = val.mixin || val;
      memo.items.push(val);
      return memo;
    }, { items: [], preInit: [], postInit: [] });
  
    var res = ctor.extend({
      constructor: function(options) {
        var args = Array.prototype.slice.call(arguments, 0);
        _.each(mixin.preInit, function(initializer){
          initializer.apply(this, args);
        }, this);
        ctor.prototype.constructor.apply(this, args);
        _.each(mixin.postInit, function(initializer){
          initializer.apply(this, args);
        }, this);
      }
    });
  
    riveter.ensureHelpers(res);
  
    _.defaults(res.prototype, _.extend.apply(null, [{}].concat(mixin.items)));
    return res;
  };
  
  riveter.mixin.extend = riveter.extend;

  return riveter;
} ));