/*global riveter*/

// Support running tests directly via mocha
if (typeof riveter === "undefined") {
    var riveter = typeof window === "undefined" ? require("../lib/riveter.js") : window.riveter;
    var expect = typeof window === "undefined" ? require("expect.js") : window.expect;
    var _ = typeof window === "undefined" ? require("underscore") : window._;
}

describe("riveter - constructor.compose", function() {

    var mixinA = {
        greet: function() {
            return "Oh, hai " + this.name;
        }
    };

    var mixinB = {
        _postInit: function(val) {
            this.otherName = "Doctor " + val;
        },
        mixin: {
            saySomething: function() {
                return "'Stetsons are cool', said " + this.otherName
            }
        }
    };

    var mixinC = {
        sayGoodbye: function() {
            return "Buh Bye " + this.name;
        }
    };

    var mixinD = {
        _preInit: function(val) {
            this.otherName = "Doctor " + val;
        },
        mixin: {
            saySomething: function() {
                return "'Bowties are cool', said " + this.otherName
            }
        }
    };

    describe("when calling compose with one argument", function() {
        var F = function(val) {
            this.name = val;
        };
        riveter(F);
        var F2 = F.compose(mixinA);
        var f2 = new F2("Who");

        it('should apply compose method to the instance', function() {
            expect(f2).to.have.property("greet");
        });

        it('should produce expected mix-in behavior', function() {
            expect(f2.greet()).to.be("Oh, hai Who");
        });

        it('should apply shared/constructor methods', function() {
            expect(F2.hasOwnProperty("mixin")).to.be(true);
            expect(F2.hasOwnProperty("extend")).to.be(true);
            expect(F2.hasOwnProperty("inherits")).to.be(true);
            expect(F2.hasOwnProperty("compose")).to.be(true);
        });
    });

    describe("when calling compose with two arguments", function() {
        var F = function(val) {
            this.name = val;
        };
        riveter(F);
        var F2 = F.compose(mixinA, mixinC);
        var f2 = new F2("Who");

        it('should apply compose methods to the instance', function() {
            expect(f2).to.have.property("greet");
            expect(f2).to.have.property("sayGoodbye");
        });

        it('should produce expected behavior', function() {
            expect(f2.greet()).to.be("Oh, hai Who");
            expect(f2.sayGoodbye()).to.be("Buh Bye Who");
        });

        it('should apply shared/constructor methods', function() {
            expect(F2.hasOwnProperty("mixin")).to.be(true);
            expect(F2.hasOwnProperty("extend")).to.be(true);
            expect(F2.hasOwnProperty("inherits")).to.be(true);
            expect(F2.hasOwnProperty("compose")).to.be(true);
        });
    });

    describe("when composing a mixin containing a postInit method", function() {
        var F = function(val) {
            this.name = val;
        };
        riveter(F);
        var F2 = F.compose(mixinB);
        var f2 = new F2("Who");
        it('should apply mixin method to the instance', function() {
            expect(f2).to.have.property("saySomething");
        });
        it('should apply mixin property to the instance', function() {
            expect(f2.otherName).to.be("Doctor Who");
        });
        it('should produce expected mix-in behavior', function() {
            expect(f2.saySomething()).to.be("'Stetsons are cool', said Doctor Who");
        });

        it('should apply shared/constructor methods', function() {
            expect(F2.hasOwnProperty("mixin")).to.be(true);
            expect(F2.hasOwnProperty("extend")).to.be(true);
            expect(F2.hasOwnProperty("inherits")).to.be(true);
            expect(F2.hasOwnProperty("compose")).to.be(true);
        });
    });

    describe("when composin a mixin containing a preInit method", function() {
        var F = function(val) {
            this.name = val;
        };
        riveter(F);
        var F2 = F.compose(mixinD);
        var f2 = new F2("Who");
        it('should apply mixin method to the instance', function() {
            expect(f2).to.have.property("saySomething");
        });
        it('should apply mixin property to the instance', function() {
            expect(f2.otherName).to.be("Doctor Who");
        });
        it('should produce expected mix-in behavior', function() {
            expect(f2.saySomething()).to.be("'Bowties are cool', said Doctor Who");
        });

        it('should apply shared/constructor methods', function() {
            expect(F2.hasOwnProperty("mixin")).to.be(true);
            expect(F2.hasOwnProperty("extend")).to.be(true);
            expect(F2.hasOwnProperty("inherits")).to.be(true);
            expect(F2.hasOwnProperty("compose")).to.be(true);
        });
    });

    describe("when compose-mixins methods collide with prototype methods", function() {
        var F = function(val) {
            this.name = val;
        };
        F.prototype.greet = function() {
            return "Hello " + this.name;
        };
        riveter(F);
        var F2 = F.compose(mixinA);
        var f2 = new F2("Who");

        it('mix-in should **not** patch prototype', function() {
            expect(f2.greet()).to.be("Hello Who");
        });

        it('should apply shared/constructor methods', function() {
            expect(F2.hasOwnProperty("mixin")).to.be(true);
            expect(F2.hasOwnProperty("extend")).to.be(true);
            expect(F2.hasOwnProperty("inherits")).to.be(true);
            expect(F2.hasOwnProperty("compose")).to.be(true);
        });
    });

    describe("when compose-mixins methods collide with other compose-mixin methods", function() {
        var F = function(val) {
            this.name = val;
        };
        riveter(F);
        var F2 = F.compose(mixinB, mixinD);
        var f2 = new F2("Who");
        it('should apply mixin method to the instance', function() {
            expect(f2).to.have.property("saySomething");
        });
        it('should apply mixin property to the instance', function() {
            expect(f2.otherName).to.be("Doctor Who");
        });
        it('should produce expected mix-in behavior (last mixin wins)', function() {
            expect(f2.saySomething()).to.be("'Bowties are cool', said Doctor Who");
        });

        it('should apply shared/constructor methods', function() {
            expect(F2.hasOwnProperty("mixin")).to.be(true);
            expect(F2.hasOwnProperty("extend")).to.be(true);
            expect(F2.hasOwnProperty("inherits")).to.be(true);
            expect(F2.hasOwnProperty("compose")).to.be(true);
        });
    });

});
