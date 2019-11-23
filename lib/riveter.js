/**
 * node-riveter - Mix-in, inheritance and constructor extend behavior for your JavaScript enjoyment.
 * © 2012 - Copyright appendTo, LLC
 * © 2019 - Copyright Zach Lintz, LLC
 * Author(s): Jim Cowart, Nicholas Cloud, Doug Neiner, Zach Lintz
 * Version: v0.2.1
 * Url: https://github.com/zlintz/riveter
 * License(s): MIT, GPL
 */

const _ = require('lodash');
const { deepExtend } = require('./utils')
const slice = Array.prototype.slice;

function riveterImpl () {
  const riveter = function () {
    const args = slice.call(arguments, 0);
    while (args.length) {
      riveter.rivet(args.shift());
    }
  };

  riveter.rivet = function (fn) {
    if (!fn.hasOwnProperty('extend')) {
      fn.extend = function (props, ctorProps, options) {
        return riveter.extend(fn, props, ctorProps, options);
      };
    }
    if (!fn.hasOwnProperty('compose')) {
      fn.compose = function () {
        return riveter.compose.apply(this, [fn].concat(slice.call(arguments, 0)));
      };
    }
    if (!fn.hasOwnProperty('inherits')) {
      fn.inherits = function (parent, ctorProps, options) {
        return riveter.inherits(fn, parent, ctorProps, options);
      };
    }
    if (!fn.hasOwnProperty('mixin')) {
      fn.mixin = function () {
        return riveter.mixin.apply(this, ([fn].concat(slice.call(arguments, 0))));
      };
    }
    if (!fn.hasOwnProperty('punch')) {
      fn.punch = function () {
        return riveter.punch.apply(this, ([fn].concat(slice.call(arguments, 0))));
      };
    }
  };

  riveter.inherits = function (child, parent, ctorProps, options) {
    options = options || {};
    let childProto;
    const TmpCtor = function () {
    };
    let Child = function () {
      parent.apply(this, arguments);
    };
    if (typeof child === 'object') {
      if (child.hasOwnProperty('constructor')) {
        Child = child.constructor;
      }
      childProto = child;
    } else {
      Child = child;
      childProto = child.prototype;
    }
    riveter.rivet(Child);
    if (options.deep) {
      deepExtend(Child, parent, ctorProps);
    } else {
      _.defaults(Child, parent, ctorProps);
    }
    TmpCtor.prototype = parent.prototype;
    Child.prototype = new TmpCtor();
    if (options.deep) {
      deepExtend(Child.prototype, childProto, {
        constructor: Child
      });
    } else {
      _.extend(Child.prototype, childProto, {
        constructor: Child
      });
    }
    Child.__super = parent;
    // Next line is all about Backbone compatibility
    Child.__super__ = parent.prototype;
    return Child;
  };

  riveter.extend = function (ctor, props, ctorProps, options) {
    return riveter.inherits(props, ctor, ctorProps, options);
  };

  riveter.compose = function () {
    const args = slice.call(arguments, 0);
    const ctor = args.shift();
    riveter.rivet(ctor);
    const mixin = _.reduce(args, function (memo, val) {
      if (val.hasOwnProperty('_preInit')) {
        memo.preInit.push(val._preInit);
      }
      if (val.hasOwnProperty('_postInit')) {
        memo.postInit.push(val._postInit);
      }
      val = val.mixin || val;
      memo.items.push(val);
      return memo;
    }, {
      items: [],
      preInit: [],
      postInit: []
    });
    const res = ctor.extend({
      constructor: function () {
        const self = this;
        const args = slice.call(arguments, 0);
        _.each(mixin.preInit, function (initializer) {
          initializer.apply(self, args);
        });
        ctor.prototype.constructor.apply(this, args);
        _.each(mixin.postInit, function (initializer) {
          initializer.apply(self, args);
        });
      }
    });
    riveter.rivet(res);
    _.defaults(res.prototype, _.extend.apply(null, [{}].concat(mixin.items)));
    return res;
  };

  riveter.mixin = function () {
    const args = slice.call(arguments, 0);
    const ctor = args.shift();
    riveter.rivet(ctor);
    _.defaults(ctor.prototype, _.extend.apply(null, [{}].concat(args)));
    return ctor;
  };

  riveter.punch = function () {
    const args = slice.call(arguments, 0);
    const ctor = args.shift();
    riveter.rivet(ctor);
    _.extend(ctor.prototype, _.extend.apply(null, [{}].concat(args)));
    return ctor;
  };

  return riveter;
};

module.exports = riveterImpl()