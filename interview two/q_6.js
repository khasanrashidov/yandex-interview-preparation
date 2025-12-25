/**
 * Question 6: Implement Queue using Stack
 * 
 * In JavaScript, we could use array to work as both a Stack or a queue.
 * 
 * Stack operations:
 * const arr = [1, 2, 3, 4]
 * arr.push(5) // now array is [1, 2, 3, 4, 5]
 * arr.pop()   // 5, now the array is [1, 2, 3, 4]
 * 
 * Queue operations:
 * const arr = [1, 2, 3, 4]
 * arr.push(5) // now array is [1, 2, 3, 4, 5]
 * arr.shift() // 1, now the array is [2, 3, 4, 5]
 * 
 * Now suppose you have a stack, which has only follow interface:
 * 
 * class Stack {
 *   push(element) {  } //add element to stack
 *   peek() {  } //get the top element
 *   pop() {  } //remove the top element
 *   size() {  } //count of elements
 * }
 * 
 * Could you implement a Queue by using only above Stack? A Queue must have following interface:
 * 
 * class Queue {
 *   enqueue(element) {  } //add element to queue, similar to Array.prototype.push
 *   peek() {  } //get the head element
 *   dequeue() {  } //remove the head element, similar to Array.prototype.pop
 *   size() {  } //count of elements
 * }
 * 
 * Note: you can only use Stack as provided, Array should be avoided for the purpose of practicing.
 */

// Provided Stack implementation
class Stack {
  constructor() {
    this._items = [];
  }

  push(element) {
    this._items.push(element);
  }

  peek() {
    if (this._items.length === 0) {
      return undefined;
    }
    return this._items[this._items.length - 1];
  }

  pop() {
    if (this._items.length === 0) {
      return undefined;
    }
    return this._items.pop();
  }

  size() {
    return this._items.length;
  }
}

// Queue implementation using two stacks
class Queue {
  constructor() {
    this._inStack = new Stack();  // For enqueue operations
    this._outStack = new Stack(); // For dequeue operations
  }

  enqueue(element) {
    // Always push to the input stack
    this._inStack.push(element);
  }

  peek() {
    // If output stack is empty, transfer from input stack
    if (this._outStack.size() === 0) {
      this._transferInToOut();
    }
    
    // Return the top element of output stack (oldest element)
    return this._outStack.peek();
  }

  dequeue() {
    // If output stack is empty, transfer from input stack
    if (this._outStack.size() === 0) {
      this._transferInToOut();
    }
    
    // Remove and return the top element of output stack (oldest element)
    return this._outStack.pop();
  }

  size() {
    // Total size is sum of both stacks
    return this._inStack.size() + this._outStack.size();
  }

  // Helper method to transfer all elements from input stack to output stack
  _transferInToOut() {
    while (this._inStack.size() > 0) {
      this._outStack.push(this._inStack.pop());
    }
  }
}

// Test cases
console.log('=== Test 1: Basic Queue Operations ===');
const queue = new Queue();

console.log('Initial size:', queue.size()); // 0
console.log('Peek empty queue:', queue.peek()); // undefined
console.log('Dequeue empty queue:', queue.dequeue()); // undefined

console.log('\n=== Test 2: Enqueue and Dequeue ===');
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);

console.log('Size after enqueue 1,2,3:', queue.size()); // 3
console.log('Peek (should be 1):', queue.peek()); // 1
console.log('Dequeue (should be 1):', queue.dequeue()); // 1
console.log('Size after dequeue:', queue.size()); // 2
console.log('Peek (should be 2):', queue.peek()); // 2

console.log('\n=== Test 3: Mixed Operations ===');
queue.enqueue(4);
queue.enqueue(5);

console.log('Size after enqueue 4,5:', queue.size()); // 4
console.log('Dequeue (should be 2):', queue.dequeue()); // 2
console.log('Dequeue (should be 3):', queue.dequeue()); // 3
console.log('Peek (should be 4):', queue.peek()); // 4
console.log('Size after two dequeues:', queue.size()); // 2

console.log('\n=== Test 4: Multiple Enqueues then Dequeues ===');
const queue2 = new Queue();

// Enqueue multiple elements
for (let i = 1; i <= 5; i++) {
  queue2.enqueue(i);
}

console.log('Size after enqueue 1-5:', queue2.size()); // 5

// Dequeue all elements
const dequeued = [];
while (queue2.size() > 0) {
  dequeued.push(queue2.dequeue());
}

console.log('Dequeued elements:', dequeued); // [1, 2, 3, 4, 5]
console.log('Final size:', queue2.size()); // 0

console.log('\n=== Test 5: String Elements ===');
const stringQueue = new Queue();

stringQueue.enqueue('first');
stringQueue.enqueue('second');
stringQueue.enqueue('third');

console.log('String queue peek:', stringQueue.peek()); // 'first'
console.log('String queue dequeue:', stringQueue.dequeue()); // 'first'
console.log('String queue dequeue:', stringQueue.dequeue()); // 'second'
console.log('String queue size:', stringQueue.size()); // 1

console.log('\n=== Test 6: Object Elements ===');
const objQueue = new Queue();

objQueue.enqueue({ id: 1, name: 'Alice' });
objQueue.enqueue({ id: 2, name: 'Bob' });

console.log('Object queue peek:', objQueue.peek()); // { id: 1, name: 'Alice' }
console.log('Object queue dequeue:', objQueue.dequeue()); // { id: 1, name: 'Alice' }
console.log('Object queue size:', objQueue.size()); // 1

console.log('\n=== Test 7: Performance Test ===');
const perfQueue = new Queue();
const start = Date.now();

// Enqueue 1000 elements
for (let i = 0; i < 1000; i++) {
  perfQueue.enqueue(i);
}

// Dequeue all elements
const results = [];
while (perfQueue.size() > 0) {
  results.push(perfQueue.dequeue());
}

const end = Date.now();
console.log('Performance test - 1000 elements:');
console.log('Time taken:', end - start, 'ms');
console.log('First 5 elements:', results.slice(0, 5)); // [0, 1, 2, 3, 4]
console.log('Last 5 elements:', results.slice(-5)); // [995, 996, 997, 998, 999]
console.log('Total elements processed:', results.length); // 1000
