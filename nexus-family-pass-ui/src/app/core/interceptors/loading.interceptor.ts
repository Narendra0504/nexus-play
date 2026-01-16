// =====================================================
// NEXUS FAMILY PASS - LOADING INTERCEPTOR
// Functional HTTP interceptor that tracks pending HTTP
// requests and updates a global loading state service
// =====================================================

// Import Angular HTTP types
import { 
  HttpInterceptorFn, 
  HttpRequest, 
  HttpHandlerFn 
} from '@angular/common/http';

// Import inject function for dependency injection
import { inject } from '@angular/core';

// Import RxJS operators
import { finalize } from 'rxjs/operators';

// Import LoadingService to update loading state
import { LoadingService } from '../services/loading.service';

/**
 * loadingInterceptor - Global Loading State Manager
 * 
 * This interceptor tracks all HTTP requests and:
 * 1. Increments loading counter when request starts
 * 2. Decrements loading counter when request completes
 * 3. Allows components to show loading indicators
 * 
 * Uses counter approach to handle multiple concurrent requests
 * - Loading shows when counter > 0
 * - Loading hides when counter === 0
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of HTTP event
 */
export const loadingInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,     // Incoming request
  next: HttpHandlerFn            // Next handler
) => {
  // Inject loading service
  const loadingService = inject(LoadingService);
  
  // Check if this request should skip loading indicator
  // Some requests (like polling) might want to be silent
  const skipLoading = req.headers.has('X-Skip-Loading');
  
  if (!skipLoading) {
    // Increment loading counter - shows loading indicator
    loadingService.show();
    
    // Log for debugging (remove in production)
    console.log('[Loading] Request started:', req.url);
  }
  
  // Pass request to next handler
  return next(req).pipe(
    // finalize runs when observable completes OR errors
    // This ensures loading is hidden even on errors
    finalize(() => {
      if (!skipLoading) {
        // Decrement loading counter
        loadingService.hide();
        
        // Log for debugging
        console.log('[Loading] Request completed:', req.url);
      }
    })
  );
};
