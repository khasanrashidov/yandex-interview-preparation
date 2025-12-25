# Advanced JavaScript Theory Questions for Interview Two

## Theory Question 1: Web Workers and Multi-threading

**Based on**: Browser performance optimization and parallel processing

### Question:

Explain how Web Workers enable parallel processing in JavaScript. What will be the output of this code and what problem does it solve?

```javascript
// main.js
const worker = new Worker("worker.js");

console.log("Main: Starting calculation");

worker.postMessage({
  numbers: Array.from({ length: 10000000 }, (_, i) => i),
});

worker.onmessage = function (e) {
  console.log("Main: Received result:", e.data);
};

console.log("Main: Doing other work");

// worker.js
self.onmessage = function (e) {
  const sum = e.data.numbers.reduce((acc, curr) => acc + curr, 0);
  self.postMessage({ result: sum });
};
```

### Expected Answer:

Output:

1. "Main: Starting calculation"
2. "Main: Doing other work"
3. "Main: Received result: [sum]" (after calculation completes)

**Key concepts to explain**:

- Web Workers run in separate threads
- No shared memory/state between main thread and workers
- Communication through message passing
- Use cases: Heavy computations, data processing, real-time operations
- Limitations: No DOM access, no shared state

### Follow-up Questions:

1. What's the difference between dedicated workers and shared workers?
2. How would you handle errors in Web Workers?
3. When would you choose Web Workers over other optimization techniques?

---

## Theory Question 2: JavaScript Modules and Bundling

**Based on**: Modern JavaScript application architecture

### Question:

Explain the differences between these module patterns and their implications for bundling:

```javascript
// CommonJS (Node.js style)
const lodash = require("lodash");
module.exports = { helper: () => {} };

// ES Modules (Modern JavaScript)
import lodash from "lodash";
export const helper = () => {};

// Dynamic Import
const module = await import("./module.js");

// UMD (Universal Module Definition)
(function (root, factory) {
  if (typeof define === "function" && define.amd) {
    define(["lodash"], factory);
  } else if (typeof exports === "object") {
    module.exports = factory(require("lodash"));
  } else {
    root.MyModule = factory(root.lodash);
  }
})(this, function (lodash) {
  return {
    /* module content */
  };
});
```

### Expected Answer:

**Key differences**:

- CommonJS: Synchronous, Node.js native, not tree-shakeable
- ES Modules: Asynchronous, static analysis possible, tree-shakeable
- Dynamic Import: Runtime loading, code splitting support
- UMD: Cross-environment compatibility, more complex

**Bundling implications**:

- Tree shaking only works with ES Modules
- Code splitting requires ES Modules or Dynamic Imports
- UMD modules can't be optimized as effectively

### Follow-up Questions:

1. How does tree shaking work with ES Modules?
2. What are the security implications of dynamic imports?
3. How do circular dependencies behave in different module systems?

---

## Theory Question 3: JavaScript Proxies and Reflection

**Based on**: Meta-programming and advanced object manipulation

### Question:

Explain how Proxies work in JavaScript. How would you implement a "negative array index" feature using Proxies?

```javascript
const arr = [1, 2, 3, 4, 5];
const proxiedArr = new Proxy(arr, {
  // Implement handler to allow arr[-1] to return last element
});

console.log(proxiedArr[-1]); // Should print: 5
console.log(proxiedArr[-2]); // Should print: 4
```

### Expected Answer:

```javascript
const arr = [1, 2, 3, 4, 5];
const proxiedArr = new Proxy(arr, {
  get(target, prop) {
    if (typeof prop === "string") {
      const index = parseInt(prop);
      if (index < 0) {
        return target[target.length + index];
      }
    }
    return target[prop];
  },
});
```

**Key concepts**:

- Proxy as a wrapper for objects
- Trap methods (get, set, has, etc.)
- Use cases: Validation, logging, default values, formatting
- Performance implications
- Reflection API integration

### Follow-up Questions:

1. How would you implement validation using Proxies?
2. What's the performance impact of using Proxies?
3. How do Proxies work with the `in` operator and `delete`?

---

## Theory Question 4: JavaScript Iterators and Generators

**Based on**: Advanced control flow and data structures

### Question:

Explain the difference between these implementations and when you'd use each:

```javascript
// Implementation 1: Iterator
const range1 = {
  from: 1,
  to: 5,
  [Symbol.iterator]() {
    return {
      current: this.from,
      last: this.to,
      next() {
        if (this.current <= this.last) {
          return { done: false, value: this.current++ };
        }
        return { done: true };
      },
    };
  },
};

// Implementation 2: Generator
function* range2(from, to) {
  for (let i = from; i <= to; i++) {
    yield i;
  }
}

// Usage
for (let num of range1) console.log(num);
for (let num of range2(1, 5)) console.log(num);
```

### Expected Answer:

**Iterator Pattern**:

- Manual implementation of iteration protocol
- More control over iteration behavior
- Can maintain complex internal state
- More verbose but potentially more flexible

**Generator Pattern**:

- Simpler syntax with `function*` and `yield`
- Automatic implementation of iteration protocol
- Built-in support for async iteration
- Better for linear sequences

**Use cases**:

- Iterators: Complex data structures, custom iteration behavior
- Generators: Processing streams, implementing async flows

### Follow-up Questions:

1. How would you implement async iteration?
2. What's the memory impact of generators vs iterators?
3. How do you handle errors in both patterns?

---

## Theory Question 5: JavaScript Memory Management and WeakRefs

**Based on**: Advanced memory handling and garbage collection

### Question:

Explain the differences between these references and their impact on memory management:

```javascript
// Strong reference
let obj = { data: "important" };
const strongRef = obj;

// Weak reference
const weakRef = new WeakRef(obj);

// FinalizationRegistry
const registry = new FinalizationRegistry((value) => {
  console.log("Object is being garbage collected:", value);
});
registry.register(obj, "my object");

// WeakMap
const weakMap = new WeakMap();
weakMap.set(obj, "metadata");

obj = null; // What happens to each reference?
```

### Expected Answer:

**After `obj = null`**:

- strongRef: Still holds the object, prevents GC
- weakRef: Object may be GC'd, `weakRef.deref()` returns undefined
- FinalizationRegistry: Callback triggers when object is GC'd
- WeakMap: Entry is automatically removed when object is GC'd

**Use cases**:

- WeakRef: Caching, memoization
- FinalizationRegistry: Resource cleanup
- WeakMap: Metadata storage, avoiding memory leaks

**Best practices**:

- Prefer strong references for critical data
- Use weak references for caching/optimization
- Always handle the case where weak references return undefined

### Follow-up Questions:

1. How do weak references affect application architecture?
2. What are the performance implications of using WeakRefs?
3. How would you implement a cache with automatic cleanup?

---

## Preparation Tips:

### For Each Question Category:

1. **Understand the underlying mechanisms**
2. **Know the performance implications**
3. **Be able to discuss real-world applications**
4. **Consider security implications**

### Common Follow-ups:

- "How would you test this?"
- "What are the browser compatibility concerns?"
- "How does this scale in production?"
- "What are the security implications?"
- "How would you debug issues with this?"

### Study Resources:

- **Web Workers**: HTML5 Rocks guide on Web Workers
- **Modules**: MDN guide on JavaScript modules
- **Proxies**: JavaScript Proxy MDN documentation
- **Generators**: Exploring ES6 by Dr. Axel Rauschmayer
- **Memory Management**: V8 blog posts on garbage collection
