/**
 * riveter - Mix-in, inheritance and constructor extend behavior for your JavaScript enjoyment.
 * © 2012 - Copyright appendTo, LLC 
 * Author(s): Jim Cowart, Nicholas Cloud, Doug Neiner
 * Version: v0.2.0
 * Url: https://github.com/a2labs/riveter
 * License(s): MIT, GPL
 */
(function (root, factory) {
    if (typeof module === "object" && module.exports) {
        // Node, or CommonJS-Like environments
        module.exports = factory(require("lodash"));
    } else if (typeof define === "function" && define.amd) {
        // AMD. Register as an anonymous module.
        define(["lodash"], function (_) {
            return factory(_, root);
        });
    } else {
        // Browser globals
        root.riveter = factory(root._, root);
    }
}(this, function (_, global, undefined) {
    var slice = Array.prototype.slice;
    var riveter = function () {
        var args = slice.call(arguments, 0);
        while (args.length) {
            riveter.rivet(args.shift());
        }
    };
    function getActualType(val) {
        if (_.isArray(val)) {
            return "array";
        }
        if (_.isDate(val)) {
            return "date";
        }
        if (_.isRegExp(val)) {
            return "regex";
        }
        return typeof val;
    }
    function getHandlerName(val) {
        var propType = getActualType(val);
        return behavior[propType] ? propType : "*";
    }
    var behavior = {
        "*": function (obj, sourcePropKey, sourcePropVal) {
            obj[sourcePropKey] = sourcePropVal;
        },
        "object": function (obj, sourcePropKey, sourcePropVal) {
            obj[sourcePropKey] = deepExtend(obj[sourcePropKey] || {}, sourcePropVal);
        },
        "array": function (obj, sourcePropKey, sourcePropVal) {
            obj[sourcePropKey] = [];
            _.each(sourcePropVal, function (item, idx) {
                behavior[getHandlerName(item)](obj[sourcePropKey], idx, item);
            }, this);
        }
    };
    function deepExtend(obj) {
        _.each(slice.call(arguments, 1), function (source) {
            _.each(source, function (sourcePropVal, sourcePropKey) {
                behavior[getHandlerName(sourcePropVal)](obj, sourcePropKey, sourcePropVal);
            });
        });
        return obj;
    }
    riveter.rivet = function (fn) {
        if (!fn.hasOwnProperty("extend")) {
            fn.extend = function (props, ctorProps, options) {
                return riveter.extend(fn, props, ctorProps, options);
            };
        }
        if (!fn.hasOwnProperty("compose")) {
            fn.compose = function () {
                return riveter.compose.apply(this, [fn].concat(slice.call(arguments, 0)));
            };
        }
        if (!fn.hasOwnProperty("inherits")) {
            fn.inherits = function (parent, ctorProps, options) {
                return riveter.inherits(fn, parent, ctorProps, options);
            };
        }
        if (!fn.hasOwnProperty("mixin")) {
            fn.mixin = function () {
                return riveter.mixin.apply(this, ([fn].concat(slice.call(arguments, 0))));
            };
        }
        if (!fn.hasOwnProperty("punch")) {
            fn.punch = function () {
                return riveter.punch.apply(this, ([fn].concat(slice.call(arguments, 0))));
            };
        }
    };
    riveter.inherits = function (child, parent, ctorProps, options) {
        options = options || {};
        var childProto;
        var TmpCtor = function () {};
        var Child = function () {
            parent.apply(this, arguments);
        };
        if (typeof child === "object") {
            if (child.hasOwnProperty("constructor")) {
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
        var args = slice.call(arguments, 0);
        var ctor = args.shift();
        riveter.rivet(ctor);
        var mixin = _.reduce(args, function (memo, val) {
            if (val.hasOwnProperty("_preInit")) {
                memo.preInit.push(val._preInit);
            }
            if (val.hasOwnProperty("_postInit")) {
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
        var res = ctor.extend({
            constructor: function () {
                var args = slice.call(arguments, 0);
                _.each(mixin.preInit, function (initializer) {
                    initializer.apply(this, args);
                }, this);
                ctor.prototype.constructor.apply(this, args);
                _.each(mixin.postInit, function (initializer) {
                    initializer.apply(this, args);
                }, this);
            }
        });
        riveter.rivet(res);
        _.defaults(res.prototype, _.extend.apply(null, [{}].concat(mixin.items)));
        return res;
    };
    riveter.mixin = function () {
        var args = slice.call(arguments, 0);
        var ctor = args.shift();
        riveter.rivet(ctor);
        _.defaults(ctor.prototype, _.extend.apply(null, [{}].concat(args)));
        return ctor;
    };
    riveter.punch = function () {
        var args = slice.call(arguments, 0);
        var ctor = args.shift();
        riveter.rivet(ctor);
        _.extend(ctor.prototype, _.extend.apply(null, [{}].concat(args)));
        return ctor;
    };
    return riveter;
}));