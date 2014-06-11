/*global riveter,describe,it,beforeEach,afterEach*/

// Support running tests directly via mocha
if (typeof riveter === "undefined") {
    var riveter = typeof window === "undefined" ? require("../lib/riveter.js") : window.riveter;
    var expect = typeof window === "undefined" ? require("expect.js") : window.expect;
}

describe("riveter - inherits (stand-alone)", function() {

    var whichCtor = [];

    var Person = function(name) {
        this.name = name;
        whichCtor.push("Person");
    };
    Person.prototype.greet = function() {
        return "Hi, " + this.name;
    };

    var VisitorProto = {
        sayGoodbye: function() {
            return "Buh Bye....";
        }
    };

    var Employee = function(name, title, salary) {
        Employee.__super.call(this, name);
        this.title = title;
        this.salary = salary;
        whichCtor.push("Employee");
    };

    Employee.prototype.giveRaise = function(amount) {
        this.salary += amount;
    };

    var CEOProto = {
        fireAllThePeeps: function() {
            return "YOU'RE ALL FIRED!";
        },
        constructor: function(name, title, salary, shouldExpectFbiRaid) {
            CEOProto.constructor.__super.call(this, name, title, salary);
            this.shouldExpectFbiRaid = shouldExpectFbiRaid;
            whichCtor.push("CEO");
        }
    };

    riveter.inherits(Employee, Person, {
        getInstance: function(name, title, salary) {
            return new Employee(name, title, salary);
        }
    });
    var Visitor = riveter.inherits(VisitorProto, Person);
    var CEO = riveter.inherits(CEOProto, Employee);

    describe("when passing constructor functions for parent and child", function() {
        var worker;
        beforeEach(function() {
            worker = new Employee("Bugs", "Bunny", 100000);
        });
        afterEach(function() {
            whichCtor = [];
        });
        it("should mutate the child constructor function", function() {
            expect(Employee !== Person).to.be(true);
            expect(Employee.prototype.constructor).to.be(Employee);
            expect(Employee.__super.prototype).to.be(Person.prototype);
            expect(Employee.__super).to.be(Person);
            expect(Employee.__super__).to.be(Person.prototype);
        });
        it("should apply shared/constructor methods", function() {
            expect(Employee.hasOwnProperty("mixin")).to.be(true);
            expect(Employee.hasOwnProperty("extend")).to.be(true);
            expect(Employee.hasOwnProperty("inherits")).to.be(true);
            expect(Employee.hasOwnProperty("compose")).to.be(true);
            expect(Employee.hasOwnProperty("getInstance")).to.be(true);
            expect(Employee.getInstance("Test", "Tester", 100) instanceof Employee).to.be(true);
        });
        it("should call the child constructor", function() {
            expect(whichCtor).to.eql(["Person", "Employee"]);
        });
        it("should produce expected instance when used to instantiate new object", function() {
            expect(worker.name).to.be("Bugs");
            expect(worker.title).to.be("Bunny");
            expect(worker.salary).to.be(100000);
            expect(worker.greet()).to.be("Hi, Bugs");
        });
        it("should properly construct the instance prototype", function() {
            expect(worker.hasOwnProperty("name")).to.be(true);
            expect(worker.hasOwnProperty("title")).to.be(true);
            expect(worker.hasOwnProperty("salary")).to.be(true);
            expect(worker.hasOwnProperty("giveRaise")).to.be(false);
            expect(worker.hasOwnProperty("greet")).to.be(false);
            expect(worker.greet).to.be(Person.prototype.greet);
            expect(worker.giveRaise).to.be(Employee.prototype.giveRaise);
        });
    });

    describe("when passing object literal (with a constructor) as the child", function() {
        var ceo;
        beforeEach(function() {
            ceo = new CEO("Byron Whitefield", "CEO", 1000000000, true);
        });
        afterEach(function() {
            whichCtor = [];
        });

        it("should mutate the child constructor function", function() {
            expect(CEO !== Person).to.be(true);
            expect(CEO !== Employee).to.be(true);
            expect(CEO !== CEOProto).to.be(true);
            expect(CEO.prototype.constructor).to.be(CEOProto.constructor);
            expect(CEO.__super.prototype).to.be(Employee.prototype);
            expect(CEO.__super).to.be(Employee);
            expect(CEO.__super__).to.be(Employee.prototype);
        });
        it("should apply shared members", function() {
            expect(CEO.hasOwnProperty("mixin")).to.be(true);
            expect(CEO.hasOwnProperty("extend")).to.be(true);
            expect(CEO.hasOwnProperty("inherits")).to.be(true);
            expect(CEO.hasOwnProperty("compose")).to.be(true);
        });
        it("should call the child constructor", function() {
            expect(whichCtor).to.eql(["Person", "Employee", "CEO"]);
        });
        it("should produce expected instance when used to instantiate new object", function() {
            expect(ceo.name).to.be("Byron Whitefield");
            expect(ceo.title).to.be("CEO");
            expect(ceo.salary).to.be(1000000000);
            expect(ceo.shouldExpectFbiRaid).to.be(true);
            expect(ceo.greet()).to.be("Hi, Byron Whitefield");
        });
        it("should properly construct the instance prototype", function() {
            expect(ceo.hasOwnProperty("name")).to.be(true);
            expect(ceo.hasOwnProperty("title")).to.be(true);
            expect(ceo.hasOwnProperty("salary")).to.be(true);
            expect(ceo.hasOwnProperty("giveRaise")).to.be(false);
            expect(ceo.hasOwnProperty("greet")).to.be(false);
            expect(ceo.hasOwnProperty("shouldExpectFbiRaid")).to.be(true);
            expect(ceo.greet).to.be(Person.prototype.greet);
            expect(ceo.giveRaise).to.be(Employee.prototype.giveRaise);
        });
    });

    describe("when passing object literal (with no constructor method) as the child", function() {
        var visitor;
        beforeEach(function() {
            visitor = new Visitor("FBI+IRS");
        });
        afterEach(function() {
            whichCtor = [];
        });

        it("should mutate the child constructor function", function() {
            expect(Visitor !== Person).to.be(true);
            expect(Visitor.__super.prototype).to.be(Person.prototype);
            expect(Visitor.__super).to.be(Person);
            expect(Visitor.__super__).to.be(Person.prototype);
        });
        it("should call the parent constructor", function() {
            expect(whichCtor).to.eql(["Person"]);
        });
        it("should apply shared members", function() {
            expect(Visitor.hasOwnProperty("mixin")).to.be(true);
            expect(Visitor.hasOwnProperty("extend")).to.be(true);
            expect(Visitor.hasOwnProperty("inherits")).to.be(true);
            expect(Visitor.hasOwnProperty("compose")).to.be(true);
        });
        it("should produce expected instance when used to instantiate new object", function() {
            expect(visitor.name).to.be("FBI+IRS");
            expect(visitor.greet()).to.be("Hi, FBI+IRS");
            expect(visitor.sayGoodbye()).to.be("Buh Bye....");
        });
        it("should properly construct the instance prototype", function() {
            expect(visitor.hasOwnProperty("name")).to.be(true);
            expect(visitor.hasOwnProperty("greet")).to.be(false);
            expect(visitor.hasOwnProperty("sayGoodbye")).to.be(false);
            expect(visitor.greet).to.be(Person.prototype.greet);
            expect(visitor.sayGoodbye).to.be(VisitorProto.sayGoodbye);
        });
    });

});