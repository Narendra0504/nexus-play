// =====================================================
// NEXUS FAMILY PASS - AUTH SERVICE
// Handles authentication, user session, and role-based access
// =====================================================

import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, of, delay, tap } from 'rxjs';
import { 
  User, 
  UserRole, 
  LoginRequest, 
  LoginResponse, 
  ForgotPasswordRequest,
  ResetPasswordRequest 
} from '../models';

// =====================================================
// MOCK USER CREDENTIALS FOR TESTING
// =====================================================
// | Role           | Email            | Password     | Login Tab  |
// |----------------|------------------|--------------|------------|
// | Parent         | parent@demo.com  | password123  | Parent     |
// | HR Admin       | hr@demo.com      | password123  | Corporate  |
// | Venue Admin    | venue@demo.com   | password123  | Venue      |
// | Platform Admin | admin@demo.com   | password123  | Venue      |
// =====================================================

const MOCK_USERS: { email: string; password: string; user: User }[] = [
  {
    email: 'parent@demo.com',
    password: 'password123',
    user: {
      id: 'user_001',
      email: 'parent@demo.com',
      firstName: 'Sarah',
      lastName: 'Johnson',
      role: UserRole.PARENT,
      phone: '555-0101',
      isActive: true,
      isEmailVerified: true,
      mfaEnabled: false,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-20')
    }
  },
  {
    email: 'hr@demo.com',
    password: 'password123',
    user: {
      id: 'user_002',
      email: 'hr@demo.com',
      firstName: 'Emily',
      lastName: 'Chen',
      role: UserRole.HR_ADMIN,
      phone: '555-0102',
      isActive: true,
      isEmailVerified: true,
      mfaEnabled: false,
      createdAt: new Date('2024-01-10'),
      updatedAt: new Date('2024-01-18')
    }
  },
  {
    email: 'venue@demo.com',
    password: 'password123',
    user: {
      id: 'user_003',
      email: 'venue@demo.com',
      firstName: 'Michael',
      lastName: 'Torres',
      role: UserRole.VENUE_ADMIN,
      phone: '555-0103',
      isActive: true,
      isEmailVerified: true,
      mfaEnabled: false,
      createdAt: new Date('2024-01-05'),
      updatedAt: new Date('2024-01-15')
    }
  },
  {
    email: 'admin@demo.com',
    password: 'password123',
    user: {
      id: 'user_004',
      email: 'admin@demo.com',
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.PLATFORM_ADMIN,
      phone: '555-0104',
      isActive: true,
      isEmailVerified: true,
      mfaEnabled: true,
      createdAt: new Date('2023-12-01'),
      updatedAt: new Date('2024-01-10')
    }
  }
];

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // -------------------------------------------------
  // PRIVATE STATE SIGNALS
  // -------------------------------------------------
  private _user = signal<User | null>(null);
  private _accessToken = signal<string | null>(null);
  private _isLoading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  // -------------------------------------------------
  // PUBLIC READONLY SIGNALS
  // -------------------------------------------------
  readonly user = this._user.asReadonly();
  readonly accessToken = this._accessToken.asReadonly();
  readonly isLoading = this._isLoading.asReadonly();
  readonly error = this._error.asReadonly();
  
  // -------------------------------------------------
  // COMPUTED SIGNALS
  // -------------------------------------------------
  readonly isAuthenticated = computed(() => !!this._user() && !!this._accessToken());
  readonly userRole = computed(() => this._user()?.role ?? null);
  
  readonly userFullName = computed(() => {
    const user = this._user();
    return user ? `${user.firstName} ${user.lastName}` : '';
  });

  // Alias for userFullName (used by layouts)
  readonly userName = computed(() => this.userFullName());

  // -------------------------------------------------
  // CONSTRUCTOR
  // -------------------------------------------------
  constructor(private router: Router) {
    this.loadStoredSession();
  }

  // -------------------------------------------------
  // PUBLIC METHODS
  // -------------------------------------------------

  /**
   * Get current user (alias for user signal)
   */
  currentUser(): User | null {
    return this._user();
  }

  /**
   * Get access token as string
   */
  getAccessToken(): string | null {
    return this._accessToken();
  }

  /**
   * Login with credentials
   */
  login(request: LoginRequest): Observable<LoginResponse> {
    this._isLoading.set(true);
    this._error.set(null);

    // Find matching user
    const matchedUser = MOCK_USERS.find(
      u => u.email.toLowerCase() === request.email.toLowerCase() && u.password === request.password
    );

    // Simulate API delay
    return new Observable<LoginResponse>(subscriber => {
      setTimeout(() => {
        this._isLoading.set(false);
        
        if (!matchedUser) {
          this._error.set('Invalid email or password');
          subscriber.error(new Error('Invalid credentials'));
          return;
        }

        // Validate login type matches user role
        const roleTypeMap: Record<string, UserRole[]> = {
          'parent': [UserRole.PARENT],
          'corporate': [UserRole.HR_ADMIN],
          'venue': [UserRole.VENUE_ADMIN, UserRole.PLATFORM_ADMIN]
        };

        if (!roleTypeMap[request.loginType]?.includes(matchedUser.user.role)) {
          this._error.set('Please use the correct login tab for your account type');
          subscriber.error(new Error('Wrong login type'));
          return;
        }

        // Set authenticated state
        const token = 'mock_jwt_token_' + Date.now();
        this._user.set(matchedUser.user);
        this._accessToken.set(token);

        // Store in localStorage/sessionStorage
        const storage = request.rememberMe ? localStorage : sessionStorage;
        storage.setItem('nfp_user', JSON.stringify(matchedUser.user));
        storage.setItem('nfp_token', token);

        // Create response
        const response: LoginResponse = {
          user: matchedUser.user,
          accessToken: token,
          refreshToken: 'mock_refresh_token_' + Date.now(),
          expiresIn: 3600
        };

        subscriber.next(response);
        subscriber.complete();

        // Navigate to appropriate dashboard
        this.router.navigate([this.getDashboardRoute()]);
      }, 800);
    });
  }

  /**
   * Forgot password - send reset email
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<{ success: boolean; message: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    return new Observable(subscriber => {
      setTimeout(() => {
        this._isLoading.set(false);
        
        // Check if email exists in mock users
        const userExists = MOCK_USERS.some(
          u => u.email.toLowerCase() === request.email.toLowerCase()
        );

        if (userExists) {
          subscriber.next({ 
            success: true, 
            message: 'Password reset link sent to your email' 
          });
        } else {
          // For security, always show success message
          subscriber.next({ 
            success: true, 
            message: 'If an account exists with this email, you will receive a reset link' 
          });
        }
        subscriber.complete();
      }, 1000);
    });
  }

  /**
   * Reset password with token
   */
  resetPassword(request: ResetPasswordRequest): Observable<{ success: boolean; message: string }> {
    this._isLoading.set(true);
    this._error.set(null);

    return new Observable(subscriber => {
      setTimeout(() => {
        this._isLoading.set(false);

        // Validate passwords match
        if (request.newPassword !== request.confirmPassword) {
          this._error.set('Passwords do not match');
          subscriber.error(new Error('Passwords do not match'));
          return;
        }

        // Validate password strength
        if (request.newPassword.length < 8) {
          this._error.set('Password must be at least 8 characters');
          subscriber.error(new Error('Password too short'));
          return;
        }

        // Mock success
        subscriber.next({ 
          success: true, 
          message: 'Password reset successfully. Please login with your new password.' 
        });
        subscriber.complete();
      }, 1000);
    });
  }

  /**
   * Logout user
   */
  logout(): void {
    this._user.set(null);
    this._accessToken.set(null);
    this._error.set(null);
    
    localStorage.removeItem('nfp_user');
    localStorage.removeItem('nfp_token');
    sessionStorage.removeItem('nfp_user');
    sessionStorage.removeItem('nfp_token');
    
    this.router.navigate(['/login']);
  }

  /**
   * Clear error
   */
  clearError(): void {
    this._error.set(null);
  }

  /**
   * Check if user has required role (single role check)
   */
  hasRole(roles: string[]): boolean {
    const userRole = this._user()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Check if user has any of the required roles
   */
  hasAnyRole(roles: string[]): boolean {
    const userRole = this._user()?.role;
    return userRole ? roles.includes(userRole) : false;
  }

  /**
   * Get dashboard route based on user role
   */
  getDashboardRoute(): string {
    const role = this._user()?.role;
    switch (role) {
      case UserRole.PARENT:
        return '/parent/dashboard';
      case UserRole.HR_ADMIN:
        return '/hr/dashboard';
      case UserRole.VENUE_ADMIN:
        return '/venue/dashboard';
      case UserRole.PLATFORM_ADMIN:
        return '/admin/dashboard';
      default:
        return '/login';
    }
  }

  // -------------------------------------------------
  // PRIVATE METHODS
  // -------------------------------------------------

  /**
   * Load session from storage
   */
  private loadStoredSession(): void {
    const storedUser = localStorage.getItem('nfp_user') || sessionStorage.getItem('nfp_user');
    const storedToken = localStorage.getItem('nfp_token') || sessionStorage.getItem('nfp_token');

    if (storedUser && storedToken) {
      try {
        this._user.set(JSON.parse(storedUser));
        this._accessToken.set(storedToken);
      } catch {
        this.logout();
      }
    }
  }
}