/*
  mixin examples
*/

/*
  inherits examples
*/

var Person = function(name) {
  this.name = name;
  console.log("PERSON CTOR");
};
Person.prototype.greet = function() {
  return "Hi, " + this.name;
};

var Employee = function(name, title, salary) {
  this.name = name;
  this.title = title;
  this.salary = salary;
  console.log("EMPLOYEE CTOR");
};

Employee.prototype.giveRaise = function(amount) {
  this.salary += amount;
};

var Worker = riveter.inherits(Person, Employee);


/*
  extend examples
*/