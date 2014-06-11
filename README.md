# riveter (v0.2.0)


### What is it?

riveter is an experimental JavaScript micro-library that provides the following helper methods:

* `riveter.mixin` - use this to mix object literals into the target constructor function's prototype. Mixin methods are only copied to the prototype if they do not already exist on the prototype (so it preserves/prefers existing prototype implementations). (Can be used stand-alone via `riveter.mixin` or it can be attached to a constructor function.)
* `riveter.compose` - like `mixin`, you use this to mix objects which provide additional behavior into your constructor function - however, all of the mixins passed to `compose` are inserted into the target constructor's prototype chain, on the 'parent' prototype. Composed mix-ins may optionally provide initialization methods that can be called before or after the original constructor function executes. (Can be used stand-alone via `riveter.compose` or it can be attached to a constructor function.)
* `riveter.inherits` - an inheritance helper allowing a constructor function to inherit the prototype of another, allowing the ability to override the parent's constructor and also to provide 'shared' methods to the constructor function itself, etc. (Can be used stand-alone via `riveter.inherits` or it can be attached to a constructor function.)
* `riveter.extend` - helper method which can be attached to a constructor function. It wraps the `inherits` call, providing the constructor to which it is attached as the `parent` argument. (Must be attached to a constructor function to operate.)
* `riveter.punch` - works like `mixin`, but mixin methods *will override the target prototype* if they already exist.
* `riveter.rivet` - Adds the `mixin`, `extend`, `compose`, `inherits` and `punch` calls to a constructor function if they are not already present. While you can call `riveter.rivet`, a short cut is provided by simply calling `riveter()` and passing 1-to-n constructor functions as arguments, each of which will have the methods applied.

### Why would I use it?

The boilerplate/ceremonial code around managing mix-ins and inheritance in JavaScript can be a significant portion of a code base. We want to remove the unnecessary boilerplate while providing a consistent, reliable way to extend constructors through a powerful & concise means.

