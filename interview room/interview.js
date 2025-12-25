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