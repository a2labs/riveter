var riveter = {};

riveter.ensureHelpers = function(fn) {
  if(!fn.hasOwnProperty('extend')) {
    fn.extend = riveter.extend;
  }
  if(!fn.hasOwnProperty('mixin')) {
    fn.mixin = riveter.mixin;
  }
};

riveter.inherits = function(parent, child, ctorProps) {
  var childProto;
  var TmpCtor = function() {};
  var Child = function() { parent.apply(this, arguments); };
  if(typeof child === 'object') {
    if(child.hasOwnProperty('constructor')) {
      Child = child.constructor;
    }
    childProto = child;
  } else {
    Child = child;
    childProto = child.prototype;
  }
  _.extend(Child, parent, ctorProps);
  TmpCtor.prototype = parent.prototype;
  Child.prototype = new TmpCtor();
  _.extend(Child.prototype, childProto, { constructor: Child });
  Child.__super = parent;
  // Next line is all about Backbone compatibility
  Child.__super__ = parent.prototype;
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