/**
 * Question 1: Implement _.get() from lodash
 * 
 * Create a function that safely retrieves values from nested objects using a path string.
 * The function should handle arrays, objects, and return a default value if the path doesn't exist.
 * 
 * Key requirements:
 * - Support dot notation ('a.b.c')
 * - Support array notation ('a[0].b')
 * - Handle undefined/null objects
 * - Return default value for non-existent paths
 * - Support array indices in path
 * 
 * @param {Object} obj - The object to query
 * @param {string} path - The path to get from object
 * @param {*} defaultValue - The value to return if path doesn't exist
 * @returns {*} - The value at path or defaultValue
 * 
 * Example:
 * const obj = { a: [{ b: { c: 3 } }] };
 * get(obj, 'a[0].b.c') // 3
 * get(obj, 'a.b.c', 'default') // 'default'
 * get(obj, 'a[0].b') // { c: 3 }
 */
function get(obj, path, defaultValue) {
  // Handle null/undefined objects
  if (obj == null) {
    return defaultValue;
  }

  // Handle array path format
  if (Array.isArray(path)) {
    return path.reduce((current, key) => {
      try {
        return current[key] === undefined ? defaultValue : current[key];
      } catch (e) {
        return defaultValue;
      }
    }, obj);
  }

  // Split path into segments, handling both dot and bracket notation
  const segments = path.replace(/\[(\w+)\]/g, '.$1').split('.');

  // Traverse the object
  let result = obj;
  for (const key of segments) {
    // Handle null/undefined intermediate values
    if (result == null) {
      return defaultValue;
    }
    
    // Try to access the next level
    try {
      result = result[key];
    } catch (e) {
      return defaultValue;
    }

    // If value is undefined, return default
    if (result === undefined) {
      return defaultValue;
    }
  }

  return result;
}

// Test cases
const obj = {
  a: [{
    b: { c: 3 },
    d: 4
  }],
  'x.y': { z: 5 },
  e: null
};

console.log(get(obj, 'a[0].b.c')); // 3
console.log(get(obj, 'a[0].d')); // 4
console.log(get(obj, 'a[0].b')); // { c: 3 }
console.log(get(obj, 'a[1].b.c', 'default')); // 'default'
console.log(get(obj, 'x.y.z')); // undefined
console.log(get(obj, ['x.y', 'z'])); // 5
console.log(get(obj, 'e.f', 'default')); // 'default'
console.log(get(null, 'a.b.c', 'default')); // 'default'