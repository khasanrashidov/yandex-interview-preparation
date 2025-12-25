/**
 * Question 5: Create a fake timer (setTimeout)
 *
 * Implement your own version of setTimeout and clearTimeout without using
 * the browser's built-in timer functions. This tests deep understanding of
 * JavaScript's event loop and timing mechanisms.
 *
 * Your implementation should:
 * - Execute callbacks after the specified delay
 * - Return a timer ID that can be used to cancel the timer
 * - Support clearTimeout functionality
 * - Handle multiple timers correctly
 * - Execute callbacks in the correct order (earliest first)
 *
 * Key concepts:
 * - You'll need to use setInterval or requestAnimationFrame as the base mechanism
 * - Track when each timer should fire
 * - Implement a priority queue or sorting mechanism for execution order
 *
 * Example usage:
 * const timerId = mySetTimeout(() => console.log('Hello'), 1000);
 * myClearTimeout(timerId); // Should cancel the timer
 *
 * mySetTimeout(() => console.log('First'), 100);
 * mySetTimeout(() => console.log('Second'), 200);
 * // Should log 'First' then 'Second'
 */

class FakeTimer {
  constructor() {
    this.timers = new Map();
    this.currentId = 0;
    this.intervalId = null;
    this.startTime = Date.now();
  }

  setTimeout(callback, delay = 0) {
    const id = ++this.currentId;
    const executeTime = Date.now() + delay;

    this.timers.set(id, {
      callback,
      executeTime,
      id,
    });

    // Start the internal timer if it's not running
    if (!this.intervalId) {
      this.start();
    }

    return id;
  }

  clearTimeout(id) {
    this.timers.delete(id);

    // Stop the internal timer if no more timers are pending
    if (this.timers.size === 0 && this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }

  start() {
    this.intervalId = setInterval(() => {
      this.tick();
    }, 1); // Check every 1ms for better precision
  }

  tick() {
    const now = Date.now();
    const readyTimers = [];

    // Find all timers that are ready to execute
    for (const [id, timer] of this.timers) {
      if (now >= timer.executeTime) {
        readyTimers.push(timer);
        this.timers.delete(id);
      }
    }

    // Sort by execution time (earliest first)
    readyTimers.sort((a, b) => a.executeTime - b.executeTime);

    // Execute ready timers
    readyTimers.forEach((timer) => {
      try {
        timer.callback();
      } catch (error) {
        console.error("Timer callback error:", error);
      }
    });

    // Stop the internal timer if no more timers are pending
    if (this.timers.size === 0) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Create global instance
const fakeTimer = new FakeTimer();

// Export the global functions
function mySetTimeout(callback, delay) {
  return fakeTimer.setTimeout(callback, delay);
}

function myClearTimeout(id) {
  fakeTimer.clearTimeout(id);
}

// Alternative implementation using requestAnimationFrame (more browser-like)
class FakeTimerRAF {
  constructor() {
    this.timers = new Map();
    this.currentId = 0;
    this.running = false;
  }

  setTimeout(callback, delay = 0) {
    const id = ++this.currentId;
    const executeTime = performance.now() + delay;

    this.timers.set(id, { callback, executeTime });

    if (!this.running) {
      this.start();
    }

    return id;
  }

  clearTimeout(id) {
    this.timers.delete(id);
  }

  start() {
    this.running = true;
    const tick = (currentTime) => {
      const readyTimers = [];

      for (const [id, timer] of this.timers) {
        if (currentTime >= timer.executeTime) {
          readyTimers.push({ id, timer });
        }
      }

      // Execute and remove ready timers
      readyTimers.forEach(({ id, timer }) => {
        this.timers.delete(id);
        timer.callback();
      });

      // Continue if there are more timers
      if (this.timers.size > 0) {
        requestAnimationFrame(tick);
      } else {
        this.running = false;
      }
    };

    requestAnimationFrame(tick);
  }
}

// Test cases
console.log("Testing fake timer...");

const timer1 = mySetTimeout(() => console.log("Timer 1: 100ms"), 100);
const timer2 = mySetTimeout(() => console.log("Timer 2: 50ms"), 50);
const timer3 = mySetTimeout(() => console.log("Timer 3: 200ms"), 200);

// Cancel timer 3
myClearTimeout(timer3);

// Should log:
// Timer 2: 50ms (after ~50ms)
// Timer 1: 100ms (after ~100ms)
// Timer 3 should not execute
