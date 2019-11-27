/* global describe it beforeEach */
const riveter = require('../lib/riveter')
const expect = require('expect.js')
const _ = require('lodash')

describe('riveter - constructor.extend', function () {
  const Person = function (name) {
    this.name = name
    this.initialize.apply(this, arguments)
  }

  _.extend(Person.prototype, {
    greet: function () {
      return 'Hi, ' + this.name
    },
    initialize: function () {}
  })

  riveter(Person)

  const Employee = Person.extend(
    {
      giveRaise: function (amount) {
        this.salary += amount
      },
      initialize: function (name, title, salary) {
        this.title = title
        this.salary = salary
      }
    },
    {
      getInstance: function (name, title, salary) {
        return new Employee(name, title, salary)
      }
    }
  )

  const CEO = Employee.extend({
    constructor: function (name, title, salary, shouldExpectFbiRaid) {
      CEO.__super.call(this, name, title, salary)
      this.shouldExpectFbiRaid = shouldExpectFbiRaid
    },
    fireAllThePeeps: function () {
      return "YOU'RE ALL FIRED!"
    }
  })

  describe('when calling extend with no overridden constructor', function () {
    let worker
    beforeEach(function () {
      worker = new Employee('Bugs', 'Bunny', 100000)
    })
    it('should produce a new constructor function', function () {
      expect(Employee !== Person).to.be(true)
      expect(Employee.prototype.constructor).to.be(Employee)
      expect(Employee.__super.prototype).to.be(Person.prototype)
      expect(Employee.__super).to.be(Person)
      expect(Employee.__super__).to.be(Person.prototype)
    })
    it('should apply shared/constructor methods', function () {
      expect(Object.prototype.hasOwnProperty.call(Employee, 'mixin')).to.be(
        true
      )
      expect(Object.prototype.hasOwnProperty.call(Employee, 'extend')).to.be(
        true
      )
      expect(Object.prototype.hasOwnProperty.call(Employee, 'inherits')).to.be(
        true
      )
      expect(Object.prototype.hasOwnProperty.call(Employee, 'compose')).to.be(
        true
      )
      expect(
        Object.prototype.hasOwnProperty.call(Employee, 'getInstance')
      ).to.be(true)
      expect(
        Employee.getInstance('Test', 'Tester', 100) instanceof Employee
      ).to.be(true)
    })
    it('should produce expected instance when used to instantiate new object', function () {
      expect(worker.name).to.be('Bugs')
      expect(worker.title).to.be('Bunny')
      expect(worker.salary).to.be(100000)
      expect(worker.greet()).to.be('Hi, Bugs')
    })
    it('should properly construct the instance prototype', function () {
      expect(Object.prototype.hasOwnProperty.call(worker, 'name')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(worker, 'title')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(worker, 'salary')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(worker, 'giveRaise')).to.be(
        false
      )
      expect(Object.prototype.hasOwnProperty.call(worker, 'greet')).to.be(false)
      expect(worker.greet).to.be(Person.prototype.greet)
      expect(worker.giveRaise).to.be(Employee.prototype.giveRaise)
    })
  })

  describe('when calling extend with an overridden constructor', function () {
    let ceo
    beforeEach(function () {
      ceo = new CEO('Byron Whitefield', 'CEO', 1000000000, true)
    })
    it('should produce a new constructor function', function () {
      expect(CEO !== Employee).to.be(true)
      expect(CEO.__super.prototype).to.be(Employee.prototype)
      expect(CEO.__super).to.be(Employee)
      expect(CEO.__super__).to.be(Employee.prototype)
    })
    it('should apply shared/constructor methods', function () {
      expect(Object.prototype.hasOwnProperty.call(CEO, 'mixin')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(CEO, 'extend')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(CEO, 'inherits')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(CEO, 'compose')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(CEO, 'getInstance')).to.be(
        true
      )
      expect(CEO.getInstance('Test', 'Tester', 100) instanceof Employee).to.be(
        true
      )
    })
    it('should produce expected instance when used to instantiate new object', function () {
      expect(ceo.name).to.be('Byron Whitefield')
      expect(ceo.title).to.be('CEO')
      expect(ceo.salary).to.be(1000000000)
      expect(ceo.shouldExpectFbiRaid).to.be(true)
      expect(ceo.greet()).to.be('Hi, Byron Whitefield')
    })
    it('should properly construct the instance prototype', function () {
      expect(Object.prototype.hasOwnProperty.call(ceo, 'name')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(ceo, 'title')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(ceo, 'salary')).to.be(true)
      expect(
        Object.prototype.hasOwnProperty.call(ceo, 'shouldExpectFbiRaid')
      ).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(ceo, 'giveRaise')).to.be(
        false
      )
      expect(Object.prototype.hasOwnProperty.call(ceo, 'greet')).to.be(false)
      expect(ceo.greet).to.be(Person.prototype.greet)
      expect(ceo.giveRaise).to.be(Employee.prototype.giveRaise)
    })
  })
})
