# JavaScript Theory Questions for Yandex Frontend Developer Interview

## Theory Question 1: Event Loop and Asynchronous Execution

**Based on**: setTimeout fake timer implementation

### Question:

Explain the JavaScript event loop. What will be the output of this code and why?

```javascript
console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");

setTimeout(() => console.log("5"), 0);

Promise.resolve().then(() => {
  console.log("6");
  return Promise.resolve().then(() => console.log("7"));
});

console.log("8");
```

### Expected Answer:

- **Output**: 1, 4, 8, 3, 6, 7, 2, 5
- **Key concepts to explain**:
  - Call stack vs. Event loop
  - Macrotasks (setTimeout, setInterval) vs. Microtasks (Promises, queueMicrotask)
  - Microtasks have higher priority than macrotasks
  - Event loop phases: Call stack → Microtask queue → Macrotask queue

### Follow-up Questions:

1. What's the difference between `setTimeout(fn, 0)` and `setImmediate(fn)`?
2. How does `requestAnimationFrame` fit into the event loop?
3. What happens if a microtask creates another microtask infinitely?

---

## Theory Question 2: Closures and Lexical Scoping

**Based on**: debounce and curry implementations

### Question:

Explain closures in JavaScript. What's wrong with this code and how would you fix it?

```javascript
function createButtons() {
  const buttons = [];

  for (var i = 0; i < 5; i++) {
    buttons.push(function () {
      console.log("Button " + i + " clicked");
    });
  }

  return buttons;
}

const buttons = createButtons();
buttons[0](); // What will this print?
buttons[2](); // What will this print?
```

### Expected Answer:

- **Problem**: All functions will print "Button 5 clicked" because they share the same reference to `i`
- **Solutions**:
  1. Use `let` instead of `var`
  2. Use IIFE (Immediately Invoked Function Expression)
  3. Use `bind()` method
  4. Use arrow functions with proper scoping

```javascript
// Solution 1: let
for (let i = 0; i < 5; i++) {
  /* ... */
}

// Solution 2: IIFE
for (var i = 0; i < 5; i++) {
  buttons.push(
    (function (index) {
      return function () {
        console.log("Button " + index + " clicked");
      };
    })(i)
  );
}

// Solution 3: bind
buttons.push(
  function (index) {
    console.log("Button " + index + " clicked");
  }.bind(null, i)
);
```

### Follow-up Questions:

1. How do closures affect memory management?
2. Explain lexical vs. dynamic scoping
3. What are the performance implications of closures?

---

## Theory Question 3: Prototypal Inheritance and `this` Context

**Based on**: custom Array methods and object-oriented patterns

### Question:

Explain JavaScript's prototypal inheritance. What will be the output and why?

```javascript
function Animal(name) {
  this.name = name;
}

Animal.prototype.speak = function () {
  console.log(this.name + " makes a sound");
};

function Dog(name, breed) {
  Animal.call(this, name);
  this.breed = breed;
}

Dog.prototype = Object.create(Animal.prototype);
Dog.prototype.constructor = Dog;

Dog.prototype.speak = function () {
  console.log(this.name + " barks");
};

const dog = new Dog("Rex", "Golden Retriever");
const speak = dog.speak;

dog.speak(); // Output?
speak(); // Output?
speak.call(dog); // Output?
Animal.prototype.speak.call(dog); // Output?
```

### Expected Answer:

- `dog.speak()` → "Rex barks" (method called on dog instance)
- `speak()` → "undefined barks" or error (lost `this` context)
- `speak.call(dog)` → "Rex barks" (explicit `this` binding)
- `Animal.prototype.speak.call(dog)` → "Rex makes a sound" (calling parent method)

### Key Concepts:

- Prototype chain lookup
- Method borrowing with `call`, `apply`, `bind`
- Constructor functions vs. class syntax
- `this` binding rules (implicit, explicit, new, arrow functions)

---

## Theory Question 4: Design Patterns

**Based on**: Promise implementation and async patterns

### Question:

Implement the Observer pattern in JavaScript. Then explain how it relates to the Publisher-Subscriber pattern and where you might use it in frontend development.

```javascript
// Your implementation here
class Subject {
  // Implement observer pattern
}

class Observer {
  // Implement observer interface
}
```

### Expected Answer:

```javascript
class Subject {
  constructor() {
    this.observers = [];
  }

  subscribe(observer) {
    this.observers.push(observer);
  }

  unsubscribe(observer) {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notify(data) {
    this.observers.forEach((observer) => observer.update(data));
  }
}

class Observer {
  constructor(name) {
    this.name = name;
  }

  update(data) {
    console.log(`${this.name} received: ${data}`);
  }
}
```

### Key Differences:

- **Observer**: Direct relationship between subject and observers
- **Pub/Sub**: Decoupled through event channel/message broker
- **Use cases**: State management, DOM events, React state updates, real-time data feeds

