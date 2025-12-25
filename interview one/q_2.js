/**
 * Question 2: Implement Promise.all()
 *
 * Promise.all() is a utility function that takes an array of promises and returns
 * a single Promise that fulfills with an array of all the fulfilled values.
 * If any of the input promises reject, Promise.all immediately rejects.
 *
 * Key behaviors:
 * - If all promises resolve, return an array of resolved values in the same order
 * - If any promise rejects, immediately reject with that error
 * - Empty array should resolve to empty array
 * - Non-promise values should be treated as resolved promises
 *
 * Example usage:
 * const p1 = Promise.resolve(1);
 * const p2 = Promise.resolve(2);
 * const p3 = Promise.resolve(3);
 *
 * myPromiseAll([p1, p2, p3]).then(values => {
 *   console.log(values); // [1, 2, 3]
 * });
 *
 * @param {Array} promises - Array of promises or values
 * @returns {Promise} - Promise that resolves to array of values or rejects with first error
 */
function myPromiseAll(promises) {
  return new Promise((resolve, reject) => {
    // Handle empty array
    if (promises.length === 0) {
      resolve([]);
      return;
    }

    const results = [];
    let completedCount = 0;

    promises.forEach((promise, index) => {
      // Convert non-promises to promises
      Promise.resolve(promise)
        .then((value) => {
          results[index] = value;
          completedCount++;

          // If all promises are completed, resolve with results
          if (completedCount === promises.length) {
            resolve(results);
          }
        })
        .catch((error) => {
          // If any promise rejects, immediately reject
          reject(error);
        });
    });
  });
}

// Test cases
const promise1 = Promise.resolve(3);
const promise2 = new Promise((resolve) =>
  setTimeout(() => resolve("foo"), 1000)
);
const promise3 = Promise.resolve(42);

myPromiseAll([promise1, promise2, promise3])
  .then((values) => console.log(values)) // [3, 'foo', 42]
  .catch((error) => console.error(error));
