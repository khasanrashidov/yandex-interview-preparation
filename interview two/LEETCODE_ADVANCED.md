# Advanced LeetCode Questions for Yandex Frontend Developer Interview

## Question 1: Product of Array Except Self (Medium)

**Topic**: Array, Prefix Sum
**Time Complexity**: O(n)
**Space Complexity**: O(1) excluding output array

### Problem:

Given an integer array `nums`, return an array `answer` such that `answer[i]` is equal to the product of all the elements of `nums` except `nums[i]`. You must write an algorithm that runs in O(n) time and without using the division operation.

```javascript
// Example:
// Input: nums = [1,2,3,4]
// Output: [24,12,8,6]
// Explanation: [2*3*4, 1*3*4, 1*2*4, 1*2*3]

// Input: nums = [-1,1,0,-3,3]
// Output: [0,0,9,0,0]

// Input: nums = [2,3,4,5]
// Output: [60,40,30,24]
```

### Solution:

```javascript
function productExceptSelf(nums) {
  const n = nums.length;
  const result = new Array(n);

  // First pass: calculate left products
  result[0] = 1;
  for (let i = 1; i < n; i++) {
    result[i] = result[i - 1] * nums[i - 1];
  }

  // Second pass: multiply by right products
  let rightProduct = 1;
  for (let i = n - 1; i >= 0; i--) {
    result[i] *= rightProduct;
    rightProduct *= nums[i];
  }

  return result;
}

// Alternative approach with extra space for clarity
function productExceptSelfVerbose(nums) {
  const n = nums.length;
  const leftProducts = new Array(n);
  const rightProducts = new Array(n);
  const result = new Array(n);

  // Calculate left products
  leftProducts[0] = 1;
  for (let i = 1; i < n; i++) {
    leftProducts[i] = leftProducts[i - 1] * nums[i - 1];
  }

  // Calculate right products
  rightProducts[n - 1] = 1;
  for (let i = n - 2; i >= 0; i--) {
    rightProducts[i] = rightProducts[i + 1] * nums[i + 1];
  }

  // Combine results
  for (let i = 0; i < n; i++) {
    result[i] = leftProducts[i] * rightProducts[i];
  }

  return result;
}
```

### Key Points:

- Use prefix and suffix products to avoid division
- Two-pass algorithm: left products, then right products
- Handle edge cases with zeros in the array
- Space-optimized version uses output array for intermediate storage

---

## Question 2: Rotate Image (Medium)

**Topic**: Array, Matrix, In-place Algorithm
**Time Complexity**: O(n²)
**Space Complexity**: O(1)

### Problem:

You are given an n x n 2D matrix representing an image, rotate the image by 90 degrees (clockwise). You have to rotate the image in-place, which means you have to modify the input 2D matrix directly. DO NOT allocate another 2D matrix and do the rotation.

```javascript
// Example:
// Input: matrix = [[1,2,3],[4,5,6],[7,8,9]]
// Output: [[7,4,1],[8,5,2],[9,6,3]]

// Input: matrix = [[5,1,9,11],[2,4,8,10],[13,3,6,7],[15,14,12,16]]
// Output: [[15,13,2,5],[14,3,4,1],[12,6,8,9],[16,7,10,11]]

// Visualization:
// Original:     After 90° rotation:
// 1 2 3         7 4 1
// 4 5 6   -->   8 5 2
// 7 8 9         9 6 3
```

### Solution:

```javascript
// Approach 1: Transpose + Reverse rows
function rotate(matrix) {
  const n = matrix.length;

  // Step 1: Transpose the matrix (swap matrix[i][j] with matrix[j][i])
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      [matrix[i][j], matrix[j][i]] = [matrix[j][i], matrix[i][j]];
    }
  }

  // Step 2: Reverse each row
  for (let i = 0; i < n; i++) {
    matrix[i].reverse();
  }
}

// Approach 2: Four-way swap (more complex but single pass)
function rotateFourWay(matrix) {
  const n = matrix.length;

  // Process layer by layer
  for (let layer = 0; layer < Math.floor(n / 2); layer++) {
    const first = layer;
    const last = n - 1 - layer;

    for (let i = first; i < last; i++) {
      const offset = i - first;

      // Save top element
      const top = matrix[first][i];

      // Move left to top
      matrix[first][i] = matrix[last - offset][first];

      // Move bottom to left
      matrix[last - offset][first] = matrix[last][last - offset];

      // Move right to bottom
      matrix[last][last - offset] = matrix[i][last];

      // Move top to right
      matrix[i][last] = top;
    }
  }
}

// Helper function to print matrix
function printMatrix(matrix) {
  for (let row of matrix) {
    console.log(row.join(" "));
  }
  console.log("---");
}
```

