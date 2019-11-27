/* global describe it */

const riveter = require('../lib/riveter')
const expect = require('expect.js')

describe('riveter - constructor.punch', function () {
  var mixinA = {
    greet: function () {
      return 'Oh, hai ' + this.name
    }
  }

  var mixinB = {
    greet: function () {
      return 'BOO! ' + this.name
    }
  }

  var mixinC = {
    sayGoodbye: function () {
      return 'Buh Bye ' + this.name
    }
  }

  describe('when calling punch with one argument', function () {
    var F2 = function (val) {
      this.name = val
    }
    riveter(F2)
    F2.punch(mixinA)
    var f2 = new F2('Who')

    it('should apply mixin method to the instance', function () {
      expect(f2).to.have.property('greet')
    })

    it('should produce expected mix-in behavior', function () {
      expect(f2.greet()).to.be('Oh, hai Who')
    })

    it('should apply shared/constructor methods', function () {
      expect(Object.prototype.hasOwnProperty.call(F2, 'mixin')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'extend')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'inherits')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'compose')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'punch')).to.be(true)
    })
  })

  describe('when calling punch with two arguments', function () {
    var F2 = function (val) {
      this.name = val
    }
    riveter(F2)
    F2.punch(mixinA, mixinC)
    var f2 = new F2('Who')

    it('should apply mixin methods to the instance', function () {
      expect(f2).to.have.property('greet')
      expect(f2).to.have.property('sayGoodbye')
    })

    it('should produce expected behavior', function () {
      expect(f2.greet()).to.be('Oh, hai Who')
      expect(f2.sayGoodbye()).to.be('Buh Bye Who')
    })

    it('should apply shared/constructor methods', function () {
      expect(Object.prototype.hasOwnProperty.call(F2, 'mixin')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'extend')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'inherits')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'compose')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'punch')).to.be(true)
    })
  })

  describe('when mixin methods collide with prototype methods', function () {
    var F2 = function (val) {
      this.name = val
    }
    F2.prototype.greet = function () {
      return 'Hello ' + this.name
    }
    riveter(F2)
    F2.punch(mixinA)
    var f2 = new F2('Who')

    it('mix-in should override prototype', function () {
      expect(f2.greet()).to.be('Oh, hai Who')
    })

    it('should apply shared/constructor methods', function () {
      expect(Object.prototype.hasOwnProperty.call(F2, 'mixin')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'extend')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'inherits')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'compose')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'punch')).to.be(true)
    })
  })

  describe('when mixin methods collide with other mixin methods', function () {
    var F2 = function (val) {
      this.name = val
    }
    riveter(F2)
    F2.punch(mixinB, mixinA)
    var f2 = new F2('Who')
    it('should apply mixin method to the instance', function () {
      expect(f2).to.have.property('greet')
    })
    it('should produce expected mix-in behavior (last mixin wins)', function () {
      expect(f2.greet()).to.be('Oh, hai Who')
    })

    it('should apply shared/constructor methods', function () {
      expect(Object.prototype.hasOwnProperty.call(F2, 'mixin')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'extend')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'inherits')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'compose')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(F2, 'punch')).to.be(true)
    })
  })
})
