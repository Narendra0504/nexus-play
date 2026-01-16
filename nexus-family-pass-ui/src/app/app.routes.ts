// =====================================================
// NEXUS FAMILY PASS - APPLICATION ROUTES
// Defines all routes for the application organized by
// portal (Auth, Parent, HR, Venue, Admin). Uses lazy
// loading for better initial load performance.
// =====================================================

// Import Angular Router types
import { Routes } from '@angular/router';

// Import route guards for authentication and authorization
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';
import { guestGuard } from './core/guards/guest.guard';

// -----------------------------------------------------
// APPLICATION ROUTES CONFIGURATION
// Routes are organized hierarchically by user role/portal
// Each portal lazy-loads its own feature module
// -----------------------------------------------------
export const routes: Routes = [
  // -------------------------------------------------
  // ROOT REDIRECT
  // Redirects empty path to login page
  // -------------------------------------------------
  {
    path: '',                          // Empty/root path
    redirectTo: 'login',               // Redirect to login
    pathMatch: 'full'                  // Only match exact empty path
  },

  // -------------------------------------------------
  // AUTHENTICATION ROUTES
  // Public routes for login, password reset, etc.
  // Protected by guestGuard - only accessible when NOT logged in
  // -------------------------------------------------
  {
    path: 'login',                     // Login page URL
    canActivate: [guestGuard],         // Only allow non-authenticated users
    loadComponent: () =>               // Lazy load the component
      import('./features/auth/pages/login/login.component')
        .then(m => m.LoginComponent),  // Extract the component class
    title: 'Login - Nexus Family Pass' // Browser tab title
  },
  {
    path: 'forgot-password',           // Forgot password page
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/forgot-password/forgot-password.component')
        .then(m => m.ForgotPasswordComponent),
    title: 'Forgot Password - Nexus Family Pass'
  },
  {
    path: 'reset-password/:token',     // Password reset with token parameter
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/reset-password/reset-password.component')
        .then(m => m.ResetPasswordComponent),
    title: 'Reset Password - Nexus Family Pass'
  },

  // -------------------------------------------------
  // PARENT PORTAL ROUTES
  // Protected routes for parent users to manage children,
  // browse activities, and make bookings
  // -------------------------------------------------
  {
    path: 'parent',                    // Parent portal base path
    canActivate: [authGuard, roleGuard], // Must be logged in with parent role
    data: { roles: ['parent'] },       // Required role for this route
    loadComponent: () =>               // Load the parent layout shell
      import('./layouts/parent-layout/parent-layout.component')
        .then(m => m.ParentLayoutComponent),
    children: [                        // Child routes render inside layout
      {
        path: '',                      // /parent - redirect to dashboard
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',             // /parent/dashboard - main dashboard
        loadComponent: () =>
          import('./features/parent/pages/dashboard/dashboard.component')
            .then(m => m.DashboardComponent),
        title: 'Dashboard - Nexus Family Pass'
      },
      {
        path: 'children',              // /parent/children - children list
        loadComponent: () =>
          import('./features/parent/pages/children-list/children-list.component')
            .then(m => m.ChildrenListComponent),
        title: 'My Children - Nexus Family Pass'
      },
      {
        path: 'children/new',          // /parent/children/new - add child form
        loadComponent: () =>
          import('./features/parent/pages/child-form/child-form.component')
            .then(m => m.ChildFormComponent),
        title: 'Add Child - Nexus Family Pass'
      },
      {
        path: 'children/:id/edit',     // /parent/children/:id/edit - edit child
        loadComponent: () =>
          import('./features/parent/pages/child-form/child-form.component')
            .then(m => m.ChildFormComponent),
        title: 'Edit Child - Nexus Family Pass'
      },
      {
        path: 'activities',            // /parent/activities - browse activities
        loadComponent: () =>
          import('./features/parent/pages/activities-browse/activities-browse.component')
            .then(m => m.ActivitiesBrowseComponent),
        title: 'Browse Activities - Nexus Family Pass'
      },
      {
        path: 'activities/:id',        // /parent/activities/:id - activity detail
        loadComponent: () =>
          import('./features/parent/pages/activity-detail/activity-detail.component')
            .then(m => m.ActivityDetailComponent),
        title: 'Activity Details - Nexus Family Pass'
      },
      {
        path: 'activities/:id/group-booking', // /parent/activities/:id/group-booking - sibling booking
        loadComponent: () =>
          import('./features/parent/pages/group-booking/group-booking.component')
            .then(m => m.GroupBookingFlowComponent),
        title: 'Group Booking - Nexus Family Pass'
      },
      {
        path: 'bookings',              // /parent/bookings - booking history
        loadComponent: () =>
          import('./features/parent/pages/bookings/bookings.component')
            .then(m => m.BookingsComponent),
        title: 'My Bookings - Nexus Family Pass'
      },
      {
        path: 'waitlist',              // /parent/waitlist - waitlist items
        loadComponent: () =>
          import('./features/parent/pages/waitlist/waitlist.component')
            .then(m => m.WaitlistComponent),
        title: 'My Waitlist - Nexus Family Pass'
      },
      {
        path: 'notifications',         // /parent/notifications - notification center
        loadComponent: () =>
          import('./features/parent/pages/notifications/notifications.component')
            .then(m => m.NotificationsComponent),
        title: 'Notifications - Nexus Family Pass'
      },
      {
        path: 'settings',              // /parent/settings - user settings
        loadComponent: () =>
          import('./features/parent/pages/settings/settings.component')
            .then(m => m.SettingsComponent),
        title: 'Settings - Nexus Family Pass'
      },
    ]
  },

  // -------------------------------------------------
  // HR ADMIN PORTAL ROUTES
  // Protected routes for HR administrators to view
  // aggregate employee usage data and manage subscription
  // -------------------------------------------------
  {
    path: 'hr',                        // HR portal base path
    canActivate: [authGuard, roleGuard],
    data: { roles: ['hr_admin'] },     // Required role
    loadComponent: () =>
      import('./layouts/hr-layout/hr-layout.component')
        .then(m => m.HrLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',             // /hr/dashboard - HR overview
        loadComponent: () =>
          import('./features/hr/pages/dashboard/dashboard.component')
            .then(m => m.HrDashboardComponent),
        title: 'HR Dashboard - Nexus Family Pass'
      },
      {
        path: 'employees',             // /hr/employees - employee list
        loadComponent: () =>
          import('./features/hr/pages/employees/employees.component')
            .then(m => m.EmployeesComponent),
        title: 'Employees - Nexus Family Pass'
      },
      {
        path: 'reports',               // /hr/reports - usage reports
        loadComponent: () =>
          import('./features/hr/pages/reports/reports.component')
            .then(m => m.ReportsComponent),
        title: 'Usage Reports - Nexus Family Pass'
      },
      {
        path: 'subscription',          // /hr/subscription - plan management
        loadComponent: () =>
          import('./features/hr/pages/subscription/subscription.component')
            .then(m => m.SubscriptionComponent),
        title: 'Subscription - Nexus Family Pass'
      },
      {
        path: 'settings',              // /hr/settings - HR settings
        loadComponent: () =>
          import('./features/hr/pages/settings/settings.component')
            .then(m => m.HrSettingsComponent),
        title: 'Settings - Nexus Family Pass'
      },
    ]
  },

  // -------------------------------------------------
  // VENUE ADMIN PORTAL ROUTES
  // Protected routes for venue administrators to manage
  // activities, view bookings, and track performance
  // -------------------------------------------------
  {
    path: 'venue',                     // Venue portal base path
    canActivate: [authGuard, roleGuard],
    data: { roles: ['venue_admin'] },  // Required role
    loadComponent: () =>
      import('./layouts/venue-layout/venue-layout.component')
        .then(m => m.VenueLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',             // /venue/dashboard - venue overview
        loadComponent: () =>
          import('./features/venue/pages/dashboard/dashboard.component')
            .then(m => m.VenueDashboardComponent),
        title: 'Venue Dashboard - Nexus Family Pass'
      },
      {
        path: 'activities',            // /venue/activities - activity listings
        loadComponent: () =>
          import('./features/venue/pages/activities/activities.component')
            .then(m => m.VenueActivitiesComponent),
        title: 'My Activities - Nexus Family Pass'
      },
      {
        path: 'activities/new',        // /venue/activities/new - create activity
        loadComponent: () =>
          import('./features/venue/pages/activity-form/activity-form.component')
            .then(m => m.ActivityFormComponent),
        title: 'Add Activity - Nexus Family Pass'
      },
      {
        path: 'activities/:id/edit',   // /venue/activities/:id/edit - edit activity
        loadComponent: () =>
          import('./features/venue/pages/activity-form/activity-form.component')
            .then(m => m.ActivityFormComponent),
        title: 'Edit Activity - Nexus Family Pass'
      },
      {
        path: 'bookings',              // /venue/bookings - booking calendar
        loadComponent: () =>
          import('./features/venue/pages/bookings/bookings.component')
            .then(m => m.VenueBookingsComponent),
        title: 'Bookings - Nexus Family Pass'
      },
      {
        path: 'bookings/:sessionId',   // /venue/bookings/:sessionId - attendance
        loadComponent: () =>
          import('./features/venue/pages/session-attendance/session-attendance.component')
            .then(m => m.SessionAttendanceComponent),
        title: 'Session Attendance - Nexus Family Pass'
      },
      {
        path: 'performance',           // /venue/performance - analytics
        loadComponent: () =>
          import('./features/venue/pages/performance/performance.component')
            .then(m => m.VenuePerformanceComponent),
        title: 'Performance - Nexus Family Pass'
      },
      {
        path: 'settings',              // /venue/settings - venue settings
        loadComponent: () =>
          import('./features/venue/pages/settings/settings.component')
            .then(m => m.VenueSettingsComponent),
        title: 'Settings - Nexus Family Pass'
      },
    ]
  },

  // -------------------------------------------------
  // PLATFORM ADMIN PORTAL ROUTES
  // Protected routes for platform administrators to
  // manage venues, corporates, and system settings
  // -------------------------------------------------
  {
    path: 'admin',                     // Admin portal base path
    canActivate: [authGuard, roleGuard],
    data: { roles: ['platform_admin'] }, // Required role
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout.component')
        .then(m => m.AdminLayoutComponent),
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',             // /admin/dashboard - platform overview
        loadComponent: () =>
          import('./features/admin/pages/dashboard/dashboard.component')
            .then(m => m.AdminDashboardComponent),
        title: 'Admin Dashboard - Nexus Family Pass'
      },
      {
        path: 'venues',                // /admin/venues - venue management
        loadComponent: () =>
          import('./features/admin/pages/venues/venues.component')
            .then(m => m.AdminVenuesComponent),
        title: 'Venue Management - Nexus Family Pass'
      },
      {
        path: 'companies',             // /admin/companies - corporate accounts
        loadComponent: () =>
          import('./features/admin/pages/companies/companies.component')
            .then(m => m.AdminCompaniesComponent),
        title: 'Company Management - Nexus Family Pass'
      },
      {
        path: 'users',                 // /admin/users - user management
        loadComponent: () =>
          import('./features/admin/pages/users/users.component')
            .then(m => m.AdminUsersComponent),
        title: 'User Management - Nexus Family Pass'
      },
      {
        path: 'bookings',              // /admin/bookings - all bookings
        loadComponent: () =>
          import('./features/admin/pages/bookings/bookings.component')
            .then(m => m.AdminBookingsComponent),
        title: 'Booking Management - Nexus Family Pass'
      },
      {
        path: 'reports',               // /admin/reports - platform analytics
        loadComponent: () =>
          import('./features/admin/pages/reports/reports.component')
            .then(m => m.AdminReportsComponent),
        title: 'Platform Reports - Nexus Family Pass'
      },
      {
        path: 'settings',              // /admin/settings - system settings
        loadComponent: () =>
          import('./features/admin/pages/settings/settings.component')
            .then(m => m.AdminSettingsComponent),
        title: 'System Settings - Nexus Family Pass'
      },
    ]
  },

  // -------------------------------------------------
  // WILDCARD ROUTE
  // Catches all unknown routes and shows 404 page
  // -------------------------------------------------
  {
    path: '**',                        // Match any unmatched route
    loadComponent: () =>
      import('./features/shared/pages/not-found/not-found.component')
        .then(m => m.NotFoundComponent),
    title: 'Page Not Found - Nexus Family Pass'
  }
];
