// =====================================================
// NEXUS FAMILY PASS - USER & AUTHENTICATION MODELS
// TypeScript interfaces and types for user data,
// authentication state, and role-based access control
// =====================================================

// -----------------------------------------------------
// USER ROLE ENUM
// Defines all possible user roles in the system
// Used for route guards and conditional UI rendering
// -----------------------------------------------------
export enum UserRole {
  PARENT = 'parent',             // Parent user - can manage children and book activities
  HR_ADMIN = 'hr_admin',         // HR administrator - can view aggregate company data
  VENUE_ADMIN = 'venue_admin',   // Venue owner - can manage activities and bookings
  PLATFORM_ADMIN = 'platform_admin' // System admin - full platform access
}

// -----------------------------------------------------
// USER INTERFACE
// Represents a user account in the system
// Contains profile info and authentication state
// -----------------------------------------------------
export interface User {
  id: string;                    // Unique identifier (UUID)
  email: string;                 // User's email address (used for login)
  firstName: string;             // User's first name for display
  lastName: string;              // User's last name for display
  role: UserRole;                // User's role determining portal access
  phone?: string;                // Optional phone number
  avatarUrl?: string;            // Optional profile image URL
  isActive: boolean;             // Whether account is active
  isEmailVerified: boolean;      // Email verification status
  mfaEnabled: boolean;           // Multi-factor auth enabled
  lastLoginAt?: Date;            // Last login timestamp
  createdAt: Date;               // Account creation date
  updatedAt: Date;               // Last profile update date
}

// -----------------------------------------------------
// LOGIN REQUEST INTERFACE
// Data structure for login form submission
// -----------------------------------------------------
export interface LoginRequest {
  email: string;                 // User's email address
  password: string;              // User's password (plaintext for transport)
  rememberMe?: boolean;          // Whether to persist session
  loginType: 'parent' | 'corporate' | 'venue'; // Login tab selection
}

// -----------------------------------------------------
// LOGIN RESPONSE INTERFACE
// Data returned from successful login API call
// -----------------------------------------------------
export interface LoginResponse {
  user: User;                    // Authenticated user object
  accessToken: string;           // JWT access token for API calls
  refreshToken: string;          // JWT refresh token for token renewal
  expiresIn: number;             // Access token expiry time in seconds
}

// -----------------------------------------------------
// PASSWORD RESET REQUEST INTERFACE
// Data for forgot password form submission
// -----------------------------------------------------
export interface ForgotPasswordRequest {
  email: string;                 // Email to send reset link to
}

// -----------------------------------------------------
// PASSWORD RESET INTERFACE
// Data for password reset form submission
// -----------------------------------------------------
export interface ResetPasswordRequest {
  token: string;                 // Password reset token from email link
  newPassword: string;           // New password chosen by user
  confirmPassword: string;       // Password confirmation for validation
}

// -----------------------------------------------------
// AUTH STATE INTERFACE
// Represents current authentication state in app
// Used by AuthService to track logged-in status
// -----------------------------------------------------
export interface AuthState {
  isAuthenticated: boolean;      // Whether user is logged in
  user: User | null;             // Current user or null if logged out
  accessToken: string | null;    // Current JWT token or null
  isLoading: boolean;            // Auth operation in progress
  error: string | null;          // Auth error message if any
}

// -----------------------------------------------------
// TOKEN PAYLOAD INTERFACE
// Structure of decoded JWT token payload
// Used for extracting user info from token
// -----------------------------------------------------
export interface TokenPayload {
  sub: string;                   // Subject (user ID)
  email: string;                 // User's email
  role: UserRole;                // User's role
  iat: number;                   // Issued at timestamp
  exp: number;                   // Expiration timestamp
}

// -----------------------------------------------------
// COMPANY INTERFACE
// Represents a corporate customer organization
// Used in HR dashboard and admin panels
// -----------------------------------------------------
export interface Company {
  id: string;                    // Unique company identifier
  name: string;                  // Company display name
  domain?: string;               // Email domain for SSO matching
  planType: string;              // Subscription tier (standard/premium)
  creditsPerEmployee: number;    // Monthly credits allocated per employee
  maxEmployees?: number;         // Contract employee limit
  billingEmail?: string;         // Invoice recipient email
  isActive: boolean;             // Active subscription status
  contractStartDate?: Date;      // Subscription start date
  contractEndDate?: Date;        // Subscription renewal date
  createdAt: Date;               // Account creation date
}

// -----------------------------------------------------
// DEPARTMENT INTERFACE
// Represents a department within a company
// Used for aggregate reporting in HR dashboard
// -----------------------------------------------------
export interface Department {
  id: string;                    // Unique department identifier
  companyId: string;             // Parent company ID
  name: string;                  // Department name (Engineering, Sales, etc.)
}

// -----------------------------------------------------
// COMPANY EMPLOYEE INTERFACE
// Links a parent user to their employer
// Used for credit allocation and HR reporting
// -----------------------------------------------------
export interface CompanyEmployee {
  id: string;                    // Unique link identifier
  userId: string;                // Parent user ID
  companyId: string;             // Employer company ID
  departmentId?: string;         // Optional department ID
  employeeId?: string;           // Company's internal employee ID
  enrollmentDate: Date;          // When added to benefit program
  isActive: boolean;             // Currently enrolled status
}
