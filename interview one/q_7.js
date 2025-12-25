/**
 * Question 7: Find Intersection of Multiple Unsorted Arrays
 *
 * Given an array of arrays, find the intersection (common elements) that appear
 * in ALL arrays. The result should contain unique elements only.
 *
 * Your implementation should:
 * - Work with any number of arrays (not just 2)
 * - Handle unsorted arrays efficiently
 * - Return unique elements only (no duplicates)
 * - Preserve one instance of each common element
 * - Handle edge cases (empty arrays, no intersection, etc.)
 * - Be efficient for large datasets
 *
 * Key challenges:
 * - Choosing the right data structure (Set, Map, Object)
 * - Optimizing for different array sizes
 * - Handling different data types consistently
 * - Time and space complexity considerations
 *
 * Example usage:
 * intersection([[1, 2, 3], [2, 3, 4], [3, 4, 5]]) // [3]
 * intersection([[1, 2, 2], [2, 3], [2, 4]]) // [2]
 * intersection([['a', 'b'], ['b', 'c'], ['b', 'd']]) // ['b']
 * intersection([[], [1, 2]]) // []
 * intersection([[1, 2, 3]]) // [1, 2, 3] (single array)
 *
 * @param {Array<Array>} arrays - Array of arrays to find intersection
 * @returns {Array} - Array containing elements present in all input arrays
 */

// Implementation 1: Using Set for optimal performance
function intersection(arrays) {
  // Handle edge cases
  if (!arrays || arrays.length === 0) return [];
  if (arrays.some((arr) => arr.length === 0)) return [];
  if (arrays.length === 1) return [...new Set(arrays[0])]; // Remove duplicates from single array

  // Start with the first array (converted to Set for uniqueness)
  let result = new Set(arrays[0]);

  // Intersect with each subsequent array
  for (let i = 1; i < arrays.length; i++) {
    const currentSet = new Set(arrays[i]);

    // Keep only elements that exist in current array
    result = new Set([...result].filter((x) => currentSet.has(x)));

    // Early termination if no common elements
    if (result.size === 0) break;
  }

  return Array.from(result);
}

// Implementation 2: Optimized version - start with smallest array
function intersectionOptimized(arrays) {
  if (!arrays || arrays.length === 0) return [];
  if (arrays.some((arr) => arr.length === 0)) return [];
  if (arrays.length === 1) return [...new Set(arrays[0])];

  // Sort arrays by length (smallest first) for better performance
  const sortedArrays = arrays.slice().sort((a, b) => a.length - b.length);

  // Start with unique elements from smallest array
  let candidates = new Set(sortedArrays[0]);

  // Check each candidate against remaining arrays
  for (let i = 1; i < sortedArrays.length; i++) {
    const currentSet = new Set(sortedArrays[i]);
    candidates = new Set([...candidates].filter((x) => currentSet.has(x)));

    if (candidates.size === 0) break;
  }

  return Array.from(candidates);
}

// Implementation 3: Using frequency counting approach
function intersectionFrequency(arrays) {
  if (!arrays || arrays.length === 0) return [];
  if (arrays.some((arr) => arr.length === 0)) return [];
  if (arrays.length === 1) return [...new Set(arrays[0])];

  const elementCount = new Map();
  const totalArrays = arrays.length;

  // Count occurrences of each element across all arrays
  arrays.forEach((arr) => {
    const uniqueElements = new Set(arr); // Handle duplicates within single array
    uniqueElements.forEach((element) => {
      elementCount.set(element, (elementCount.get(element) || 0) + 1);
    });
  });

  // Return elements that appear in all arrays
  return Array.from(elementCount.entries())
    .filter(([element, count]) => count === totalArrays)
    .map(([element]) => element);
}

// Implementation 4: Functional approach using reduce
function intersectionFunctional(arrays) {
  if (!arrays || arrays.length === 0) return [];
  if (arrays.some((arr) => arr.length === 0)) return [];

  return arrays.reduce(
    (acc, currentArray) => {
      const currentSet = new Set(currentArray);
      return acc.filter((item) => currentSet.has(item));
    },
    [...new Set(arrays[0])]
  ); // Start with unique elements from first array
}

// Advanced: Generic intersection function with custom equality
function intersectionWithComparator(arrays, compareFn = (a, b) => a === b) {
  if (!arrays || arrays.length === 0) return [];
  if (arrays.some((arr) => arr.length === 0)) return [];

  // For custom comparison, we need to check manually
  const result = [];
  const firstArray = arrays[0];

  firstArray.forEach((candidate) => {
    // Skip if we already added this element (avoid duplicates)
    if (result.some((item) => compareFn(item, candidate))) return;

    // Check if candidate exists in all other arrays
    const existsInAll = arrays
      .slice(1)
      .every((arr) => arr.some((item) => compareFn(item, candidate)));

    if (existsInAll) {
      result.push(candidate);
    }
  });

  return result;
}

// Test cases
console.log("=== Testing Array Intersection Functions ===");

// Basic intersection
console.log(
  "Basic:",
  intersection([
    [1, 2, 3],
    [2, 3, 4],
    [3, 4, 5],
  ])
); // [3]

// With duplicates
console.log(
  "Duplicates:",
  intersection([
    [1, 2, 2, 3],
    [2, 3, 3],
    [2, 4, 4],
  ])
); // [2]

// String arrays
console.log(
  "Strings:",
  intersection([
    ["a", "b", "c"],
    ["b", "c", "d"],
    ["c", "d", "e"],
  ])
); // ['c']

// No intersection
console.log(
  "No intersection:",
  intersection([
    [1, 2],
    [3, 4],
    [5, 6],
  ])
); // []

// Single array
console.log("Single array:", intersection([[1, 2, 2, 3]])); // [1, 2, 3]

// Empty array in input
console.log("Empty array:", intersection([[], [1, 2]])); // []

// Empty input
console.log("Empty input:", intersection([])); // []

// Mixed data types
console.log(
  "Mixed types:",
  intersection([
    [1, "a", true],
    ["a", true, 2],
    [true, "a", null],
  ])
); // ['a', true]

// Performance comparison
const largeArray1 = Array.from({ length: 10000 }, (_, i) => i);
const largeArray2 = Array.from({ length: 5000 }, (_, i) => i * 2);
const largeArray3 = Array.from({ length: 3000 }, (_, i) => i * 3);

console.time("Standard implementation");
intersection([largeArray1, largeArray2, largeArray3]);
console.timeEnd("Standard implementation");

console.time("Optimized implementation");
intersectionOptimized([largeArray1, largeArray2, largeArray3]);
console.timeEnd("Optimized implementation");

// Custom comparator example (case-insensitive strings)
const caseInsensitiveCompare = (a, b) =>
  typeof a === "string" && typeof b === "string"
    ? a.toLowerCase() === b.toLowerCase()
    : a === b;

console.log(
  "Case insensitive:",
  intersectionWithComparator(
    [
      ["Hello", "WORLD"],
      ["world", "test"],
      ["WORLD", "foo"],
    ],
    caseInsensitiveCompare
  )
); // ['WORLD'] (first occurrence preserved)