riveter is heavily informed by appendTo projects using [Backbone.js](http://backbonejs.org/). We've often wanted the backbone-style extend functionality, but with some slight tweaks, while maintaining compatibility with backbone objects. `riveter` is our attempt to standardize that approach. riveter is **not** dependent on backbone, it just plays well with it.  Speaking of dependencies, riveter does take one dependency: [lodash.js](http://lodash.com/).

### How do I use it?
####mixin

`constructorFn.mixin( mixin1 [, mixin2, mixin3, etc.] );`

`riveter.mixin( constructorFn, mixin1 [, mixin2, mixin3, etc.] );`

The `mixin` call takes 1-to-n number of object literals, each containing methods you want mixed into the target constructor function's prototype. Methods that already exist on the prototype will **not** be overridden. For example, let's say you had a pub/sub mixin, which you wanted to use across multiple constructor functions, to ensure that those instances had a `publish` and `subscribe` call. Of course, you could add those calls to the individual prototypes of your various constructor functions, or you could have a common 'base' prototype from which each inherit. Or you could do this:

    var Person = function( name ) {
        this.name = name;
    };
    Person.prototype.greet = function() {
        return "Hi, " + this.name;
    };

    var Order = function( id ) {
        this.id = id;
    };
    Order.prototype.addItem = function( item ) {
        // some behavior….
    };

    var Product = function( sku ) {
        this.sku = sku;
    };

    riveter( Product, Person, Order );

    var pubSub = {
        publish: mediator.publish,
        subscribe: function( topic, callback ) {
            if( !this._subscriptions ) {
                this._subscriptions = {};
            }
            this._subscriptions[ topic ] = mediator.subscribe( topic, callback ); 
        },
        removeSubscriptions: function() {
            if( this._subscriptions ) {
                _.each( this._subscriptions, function( sub ){
                    sub.unsubscribe();
                });
            }
        }
    };

    Person.mixin( pubSub );
    Order.mixin( pubSub );
    Product.mixin( pubSub );


####compose

`constructorFn.compose( mixin1 [, mixin2, mixin3, etc.] );`
`riveter.compose( constructorFn, mixin1 [, mixin2, mixin3, etc. ] );`

The `compose` call can be used to mix blocks of behavior into a constructor function. `compose` returns a new constructor function, with the mixed-in members on the resulting 'parent' prototype, but still-overridable by prototype or instance members applied from that point on. 

Continuing from the example above (for `mixin`s) - isn't it kind of ugly that the pubSub mixin's methods have to check to see if the `_subscriptions` member is present? Wouldn't it be nice if we could initialize state for the mixin, much like it we had baked the logic into the actual constructor function?  You can, by using `compose` to bake your mixins into a single level of the prototype chain:

    var pubSub = {
        _postInit: function() {
            this._subscriptions = {};
        },
        mixin: {
            publish: mediator.publish,
            subscribe: function( topic, callback ) {
                this._subscriptions[ topic ] = mediator.subscribe( topic, callback ); 
            },
            removeSubscriptions: function() {
                _.each( this._subscriptions, function( sub ){
                    sub.unsubscribe();
                });
            }
        }
    }

    var MsgPerson = Person.compose( pubSub );
    var MsgOrder = Order.compose( pubSub );
    var MsgProduct = Product.compose( pubSub );

In the above example, our 'composable' mixin is now structured slightly differently.  The actual mixin is on the `mixin` member, and we've provided a `_postInit` method.  `_postInit` will execute just after the constructor function, and is passed any arguments that were passed to the constructor. You can optionally use the `_preInit` method to have your setup execute just before the constructor function executes. Although we haven't found a real use-case **yet**, you can provide both a `_preInit` and a `_postInit` method if you need to get way fancier than we have.

`compose` may feel like a hybrid between `mixin` and `inherits` - that's because it is. Use `mixin` for when you only need to mix behavior from other objects into a target constructor's prototype.  Use `inherits` if you need/want to follow a more classical inheritance approach.  Use `compose` if you're mixing in mixins that have `_preInit` or `postInit` behavior, or to simulate multiple inheritance at one level of the prototype chain.

####inherits
There are two ways to use `inherits`: the stand-alone version (`riveter.inherits`) and when it's attached to a constructor function.

#####riveter.inherits (stand alone version)
`riveter.inherits(child, parent [, ctorProps ]);`

The `inherits` method allows you to specify a `parent` contructor function from which a `child` constructor function can inherit.  Optionally, the `child` can be an object literal (which is then used at the prototype of a new instance).  You can optionally provide the `ctorProps` argument, which applies 'shared' methods to the constructor function itself. Really, `inherits` is quite similar to many existing implementations which provide helper utilities around prototypical inheritance.  It's worth noting that when `child` inherits from `parent`, it's prototype will be a new instance of `parent`.  Some examples:

    var Person = function( name ) {
        this.name = name;
    };
    Person.prototype.greet = function() {
        return "Hi, " + this.name;
    };

    var Employee = function( name, title, salary ) {
        Employee.__super.call( this, name );
        this.title = title;
        this.salary = salary;
    };

    Employee.prototype.giveRaise = function( amount ) {
        this.salary += amount;
    };

    // Now, let's make Employee inherit from Person:
    riveter.inherits( Employee, Person );

As mentioned above, we can also provide an object literal as the "child" argument:

    var CEOProto = {
        fireAllThePeeps: function() {
            return "YOU'RE ALL FIRED!";
        },
        constructor: function( name, title, salary, shouldExpectFbiRaid ) {
            CEOProto.constructor.__super.call( this,name, title, salary );
            this.shouldExpectFbiRaid = shouldExpectFbiRaid;
        }
    };

    // let's use the above object as the prototype of a new constructor function, which inherits from Employee:
    var CEO = riveter.inherits( CEOProto, Employee );

Notice that when we provide a constructor function for the `child` argument, the `inherits` call mutates that constructor function in place, so there's no need to do this:

    // Don't need to do this, since Employee is already a constructor function
    var Employee = riveter.inherits( Employee, Person );

However, when we passed an object literal as the `child` argument, then you will want to take advantage of the fact that `inherits` returns the resulting constructor function:

    // only other way to get CEO would be to reference CEOProto.constructor
    // but constructor is an optional property if you pass an object literal...
    var CEO = riveter.inherits( CEOProto, Employee );

The examples above also demonstrate that riveter puts a `__super` function member on the resulting child constructor function, which is simply the constructor of the parent.  In addition, a ``__super__`` member is added as well (to match what Backbone.js provides) - which is a reference to the parent's prototype.  We don't recommend over-(ab)using calls to a `__super` constructor in your child instances, but given that this is still a fairly common approach with many JavaScript developers, we wanted to demonstrate that it's possible to do so if necessary.

#####constructor.inherits
`constructorFn.inherits(parent [, ctorProps ]);`
When `inherits` is attached to a constructor function, it's functionality is **identical** to `riveter.inherits`, except that the constructor function it is attached to is the `child` argument, so all you have to do is provide a `parent` argument and, optionally, any shared/constructor methods.  The `inherits` method can be attached by passing your constructor function to `riveter.ensureHelpers` (it's attached automatically to any constructor that uses `extend` or `mixin`).

    var Person = function( name ) {
        this.name = name;
    };
    Person.prototype.greet = function() {
        return "Hi, " + this.name;
    };

    var Employee = function( name, title, salary ) {
        Employee.__super.call( this, name );
        this.title = title;
        this.salary = salary;
    };

    Employee.prototype.giveRaise = function( amount ) {
        this.salary += amount;
    };
    // ensureHelpers adds inherits, extend and mixin
    // if they do not already exist on the constructor
    riveter.ensureHelpers( Employee );

    // Now, let's make Employee inherit from Person:
    Employee.inherits( Person );