---

## Theory Question 5: Memory Management and Performance

**Based on**: array operations and data structure implementations

### Question:

Explain JavaScript's garbage collection. What memory leaks might occur in this code?

```javascript
function createDataProcessor() {
  const largeArray = new Array(1000000).fill(0);
  const cache = new Map();

  function processData(data) {
    // Process and cache results
    cache.set(data.id, data);

    // Add event listener
    document.addEventListener("click", function handler() {
      console.log("Processing", data.id);
      // Some processing logic
    });

    return {
      process: () => processData(data),
      getData: () => cache.get(data.id),
    };
  }

  return processData;
}
```

### Expected Answer:

**Memory leaks identified**:

1. **Event listeners not removed** - each call adds a new listener
2. **Cache grows indefinitely** - Map never cleared
3. **Closure retains large array** - `largeArray` stays in memory
4. **Circular references** in returned object

**Solutions**:

```javascript
// Remove event listeners
element.removeEventListener("click", handler);

// Limit cache size
if (cache.size > 100) cache.clear();

// Use WeakMap for automatic garbage collection
const cache = new WeakMap();

// Avoid retaining unnecessary references
```

---

## Theory Question 6: Hoisting and Temporal Dead Zone

**Based on**: function declarations and variable scoping

### Question:

Explain hoisting in JavaScript. What will be the output?

```javascript
console.log(a); // ?
console.log(b); // ?
console.log(c); // ?

var a = 1;
let b = 2;
const c = 3;

console.log(typeof d); // ?
console.log(typeof e); // ?

function d() {}
var e = function () {};
```

### Expected Answer:

- `console.log(a)` → `undefined` (var hoisted, initialized with undefined)
- `console.log(b)` → `ReferenceError` (let in temporal dead zone)
- `console.log(c)` → `ReferenceError` (const in temporal dead zone)
- `typeof d` → `"function"` (function declarations fully hoisted)
- `typeof e` → `"undefined"` (var hoisted, function assigned later)

---

## Theory Question 7: Advanced Promise Concepts

**Based on**: Promise.all() and async sequence implementations

### Question:

What's the difference between these async patterns? When would you use each?

```javascript
// Pattern 1
const results1 = await Promise.all([
  fetch("/api/users"),
  fetch("/api/posts"),
  fetch("/api/comments"),
]);

// Pattern 2
const users = await fetch("/api/users");
const posts = await fetch("/api/posts");
const comments = await fetch("/api/comments");

// Pattern 3
const results3 = await Promise.allSettled([
  fetch("/api/users"),
  fetch("/api/posts"),
  fetch("/api/comments"),
]);
```

### Expected Answer:

- **Pattern 1 (Promise.all)**: Parallel execution, fails fast if any rejects
- **Pattern 2 (Sequential)**: One after another, good for dependent operations
- **Pattern 3 (Promise.allSettled)**: Parallel execution, continues even if some fail

**Use cases**:

- Promise.all: When all operations must succeed
- Sequential: When operations depend on each other
- Promise.allSettled: When you need results from all operations regardless of failures

---

## Theory Question 8: Functional Programming Concepts

**Based on**: curry implementation and array methods

### Question:

Explain the difference between pure and impure functions. Convert this impure function to pure:

```javascript
let globalCounter = 0;
const users = [];

function addUser(name, age) {
  globalCounter++;
  const user = {
    id: globalCounter,
    name: name,
    age: age,
    createdAt: new Date(),
  };
  users.push(user);
  console.log("User added:", user);
  return user;
}
```

### Expected Answer:

**Pure function version**:

```javascript
function createUser(id, name, age, timestamp = Date.now()) {
  return {
    id,
    name,
    age,
    createdAt: new Date(timestamp),
  };
}

function addUserPure(users, user) {
  return [...users, user];
}
```

**Key concepts**:

- **Pure functions**: Same input → same output, no side effects
- **Benefits**: Predictable, testable, cacheable, parallelizable
- **Immutability**: Don't modify original data structures

---

## Preparation Tips:

### For Each Question Category:

1. **Understand the why, not just the how**
2. **Be able to give real-world examples**
3. **Know the trade-offs and performance implications**
4. **Practice explaining complex concepts simply**

### Common Follow-ups:

- "How would you test this?"
- "What are the performance implications?"
- "How does this work in different browsers?"
- "Can you think of alternative approaches?"
- "When would you choose this pattern over others?"

### Study Resources:

- **Event Loop**: Philip Roberts' "What the heck is the event loop anyway?"
- **Closures**: MDN documentation and Kyle Simpson's "You Don't Know JS"
- **Prototypes**: Understanding the prototype chain visually
- **Design Patterns**: Gang of Four patterns applied to JavaScript
- **Performance**: Chrome DevTools profiling and memory analysis