### Key Points:

- Two main approaches: transpose + reverse, or four-way rotation
- Transpose + reverse is easier to understand and implement
- Four-way rotation is more complex but demonstrates advanced array manipulation
- Both achieve O(1) space complexity (in-place)

---

## Question 3: Find All Anagrams in a String (Medium)

**Topic**: Hash Table, String, Sliding Window
**Time Complexity**: O(s + p)
**Space Complexity**: O(1) - fixed size alphabet

### Problem:

Given two strings `s` and `p`, return an array of all the start indices of `p`'s anagrams in `s`. You may return the answer in any order. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

```javascript
// Example:
// Input: s = "abab", p = "ab"
// Output: [0,2]
// Explanation: The substring with start index 0 is "ab", which is an anagram of "ab".
//              The substring with start index 2 is "ab", which is an anagram of "ab".

// Input: s = "abacabad", p = "aaab"
// Output: [0,4]
// Explanation: The substring "abac" is an anagram of "aaab" at index 0
//              The substring "abad" is an anagram of "aaab" at index 4

// Input: s = "cbaebabacd", p = "abc"
// Output: [1,6]
```

### Solution:

```javascript
function findAnagrams(s, p) {
  if (s.length < p.length) return [];

  const result = [];
  const pCount = new Array(26).fill(0);
  const windowCount = new Array(26).fill(0);

  // Count characters in p
  for (let char of p) {
    pCount[char.charCodeAt(0) - 97]++;
  }

  const windowSize = p.length;

  // Initialize first window
  for (let i = 0; i < windowSize; i++) {
    windowCount[s.charCodeAt(i) - 97]++;
  }

  // Check if first window is an anagram
  if (arraysEqual(pCount, windowCount)) {
    result.push(0);
  }

  // Slide the window
  for (let i = windowSize; i < s.length; i++) {
    // Add new character to window
    windowCount[s.charCodeAt(i) - 97]++;

    // Remove character that's sliding out
    windowCount[s.charCodeAt(i - windowSize) - 97]--;

    // Check if current window is an anagram
    if (arraysEqual(pCount, windowCount)) {
      result.push(i - windowSize + 1);
    }
  }

  return result;
}

// Helper function to compare arrays
function arraysEqual(arr1, arr2) {
  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) return false;
  }
  return true;
}

// Alternative approach using Map (more readable)
function findAnagramsMap(s, p) {
  if (s.length < p.length) return [];

  const result = [];
  const pMap = new Map();
  const windowMap = new Map();

  // Count characters in p
  for (let char of p) {
    pMap.set(char, (pMap.get(char) || 0) + 1);
  }

  let left = 0;
  let right = 0;
  let matches = 0;

  while (right < s.length) {
    // Expand window
    const rightChar = s[right];
    windowMap.set(rightChar, (windowMap.get(rightChar) || 0) + 1);

    if (
      pMap.has(rightChar) &&
      windowMap.get(rightChar) === pMap.get(rightChar)
    ) {
      matches++;
    }

    // Shrink window if too large
    if (right - left + 1 > p.length) {
      const leftChar = s[left];
      if (
        pMap.has(leftChar) &&
        windowMap.get(leftChar) === pMap.get(leftChar)
      ) {
        matches--;
      }
      windowMap.set(leftChar, windowMap.get(leftChar) - 1);
      if (windowMap.get(leftChar) === 0) {
        windowMap.delete(leftChar);
      }
      left++;
    }

    // Check if we found an anagram
    if (matches === pMap.size) {
      result.push(left);
    }

    right++;
  }

  return result;
}
```

### Key Points:

- Sliding window technique with character frequency counting
- Use array for counting (faster) or Map for readability
- Track matches to avoid comparing entire frequency arrays each time
- Handle edge cases: empty strings, p longer than s

---

## Question 4: Kth Largest Element in an Array (Medium)

**Topic**: Heap, Divide and Conquer, Quickselect
**Time Complexity**: O(n) average, O(n²) worst case
**Space Complexity**: O(1)

### Problem:

