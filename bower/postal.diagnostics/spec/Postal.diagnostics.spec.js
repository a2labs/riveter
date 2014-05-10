var wiretap,
	msgs = [];
describe( "postal.diagnostics", function () {
	describe( "With DiagnosticsWireTap", function () {

		beforeEach(function() {
			wiretap = new postal.diagnostics.DiagnosticsWireTap({ name: "test", writer: function(x) { msgs.push(x); } });
		});
		afterEach(function() {
			msgs = [];
		});
		describe("when not logging anything", function() {
			it("should not capture any messages", function() {
				expect(msgs.length).to.be(0);
			});
			it("should not have any filters", function() {
				expect(wiretap.filters.length).to.be(0);
			});
			it("should default to active", function() {
				expect(wiretap.active).to.be(true);
			});
		});
		describe("when adding a filter with plain string match", function() {
			beforeEach(function(){
				wiretap.addFilter({ data: "bacon" });
			});
			it("should have one filter", function() {
				expect(wiretap.filters.length).to.be(1);
			});
			it("should filter a valid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "bacon"
				});
				expect(msgs.length).to.be(1);
				expect(msgs[0]).to.be(JSON.stringify(env, null, 4));
			});
			it("should *not* filter an invalid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "baconista"
				});
				expect(msgs.length).to.be(0);
				expect(msgs[0]).to.not.be(JSON.stringify(env, null, 4));
			});
		});
		describe("when adding a filter with regex match", function() {
			beforeEach(function(){
				wiretap.addFilter({ data: /bacon/ });
			});
			it("should have one filter", function() {
				expect(wiretap.filters.length).to.be(1);
			});
			it("should filter a valid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "bacon"
				});
				expect(msgs.length).to.be(1);
				expect(msgs[0]).to.be(JSON.stringify(env, null, 4));
			});
			it("should filter a second valid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "baconista"
				});
				expect(msgs.length).to.be(1);
				expect(msgs[0]).to.be(JSON.stringify(env, null, 4));
			});
			it("should *not* filter an invalid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "barkin"
				});
				expect(msgs.length).to.be(0);
				expect(msgs[0]).to.not.be(JSON.stringify(env, null, 4));
			});
		});
		describe("when adding a complex filter", function() {
			beforeEach(function(){
				wiretap.addFilter({
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: /sizzl/
					}
				});
			});
			it("should have one filter", function() {
				expect(wiretap.filters.length).to.be(1);
			});
			it("should filter a valid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				expect(msgs.length).to.be(1);
				expect(msgs[0]).to.be(JSON.stringify(env, null, 4));
			});
			it("should *not* filter an invalid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: "barkin"
				});
				expect(msgs.length).to.be(0);
				expect(msgs[0]).to.not.be(JSON.stringify(env, null, 4));
			});
			it("should *not* filter another invalid match", function(){
				var env = postal.publish({
					channel: "/",
					topic: "Nothing.Really",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				expect(msgs.length).to.be(0);
				expect(msgs[0]).to.not.be(JSON.stringify(env, null, 4));
			});
		});
		describe("when clearing all filters", function() {
			beforeEach(function(){
				wiretap.addFilter({
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: /sizzl/
					}
				});
			});
			it("should have one filter beforeEach clearing", function() {
				expect(wiretap.filters.length).to.be(1);
			});
			it("should have 0 filters after clearing", function(){
				wiretap.clearFilters();
				expect(wiretap.filters.length).to.be(0);
			});
		});
		describe("when clearing a specific filter", function() {
			beforeEach(function(){
				wiretap.addFilter({
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: /sizzl/
					}
				});
				wiretap.addFilter({
					topic: "Not.Really.Anything",
					data: {
						foo: "bar",
						bacon: "frozen"
					}
				});
			});
			it("should have two filters", function() {
				expect(wiretap.filters.length).to.be(2);
			});
			it("should filter valid match against either filter", function(){
				var envA = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				var envB = postal.publish({
					channel: "/",
					topic: "Not.Really.Anything"
				});
				expect(msgs.length).to.be(2);
				expect(msgs[0]).to.be(JSON.stringify(envA, null, 4));
				expect(msgs[1]).to.be(JSON.stringify(envB, null, 4));
			});
			it("should *not* filter an invalid match", function(){
				var envA = postal.publish({
					channel: "/",
					topic: "Not.Going.To.Get.Captured.YAY",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				expect(msgs.length).to.be(0);
			});
			it("should filter valid matches after removing one filter", function(){
				var envA = postal.publish({
					channel: "/",
					topic: "Anything.Really",
					data: {
						foo: "bar",
						bacon: "sizzling"
					}
				});
				var envB = postal.publish({
					channel: "/",
					topic: "Not.Really.Anything"
				});
				wiretap.removeFilter({
					topic: "Not.Really.Anything",
					data: {
						foo: "bar",
						bacon: "frozen"
					}
				});
				var envC = postal.publish({
					channel: "/",
					topic: "Not.Really.Anything"
				});
				expect(msgs.length).to.be(2);
				expect(msgs[0]).to.be(JSON.stringify(envA, null, 4));
				expect(msgs[1]).to.be(JSON.stringify(envB, null, 4));
			});
		});
	});
} );