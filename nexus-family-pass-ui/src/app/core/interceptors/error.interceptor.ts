// =====================================================
// NEXUS FAMILY PASS - ERROR INTERCEPTOR
// Functional HTTP interceptor that handles HTTP errors
// globally, showing user-friendly messages and handling
// authentication failures (401 responses)
// =====================================================

// Import Angular HTTP types
import { 
  HttpInterceptorFn, 
  HttpRequest, 
  HttpHandlerFn,
  HttpErrorResponse 
} from '@angular/common/http';

// Import inject function for dependency injection
import { inject } from '@angular/core';

// Import RxJS operators for error handling
import { catchError, throwError } from 'rxjs';

// Import Angular Router for navigation
import { Router } from '@angular/router';

// Import Material Snackbar for toast notifications
import { MatSnackBar } from '@angular/material/snack-bar';

// Import AuthService for logout on auth errors
import { AuthService } from '../services/auth.service';

/**
 * errorInterceptor - Global HTTP Error Handler
 * 
 * This interceptor catches all HTTP errors and:
 * 1. Handles 401 Unauthorized - logs out user and redirects to login
 * 2. Handles 403 Forbidden - shows access denied message
 * 3. Handles 404 Not Found - shows not found message
 * 4. Handles 500 Server Error - shows generic error message
 * 5. Handles network errors - shows offline message
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of HTTP event
 */
export const errorInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,     // Incoming request
  next: HttpHandlerFn            // Next handler
) => {
  // Inject required services
  const router = inject(Router);           // For navigation
  const snackBar = inject(MatSnackBar);    // For toast messages
  const authService = inject(AuthService); // For logout
  
  // Pass request and catch any errors
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      // Log error for debugging
      console.error('[Error Interceptor] HTTP Error:', error);
      
      // Default error message
      let errorMessage = 'An unexpected error occurred. Please try again.';
      
      // Handle different error status codes
      if (error.error instanceof ErrorEvent) {
        // -------------------------------------------------
        // CLIENT-SIDE ERROR (network error, etc.)
        // -------------------------------------------------
        errorMessage = 'Unable to connect. Please check your internet connection.';
        
        // Show error toast
        showErrorToast(snackBar, errorMessage);
        
      } else {
        // -------------------------------------------------
        // SERVER-SIDE ERROR (HTTP response error)
        // -------------------------------------------------
        switch (error.status) {
          case 0:
            // Network error - server unreachable
            errorMessage = 'Unable to connect to server. Please try again later.';
            break;
            
          case 400:
            // Bad Request - invalid data sent
            errorMessage = error.error?.message || 'Invalid request. Please check your input.';
            break;
            
          case 401:
            // Unauthorized - authentication required or token expired
            errorMessage = 'Your session has expired. Please log in again.';
            
            // Log out user and redirect to login
            authService.logout();
            
            // Navigate to login page
            router.navigate(['/login']);
            break;
            
          case 403:
            // Forbidden - user doesn't have permission
            errorMessage = 'You do not have permission to perform this action.';
            break;
            
          case 404:
            // Not Found - resource doesn't exist
            errorMessage = error.error?.message || 'The requested resource was not found.';
            break;
            
          case 409:
            // Conflict - resource already exists or state conflict
            errorMessage = error.error?.message || 'A conflict occurred. Please refresh and try again.';
            break;
            
          case 422:
            // Unprocessable Entity - validation error
            errorMessage = error.error?.message || 'Please check your input and try again.';
            break;
            
          case 429:
            // Too Many Requests - rate limited
            errorMessage = 'Too many requests. Please wait a moment and try again.';
            break;
            
          case 500:
            // Internal Server Error
            errorMessage = 'A server error occurred. Our team has been notified.';
            break;
            
          case 502:
          case 503:
          case 504:
            // Gateway/Service errors - server overloaded or down
            errorMessage = 'Service temporarily unavailable. Please try again later.';
            break;
            
          default:
            // Unknown error status
            errorMessage = error.error?.message || `Error ${error.status}: Please try again.`;
        }
        
        // Show error toast (except for 401 which redirects)
        if (error.status !== 401) {
          showErrorToast(snackBar, errorMessage);
        }
      }
      
      // Re-throw error so components can handle it if needed
      return throwError(() => new Error(errorMessage));
    })
  );
};

/**
 * showErrorToast - Display error message in snackbar
 * @param snackBar - Material snackbar instance
 * @param message - Error message to display
 */
function showErrorToast(snackBar: MatSnackBar, message: string): void {
  // Show snackbar with error styling
  snackBar.open(
    message,                              // Message text
    'Dismiss',                            // Action button text
    {
      duration: 5000,                     // Show for 5 seconds
      horizontalPosition: 'right',        // Position on right
      verticalPosition: 'top',            // Position at top
      panelClass: ['snackbar-error']      // Error styling class
    }
  );
}