Given an integer array `nums` and an integer `k`, return the kth largest element in the array. Note that it is the kth largest element in the sorted order, not the kth distinct element. Can you solve it without sorting?

```javascript
// Example:
// Input: nums = [3,2,1,5,6,4], k = 2
// Output: 5
// Explanation: Sorted array is [6,5,4,3,2,1], 2nd largest is 5

// Input: nums = [3,2,3,1,2,4,5,5,6], k = 4
// Output: 4
// Explanation: Sorted array is [6,5,5,4,3,3,2,2,1], 4th largest is 4

// Input: nums = [1], k = 1
// Output: 1
```

### Solution:

```javascript
// Approach 1: Quickselect (optimal average case)
function findKthLargest(nums, k) {
  // Convert to finding (n-k)th smallest element (0-indexed)
  const targetIndex = nums.length - k;

  function quickSelect(left, right) {
    if (left === right) return nums[left];

    // Partition around pivot
    const pivotIndex = partition(left, right);

    if (pivotIndex === targetIndex) {
      return nums[pivotIndex];
    } else if (pivotIndex < targetIndex) {
      return quickSelect(pivotIndex + 1, right);
    } else {
      return quickSelect(left, pivotIndex - 1);
    }
  }

  function partition(left, right) {
    // Choose random pivot to avoid worst case
    const randomIndex = left + Math.floor(Math.random() * (right - left + 1));
    [nums[randomIndex], nums[right]] = [nums[right], nums[randomIndex]];

    const pivot = nums[right];
    let i = left;

    for (let j = left; j < right; j++) {
      if (nums[j] <= pivot) {
        [nums[i], nums[j]] = [nums[j], nums[i]];
        i++;
      }
    }

    [nums[i], nums[right]] = [nums[right], nums[i]];
    return i;
  }

  return quickSelect(0, nums.length - 1);
}

// Approach 2: Min Heap (using priority queue simulation)
function findKthLargestHeap(nums, k) {
  // Simulate min heap with array
  const minHeap = [];

  function heapifyUp(index) {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (minHeap[index] >= minHeap[parentIndex]) break;
      [minHeap[index], minHeap[parentIndex]] = [
        minHeap[parentIndex],
        minHeap[index],
      ];
      index = parentIndex;
    }
  }

  function heapifyDown(index) {
    while (true) {
      let smallest = index;
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;

      if (
        leftChild < minHeap.length &&
        minHeap[leftChild] < minHeap[smallest]
      ) {
        smallest = leftChild;
      }

      if (
        rightChild < minHeap.length &&
        minHeap[rightChild] < minHeap[smallest]
      ) {
        smallest = rightChild;
      }

      if (smallest === index) break;

      [minHeap[index], minHeap[smallest]] = [minHeap[smallest], minHeap[index]];
      index = smallest;
    }
  }

  function addToHeap(val) {
    minHeap.push(val);
    heapifyUp(minHeap.length - 1);
  }

  function removeMin() {
    if (minHeap.length === 0) return null;
    if (minHeap.length === 1) return minHeap.pop();

    const min = minHeap[0];
    minHeap[0] = minHeap.pop();
    heapifyDown(0);
    return min;
  }

  // Build heap of size k
  for (let num of nums) {
    if (minHeap.length < k) {
      addToHeap(num);
    } else if (num > minHeap[0]) {
      removeMin();
      addToHeap(num);
    }
  }

  return minHeap[0];
}

// Approach 3: Simple sorting (for comparison)
function findKthLargestSort(nums, k) {
  nums.sort((a, b) => b - a);
  return nums[k - 1];
}
```

### Key Points:

- Quickselect is optimal average case O(n), but O(n²) worst case
- Min heap approach guarantees O(n log k) time complexity
- Random pivot selection helps avoid worst case in quickselect
- Converting "kth largest" to "nth smallest" simplifies logic

---

## Question 5: Group Anagrams (Medium)

**Topic**: Hash Table, String, Sorting
**Time Complexity**: O(n _ m log m) where n is number of strings, m is max string length
**Space Complexity**: O(n _ m)

### Problem:

Given an array of strings `strs`, group the anagrams together. You can return the answer in any order. An anagram is a word or phrase formed by rearranging the letters of a different word or phrase, typically using all the original letters exactly once.

