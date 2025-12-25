/**
 * Question 3: Implement _.memoize()
 * 
 * Create a function that memoizes the results of a function based on its arguments.
 * 
 * Key requirements:
 * - Cache function results
 * - Handle multiple arguments
 * - Expose cache for manual management
 * - Preserve 'this' context
 * 
 * @param {Function} func - The function to memoize
 * @returns {Function} - Memoized function with .cache property
 * 
 * Example:
 * const memoizedFn = memoize((a, b) => ({ sum: a + b }));
 * 
 * memoizedFn(1, 2); // Computes { sum: 3 }
 * memoizedFn(1, 2); // Returns cached { sum: 3 }
 * memoizedFn.cache.get('1__2'); // Access cache directly
 */
function memoize(func) {
  if (typeof func !== 'function') {
    throw new TypeError('Expected a function');
  }

  // Create memoized function
  const memoized = function(...args) {
    const key = args.length === 0 
      ? '__zero_args__' 
      : args.length === 1 
        ? args[0] 
        : args.join('__');

    // Get cache for this context
    const cache = memoized.cache;

    if (cache.has(key)) {
      return cache.get(key);
    }

    // Compute and cache result
    const result = func.apply(this, args);
    cache.set(key, result);
    return result;
  };

  // Attach cache to function
  memoized.cache = new Map();

  return memoized;
}

// Test cases
// Test 1: Basic memoization
const add = (a, b) => {
  console.log('Computing sum...');
  return a + b;
};

const memoizedAdd = memoize(add);
console.log(memoizedAdd(1, 2)); // Computing sum... 3
console.log(memoizedAdd(1, 2)); // 3 (from cache)
console.log(memoizedAdd(2, 3)); // Computing sum... 5

// Test 2: Object property access
const getItem = (obj, path) => {
  console.log('Accessing path...');
  return path.split('.').reduce((o, k) => o?.[k], obj);
};

const memoizedGetItem = memoize(getItem);
const obj = { a: { b: { c: 3 } } };

console.log(memoizedGetItem(obj, 'a.b.c')); // Accessing path... 3
console.log(memoizedGetItem(obj, 'a.b.c')); // 3 (from cache)
console.log(memoizedGetItem(obj, 'a.b')); // Accessing path... { c: 3 }

// Test 3: Object methods and 'this' context
const user = {
  name: 'John',
  getName(greeting) {
    console.log('Computing name...');
    return `${greeting}, ${this.name}`;
  }
};

const memoizedGetName = memoize(user.getName.bind(user));
console.log(memoizedGetName('Hi')); // Computing name... Hi, John
console.log(memoizedGetName('Hi')); // Hi, John (from cache)

// Test 4: Cache manipulation
const memoizedFn = memoize((a, b) => a + b);
memoizedFn(1, 2);
console.log('Cache size:', memoizedFn.cache.size);
memoizedFn.cache.clear();
console.log('Cache after clear:', memoizedFn.cache.size);