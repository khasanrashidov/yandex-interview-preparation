/**
 * Question 3: Implement async helper - sequence()
 *
 * Unlike Promise.all() which runs promises in parallel, sequence() should run
 * async functions one by one, in sequence. Each function should only start
 * after the previous one has completed.
 *
 * The sequence function takes an array of functions that return promises,
 * and returns a promise that resolves to an array of all resolved values
 * in the same order.
 *
 * Key behaviors:
 * - Execute functions sequentially (one after another)
 * - Wait for each promise to resolve before starting the next
 * - If any promise rejects, stop execution and reject immediately
 * - Return results in the same order as input functions
 *
 * Example usage:
 * const asyncFn1 = () => new Promise(resolve => setTimeout(() => resolve(1), 100));
 * const asyncFn2 = () => new Promise(resolve => setTimeout(() => resolve(2), 200));
 * const asyncFn3 = () => new Promise(resolve => setTimeout(() => resolve(3), 50));
 *
 * sequence([asyncFn1, asyncFn2, asyncFn3]).then(results => {
 *   console.log(results); // [1, 2, 3] after ~350ms total
 * });
 *
 * @param {Array<Function>} funcs - Array of functions that return promises
 * @returns {Promise<Array>} - Promise that resolves to array of sequential results
 */
async function sequence(funcs) {
  const results = [];

  for (let i = 0; i < funcs.length; i++) {
    try {
      // Wait for each function to complete before moving to the next
      const result = await funcs[i]();
      results.push(result);
    } catch (error) {
      // If any function throws/rejects, propagate the error
      throw error;
    }
  }

  return results;
}

// Alternative implementation using reduce:
function sequenceWithReduce(funcs) {
  return funcs.reduce(async (previousPromise, currentFunc) => {
    const results = await previousPromise;
    const currentResult = await currentFunc();
    return [...results, currentResult];
  }, Promise.resolve([]));
}

// Test cases
const delay = (ms, value) =>
  new Promise((resolve) => setTimeout(() => resolve(value), ms));

const asyncFn1 = () => delay(100, "first");
const asyncFn2 = () => delay(200, "second");
const asyncFn3 = () => delay(50, "third");

sequence([asyncFn1, asyncFn2, asyncFn3])
  .then((results) => console.log(results)) // ['first', 'second', 'third']
  .catch((error) => console.error(error));