```javascript
// Example:
// Input: strs = ["eat","tea","tan","ate","nat","bat"]
// Output: [["bat"],["nat","tan"],["ate","eat","tea"]]

// Input: strs = [""]
// Output: [[""]]

// Input: strs = ["a"]
// Output: [["a"]]

// Input: strs = ["abc","bca","cab","xyz","zyx","yxz"]
// Output: [["abc","bca","cab"],["xyz","zyx","yxz"]]
```

### Solution:

```javascript
// Approach 1: Sort characters as key
function groupAnagrams(strs) {
  const groups = new Map();

  for (let str of strs) {
    // Sort characters to create canonical form
    const sortedStr = str.split("").sort().join("");

    if (!groups.has(sortedStr)) {
      groups.set(sortedStr, []);
    }

    groups.get(sortedStr).push(str);
  }

  return Array.from(groups.values());
}

// Approach 2: Character count as key (more efficient)
function groupAnagramsCount(strs) {
  const groups = new Map();

  for (let str of strs) {
    // Create character count signature
    const count = new Array(26).fill(0);
    for (let char of str) {
      count[char.charCodeAt(0) - 97]++;
    }

    // Use count array as key (convert to string)
    const key = count.join(",");

    if (!groups.has(key)) {
      groups.set(key, []);
    }

    groups.get(key).push(str);
  }

  return Array.from(groups.values());
}

// Approach 3: Prime number encoding (mathematical approach)
function groupAnagramsPrime(strs) {
  // Assign prime numbers to each letter
  const primes = [
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97, 101,
  ];

  const groups = new Map();

  for (let str of strs) {
    // Calculate product of primes (unique for each anagram group)
    let product = 1;
    for (let char of str) {
      product *= primes[char.charCodeAt(0) - 97];
    }

    if (!groups.has(product)) {
      groups.set(product, []);
    }

    groups.get(product).push(str);
  }

  return Array.from(groups.values());
}

// Helper function for testing
function testGroupAnagrams() {
  const testCases = [
    ["eat", "tea", "tan", "ate", "nat", "bat"],
    [""],
    ["a"],
    ["abc", "bca", "cab", "xyz", "zyx", "yxz"],
    ["ddddddddddg", "dgggggggggg"],
  ];

  testCases.forEach((testCase, index) => {
    console.log(`Test ${index + 1}:`, testCase);
    console.log("Result:", groupAnagrams(testCase));
    console.log("---");
  });
}
```

### Key Points:

- Three main approaches: sorting, character counting, prime encoding
- Sorting approach is simplest but O(m log m) per string
- Character counting is more efficient for long strings
- Prime encoding is mathematically elegant but may overflow for very long strings
- Hash map groups strings by their canonical representation

---

## Question 6: Serialize and Deserialize Binary Tree (Hard)

**Topic**: Tree, DFS, BFS, Design
**Time Complexity**: O(n) for both operations
**Space Complexity**: O(n)

### Problem:

Serialization is the process of converting a data structure or object into a sequence of bits so that it can be stored in a file or memory buffer, or transmitted across a network connection link to be reconstructed later in the same or another computer environment. Design an algorithm to serialize and deserialize a binary tree. There is no restriction on how your serialization/deserialization algorithm should work. You just need to ensure that a binary tree can be serialized to a string and this string can be deserialized to the original tree structure.

```javascript
// Example:
// Input: root = [1,2,3,null,null,4,5]
//        1
//       / \
//      2   3
//         / \
//        4   5
// Output: "1,2,#,#,3,4,#,#,5,#,#" (preorder with nulls)

// Input: root = []
// Output: ""

// Input: root = [1]
// Output: "1,#,#"

// Definition for a binary tree node
class TreeNode {
  constructor(val, left = null, right = null) {
    this.val = val;
    this.left = left;
    this.right = right;
  }
}
```

### Solution:

