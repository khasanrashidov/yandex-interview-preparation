# LeetCode Style Questions for Yandex Frontend Developer Interview

## Question 1: Two Sum (Medium)

**Topic**: Hash Table, Array
**Time Complexity**: O(n)
**Space Complexity**: O(n)

### Problem:

Given an array of integers `nums` and an integer `target`, return indices of the two numbers such that they add up to target. You may assume that each input would have exactly one solution, and you may not use the same element twice.

```javascript
// Example:
// Input: nums = [2,7,11,15], target = 9
// Output: [0,1] (because nums[0] + nums[1] = 2 + 7 = 9)

// Input: nums = [3,2,4], target = 6
// Output: [1,2]

// Input: nums = [3,3], target = 6
// Output: [0,1]
```

### Solution:

```javascript
function twoSum(nums, target) {
  const numMap = new Map();

  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];

    if (numMap.has(complement)) {
      return [numMap.get(complement), i];
    }

    numMap.set(nums[i], i);
  }

  return []; // Should not reach here given problem constraints
}
```

### Key Points:

- Use hash map to store seen numbers and their indices
- For each number, check if its complement exists
- Time: O(n) - single pass, Space: O(n) - hash map storage

---

## Question 2: Valid Parentheses (Medium)

**Topic**: Stack, String
**Time Complexity**: O(n)
**Space Complexity**: O(n)

### Problem:

Given a string `s` containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid. An input string is valid if:

1. Open brackets must be closed by the same type of brackets
2. Open brackets must be closed in the correct order
3. Every close bracket has a corresponding open bracket of the same type

```javascript
// Example:
// Input: s = "()"
// Output: true

// Input: s = "()[]{}"
// Output: true

// Input: s = "(]"
// Output: false

// Input: s = "([)]"
// Output: false
```

### Solution:

```javascript
function isValid(s) {
  const stack = [];
  const pairs = {
    ")": "(",
    "}": "{",
    "]": "[",
  };

  for (let char of s) {
    // If it's an opening bracket, push to stack
    if (char === "(" || char === "{" || char === "[") {
      stack.push(char);
    }
    // If it's a closing bracket
    else if (char === ")" || char === "}" || char === "]") {
      // Check if stack is empty or doesn't match
      if (stack.length === 0 || stack.pop() !== pairs[char]) {
        return false;
      }
    }
  }

  // Valid if stack is empty (all brackets matched)
  return stack.length === 0;
}
```

### Key Points:

- Use stack to keep track of opening brackets
- When encountering closing bracket, check if it matches the last opening bracket
- Stack should be empty at the end for valid string

---

## Question 3: Maximum Subarray (Kadane's Algorithm) (Medium)

**Topic**: Dynamic Programming, Array
**Time Complexity**: O(n)
**Space Complexity**: O(1)

### Problem:

Given an integer array `nums`, find the contiguous subarray (containing at least one number) which has the largest sum and return its sum.

```javascript
// Example:
// Input: nums = [-2,1,-3,4,-1,2,1,-5,4]
// Output: 6 (subarray [4,-1,2,1] has sum = 6)

// Input: nums = [1]
// Output: 1

// Input: nums = [5,4,-1,7,8]
// Output: 23
```

### Solution:

```javascript
function maxSubArray(nums) {
  let maxSoFar = nums[0];
  let maxEndingHere = nums[0];

  for (let i = 1; i < nums.length; i++) {
    // Either extend existing subarray or start new one
    maxEndingHere = Math.max(nums[i], maxEndingHere + nums[i]);

    // Update overall maximum
    maxSoFar = Math.max(maxSoFar, maxEndingHere);
  }

  return maxSoFar;
}

// Alternative: If you need the actual subarray indices
function maxSubArrayWithIndices(nums) {
  let maxSum = nums[0];
  let currentSum = nums[0];
  let start = 0,
    end = 0,
    tempStart = 0;

  for (let i = 1; i < nums.length; i++) {
    if (currentSum < 0) {
      currentSum = nums[i];
      tempStart = i;
    } else {
      currentSum += nums[i];
    }

    if (currentSum > maxSum) {
      maxSum = currentSum;
      start = tempStart;
      end = i;
    }
  }

  return {
    sum: maxSum,
    subarray: nums.slice(start, end + 1),
    indices: [start, end],
  };
}
```

