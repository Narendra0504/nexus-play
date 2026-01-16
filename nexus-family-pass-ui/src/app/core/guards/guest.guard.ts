// =====================================================
// NEXUS FAMILY PASS - GUEST GUARD
// Functional route guard that prevents authenticated
// users from accessing guest-only pages (login, etc.)
// =====================================================

// Import Angular Router types
import { CanActivateFn, Router } from '@angular/router';

// Import inject function for dependency injection
import { inject } from '@angular/core';

// Import AuthService to check authentication status
import { AuthService } from '../services/auth.service';

/**
 * guestGuard - Guest-Only Route Guard
 * 
 * This guard prevents authenticated users from accessing
 * pages meant only for guests (non-authenticated users):
 * - Login page
 * - Forgot password page
 * - Reset password page
 * - Registration pages
 * 
 * Behavior:
 * - If NOT authenticated: allows navigation (returns true)
 * - If authenticated: redirects to user's dashboard
 * 
 * This prevents logged-in users from seeing the login page,
 * which would be confusing UX.
 * 
 * Usage in routes:
 * ```typescript
 * {
 *   path: 'login',
 *   canActivate: [guestGuard],
 *   component: LoginComponent
 * }
 * ```
 * 
 * @param route - The activated route snapshot
 * @param state - The router state snapshot
 * @returns boolean | UrlTree - true to allow, UrlTree to redirect
 */
export const guestGuard: CanActivateFn = (route, state) => {
  // Inject required services
  const authService = inject(AuthService);  // Authentication service
  const router = inject(Router);            // Router for redirects
  
  // Check if user is NOT authenticated
  if (!authService.isAuthenticated()) {
    // User is not logged in - allow access to guest pages
    console.log('[Guest Guard] User is guest, access granted to:', state.url);
    return true;
  }
  
  // User is already authenticated
  // Redirect them to their appropriate dashboard
  console.log('[Guest Guard] User is authenticated, redirecting to dashboard');
  
  // Get the appropriate dashboard URL based on user's role
  const dashboardUrl = authService.getDashboardRoute();
  
  console.log('[Guest Guard] Redirecting to:', dashboardUrl);
  
  // Return URL tree to redirect to dashboard
  return router.createUrlTree([dashboardUrl]);
};
