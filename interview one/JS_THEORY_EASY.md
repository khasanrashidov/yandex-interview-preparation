# Simple JavaScript Theory Questions for Yandex Interview

## Theory Question 1: Basic Event Loop

**Simple concept**: What happens first, second, third?

### Question:

What will be the output of this code?

```javascript
console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

console.log("C");
```

### Expected Answer:

- Output: A, C, B
- **Why**:
  - `console.log('A')` runs immediately
  - `setTimeout` goes to the task queue (even with 0 delay)
  - `console.log('C')` runs immediately
  - `setTimeout` callback runs after the main code finishes

### Follow-up:

"Why doesn't setTimeout with 0ms run immediately?"

---

## Theory Question 2: Simple Closures

**Simple concept**: Functions remembering variables from outside

### Question:

What will this code print?

```javascript
function outer() {
  var message = "Hello";

  function inner() {
    console.log(message);
  }

  return inner;
}

const myFunction = outer();
myFunction(); // What prints?
```

### Expected Answer:

- Output: "Hello"
- **Why**: The `inner` function remembers the `message` variable even after `outer` finishes
- **This is called**: A closure - when a function "closes over" variables from its outer scope

### Follow-up:

"What happens to the `message` variable after `outer()` finishes?"

---

## Theory Question 3: `this` Keyword Basics

**Simple concept**: What does `this` point to?

### Question:

What will be the output?

```javascript
const person = {
  name: "John",
  sayHello: function () {
    console.log("Hello, I am " + this.name);
  },
};

person.sayHello(); // Output 1?

const hello = person.sayHello;
hello(); // Output 2?
```

### Expected Answer:

- Output 1: "Hello, I am John" (`this` refers to `person` object)
- Output 2: "Hello, I am undefined" (`this` refers to global object or undefined in strict mode)
- **Why**: `this` depends on HOW the function is called, not WHERE it's defined

### Follow-up:

"How can you fix the second call to work properly?"

---

## Theory Question 4: var vs let vs const

**Simple concept**: Different ways to declare variables

### Question:

What's the difference between these?

```javascript
var a = 1;
let b = 2;
const c = 3;
```

And what happens here?

```javascript
console.log(x); // ?
var x = 5;

console.log(y); // ?
let y = 10;
```

### Expected Answer:

- **var**: Function-scoped, hoisted (moved to top), can be redeclared
- **let**: Block-scoped, not hoisted (temporal dead zone), can't be redeclared
- **const**: Block-scoped, not hoisted, can't be redeclared or reassigned

- `console.log(x)` → `undefined` (var is hoisted but not initialized)
- `console.log(y)` → `ReferenceError` (let is not hoisted)

---

## Theory Question 5: Promises Basics

**Simple concept**: Handling async operations

### Question:

What will this code do?

```javascript
const promise = new Promise((resolve, reject) => {
  setTimeout(() => {
    resolve("Success!");
  }, 1000);
});

promise.then((result) => {
  console.log(result);
});

console.log("End");
```

### Expected Answer:

- Output: "End" immediately, then "Success!" after 1 second
- **Why**:
  - Promise is asynchronous
  - `console.log('End')` runs immediately
  - `.then()` callback runs after promise resolves

### Follow-up:

"What's the difference between callbacks and promises?"

---

## Theory Question 6: Array Methods

**Simple concept**: Common array operations

### Question:

What's the difference between these array methods?

```javascript
const numbers = [1, 2, 3, 4, 5];

// Method 1
const doubled1 = numbers.map((x) => x * 2);

// Method 2
const doubled2 = [];
numbers.forEach((x) => {
  doubled2.push(x * 2);
});
```

### Expected Answer:

- **map()**: Returns a NEW array with transformed elements
- **forEach()**: Executes a function for each element, returns nothing
- Both `doubled1` and `doubled2` will be `[2, 4, 6, 8, 10]`
- **Best practice**: Use `map()` when you want to transform data

