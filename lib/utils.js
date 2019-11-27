const _ = require('lodash')

function getActualType (val) {
  if (_.isArray(val)) {
    return 'array'
  }
  if (_.isDate(val)) {
    return 'date'
  }
  if (_.isRegExp(val)) {
    return 'regex'
  }
  return typeof val
}

const behavior = {
  '*': function (obj, sourcePropKey, sourcePropVal) {
    obj[sourcePropKey] = sourcePropVal
  },
  object: function (obj, sourcePropKey, sourcePropVal) {
    obj[sourcePropKey] = deepExtend(obj[sourcePropKey] || {}, sourcePropVal)
  },
  array: function (obj, sourcePropKey, sourcePropVal) {
    obj[sourcePropKey] = []
    _.each(sourcePropVal, function (item, idx) {
      behavior[getHandlerName(item)](obj[sourcePropKey], idx, item)
    })
  }
}

function getHandlerName (val) {
  const propType = getActualType(val)
  return behavior[propType] ? propType : '*'
}

function deepExtend (obj) {
  _.each(Array.prototype.slice.call(arguments, 2), function (source) {
    _.each(source, function (sourcePropVal, sourcePropKey) {
      behavior[getHandlerName(sourcePropVal)](obj, sourcePropKey, sourcePropVal)
    })
  })
  return obj
}

module.exports = {
  deepExtend
}
