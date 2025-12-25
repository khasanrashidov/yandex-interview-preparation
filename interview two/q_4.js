/**
 * Question 4: Implement _.throttle()
 * 
 * Create a function that returns a throttled version of a function that can only be
 * called at most once per every wait milliseconds.
 * 
 * Key requirements:
 * - Limit function calls to once per wait period
 * - Handle 'this' context and arguments
 * - Execute immediately on first call
 * - Schedule trailing execution for subsequent calls
 * 
 * @param {Function} func - The function to throttle
 * @param {number} wait - The number of milliseconds to throttle
 * @returns {Function} - Throttled function
 * 
 * Example:
 * const throttled = throttle(fn, 1000);
 * throttled(); // executes immediately
 * throttled(); // scheduled for later
 */
function throttle(func, wait) {
  let lastCallTime = 0;
  let timeoutId = null;
  let lastArgs = null;
  let lastThis = null;
  let result;

  // Execute the function with last known arguments
  function executeFunction() {
    const now = Date.now();
    lastCallTime = now;
    result = func.apply(lastThis, lastArgs);
    timeoutId = null;
    lastArgs = lastThis = null;
    return result;
  }

  // The throttled function
  function throttled(...args) {
    const now = Date.now();
    lastArgs = args;
    lastThis = this;

    // Check if this is the first call or if enough time has passed
    const timeSinceLastCall = now - lastCallTime;

    if (lastCallTime === 0 || timeSinceLastCall >= wait) {
      // If this is the first call or enough time has passed, execute immediately
      return executeFunction();
    } else if (!timeoutId) {
      // Schedule a trailing execution
      timeoutId = setTimeout(executeFunction, wait - timeSinceLastCall);
    }

    return result;
  }

  return throttled;
}

// Test cases
// Test 1: Basic throttling
let counter = 0;
const increment = () => {
  counter++;
  console.log('Called:', counter, 'Time:', Date.now());
};

console.log('Test 1: Basic throttling');
const throttledIncrement = throttle(increment, 1000);

throttledIncrement(); // executes immediately
throttledIncrement(); // throttled
throttledIncrement(); // throttled

setTimeout(() => {
  console.log('After 1100ms:');
  throttledIncrement(); // executes
}, 1100);

// Test 2: Multiple rapid calls
console.log('\nTest 2: Multiple rapid calls');
counter = 0;
const throttledRapid = throttle(increment, 500);

console.log('Rapid calls:');
throttledRapid(); // executes immediately
throttledRapid(); // throttled
throttledRapid(); // throttled
throttledRapid(); // throttled

setTimeout(() => {
  console.log('After 600ms:');
  throttledRapid(); // executes
}, 600);

// Test 3: Context and arguments
console.log('\nTest 3: Context and arguments');
const obj = {
  value: 0,
  increment(amount) {
    this.value += amount;
    console.log('Value:', this.value, 'Amount:', amount);
  }
};

const throttledMethod = throttle(obj.increment.bind(obj), 1000);
throttledMethod(1); // executes immediately
throttledMethod(2); // scheduled with new arguments
throttledMethod(3); // updates scheduled arguments

// Test 4: Different functions
console.log('\nTest 4: Different functions');
const logMessage = (msg) => console.log('Message:', msg, 'Time:', Date.now());
const throttledLog = throttle(logMessage, 800);

throttledLog('First'); // executes immediately
throttledLog('Second'); // throttled
throttledLog('Third'); // throttled

setTimeout(() => {
  console.log('After 900ms:');
  throttledLog('Fourth'); // executes
}, 900);