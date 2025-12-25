/**
 * Question 1: Implement basic debounce()
 *
 * Debouncing is a technique used to ensure that time-consuming tasks do not fire so often,
 * making it so they only trigger after a delay when the action has stopped being called.
 *
 * For example, if a user is typing in a search box, we don't want to make API calls on every
 * keystroke. Instead, we wait until they've stopped typing for a certain amount of time.
 *
 * Your task:
 * Implement a debounce function that takes a function and a delay time.
 * The returned function should only execute after the specified delay has passed since
 * the last time it was called.
 *
 * Example usage:
 * const debouncedFn = debounce(() => console.log('called'), 1000);
 * debouncedFn(); // won't log immediately
 * debouncedFn(); // previous call cancelled, new timer starts
 * debouncedFn(); // previous call cancelled, new timer starts
 * // after 1000ms: logs 'called' once
 *
 * @param {Function} func - The function to debounce
 * @param {number} wait - The number of milliseconds to delay
 * @returns {Function} - The debounced function
 */
function debounce(func, wait) {
  let timeoutId;

  return function (...args) {
    // Clear the previous timeout if it exists
    clearTimeout(timeoutId);

    // Set a new timeout
    timeoutId = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

// Test cases
const log = debounce(() => console.log("Hello"), 1000);
log(); // Should only execute after 1 second of no further calls
