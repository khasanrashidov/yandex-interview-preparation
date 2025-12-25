/**
 * Question 8: Implement Array Chunking with Advanced Features
 *
 * Create a function that splits an array into chunks of a specified size.
 * This is similar to Lodash's _.chunk() but with additional advanced features.
 *
 * Your implementation should support:
 * - Basic chunking with fixed size
 * - Custom chunking with a function that determines chunk boundaries
 * - Overlapping chunks (sliding window)
 * - Padding incomplete chunks with a default value
 * - Memory-efficient streaming for large arrays
 *
 * Key challenges:
 * - Handle edge cases (empty arrays, invalid sizes)
 * - Implement multiple chunking strategies
 * - Optimize for large datasets
 * - Support different data types and objects
 * - Maintain immutability
 *
 * Example usage:
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * chunk([1, 2, 3, 4], 2, true) // [[1, 2], [3, 4]] - pad incomplete
 * chunkBy([1, 1, 2, 2, 3], x => x) // [[1, 1], [2, 2], [3]] - group by value
 * chunkOverlap([1, 2, 3, 4, 5], 3, 1) // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
 *
 * @param {Array} array - The array to chunk
 * @param {number} size - The length of each chunk
 * @param {*} options - Additional options for chunking behavior
 * @returns {Array<Array>} - Array of chunks
 */

// Implementation 1: Basic chunking
function chunk(array, size, padIncomplete = false, padValue = undefined) {
  if (!Array.isArray(array)) {
    throw new TypeError("First argument must be an array");
  }

  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("Size must be a positive integer");
  }

  if (array.length === 0) return [];

  const result = [];

  for (let i = 0; i < array.length; i += size) {
    let chunk = array.slice(i, i + size);

    // Pad incomplete chunks if requested
    if (padIncomplete && chunk.length < size) {
      while (chunk.length < size) {
        chunk.push(padValue);
      }
    }

    result.push(chunk);
  }

  return result;
}

// Implementation 2: Chunk by predicate function
function chunkBy(array, predicateFn) {
  if (!Array.isArray(array)) {
    throw new TypeError("First argument must be an array");
  }

  if (typeof predicateFn !== "function") {
    throw new TypeError("Predicate must be a function");
  }

  if (array.length === 0) return [];

  const result = [];
  let currentChunk = [array[0]];
  let currentKey = predicateFn(array[0], 0, array);

  for (let i = 1; i < array.length; i++) {
    const newKey = predicateFn(array[i], i, array);

    // If key changes, start a new chunk
    if (newKey !== currentKey) {
      result.push(currentChunk);
      currentChunk = [array[i]];
      currentKey = newKey;
    } else {
      currentChunk.push(array[i]);
    }
  }

  // Add the last chunk
  if (currentChunk.length > 0) {
    result.push(currentChunk);
  }

  return result;
}

// Implementation 3: Overlapping chunks (sliding window)
function chunkOverlap(array, size, overlap = 0) {
  if (!Array.isArray(array)) {
    throw new TypeError("First argument must be an array");
  }

  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("Size must be a positive integer");
  }

  if (!Number.isInteger(overlap) || overlap < 0 || overlap >= size) {
    throw new Error("Overlap must be a non-negative integer less than size");
  }

  if (array.length === 0) return [];
  if (array.length < size) return [array.slice()];

  const result = [];
  const step = size - overlap;

  for (let i = 0; i <= array.length - size; i += step) {
    result.push(array.slice(i, i + size));
  }

  return result;
}

// Implementation 4: Advanced chunking with multiple options
function chunkAdvanced(array, options = {}) {
  const {
    size = 1,
    predicate = null,
    overlap = 0,
    padIncomplete = false,
    padValue = undefined,
    maxChunks = Infinity,
    filter = null,
  } = options;

  if (!Array.isArray(array)) {
    throw new TypeError("First argument must be an array");
  }

  let workingArray = array;

  // Apply filter if provided
  if (filter && typeof filter === "function") {
    workingArray = array.filter(filter);
  }

  if (workingArray.length === 0) return [];

  let result;

  // Use predicate-based chunking if provided
  if (predicate && typeof predicate === "function") {
    result = chunkBy(workingArray, predicate);
  }
  // Use overlapping chunks if overlap is specified
  else if (overlap > 0) {
    result = chunkOverlap(workingArray, size, overlap);
  }
  // Use basic chunking
  else {
    result = chunk(workingArray, size, padIncomplete, padValue);
  }

  // Limit number of chunks if specified
  if (maxChunks < result.length) {
    result = result.slice(0, maxChunks);
  }

  return result;
}