### Key Points:

- Kadane's algorithm: decide at each position whether to extend or restart
- Keep track of maximum sum seen so far
- Classic dynamic programming problem

---

## Question 4: Binary Tree Level Order Traversal (Medium)

**Topic**: Tree, BFS, Queue
**Time Complexity**: O(n)
**Space Complexity**: O(w) where w is maximum width

### Problem:

Given the root of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).

```javascript
// Example:
//     3
//    / \
//   9  20
//     /  \
//    15   7
// Output: [[3],[9,20],[15,7]]

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
function levelOrder(root) {
  if (!root) return [];

  const result = [];
  const queue = [root];

  while (queue.length > 0) {
    const levelSize = queue.length;
    const currentLevel = [];

    // Process all nodes at current level
    for (let i = 0; i < levelSize; i++) {
      const node = queue.shift();
      currentLevel.push(node.val);

      // Add children to queue for next level
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }

    result.push(currentLevel);
  }

  return result;
}

// Alternative: Recursive approach with level tracking
function levelOrderRecursive(root) {
  const result = [];

  function traverse(node, level) {
    if (!node) return;

    // Initialize level array if needed
    if (result.length === level) {
      result.push([]);
    }

    result[level].push(node.val);

    // Recurse on children
    traverse(node.left, level + 1);
    traverse(node.right, level + 1);
  }

  traverse(root, 0);
  return result;
}
```

### Key Points:

- Use BFS with queue to traverse level by level
- Track level size to separate levels in result
- Alternative recursive solution tracks level depth

---

## Question 5: Longest Palindromic Substring (Medium)

**Topic**: String, Dynamic Programming, Expand Around Centers
**Time Complexity**: O(n²)
**Space Complexity**: O(1)

### Problem:

Given a string `s`, return the longest palindromic substring in `s`.

```javascript
// Example:
// Input: s = "babad"
// Output: "bab" (or "aba")

// Input: s = "cbbd"
// Output: "bb"

// Input: s = "a"
// Output: "a"
```

### Solution:

```javascript
// Approach 1: Expand Around Centers
function longestPalindrome(s) {
  if (!s || s.length < 1) return "";

  let start = 0;
  let maxLength = 1;

  // Helper function to expand around center
  function expandAroundCenter(left, right) {
    while (left >= 0 && right < s.length && s[left] === s[right]) {
      const currentLength = right - left + 1;
      if (currentLength > maxLength) {
        start = left;
        maxLength = currentLength;
      }
      left--;
      right++;
    }
  }

  for (let i = 0; i < s.length; i++) {
    // Check for odd-length palindromes (center at i)
    expandAroundCenter(i, i);

    // Check for even-length palindromes (center between i and i+1)
    expandAroundCenter(i, i + 1);
  }

  return s.substring(start, start + maxLength);
}

// Approach 2: Dynamic Programming (O(n²) space)
function longestPalindromeDP(s) {
  const n = s.length;
  if (n === 0) return "";

  // dp[i][j] represents if substring from i to j is palindrome
  const dp = Array(n)
    .fill()
    .map(() => Array(n).fill(false));

  let start = 0;
  let maxLength = 1;

  // All single characters are palindromes
  for (let i = 0; i < n; i++) {
    dp[i][i] = true;
  }

  // Check for palindromes of length 2
  for (let i = 0; i < n - 1; i++) {
    if (s[i] === s[i + 1]) {
      dp[i][i + 1] = true;
      start = i;
      maxLength = 2;
    }
  }

  // Check for palindromes of length 3 and more
  for (let length = 3; length <= n; length++) {
    for (let i = 0; i <= n - length; i++) {
      const j = i + length - 1;

      // Check if current substring is palindrome
      if (s[i] === s[j] && dp[i + 1][j - 1]) {
        dp[i][j] = true;
        start = i;
        maxLength = length;
      }
    }
  }

  return s.substring(start, start + maxLength);
}
```

