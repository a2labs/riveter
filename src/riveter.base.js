/*global riveter,slice,deepExtend*/
riveter.rivet = function(fn) {
    if (!fn.hasOwnProperty("extend")) {
        fn.extend = function(props, ctorProps, options) {
            return riveter.extend(fn, props, ctorProps, options);
        };
    }
    if (!fn.hasOwnProperty("compose")) {
        fn.compose = function() {
            return riveter.compose.apply(this, [fn].concat(slice.call(arguments, 0)));
        };
    }
    if (!fn.hasOwnProperty("inherits")) {
        fn.inherits = function(parent, ctorProps, options) {
            return riveter.inherits(fn, parent, ctorProps, options);
        };
    }
    if (!fn.hasOwnProperty("mixin")) {
        fn.mixin = function() {
            return riveter.mixin.apply(this, ([fn].concat(slice.call(arguments, 0))));
        };
    }
    if (!fn.hasOwnProperty("punch")) {
        fn.punch = function() {
            return riveter.punch.apply(this, ([fn].concat(slice.call(arguments, 0))));
        };
    }
};

riveter.inherits = function(child, parent, ctorProps, options) {
    options = options || {};
    var childProto;
    var TmpCtor = function() {};
    var Child = function() {
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

riveter.extend = function(ctor, props, ctorProps, options) {
    return riveter.inherits(props, ctor, ctorProps, options);
};

riveter.compose = function() {
    var args = slice.call(arguments, 0);
    var ctor = args.shift();
    riveter.rivet(ctor);
    var mixin = _.reduce(args, function(memo, val) {
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
        constructor: function() {
            var args = slice.call(arguments, 0);
            _.each(mixin.preInit, function(initializer) {
                initializer.apply(this, args);
            }, this);
            ctor.prototype.constructor.apply(this, args);
            _.each(mixin.postInit, function(initializer) {
                initializer.apply(this, args);
            }, this);
        }
    });
    riveter.rivet(res);
    _.defaults(res.prototype, _.extend.apply(null, [{}].concat(mixin.items)));
    return res;
};

riveter.mixin = function() {
    var args = slice.call(arguments, 0);
    var ctor = args.shift();
    riveter.rivet(ctor);
    _.defaults(ctor.prototype, _.extend.apply(null, [{}].concat(args)));
    return ctor;
};

riveter.punch = function() {
    var args = slice.call(arguments, 0);
    var ctor = args.shift();
    riveter.rivet(ctor);
    _.extend(ctor.prototype, _.extend.apply(null, [{}].concat(args)));
    return ctor;
};