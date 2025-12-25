/**
 * Question 4: Implement curry()
 *
 * Currying is a functional programming technique that transforms a function
 * that takes multiple arguments into a sequence of functions that each take
 * a single argument.
 *
 * The curry function should:
 * - Take a function as input
 * - Return a curried version that can be called with partial arguments
 * - When all required arguments are provided, execute the original function
 * - Support multiple ways of calling: curry(fn)(a)(b)(c) or curry(fn)(a, b)(c), etc.
 *
 * Example usage:
 * const add = (a, b, c) => a + b + c;
 * const curriedAdd = curry(add);
 *
 * console.log(curriedAdd(1)(2)(3)); // 6
 * console.log(curriedAdd(1, 2)(3)); // 6
 * console.log(curriedAdd(1)(2, 3)); // 6
 * console.log(curriedAdd(1, 2, 3)); // 6
 *
 * const addTwo = curriedAdd(2);
 * console.log(addTwo(3)(4)); // 9
 *
 * @param {Function} func - The function to curry
 * @returns {Function} - The curried function
 */
function curry(func) {
  return function curried(...args) {
    // If we have enough arguments, call the original function
    if (args.length >= func.length) {
      return func.apply(this, args);
    }

    // Otherwise, return a new function that collects more arguments
    return function (...nextArgs) {
      return curried.apply(this, args.concat(nextArgs));
    };
  };
}

// Alternative implementation with more explicit argument tracking:
function curryAlt(func) {
  const arity = func.length;

  return function curried(...args) {
    if (args.length >= arity) {
      return func.apply(this, args.slice(0, arity));
    }

    return (...nextArgs) => curried(...args, ...nextArgs);
  };
}

// Test cases
const multiply = (a, b, c) => a * b * c;
const curriedMultiply = curry(multiply);

console.log(curriedMultiply(2)(3)(4)); // 24
console.log(curriedMultiply(2, 3)(4)); // 24
console.log(curriedMultiply(2)(3, 4)); // 24
console.log(curriedMultiply(2, 3, 4)); // 24

// Partial application example
const multiplyBy2 = curriedMultiply(2);
const multiplyBy2And3 = multiplyBy2(3);
console.log(multiplyBy2And3(4)); // 24

// Edge case: function with no parameters
const noArgs = () => "no arguments";
const curriedNoArgs = curry(noArgs);
console.log(curriedNoArgs()); // 'no arguments'