### Key Points:

- Expand around centers is more space-efficient O(1) vs O(n²)
- Consider both odd and even length palindromes
- DP approach builds up solution from smaller subproblems

---

## Question 6: Median of Two Sorted Arrays (Hard)

**Topic**: Binary Search, Array, Divide and Conquer
**Time Complexity**: O(log(min(m,n)))
**Space Complexity**: O(1)

### Problem:

Given two sorted arrays `nums1` and `nums2` of size `m` and `n` respectively, return the median of the two sorted arrays. The overall run time complexity should be O(log (m+n)).

```javascript
// Example:
// Input: nums1 = [1,3], nums2 = [2]
// Output: 2.0 (merged array = [1,2,3], median = 2)

// Input: nums1 = [1,2], nums2 = [3,4]
// Output: 2.5 (merged array = [1,2,3,4], median = (2+3)/2 = 2.5)

// Input: nums1 = [0,0], nums2 = [0,0]
// Output: 0.0
```

### Solution:

```javascript
function findMedianSortedArrays(nums1, nums2) {
  // Ensure nums1 is the smaller array for optimization
  if (nums1.length > nums2.length) {
    [nums1, nums2] = [nums2, nums1];
  }

  const m = nums1.length;
  const n = nums2.length;
  const totalLeft = Math.floor((m + n + 1) / 2);

  let left = 0;
  let right = m;

  while (left <= right) {
    const cut1 = Math.floor((left + right) / 2);
    const cut2 = totalLeft - cut1;

    const left1 = cut1 === 0 ? -Infinity : nums1[cut1 - 1];
    const left2 = cut2 === 0 ? -Infinity : nums2[cut2 - 1];

    const right1 = cut1 === m ? Infinity : nums1[cut1];
    const right2 = cut2 === n ? Infinity : nums2[cut2];

    if (left1 <= right2 && left2 <= right1) {
      // Found the correct partition
      if ((m + n) % 2 === 1) {
        // Odd total length
        return Math.max(left1, left2);
      } else {
        // Even total length
        return (Math.max(left1, left2) + Math.min(right1, right2)) / 2;
      }
    } else if (left1 > right2) {
      // Too many elements from nums1, move left
      right = cut1 - 1;
    } else {
      // Too few elements from nums1, move right
      left = cut1 + 1;
    }
  }

  throw new Error("Input arrays are not sorted");
}

// Alternative: Simple merge approach (O(m+n) time, O(m+n) space)
function findMedianSortedArraysSimple(nums1, nums2) {
  const merged = [];
  let i = 0,
    j = 0;

  // Merge arrays
  while (i < nums1.length && j < nums2.length) {
    if (nums1[i] <= nums2[j]) {
      merged.push(nums1[i++]);
    } else {
      merged.push(nums2[j++]);
    }
  }

  // Add remaining elements
  while (i < nums1.length) merged.push(nums1[i++]);
  while (j < nums2.length) merged.push(nums2[j++]);

  const len = merged.length;
  if (len % 2 === 1) {
    return merged[Math.floor(len / 2)];
  } else {
    return (merged[len / 2 - 1] + merged[len / 2]) / 2;
  }
}
```

### Key Points:

- Hard problem requiring binary search optimization
- Key insight: partition arrays such that left half ≤ right half
- Handle edge cases (empty arrays, different sizes)
- Simple O(m+n) solution acceptable if O(log(m+n)) not required

---

## Question 7: Trapping Rain Water (Hard)

**Topic**: Array, Two Pointers, Dynamic Programming, Stack
**Time Complexity**: O(n)
**Space Complexity**: O(1) for optimal solution

### Problem:

Given `n` non-negative integers representing an elevation map where the width of each bar is 1, compute how much water it can trap after raining.

