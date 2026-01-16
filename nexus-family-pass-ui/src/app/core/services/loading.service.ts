// =====================================================
// NEXUS FAMILY PASS - LOADING SERVICE
// Manages global loading state using Angular Signals
// Tracks pending HTTP requests for loading indicators
// =====================================================

// Import Angular core decorators and signals
import { Injectable, signal, computed } from '@angular/core';

/**
 * LoadingService - Global Loading State Manager
 * 
 * This service manages a counter-based loading state that:
 * - Increments when HTTP requests start
 * - Decrements when HTTP requests complete
 * - Exposes reactive signal for components to subscribe
 * 
 * Counter approach handles multiple concurrent requests:
 * - Request 1 starts: counter = 1, loading = true
 * - Request 2 starts: counter = 2, loading = true
 * - Request 1 ends: counter = 1, loading = true
 * - Request 2 ends: counter = 0, loading = false
 */
@Injectable({
  providedIn: 'root'  // Singleton available application-wide
})
export class LoadingService {
  // -------------------------------------------------
  // PRIVATE STATE
  // Counter tracking number of pending requests
  // -------------------------------------------------
  
  // Signal holding count of pending requests
  private loadingCounter = signal<number>(0);

  // -------------------------------------------------
  // PUBLIC COMPUTED SIGNALS
  // Reactive values for components to consume
  // -------------------------------------------------
  
  /**
   * isLoading - Whether any requests are pending
   * Returns true when counter > 0, false when counter === 0
   */
  readonly isLoading = computed(() => this.loadingCounter() > 0);
  
  /**
   * pendingRequests - Number of pending requests
   * Useful for debugging or showing request count
   */
  readonly pendingRequests = computed(() => this.loadingCounter());

  // -------------------------------------------------
  // PUBLIC METHODS
  // Called by loading interceptor
  // -------------------------------------------------

  /**
   * show - Increment loading counter
   * Called when an HTTP request starts
   */
  show(): void {
    // Update signal by incrementing current value
    this.loadingCounter.update(count => count + 1);
  }

  /**
   * hide - Decrement loading counter
   * Called when an HTTP request completes (success or error)
   */
  hide(): void {
    // Update signal by decrementing, but never go below 0
    this.loadingCounter.update(count => Math.max(0, count - 1));
  }

  /**
   * reset - Reset counter to 0
   * Useful for cleanup or error recovery
   */
  reset(): void {
    // Set counter to 0
    this.loadingCounter.set(0);
  }

  /**
   * forceShow - Force loading to show
   * Useful for non-HTTP loading scenarios
   * Remember to call forceHide when done!
   */
  forceShow(): void {
    this.loadingCounter.update(count => count + 1);
  }

  /**
   * forceHide - Force loading to hide
   * Decrements counter for manual loading management
   */
  forceHide(): void {
    this.loadingCounter.update(count => Math.max(0, count - 1));
  }
}