### Follow-up:

"When would you use forEach instead of map?"

---

## Theory Question 7: Objects and References

**Simple concept**: How objects are passed around

### Question:

What will be the output?

```javascript
const obj1 = { name: "John" };
const obj2 = obj1;

obj2.name = "Jane";

console.log(obj1.name); // ?
console.log(obj2.name); // ?
```

### Expected Answer:

- Both will print "Jane"
- **Why**: Objects are passed by reference, not by value
- `obj1` and `obj2` point to the same object in memory
- Changing one affects the other

### Follow-up:

"How can you make a copy of an object?"

```javascript
const obj3 = { ...obj1 }; // Shallow copy
const obj4 = Object.assign({}, obj1); // Also shallow copy
```

---

## Theory Question 8: Functions as Values

**Simple concept**: Functions can be stored in variables

### Question:

Are these the same?

```javascript
// Way 1
function sayHello() {
  console.log("Hello");
}

// Way 2
const sayHello = function () {
  console.log("Hello");
};

// Way 3
const sayHello = () => {
  console.log("Hello");
};
```

### Expected Answer:

**They're similar but different:**

- **Way 1 (Function Declaration)**: Hoisted (can use before declaration), has `this`
- **Way 2 (Function Expression)**: Not hoisted, has `this`
- **Way 3 (Arrow Function)**: Not hoisted, no `this` (uses parent's `this`)

**Example difference:**

```javascript
// This works
sayHello(); // "Hello"
function sayHello() {
  console.log("Hello");
}

// This doesn't work
sayHello(); // Error!
const sayHello = function () {
  console.log("Hello");
};
```

---

## Theory Question 9: Truthy and Falsy

**Simple concept**: What JavaScript considers true/false

### Question:

Which of these are `falsy` (act like false)?

```javascript
false
0
""
null
undefined
NaN
"0"
[]
{}
```

### Expected Answer:

**Falsy values** (only these 6):

- `false`
- `0`
- `""` (empty string)
- `null`
- `undefined`
- `NaN`

**Everything else is truthy**, including:

- `"0"` (string with zero)
- `[]` (empty array)
- `{}` (empty object)

### Follow-up:

"How do you check if an array is empty?"

```javascript
if (arr.length === 0) {
  /* empty */
}
// Don't use: if (!arr) - this doesn't work!
```

---

## Theory Question 10: Basic Async/Await

**Simple concept**: Cleaner way to write promises

### Question:

Are these the same?

```javascript
// Version 1: Promises
function getData() {
  return fetch("/api/data")
    .then((response) => response.json())
    .then((data) => {
      console.log(data);
      return data;
    });
}

// Version 2: Async/Await
async function getData() {
  const response = await fetch("/api/data");
  const data = await response.json();
  console.log(data);
  return data;
}
```

### Expected Answer:

- **Yes, they do the same thing!**
- **async/await** is just a cleaner way to write promises
- **async** makes a function return a promise
- **await** waits for a promise to resolve
- **Why it's better**: Easier to read, looks like normal code, easier to handle errors

---

## Quick Review - Key Concepts:

### **Essential JavaScript Concepts:**

1. **Event Loop**: Sync code runs first, then async callbacks
2. **Closures**: Functions remember variables from outer scopes
3. **this**: Depends on HOW function is called
4. **Variables**: var (old), let/const (new and better)
5. **Promises**: Handle async operations cleanly
6. **Arrays**: map() returns new array, forEach() doesn't
7. **Objects**: Passed by reference (be careful!)
8. **Functions**: Can be stored in variables, different types behave differently
9. **Truthy/Falsy**: Only 6 values are falsy, everything else is truthy
10. **Async/Await**: Clean way to write promise-based code

### **How to Prepare:**

- **Practice explaining** each concept in simple words
- **Write small code examples** for each concept
- **Think of real-world uses** - "When would I use this?"
- **Don't memorize** - understand the "why" behind each concept
