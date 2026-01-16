// =====================================================
// NEXUS FAMILY PASS - AUTH GUARD
// Functional route guard that protects routes requiring
// authentication. Redirects to login if not authenticated.
// =====================================================

// Import Angular Router types for guards
import { CanActivateFn, Router } from '@angular/router';

// Import inject function for dependency injection
import { inject } from '@angular/core';

// Import AuthService to check authentication status
import { AuthService } from '../services/auth.service';

/**
 * authGuard - Authentication Route Guard
 * 
 * This guard protects routes that require authentication:
 * - Checks if user is currently authenticated
 * - If authenticated: allows navigation (returns true)
 * - If not authenticated: redirects to login page
 * 
 * Usage in routes:
 * ```typescript
 * {
 *   path: 'dashboard',
 *   canActivate: [authGuard],
 *   component: DashboardComponent
 * }
 * ```
 * 
 * @param route - The activated route snapshot
 * @param state - The router state snapshot
 * @returns boolean | UrlTree - true to allow, UrlTree to redirect
 */
export const authGuard: CanActivateFn = (route, state) => {
  // Inject required services using inject() function
  const authService = inject(AuthService);  // Authentication service
  const router = inject(Router);            // Router for redirects
  
  // Check if user is authenticated
  if (authService.isAuthenticated()) {
    // User is authenticated - allow navigation
    console.log('[Auth Guard] Access granted to:', state.url);
    return true;
  }
  
  // User is not authenticated - redirect to login
  console.log('[Auth Guard] Access denied, redirecting to login');
  
  // Store the attempted URL for redirecting after login
  // This allows "return to where you were" functionality
  const returnUrl = state.url;
  
  // Create URL tree for login with return URL parameter
  return router.createUrlTree(['/login'], {
    queryParams: { returnUrl }  // Pass original URL as query param
  });
};
