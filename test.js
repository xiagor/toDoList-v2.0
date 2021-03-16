// let Person = function () {};
// Person.prototype.name = "Nicholas";
// Person.prototype.age = 29;
// Person.prototype.job = "Software Engineer";
// Person.prototype.sayName = function () {
// 	console.log(this.name);
// };
// let person1 = new Person();
// person1.sayName(); // "Nicholas"
// let person2 = new Person();
// person2.sayName(); // "Nicholas"
// console.log(person1.sayName === person2.sayName); // true

// console.log(person1.name === person2.name);
// person1.name = "Jack";
// console.log(person1.name === person2.name);

arr = [1, 2, 3, 5, 4, 3, 2, 1];
arr = arr.filter((item) => {
	return arr.indexOf(item) === arr.lastIndexOf(item);
});
console.log(arr);
