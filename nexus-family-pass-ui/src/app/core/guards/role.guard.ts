// =====================================================
// NEXUS FAMILY PASS - ROLE GUARD
// Functional route guard that protects routes based on
// user role. Ensures user has required role to access.
// =====================================================

// Import Angular Router types
import { CanActivateFn, Router } from '@angular/router';

// Import inject function for dependency injection
import { inject } from '@angular/core';

// Import AuthService to check user role
import { AuthService } from '../services/auth.service';

// Import UserRole enum
import { UserRole } from '../models';

/**
 * roleGuard - Role-Based Route Guard
 * 
 * This guard protects routes that require specific user roles:
 * - Reads required roles from route data
 * - Checks if current user has any of the required roles
 * - If authorized: allows navigation (returns true)
 * - If not authorized: redirects to user's dashboard
 * 
 * Usage in routes:
 * ```typescript
 * {
 *   path: 'admin/dashboard',
 *   canActivate: [authGuard, roleGuard],
 *   data: { roles: ['platform_admin'] },
 *   component: AdminDashboardComponent
 * }
 * ```
 * 
 * @param route - The activated route snapshot (contains role data)
 * @param state - The router state snapshot
 * @returns boolean | UrlTree - true to allow, UrlTree to redirect
 */
export const roleGuard: CanActivateFn = (route, state) => {
  // Inject required services
  const authService = inject(AuthService);  // Authentication service
  const router = inject(Router);            // Router for redirects
  
  // Get required roles from route data
  // Route definition should have: data: { roles: ['role1', 'role2'] }
  const requiredRoles = route.data['roles'] as UserRole[];
  
  // If no roles specified, allow access (only auth check needed)
  if (!requiredRoles || requiredRoles.length === 0) {
    console.log('[Role Guard] No roles required, access granted');
    return true;
  }
  
  // Check if user has any of the required roles
  if (authService.hasAnyRole(requiredRoles)) {
    // User has required role - allow navigation
    console.log('[Role Guard] User has required role, access granted to:', state.url);
    return true;
  }
  
  // User does not have required role
  console.log('[Role Guard] User does not have required role:', requiredRoles);
  console.log('[Role Guard] User role:', authService.userRole());
  
  // Redirect to user's appropriate dashboard instead of showing error
  // This handles cases like parent trying to access admin routes
  const dashboardUrl = authService.getDashboardRoute();
  
  console.log('[Role Guard] Redirecting to:', dashboardUrl);
  
  // Return URL tree to redirect to user's dashboard
  return router.createUrlTree([dashboardUrl]);
};
