/*global riveter*/

// Support running tests directly via mocha
if ( typeof riveter === "undefined" ) {
  var riveter = require("../lib/riveter.js")();
  var expect  = require("../ext/expect.js" );
}

describe("riveter - constructor.mixin", function(){

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

  var F = function(val) {
    this.name = val;
  };

  F.mixin = riveter.mixin;

  describe("when calling mixin with one argument", function(){
    var F2 = F.mixin(mixinA);
    var f2 = new F2("Who");

    it('should apply mixin method to the instance', function(){
      expect(f2).to.have.property("greet");
    });

    it('should produce expected mix-in behavior', function(){
      expect(f2.greet()).to.be("Oh, hai Who");
    });

    it('should apply shared/constructor methods', function(){
      expect(F2.hasOwnProperty("mixin")).to.be(true);
      expect(F2.hasOwnProperty("extend")).to.be(true);
      expect(F2.hasOwnProperty("inherits")).to.be(true);
    });
  });

  describe("when calling mixin with two arguments", function(){
    var F2 = F.mixin(mixinA, mixinC);
    var f2 = new F2("Who");

    it('should apply mixin methods to the instance', function(){
      expect(f2).to.have.property("greet");
      expect(f2).to.have.property("sayGoodbye");
    });

    it('should produce expected mix-in behavior', function(){
      expect(f2.greet()).to.be("Oh, hai Who");
      expect(f2.sayGoodbye()).to.be("Buh Bye Who");
    });

    it('should apply shared/constructor methods', function(){
      expect(F2.hasOwnProperty("mixin")).to.be(true);
      expect(F2.hasOwnProperty("extend")).to.be(true);
      expect(F2.hasOwnProperty("inherits")).to.be(true);
    });
  });

  describe("when using a mixin containing a postInit method", function() {
    var F2 = F.mixin(mixinB);
    var f2 = new F2("Who");
    it('should apply mixin method to the instance', function(){
      expect(f2).to.have.property("saySomething");
    });
    it('should apply mixin property to the instance', function(){
      expect(f2.otherName).to.be("Doctor Who");
    });
    it('should produce expected mix-in behavior', function(){
      expect(f2.saySomething()).to.be("'Stetsons are cool', said Doctor Who");
    });

    it('should apply shared/constructor methods', function(){
      expect(F2.hasOwnProperty("mixin")).to.be(true);
      expect(F2.hasOwnProperty("extend")).to.be(true);
      expect(F2.hasOwnProperty("inherits")).to.be(true);
    });
  });

  describe("when using a mixin containing a preInit method", function() {
    var F2 = F.mixin(mixinD);
    var f2 = new F2("Who");
    it('should apply mixin method to the instance', function(){
      expect(f2).to.have.property("saySomething");
    });
    it('should apply mixin property to the instance', function(){
      expect(f2.otherName).to.be("Doctor Who");
    });
    it('should produce expected mix-in behavior', function(){
      expect(f2.saySomething()).to.be("'Bowties are cool', said Doctor Who");
    });

    it('should apply shared/constructor methods', function(){
      expect(F2.hasOwnProperty("mixin")).to.be(true);
      expect(F2.hasOwnProperty("extend")).to.be(true);
      expect(F2.hasOwnProperty("inherits")).to.be(true);
    });
  });

  describe("when mixins methods collide with prototype methods", function(){
    var F = function(val) {
      this.name = val;
    };
    F.prototype.greet = function() { return "Hello " + this.name; };
    F.mixin = riveter.mixin;
    var F2 = F.mixin(mixinA);
    var f2 = new F2("Who");

    it('mix-in should **not** patch prototype', function(){
      expect(f2.greet()).to.be("Hello Who");
    });

    it('should apply shared/constructor methods', function(){
      expect(F2.hasOwnProperty("mixin")).to.be(true);
      expect(F2.hasOwnProperty("extend")).to.be(true);
      expect(F2.hasOwnProperty("inherits")).to.be(true);
    });
  });

  describe("when mixins methods collide with other mixin methods", function() {
    var F2 = F.mixin(mixinB, mixinD);
    var f2 = new F2("Who");
    it('should apply mixin method to the instance', function(){
      expect(f2).to.have.property("saySomething");
    });
    it('should apply mixin property to the instance', function(){
      expect(f2.otherName).to.be("Doctor Who");
    });
    it('should produce expected mix-in behavior (last mixin wins)', function(){
      expect(f2.saySomething()).to.be("'Bowties are cool', said Doctor Who");
    });

    it('should apply shared/constructor methods', function(){
      expect(F2.hasOwnProperty("mixin")).to.be(true);
      expect(F2.hasOwnProperty("extend")).to.be(true);
      expect(F2.hasOwnProperty("inherits")).to.be(true);
    });
  });

});