// Implementation 5: Memory-efficient generator for large arrays
function* chunkGenerator(array, size) {
  if (!Array.isArray(array)) {
    throw new TypeError("First argument must be an array");
  }

  if (!Number.isInteger(size) || size <= 0) {
    throw new Error("Size must be a positive integer");
  }

  for (let i = 0; i < array.length; i += size) {
    yield array.slice(i, i + size);
  }
}

// Utility: Convert generator to array (for testing)
function chunkWithGenerator(array, size) {
  return Array.from(chunkGenerator(array, size));
}

// Implementation 6: Chunk objects by property
function chunkByProperty(array, propertyPath) {
  if (!Array.isArray(array)) {
    throw new TypeError("First argument must be an array");
  }

  const getValue = (obj, path) => {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  };

  return chunkBy(array, (item) => getValue(item, propertyPath));
}

// Test cases
console.log("=== Testing Advanced Array Chunking ===");

// Basic chunking
console.log("Basic chunking:");
console.log(chunk([1, 2, 3, 4, 5], 2)); // [[1, 2], [3, 4], [5]]
console.log(chunk([1, 2, 3, 4, 5], 3)); // [[1, 2, 3], [4, 5]]

// Padding incomplete chunks
console.log("\nPadding incomplete:");
console.log(chunk([1, 2, 3, 4, 5], 3, true, 0)); // [[1, 2, 3], [4, 5, 0]]
console.log(chunk([1, 2, 3, 4], 3, true, "x")); // [[1, 2, 3], [4, 'x', 'x']]

// Chunk by predicate
console.log("\nChunk by predicate:");
console.log(chunkBy([1, 1, 2, 2, 2, 3, 3], (x) => x)); // [[1, 1], [2, 2, 2], [3, 3]]
console.log(chunkBy(["a", "A", "b", "B", "c"], (x) => x.toLowerCase())); // [['a', 'A'], ['b', 'B'], ['c']]
console.log(chunkBy([1, 3, 5, 2, 4, 6], (x) => x % 2)); // [[1, 3, 5], [2, 4, 6]]

// Overlapping chunks
console.log("\nOverlapping chunks:");
console.log(chunkOverlap([1, 2, 3, 4, 5], 3, 1)); // [[1, 2, 3], [2, 3, 4], [3, 4, 5]]
console.log(chunkOverlap([1, 2, 3, 4, 5, 6], 3, 2)); // [[1, 2, 3], [3, 4, 5], [5, 6]]

// Advanced chunking with options
console.log("\nAdvanced chunking:");
console.log(
  chunkAdvanced([1, 2, 3, 4, 5, 6, 7, 8], {
    size: 3,
    maxChunks: 2,
  })
); // [[1, 2, 3], [4, 5, 6]]

console.log(
  chunkAdvanced([1, 2, 3, 4, 5, 6], {
    size: 2,
    filter: (x) => x % 2 === 0,
  })
); // [[2, 4], [6]]

console.log(
  chunkAdvanced(["apple", "apricot", "banana", "blueberry"], {
    predicate: (x) => x[0], // Group by first letter
  })
); // [['apple', 'apricot'], ['banana', 'blueberry']]

// Generator approach (memory efficient)
console.log("\nGenerator approach:");
console.log(chunkWithGenerator([1, 2, 3, 4, 5], 2)); // [[1, 2], [3, 4], [5]]

// Chunk objects by property
console.log("\nChunk objects by property:");
const users = [
  { name: "John", age: 25, department: "IT" },
  { name: "Jane", age: 30, department: "IT" },
  { name: "Bob", age: 35, department: "HR" },
  { name: "Alice", age: 28, department: "HR" },
  { name: "Charlie", age: 32, department: "IT" },
];

console.log(chunkByProperty(users, "department"));
// Groups by department: IT, HR, IT

// Edge cases
console.log("\nEdge cases:");
console.log(chunk([], 2)); // []
console.log(chunk([1], 3)); // [[1]]
console.log(chunkBy([], (x) => x)); // []

// Performance test with large array
const largeArray = Array.from({ length: 100000 }, (_, i) => i);
console.time("Large array chunking");
const chunks = chunk(largeArray, 1000);
console.timeEnd("Large array chunking");
console.log(
  `Created ${chunks.length} chunks from ${largeArray.length} elements`
);