####extend
`constructorFn.extend(childPrototypeProps [, ctorProps] );`

`riveter.extend(constructorFn, childPrototypeProps [, ctorProps] );`

It's very common for JavaScript developers to have an existing constructor function they'd like to use as a 'base' constructor, from which other constructors could inherit. The `extend` call can make this possible. It gets attached to an existing constructor function, and simply wraps a call to `inherits`, passing the constructor to which it's attached as the `parent` argument.  This pattern will feel familiar to developers that have used similar approaches in libraries like [Prototype.js](http://prototypejs.org/), [Closure](https://developers.google.com/closure/) and [Backbone.js](http://backbonejs.org/). For example:

    var Person = function( name ) {
        this.name = name;
        this.initialize.apply( this, arguments );
    };

    _.extend(Person.prototype, {
        greet: function() {
            return "Hi, " + this.name;
        },
        initialize: function() {

        }
    });

    // Here we attach the extend call to the constructor
    // Using extend will result in riveter ensuring inherits,
    // extend and mixin exist on the constructor from then on
    Person.extend = riveter.extend;

    var Employee = Person.extend({
        giveRaise: function( amount ) {
            this.salary += amount;
        },
        initialize: function( name, title, salary ) {
            this.title = title;
            this.salary = salary;
        }
    }, {
        getInstance: function( name, title, salary ) {
            return new Employee( name, title, salary );
        }
    });

    var CEO = Employee.extend({
        constructor: function( name, title, salary, shouldExpectFbiRaid ) {
            CEO.__super.call( this, name, title, salary );
            this.shouldExpectFbiRaid = shouldExpectFbiRaid;
        },
        fireAllThePeeps: function() {
            return "YOU'RE ALL FIRED!";
        }
    });​

Note in the above examples we've taken a cue from Backbone.js in providing a no-op `initialize` call in the `Person` prototype, and we call it at the end of the `Person` constructor.  That way, if any inheriting constructor provides an implementation of `initialize`, it will call that instead.

####punch
`constructorFn.punch( mixin1 [, mixin2, mixin3, etc.] );`

`riveter.punch( constructorFn, mixin1 [, mixin2, mixin3, etc.] );`

The `punch` call takes 1-to-n number of object literals, each containing methods you want mixed into the target constructor function's prototype. Methods that already exist on the prototype **will** be overridden.

    var Person = function( name ) {
        this.name = name;
    };
    Person.prototype.greet = function() {
        return "Hi, " + this.name;
    };

    riveter( Person );

    var greetPunch = {
        greet: function() {
            return "OHSNAP, I get to greet you, " + this.name;
        }
    };

    Person.punch( greetPunch );

### Caveats
riveter is currently an 'appendTo Labs' effort. This means that we're excited about it enough to make it a micro-library - and we invite you to try it out with us and give us your feedback.  However, being that it's experimental, we may also decide it's the worst idea since the 8-track cassette player.  As long as it continues to prove promising, it stands the chance of becoming a more 'officially supported' appendTo project. In short - we may pull the plug or change the name at any moment.

### Building & Running Tests
riveter uses [gulp.js](http://gulpjs.com/) to build.

* Install node.js (and consider using [nvm](https://github.com/creationix/nvm) to manage your node versions)
* run `npm install` & `bower install` to install all dependencies
* To build, run `npm run build` - then check the lib folder for the output
* To run tests & examples:
    * To run node-based tests: `npm run test`
    * To run browser-based tests & examples:
        * run `npm start`
        * navigate in your browser to <http://localhost:3080/>