```javascript
// Example:
// Input: height = [0,1,0,2,1,0,1,3,2,1,2,1]
// Output: 6
// Explanation: The elevation map is represented by array [0,1,0,2,1,0,1,3,2,1,2,1].
// In this case, 6 units of rain water are being trapped.

// Input: height = [4,2,0,3,2,5]
// Output: 9

// Visual representation of first example:
//     |
// |   ||  | |
// ||| ||||||||
// Water can be trapped in the valleys between higher bars
```

### Solution:

```javascript
// Approach 1: Two Pointers (Optimal - O(n) time, O(1) space)
function trap(height) {
  if (!height || height.length <= 2) return 0;

  let left = 0;
  let right = height.length - 1;
  let leftMax = 0;
  let rightMax = 0;
  let water = 0;

  while (left < right) {
    if (height[left] < height[right]) {
      // Process left side
      if (height[left] >= leftMax) {
        leftMax = height[left];
      } else {
        // Water can be trapped
        water += leftMax - height[left];
      }
      left++;
    } else {
      // Process right side
      if (height[right] >= rightMax) {
        rightMax = height[right];
      } else {
        // Water can be trapped
        water += rightMax - height[right];
      }
      right--;
    }
  }

  return water;
}

// Approach 2: Dynamic Programming (O(n) time, O(n) space)
function trapDP(height) {
  if (!height || height.length <= 2) return 0;

  const n = height.length;
  const leftMax = new Array(n);
  const rightMax = new Array(n);

  // Calculate max height to the left of each position
  leftMax[0] = height[0];
  for (let i = 1; i < n; i++) {
    leftMax[i] = Math.max(height[i], leftMax[i - 1]);
  }

  // Calculate max height to the right of each position
  rightMax[n - 1] = height[n - 1];
  for (let i = n - 2; i >= 0; i--) {
    rightMax[i] = Math.max(height[i], rightMax[i + 1]);
  }

  let water = 0;
  for (let i = 0; i < n; i++) {
    // Water level at position i is min of left and right max
    const waterLevel = Math.min(leftMax[i], rightMax[i]);
    if (waterLevel > height[i]) {
      water += waterLevel - height[i];
    }
  }

  return water;
}

// Approach 3: Using Stack (O(n) time, O(n) space)
function trapStack(height) {
  if (!height || height.length <= 2) return 0;

  const stack = [];
  let water = 0;

  for (let i = 0; i < height.length; i++) {
    // While current height is greater than stack top
    while (stack.length > 0 && height[i] > height[stack[stack.length - 1]]) {
      const top = stack.pop();

      if (stack.length === 0) break;

      // Calculate trapped water
      const distance = i - stack[stack.length - 1] - 1;
      const minHeight =
        Math.min(height[i], height[stack[stack.length - 1]]) - height[top];
      water += distance * minHeight;
    }

    stack.push(i);
  }

  return water;
}

// Approach 4: Brute Force (O(n²) time, O(1) space) - for understanding
function trapBruteForce(height) {
  if (!height || height.length <= 2) return 0;

  let water = 0;

  for (let i = 1; i < height.length - 1; i++) {
    // Find max height to the left
    let leftMax = 0;
    for (let j = i - 1; j >= 0; j--) {
      leftMax = Math.max(leftMax, height[j]);
    }

    // Find max height to the right
    let rightMax = 0;
    for (let j = i + 1; j < height.length; j++) {
      rightMax = Math.max(rightMax, height[j]);
    }

    // Calculate trapped water at position i
    const waterLevel = Math.min(leftMax, rightMax);
    if (waterLevel > height[i]) {
      water += waterLevel - height[i];
    }
  }

  return water;
}

// Helper function to visualize the problem
function visualizeTrap(height) {
  const maxHeight = Math.max(...height);
  const n = height.length;

  console.log("Elevation Map:");
  for (let level = maxHeight; level >= 1; level--) {
    let row = "";
    for (let i = 0; i < n; i++) {
      if (height[i] >= level) {
        row += "█";
      } else {
        // Check if water can be trapped at this position and level
        let leftMax = 0,
          rightMax = 0;
        for (let j = 0; j < i; j++) leftMax = Math.max(leftMax, height[j]);
        for (let j = i + 1; j < n; j++)
          rightMax = Math.max(rightMax, height[j]);

        if (Math.min(leftMax, rightMax) >= level) {
          row += "~"; // Water
        } else {
          row += " "; // Air
        }
      }
    }
    console.log(row);
  }
  console.log("─".repeat(n)); // Ground
}
```

