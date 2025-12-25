/**
 * Question 6: Implement Array.prototype.flat()
 *
 * The flat() method creates a new array with all sub-array elements concatenated
 * into it recursively up to the specified depth.
 *
 * Your implementation should:
 * - Flatten nested arrays up to the specified depth
 * - Default depth should be 1 if not specified
 * - Handle Infinity depth for complete flattening
 * - Preserve the order of elements
 * - Handle sparse arrays (empty slots) correctly
 * - Not modify the original array
 *
 * Key challenges:
 * - Recursive traversal with depth control
 * - Handling different data types (not just arrays)
 * - Performance considerations for deep nesting
 *
 * Example usage:
 * [1, [2, 3]].myFlat() // [1, 2, 3]
 * [1, [2, [3, 4]]].myFlat() // [1, 2, [3, 4]]
 * [1, [2, [3, 4]]].myFlat(2) // [1, 2, 3, 4]
 * [1, [2, [3, [4]]]].myFlat(Infinity) // [1, 2, 3, 4]
 *
 * @param {number} depth - The depth level specifying how deep a nested array should be flattened
 * @returns {Array} - A new array with flattened elements
 */

// Implementation 1: Recursive approach
function myFlat(arr, depth = 1) {
  const result = [];

  for (let i = 0; i < arr.length; i++) {
    // Handle sparse arrays - skip empty slots
    if (!(i in arr)) {
      continue;
    }

    const element = arr[i];

    // If element is an array and we haven't reached max depth
    if (Array.isArray(element) && depth > 0) {
      // Recursively flatten and spread the results
      result.push(...myFlat(element, depth - 1));
    } else {
      // Add element as-is (including arrays when depth is 0)
      result.push(element);
    }
  }

  return result;
}

// Implementation 2: Iterative approach using stack
function myFlatIterative(arr, depth = 1) {
  const stack = arr.map((item, index) => [item, depth, index]);
  const result = [];

  while (stack.length > 0) {
    const [item, currentDepth, originalIndex] = stack.pop();

    if (Array.isArray(item) && currentDepth > 0) {
      // Add array elements to stack in reverse order to maintain order
      for (let i = item.length - 1; i >= 0; i--) {
        if (i in item) {
          // Handle sparse arrays
          stack.push([item[i], currentDepth - 1, i]);
        }
      }
    } else {
      result.unshift(item);
    }
  }

  return result;
}

// Implementation 3: Using reduce (functional approach)
function myFlatReduce(arr, depth = 1) {
  return depth > 0
    ? arr.reduce((acc, val, index) => {
        // Skip empty slots in sparse arrays
        if (!(index in arr)) return acc;

        return Array.isArray(val)
          ? acc.concat(myFlatReduce(val, depth - 1))
          : acc.concat(val);
      }, [])
    : arr.slice(); // Return shallow copy when depth is 0
}

// Add to Array prototype for testing
Array.prototype.myFlat = function (depth = 1) {
  return myFlat(this, depth);
};

// Test cases
console.log("=== Testing Array.prototype.flat() implementation ===");

// Basic flattening
console.log([1, [2, 3]].myFlat()); // [1, 2, 3]
console.log([1, [2, [3, 4]]].myFlat()); // [1, 2, [3, 4]]

// Multiple depth levels
console.log([1, [2, [3, 4]]].myFlat(2)); // [1, 2, 3, 4]
console.log([1, [2, [3, [4, 5]]]].myFlat(3)); // [1, 2, 3, 4, 5]

// Infinity depth
console.log([1, [2, [3, [4, [5]]]]].myFlat(Infinity)); // [1, 2, 3, 4, 5]

// Mixed data types
console.log([1, [2, "hello", [true, null]]].myFlat(2)); // [1, 2, 'hello', true, null]

// Sparse arrays
const sparse = [1, , 3, [4, , 6]];
console.log(sparse.myFlat()); // [1, 3, 4, 6] - empty slots removed

// Empty arrays
console.log([[], [1], [[2]]].myFlat(2)); // [1, 2]

// Edge cases
console.log([].myFlat()); // []
console.log([1, 2, 3].myFlat()); // [1, 2, 3] - no nested arrays
console.log([1, [2, 3]].myFlat(0)); // [1, [2, 3]] - no flattening

// Performance test for deep nesting
const deepArray = [1];
for (let i = 0; i < 100; i++) {
  deepArray[0] = [deepArray[0]];
}
console.time("Deep flatten");
deepArray.myFlat(Infinity);
console.timeEnd("Deep flatten");