```javascript
// Approach 1: Preorder DFS with null markers
class Codec {
  // Encodes a tree to a single string
  serialize(root) {
    const result = [];

    function preorder(node) {
      if (!node) {
        result.push("#");
        return;
      }

      result.push(node.val.toString());
      preorder(node.left);
      preorder(node.right);
    }

    preorder(root);
    return result.join(",");
  }

  // Decodes your encoded data to tree
  deserialize(data) {
    if (!data) return null;

    const values = data.split(",");
    let index = 0;

    function buildTree() {
      if (index >= values.length || values[index] === "#") {
        index++;
        return null;
      }

      const node = new TreeNode(parseInt(values[index++]));
      node.left = buildTree();
      node.right = buildTree();

      return node;
    }

    return buildTree();
  }
}

// Approach 2: Level-order BFS
class CodecBFS {
  serialize(root) {
    if (!root) return "";

    const result = [];
    const queue = [root];

    while (queue.length > 0) {
      const node = queue.shift();

      if (node) {
        result.push(node.val.toString());
        queue.push(node.left);
        queue.push(node.right);
      } else {
        result.push("#");
      }
    }

    // Remove trailing nulls for efficiency
    while (result.length > 0 && result[result.length - 1] === "#") {
      result.pop();
    }

    return result.join(",");
  }

  deserialize(data) {
    if (!data) return null;

    const values = data.split(",");
    const root = new TreeNode(parseInt(values[0]));
    const queue = [root];
    let index = 1;

    while (queue.length > 0 && index < values.length) {
      const node = queue.shift();

      // Process left child
      if (index < values.length) {
        if (values[index] !== "#") {
          node.left = new TreeNode(parseInt(values[index]));
          queue.push(node.left);
        }
        index++;
      }

      // Process right child
      if (index < values.length) {
        if (values[index] !== "#") {
          node.right = new TreeNode(parseInt(values[index]));
          queue.push(node.right);
        }
        index++;
      }
    }

    return root;
  }
}

// Approach 3: Postorder with stack (iterative)
class CodecPostorder {
  serialize(root) {
    const result = [];
    const stack = [root];

    while (stack.length > 0) {
      const node = stack.pop();

      if (node) {
        result.push(node.val.toString());
        stack.push(node.left);
        stack.push(node.right);
      } else {
        result.push("#");
      }
    }

    return result.join(",");
  }

  deserialize(data) {
    if (!data) return null;

    const values = data.split(",");
    let index = 0;

    function buildTree() {
      const val = values[index++];
      if (val === "#") return null;

      const node = new TreeNode(parseInt(val));
      node.left = buildTree();
      node.right = buildTree();

      return node;
    }

    return buildTree();
  }
}

// Approach 4: Compact encoding (for space efficiency)
class CodecCompact {
  serialize(root) {
    if (!root) return "";

    const result = [];

    function encode(node) {
      if (!node) return;

      result.push(node.val);

      // Encode structure using bits
      let hasChildren = 0;
      if (node.left) hasChildren |= 1;
      if (node.right) hasChildren |= 2;

      result.push(hasChildren);

      if (node.left) encode(node.left);
      if (node.right) encode(node.right);
    }

    encode(root);
    return result.join(",");
  }

  deserialize(data) {
    if (!data) return null;

    const values = data.split(",").map((x) => parseInt(x));
    let index = 0;

    function decode() {
      if (index >= values.length) return null;

      const val = values[index++];
      const hasChildren = values[index++];

      const node = new TreeNode(val);

      if (hasChildren & 1) {
        node.left = decode();
      }

      if (hasChildren & 2) {
        node.right = decode();
      }

      return node;
    }

    return decode();
  }
}

// Helper functions for testing
function createTestTree() {
  //     1
  //    / \
  //   2   3
  //      / \
  //     4   5
  const root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.right = new TreeNode(3);
  root.right.left = new TreeNode(4);
  root.right.right = new TreeNode(5);
  return root;
}

function printTree(root, level = 0, prefix = "Root: ") {
  if (!root) return;

  console.log(" ".repeat(level * 4) + prefix + root.val);

  if (root.left || root.right) {
    if (root.left) {
      printTree(root.left, level + 1, "L--- ");
    } else {
      console.log(" ".repeat((level + 1) * 4) + "L--- null");
    }

    if (root.right) {
      printTree(root.right, level + 1, "R--- ");
    } else {
      console.log(" ".repeat((level + 1) * 4) + "R--- null");
    }
  }
}

function testSerialization() {
  const codec = new Codec();
  const tree = createTestTree();

  console.log("Original tree:");
  printTree(tree);

  const serialized = codec.serialize(tree);
  console.log("\nSerialized:", serialized);

  const deserialized = codec.deserialize(serialized);
  console.log("\nDeserialized tree:");
  printTree(deserialized);

  // Test edge cases
  console.log("\nEdge cases:");
  console.log("Empty tree:", codec.serialize(null));
  console.log("Single node:", codec.serialize(new TreeNode(42)));
}
```

### Key Insights:

#### **Why This Problem is Hard:**

