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
…Examples to come…

### Caveats
riveter is currently an 'appendTo Labs' effort. This means that we're excited about it enough to make it a micro-library - and we invite you to try it out with us and give us your feedback.  However, being that it's experimental, we may also decide it's the worst idea since the 8-track cassette player.  As long as it continues to prove promising, it stands the chance of becoming a more 'officially supported' appendTo project. In short - we may pull the plug or change the name at any moment.