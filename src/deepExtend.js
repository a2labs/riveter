/* global slice */
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
    "*": function(obj, sourcePropKey, sourcePropVal) {
        obj[sourcePropKey] = sourcePropVal;
    },
    "object": function(obj, sourcePropKey, sourcePropVal) {
        obj[sourcePropKey] = deepExtend(obj[sourcePropKey] || {}, sourcePropVal);
    },
    "array": function(obj, sourcePropKey, sourcePropVal) {
        obj[sourcePropKey] = [];
        _.each(sourcePropVal, function(item, idx) {
            behavior[getHandlerName(item)](obj[sourcePropKey], idx, item);
        }, this);
    }
};

function deepExtend(obj) {
    _.each(slice.call(arguments, 1), function(source) {
        _.each(source, function(sourcePropVal, sourcePropKey) {
            behavior[getHandlerName(sourcePropVal)](obj, sourcePropKey, sourcePropVal);
        });
    });
    return obj;
}