/**
 * Question 5: Implement _.chunk()
 * 
 * Creates an array of elements split into groups the length of size.
 * If array can't be split evenly, the final chunk will be the remaining elements.
 * 
 * Key requirements:
 * - Split array into groups of specified size
 * - Handle edge cases (size < 1, empty array)
 * - Return empty array for invalid size
 * - Preserve original array order
 * 
 * @param {Array} arr - The array to process
 * @param {number} size - The length of each chunk
 * @returns {Array} - Returns the new array of chunks
 * 
 * Example:
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * chunk([1, 2, 3, 4, 5], 3) // [[1, 2, 3], [4, 5]]
 * chunk([1, 2, 3, 4, 5], 1) // [[1], [2], [3], [4], [5]]
 */
function chunk(arr, size) {
  // Handle edge cases
  if (!Array.isArray(arr)) {
    return [];
  }
  
  if (size < 1 || !Number.isInteger(size)) {
    return [];
  }
  
  if (arr.length === 0) {
    return [];
  }
  
  const result = [];
  
  // Split array into chunks
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  
  return result;
}

// Test cases
console.log('=== Test 1: Basic chunking ===');
console.log('chunk([1,2,3,4,5], 1):', chunk([1,2,3,4,5], 1));
// Expected: [[1], [2], [3], [4], [5]]

console.log('chunk([1,2,3,4,5], 2):', chunk([1,2,3,4,5], 2));
// Expected: [[1, 2], [3, 4], [5]]

console.log('chunk([1,2,3,4,5], 3):', chunk([1,2,3,4,5], 3));
// Expected: [[1, 2, 3], [4, 5]]

console.log('chunk([1,2,3,4,5], 4):', chunk([1,2,3,4,5], 4));
// Expected: [[1, 2, 3, 4], [5]]

console.log('chunk([1,2,3,4,5], 5):', chunk([1,2,3,4,5], 5));
// Expected: [[1, 2, 3, 4, 5]]

console.log('\n=== Test 2: Edge cases ===');
console.log('chunk([1,2,3,4,5], 0):', chunk([1,2,3,4,5], 0));
// Expected: []

console.log('chunk([1,2,3,4,5], -1):', chunk([1,2,3,4,5], -1));
// Expected: []

console.log('chunk([1,2,3,4,5], 1.5):', chunk([1,2,3,4,5], 1.5));
// Expected: []

console.log('chunk([], 2):', chunk([], 2));
// Expected: []

console.log('chunk(null, 2):', chunk(null, 2));
// Expected: []

console.log('chunk(undefined, 2):', chunk(undefined, 2));
// Expected: []

console.log('\n=== Test 3: Different data types ===');
console.log('chunk(["a","b","c","d"], 2):', chunk(["a","b","c","d"], 2));
// Expected: [["a", "b"], ["c", "d"]]

console.log('chunk([{a:1},{b:2},{c:3}], 2):', chunk([{a:1},{b:2},{c:3}], 2));
// Expected: [[{a:1}, {b:2}], [{c:3}]]

console.log('\n=== Test 4: Large chunks ===');
console.log('chunk([1,2,3,4,5], 10):', chunk([1,2,3,4,5], 10));
// Expected: [[1, 2, 3, 4, 5]]

console.log('chunk([1,2,3,4,5], 6):', chunk([1,2,3,4,5], 6));
// Expected: [[1, 2, 3, 4, 5]]

console.log('\n=== Test 5: Performance test ===');
const largeArray = Array.from({length: 1000}, (_, i) => i);
console.log('Large array chunk test:');
console.log('First chunk:', chunk(largeArray, 100)[0].slice(0, 5), '...');
console.log('Number of chunks:', chunk(largeArray, 100).length);
// Expected: 10 chunks of 100 elements each
