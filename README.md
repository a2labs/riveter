# riveter (v0.1.0)


### What is it?

riveter is an experimental JavaScript micro-library that provides the following facilities, which you can attach to your constructor functions:

* `mixin` - use this to mix objects which provide additional behavior into your constructor function.  The mix-ins may optional provide initialization methods that can be called before or after the original constructor function executes.
* `inherits` - an inheritance helper allowing a constructor function to inherit the prototype of another, allowing the ability to override the parent's constructor and also to provide 'shared' methods to the constructor function itself, etc.
* `extend` - helper method which can be attached to a constructor function. It wraps the `inherits` call, providing the constructor to which it is attached as the first argument (the parent).

### Why would I use it?

The boilerplate/ceremonial code around managing mix-ins and inheritance in JavaScript can be a significant portion of a code base. We want to remove the unnecessary boilerplate while providing a consistent, reliable way to extend constructors through a powerful & concise means.

riveter is heavily informed by appendTo projects using [backbone.js]().  We've often wanted the backbone-style extend functionality, but with some slight tweaks, while maitaining compatibility with backbone objects.  riveter is our attempt to standardize that approach - so you can use it with or without backbone

### How do I use it?
####mixins

The `mixin` call can be used to mix blocks of behavior into a constructor function. For example, let's say you had a pub/sub mixin, which you wanted to use across multiple constructor functions, to ensure that objects produced by those constructors had a `publish` and `subscribe` call. Of course, you could add those calls to the individual prototypes of your various constructor functions, or you could have a common 'base' prototype from which each inherit. Or you could do this:

```javascript
var Person = function(name) {
    this.name = name;
};
Person.prototype.greet = function() {
    return "Hi, " + this.name;
};

var Order = function(id) {
    this.id = id;
};
Order.prototype.addItem = function(item) {
    // some behavior….
};

var Product = function(sku) {
    this.sku = sku;
};

var pubSub = {
    publish: mediator.publish,
    subscribe: function(topic, callback) {
        if(!this._subscriptions) {
            this._subscriptions = {};
        }
        this._subscriptions[topic] = mediator.subscribe(topic, callback); 
    },
    removeSubscriptions: function() {
        if(this._subscriptions) {
            _.each(this._subscriptions, function(sub){
                sub.unsubscribe();
            });
        }
    }
};

Person.mixin(pubSub);
Order.mixin(pubSub);
Product.mixin(pubSub);

```

However - isn't it kind of ugly that the pubSub mixin's methods have to check to see if the `_subscriptions` member is present? Wouldn't it be nice if we could initialize state for the mixin, much like it we had baked the logic into the actual constructor function?  You can, if your mixin looks something like this:

```javascript
var pubSub = {
    _postInit: function() {
        this._subscriptions = {};
    },
    mixin: {
        publish: mediator.publish,
        subscribe: function(topic, callback) {
            this._subscriptions[topic] = mediator.subscribe(topic, callback); 
        },
        removeSubscriptions: function() {
            _.each(this._subscriptions, function(sub){
                sub.unsubscribe();
            });
        }
    }
}
```

In the above example, our mixin is now structured slightly differently.  The actual mixin is on the `mixin` member, and we've provided a `_postInit` method.  `_postInit` will execute just after the constructor function, and is passed any arguments that were passed to the constructor. You can optionally use the `_preInit` method to have your setup execute just before the constructor function executes. Although we haven't found a real use-case **yet**, you can provide both a `_preInit` and a `_postInit` method if you need to get way fancier than we have.

####inherits
…Examples coming…

####extend
…Examples coming…

### Caveats
riveter is currently an 'appendTo Labs' effort. This means that we're excited about it enough to make it a micro-library - and we invite you to try it out with us and give us your feedback.  However, being that it's experimental, we may also decide it's the worst idea since the 8-track cassette player.  As long as it continues to prove promising, it stands the chance of becoming a more 'officially supported' appendTo project. In short - we may pull the plug or change the name at any moment.