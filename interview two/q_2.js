/**
 * Question 2: Implement Observable.merge from RxJS
 * 
 * Create a function that merges multiple observables into a single observable.
 * The merged observable should emit values from all source observables as they arrive.
 * 
 * Key requirements:
 * - Merge multiple observables into one
 * - Maintain order of emissions within each source
 * - Handle errors from any source
 * - Complete only when all sources complete
 * - Support unsubscribe/cleanup
 * 
 * @param {...Observable} observables - Source observables to merge
 * @returns {Observable} - A new observable that emits all values from all sources
 * 
 * Example:
 * const obs1 = new Observable(sub => {
 *   sub.next(1);
 *   setTimeout(() => sub.next(2), 100);
 *   setTimeout(() => sub.complete(), 200);
 * });
 * 
 * const obs2 = new Observable(sub => {
 *   setTimeout(() => sub.next('a'), 50);
 *   setTimeout(() => sub.next('b'), 150);
 *   setTimeout(() => sub.complete(), 250);
 * });
 * 
 * merge(obs1, obs2).subscribe(console.log);
 * // 1, 'a', 2, 'b'
 */

class Observable {
  constructor(subscribe) {
    this._subscribe = subscribe;
  }

  subscribe(next, error, complete) {
    const observer = typeof next === 'function'
      ? { next, error, complete }
      : next;

    return this._subscribe(observer);
  }
}

function merge(...observables) {
  return new Observable(observer => {
    // Track completion status of each source
    const completionStatus = new Array(observables.length).fill(false);
    // Store cleanup functions
    const cleanupFns = [];
    // Track if we've errored or completed
    let hasErrored = false;
    let isComplete = false;

    // Subscribe to each source observable
    observables.forEach((obs, index) => {
      // Skip if we've already errored
      if (hasErrored) return;

      const subscription = obs.subscribe({
        next: value => {
          // Only emit if we haven't errored or completed
          if (!hasErrored && !isComplete) {
            observer.next(value);
          }
        },
        error: err => {
          // Only handle error once
          if (!hasErrored && !isComplete) {
            hasErrored = true;
            // Clean up all other subscriptions
            cleanupFns.forEach(fn => fn && fn());
            observer.error(err);
          }
        },
        complete: () => {
          // Mark this source as complete
          completionStatus[index] = true;
          // If all sources are complete, complete the merged observable
          if (completionStatus.every(status => status) && !hasErrored && !isComplete) {
            isComplete = true;
            observer.complete();
          }
        }
      });

      // Store cleanup function
      if (subscription && typeof subscription === 'function') {
        cleanupFns[index] = subscription;
      } else if (subscription && typeof subscription.unsubscribe === 'function') {
        cleanupFns[index] = () => subscription.unsubscribe();
      }
    });

    // Return cleanup function
    return () => {
      cleanupFns.forEach(fn => fn && fn());
    };
  });
}

// Test cases
const obs1 = new Observable(sub => {
  sub.next(1);
  setTimeout(() => sub.next(2), 100);
  setTimeout(() => sub.complete(), 200);
  return () => console.log('obs1 cleanup');
});

const obs2 = new Observable(sub => {
  setTimeout(() => sub.next('a'), 50);
  setTimeout(() => sub.next('b'), 150);
  setTimeout(() => sub.complete(), 250);
  return () => console.log('obs2 cleanup');
});

const obs3 = new Observable(sub => {
  setTimeout(() => sub.error('error!'), 150);
  return () => console.log('obs3 cleanup');
});

// Test 1: Basic merge
console.log('Test 1: Basic merge');
const sub1 = merge(obs1, obs2).subscribe({
  next: val => console.log('next:', val),
  error: err => console.log('error:', err),
  complete: () => console.log('complete')
});

// Test 2: Error handling
console.log('\nTest 2: Error handling');
const sub2 = merge(obs1, obs3).subscribe({
  next: val => console.log('next:', val),
  error: err => console.log('error:', err),
  complete: () => console.log('complete')
});

// Test 3: Unsubscribe
console.log('\nTest 3: Unsubscribe');
const sub3 = merge(obs1, obs2).subscribe({
  next: val => console.log('next:', val)
});
setTimeout(() => {
  console.log('unsubscribing...');
  sub3.unsubscribe();
}, 120);