### Key Insights:

#### **Core Concept:**

Water at any position is determined by the minimum of:

- Maximum height to the left
- Maximum height to the right
- Minus the current height

#### **Two-Pointer Approach (Best):**

- Use two pointers moving towards each other
- Maintain running max from both sides
- Process the side with smaller height first
- Key insight: If left side is smaller, we know water level is determined by left max

#### **Why This Problem is Hard:**

1. **Multiple valid approaches** - requires understanding trade-offs
2. **Non-obvious optimization** - two-pointer technique is clever
3. **Edge case handling** - empty arrays, insufficient walls
4. **Spatial reasoning** - visualizing 2D water trapping in 1D array

### Test Cases:

```javascript
console.log("=== Testing Trapping Rain Water ===");

// Test case 1: Standard example
console.log(trap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1])); // Expected: 6

// Test case 2: Simple valley
console.log(trap([4, 2, 0, 3, 2, 5])); // Expected: 9

// Test case 3: No trapping possible
console.log(trap([1, 2, 3, 4, 5])); // Expected: 0 (strictly increasing)
console.log(trap([5, 4, 3, 2, 1])); // Expected: 0 (strictly decreasing)

// Test case 4: Edge cases
console.log(trap([])); // Expected: 0
console.log(trap([1])); // Expected: 0
console.log(trap([1, 1])); // Expected: 0

// Test case 5: Single valley
console.log(trap([3, 0, 2])); // Expected: 2

// Test case 6: Multiple valleys
console.log(trap([2, 0, 2, 0, 2])); // Expected: 4

// Visualization example
console.log("\nVisualization of [0,1,0,2,1,0,1,3,2,1,2,1]:");
visualizeTrap([0, 1, 0, 2, 1, 0, 1, 3, 2, 1, 2, 1]);
```

### Interview Discussion Points:

#### **Approach Comparison:**

- **Brute Force**: Easy to understand, O(n²) time
- **DP**: Clear logic, O(n) space for precomputation
- **Stack**: Good for understanding the "filling" process
- **Two Pointers**: Optimal solution, requires insight

#### **Follow-up Questions:**

1. "What if we had 2D rain trapping?" (Much harder problem)
2. "How would you handle very large arrays?" (Consider memory constraints)
3. "Can you solve it with only one pass?" (Two-pointer approach)
4. "What if heights could be negative?" (Modify the algorithm)

#### **Real-world Applications:**

- **Computer Graphics**: Water simulation, terrain rendering
- **Architecture**: Drainage system design
- **Data Analysis**: Finding "valleys" in time series data

## Practice Strategy:

### **For Each Problem:**

1. **Understand the problem** - read carefully, ask clarifying questions
2. **Think about approach** - brute force first, then optimize
3. **Consider edge cases** - empty inputs, single elements, etc.
4. **Implement step by step** - don't try to write perfect code immediately
5. **Test with examples** - walk through with given test cases
6. **Analyze complexity** - time and space complexity

### **Common Patterns:**

- **Two Pointers**: Two Sum, Valid Parentheses
- **Sliding Window**: Maximum Subarray
- **BFS/DFS**: Tree Traversal
- **Dynamic Programming**: Longest Palindromic Substring
- **Binary Search**: Median of Two Sorted Arrays

### **Interview Tips:**

- **Think out loud** - explain your approach before coding
- **Start with brute force** - then optimize if needed
- **Ask about constraints** - array size, value ranges, etc.
- **Handle edge cases** - empty inputs, single elements
- **Test your solution** - walk through with examples
