// =====================================================
// NEXUS FAMILY PASS - MODELS BARREL EXPORT
// Central export file for all TypeScript interfaces
// and types. Allows importing from '@models' path.
// =====================================================

// -----------------------------------------------------
// USER & AUTHENTICATION MODELS
// Export all user-related types and interfaces
// -----------------------------------------------------
export * from './user.model';          // User, LoginRequest, Company, etc.

// -----------------------------------------------------
// CHILD PROFILE MODELS
// Export all child-related types and interfaces
// -----------------------------------------------------
export * from './child.model';         // Child, ChildInterest, OnboardingQuiz, etc.

// -----------------------------------------------------
// ACTIVITY & VENUE MODELS
// Export all activity and venue types
// -----------------------------------------------------
export * from './activity.model';      // Activity, Venue, ActivitySlot, etc.

// -----------------------------------------------------
// BOOKING & CREDIT MODELS
// Export all booking and credit types
// -----------------------------------------------------
export * from './booking.model';       // Booking, CreditAccount, Waitlist, etc.

// -----------------------------------------------------
// NOTIFICATION & REVIEW MODELS
// Export all notification and feedback types
// -----------------------------------------------------
export * from './notification.model';  // Notification, Review, Feedback, etc.