1. **Multiple valid approaches** - preorder, postorder, level-order all work
2. **State management** - need to track position during deserialization
3. **Edge case handling** - null nodes, empty trees, single nodes
4. **Design decisions** - space vs time tradeoffs, encoding format

#### **Approach Comparison:**

- **Preorder DFS**: Most intuitive, recursive structure matches tree structure
- **Level-order BFS**: Matches typical tree representation, good for debugging
- **Postorder**: Alternative traversal, demonstrates flexibility
- **Compact encoding**: Space-efficient, shows optimization thinking

#### **Key Design Principles:**

1. **Null representation**: Use special marker ('#') for null nodes
2. **Delimiter choice**: Comma separation handles multi-digit numbers
3. **Reconstruction strategy**: Match serialization order in deserialization
4. **State tracking**: Use index/queue to maintain position during rebuild

### Test Cases:

```javascript
console.log("=== Testing Tree Serialization ===");

// Test different tree structures
const testTrees = [
  null, // Empty tree
  new TreeNode(1), // Single node
  createTestTree(), // Balanced tree
  createSkewedTree(), // Skewed tree
  createCompleteTree(), // Complete tree
];

function createSkewedTree() {
  // 1
  //  \
  //   2
  //    \
  //     3
  const root = new TreeNode(1);
  root.right = new TreeNode(2);
  root.right.right = new TreeNode(3);
  return root;
}

function createCompleteTree() {
  //     1
  //   /   \
  //  2     3
  // / \   / \
  //4   5 6   7
  const root = new TreeNode(1);
  root.left = new TreeNode(2);
  root.right = new TreeNode(3);
  root.left.left = new TreeNode(4);
  root.left.right = new TreeNode(5);
  root.right.left = new TreeNode(6);
  root.right.right = new TreeNode(7);
  return root;
}

testTrees.forEach((tree, index) => {
  console.log(`\nTest ${index + 1}:`);
  testSerialization();
});
```

### Interview Discussion Points:

#### **Follow-up Questions:**

1. **"What if the tree contains duplicate values?"** - Current solution works fine
2. **"How would you handle very large trees?"** - Streaming, compression
3. **"What about n-ary trees?"** - Modify to handle variable children
4. **"Can you make it more space-efficient?"** - Bit manipulation, compression

#### **Alternative Representations:**

- **JSON format**: `{"val":1,"left":{"val":2},"right":{"val":3}}`
- **Parenthetical**: `1(2()())(3(4()())(5()()))`
- **Binary encoding**: Use actual binary format for space efficiency

#### **Real-world Applications:**

- **Database storage**: Storing tree structures in relational databases
- **Network transmission**: Sending tree data over APIs
- **Caching**: Serializing complex data structures for Redis/Memcached
- **File formats**: XML, JSON parsing and generation

---

## Practice Strategy for Advanced Questions

### **Problem-Solving Framework:**

1. **Understand the constraints** - array size, value ranges, time limits
2. **Identify the pattern** - sliding window, two pointers, divide & conquer
3. **Consider multiple approaches** - brute force → optimized → space-optimized
4. **Handle edge cases** - empty inputs, single elements, duplicates
5. **Analyze complexity** - time and space tradeoffs

### **Common Advanced Patterns:**

- **Sliding Window**: Find All Anagrams, Longest Substring problems
- **Two Pointers**: Array manipulation, palindrome problems
- **Divide & Conquer**: Quickselect, merge operations
- **Hash Tables**: Anagram grouping, frequency counting
- **Tree Traversal**: Serialization, path problems
- **In-place Algorithms**: Array rotation, matrix manipulation

### **Interview Tips for Advanced Questions:**

- **Start with brute force** - show you understand the problem
- **Optimize step by step** - don't jump to the optimal solution immediately
- **Explain your thought process** - verbalize the pattern recognition
- **Consider space-time tradeoffs** - discuss different approaches
- **Test with edge cases** - empty inputs, single elements, large inputs
- **Code incrementally** - build up the solution piece by piece

### **Red Flags to Avoid:**

- **Jumping to code too quickly** - understand the problem first
- **Not considering edge cases** - always think about boundary conditions
- **Overcomplicating solutions** - sometimes simpler is better
- **Not explaining complexity** - always analyze time and space complexity
- **Giving up too easily** - work through the problem step by step

These advanced questions test deeper algorithmic thinking, pattern recognition, and the ability to optimize solutions. They're less commonly seen in basic interviews but demonstrate strong problem-solving skills expected at senior levels.
