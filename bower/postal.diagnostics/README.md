# postal.diagnostics

# Version 0.7.0

# What is it?
postal.diagnostics is a plug-in for [postal.js](https://github.com/postaljs/postal.js) that enables a 'smart' wiretap on message bus to log all or a filtered subset of messages.  You provide a `DiagnosticsWireTap` instance with a "writer" callback - enabling you to write the logged messages to the console (for example), or to the file system (node.js), DOM Element, websocket or nearly anything else that can be a "writer target".

# Why would I use it?
Developing a browser or node.js application using a local message bus like [postal.js](https://github.com/postal/postal.js) can greatly benefit from design/debug-time console logging.  The postal.diagnostics plugin gives you tight control over what gets logged out to your writer callback, so it's fairly simple to narrow down your logged output to the messages you want to see.  Having good visibility into the messages being published assists you in seeing the components of your application interact, and helps resolve odd runtime edge cases.

# Ok, great, so *how* do I use it?

* For non-amd browser usage you can access the DiagnosticsWireTap constructor from `postal.diagnostics.DiagnosticsWireTap`
* For amd usage, the module returns the constructor function (i.e. - `require(['postal.diagnostics'], function(DiagnosticsWireTap) { /* use the constructor here */ });`
* For node.js, the module returns the constructor function (i.e. - `var DiagnosticsWireTap = require('./postal.diagnostics')(_, postal)`)
* The DiagnosticsWireTap constructor takes 1 argument:
	* `options` - the options object can provide any of the following members (none are required)
		* `name`    - the name given to the wiretap (it should be unique - and is most often used to identify *where* it's logging to.  Example, "console").  This value will be used to attach your wiretap instance to the postal.diagnostics namespace (ex. - postal.diagnostics.console). If you don't provide one, a name will be provided for you.
		* `writer`  - a function that takes one arg (the serialized message envelope) and provides the implementation of how/where to write the desired data.  Simple example: `function(output) { console.log(output); }` (which is also the default value)
		* `serialize` - a function that takes one arg (the envelope) and returns the desired format to represent the envelope. If you don't want to serialize, you'd simply `function(envelope) { return envelope; }`. *OR* you can stringify it with formatting: `function(envelope) { return JSON.stringify(envelope, null, 4) }` (that example is the default value).
		* `filters` - optional array of filters that will constrain which envelopes get passed to the `writer` callback. (Filters can also be added later using the `addFilter` method.)
		* 'active' - boolean which is used to indicate if the wire tap should be active or not. This defaults to `true`.
* DiagnosticsWireTap instance members
	* `name` - unique name of the wire tap instance.
	* `filters` - an array of filters currently being used by the diagnostics wiretap instance.
	* `active` - boolean flag (defaults to true) that turns the wiretap off and on
	* `removeWireTap` - removes the wiretap from postal
* The DiagnosticsWireTap prototype implementation:
	* `applyFilter` - helper method used to apply a given filter to a message envelope, which passes it to the writer callback if it passes the filter test (you should not need to invoke this directly).
	* `clearFilters` - removes all filters from the `filters` array.
	* `removeFilter` - removes a specific filter
	* `addFilter` - accepts a single filter or an array of filters for the wiretap to use for constraining which envelopes get passed to the writer callback
* See below for examples

## Instantiating a DiagnosticsWireTap
```javascript
// simple wire tap:
// serializes the envelope via JSON.stringify(envelope, null, 4)
// and writes it to console.log (it also gets a default name)
var wireTap = new postal.diagnostics.DiagnosticsWireTap();

// using AMD/require.js
define(['postal.diagnostics'], function(DiagnosticsWireTap) {
	var wireTap = new DiagnosticsWireTap({ name: "console" });
	// other stuff here.....
});

// node.js - postal and underscore need to be passed to the function returned by the module
var _ = require('underscore');
var postal = require('postal');
var DiagnosticsWireTap = require('postal.diagnostics')(_, postal);

var wireTap = new DiagnosticsWireTap({name: "console"});

```

## Using Filters
Filters are a simple way to constrain what envelopes get passed to the writer callback you provide to the `DiagnosticsWireTap` instance.  A filter is (usually) an object literal that should align with the hierarchy of a postal message envelope - though you only implement the members on which you want to match.  For example:

```javascript
// Consider an envelope like this:
{
	channel: "SomeChannel",
	topic: "Some.Topic",
	data: {
		foo: "bar",
		bacon: "sizzle"
	}
}

// to match the above envelope on topic name only, your filter object would look like:
{ topic: "Some.Topic" }

// to match the envelope by testing if a member of the data property matched a specific value:
{ data: { bacon: "sizzle" } }

// to match the envelope by testing if a member of the data property matched a regex:
{ data: { bacon: /sizzl/ } }

```

As mentioned above, filters can be provided when you instantiate the wiretap, or added later by calling `addFilter`

Here's an example of instantiating a `DiagnosticsWireTap` with 3 filters:

```javascript
// The filters below mean that ANY envelope that passes
// at least one of the filters will be passed to the writer callback
var wireTap = new DiagnosticsWireTap({
	name: "console",
	filters: [
		{ channel: "MyChannel" },
		{ data: { foo: /bar/ } },
		{ topic: "Some.Topic" }
	]
});
```

## Build, Dependencies, etc.

* In case it's not obvious already, postal.diagnostics depends on [postal.js](https://github.com/postaljs/postal.js)
* postal.diagnostics also depends on [underscore.js](http://underscorejs.org/)
* postal.diagnostics uses [anvil.js](http://anvil-js.com/) for building, running tests and examples.
	* To build
        * install anvil.js (`npm install -g anvil.js`)
        * navigate to the root of the repo and run `anvil` - then check the lib folder for the output
    * To run tests & examples
        * navigate to the root of the repo and run `anvil --host --browser	`
        * navigate in your browser to http://localhost:3080/spec for tests
        * navigate in your browser to http://localhost:3080/example for tests

## License
postal.diagnostics is dual-licensed MIT & GPL - use whichever is appropriate for your project.
