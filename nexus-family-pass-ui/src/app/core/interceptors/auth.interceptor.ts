// =====================================================
// NEXUS FAMILY PASS - AUTH INTERCEPTOR
// Functional HTTP interceptor that adds JWT bearer
// token to all outgoing API requests for authentication
// =====================================================

// Import Angular HTTP interceptor types
import { HttpInterceptorFn, HttpRequest, HttpHandlerFn } from '@angular/common/http';

// Import inject function for dependency injection in functions
import { inject } from '@angular/core';

// Import AuthService to get the current token
import { AuthService } from '../services/auth.service';

/**
 * authInterceptor - Functional HTTP Interceptor
 * 
 * This interceptor runs on every outgoing HTTP request and:
 * 1. Checks if user is authenticated
 * 2. Adds Authorization header with Bearer token if available
 * 3. Passes request to next handler in chain
 * 
 * Uses Angular 17+ functional interceptor pattern (not class-based)
 * 
 * @param req - The outgoing HTTP request
 * @param next - The next handler in the interceptor chain
 * @returns Observable of HTTP event
 */
export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,     // Incoming request object
  next: HttpHandlerFn            // Next handler function
) => {
  // Inject AuthService using inject() function
  // This is the Angular 17+ way to inject in functional interceptors
  const authService = inject(AuthService);
  
  // Get current access token from auth service
  const token = authService.getAccessToken();
  
  // Check if we have a valid token
  if (token) {
    // Clone the request and add Authorization header
    // We must clone because HttpRequest is immutable
    const authReq = req.clone({
      setHeaders: {
        // Add Bearer token in standard Authorization header format
        Authorization: `Bearer ${token}`
      }
    });
    
    // Log for debugging (remove in production)
    console.log('[Auth Interceptor] Added token to request:', req.url);
    
    // Pass modified request to next handler
    return next(authReq);
  }
  
  // No token available - pass original request unchanged
  // This handles public endpoints that don't need auth
  return next(req);
};
