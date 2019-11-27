/* global describe it beforeEach afterEach */

const riveter = require('../lib/riveter')
const expect = require('expect.js')

describe('riveter - constructor.inherits', function () {
  var whichCtor = []

  var Person = function (name) {
    this.name = name
    whichCtor.push('Person')
  }
  Person.prototype.greet = function () {
    return 'Hi, ' + this.name
  }

  var Employee = function (name, title, salary) {
    Employee.__super.call(this, name)
    this.title = title
    this.salary = salary
    whichCtor.push('Employee')
  }

  Employee.prototype.giveRaise = function (amount) {
    this.salary += amount
  }

  var CEO = function (name, title, salary, shouldExpectFbiRaid) {
    CEO.__super.call(this, name, title, salary)
    this.shouldExpectFbiRaid = shouldExpectFbiRaid
    whichCtor.push('CEO')
  }

  CEO.prototype.fireAllThePeeps = function () {
    return "YOU'RE ALL FIRED!"
  }

  riveter(Person, Employee, CEO)

  Employee.inherits(Person, {
    getInstance: function (name, title, salary) {
      return new Employee(name, title, salary)
    }
  })
  CEO.inherits(Employee)

  describe('when inheriting and passing shared members', function () {
    var worker
    beforeEach(function () {
      worker = new Employee('Bugs', 'Bunny', 100000)
    })
    afterEach(function () {
      whichCtor = []
    })
    it('should mutate the child constructor function', function () {
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
    it('should call the child constructor', function () {
      expect(whichCtor).to.eql(['Person', 'Employee'])
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

  describe('when inheriting more than 1 level deep (sad panda)', function () {
    var ceo
    beforeEach(function () {
      ceo = new CEO('Byron Whitefield', 'CEO', 1000000000, true)
    })
    afterEach(function () {
      whichCtor = []
    })

    it('should mutate the child constructor function', function () {
      expect(CEO !== Person).to.be(true)
      expect(CEO !== Employee).to.be(true)
      expect(CEO.__super.prototype).to.be(Employee.prototype)
      expect(CEO.__super).to.be(Employee)
      expect(CEO.__super__).to.be(Employee.prototype)
      expect(Employee.__super.prototype).to.be(Person.prototype)
      expect(Employee.__super).to.be(Person)
      expect(Employee.__super__).to.be(Person.prototype)
    })
    it('should apply shared members', function () {
      expect(Object.prototype.hasOwnProperty.call(CEO, 'mixin')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(CEO, 'extend')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(CEO, 'inherits')).to.be(true)
      expect(Object.prototype.hasOwnProperty.call(CEO, 'compose')).to.be(true)
    })
    it('should call the child constructor', function () {
      expect(whichCtor).to.eql(['Person', 'Employee', 'CEO'])
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
      expect(Object.prototype.hasOwnProperty.call(ceo, 'giveRaise')).to.be(
        false
      )
      expect(Object.prototype.hasOwnProperty.call(ceo, 'greet')).to.be(false)
      expect(
        Object.prototype.hasOwnProperty.call(ceo, 'shouldExpectFbiRaid')
      ).to.be(true)
      expect(ceo.greet).to.be(Person.prototype.greet)
      expect(ceo.giveRaise).to.be(Employee.prototype.giveRaise)
    })
  })
})
