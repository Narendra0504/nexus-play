// =====================================================
// NEXUS FAMILY PASS - SHARED HEADER COMPONENT
// Reusable header component for all portal layouts
// Shows logo, navigation, notifications, and user menu
// =====================================================

// Import Angular core
import { Component, Input, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Router
import { Router, RouterLink } from '@angular/router';

// Import Angular Material modules
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatBadgeModule } from '@angular/material/badge';

// Import AuthService
import { AuthService } from '../../../core/services/auth.service';

/**
 * HeaderComponent - Shared Header
 * 
 * Reusable header component providing:
 * - Logo and app name
 * - Mobile menu toggle
 * - Notification bell with badge
 * - User avatar and dropdown menu
 */
@Component({
  // Component selector
  selector: 'app-header',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatBadgeModule
  ],
  
  // Inline template
  template: `
    <!-- Header toolbar -->
    <mat-toolbar class="header-toolbar">
      
      <!-- Mobile menu toggle -->
      <button mat-icon-button class="menu-toggle lg:hidden" (click)="toggleSidebar()">
        <mat-icon>menu</mat-icon>
      </button>
      
      <!-- Logo and app name -->
      <a [routerLink]="homeRoute" class="logo-link flex items-center gap-2">
        <mat-icon class="text-primary-600">family_restroom</mat-icon>
        <span class="app-name font-display font-bold text-lg hidden sm:inline">
          Nexus Family Pass
        </span>
      </a>
      
      <!-- Spacer -->
      <span class="flex-1"></span>
      
      <!-- Portal indicator -->
      <span class="portal-badge hidden md:inline text-sm text-neutral-500 mr-4">
        {{ portalName }}
      </span>
      
      <!-- Notifications button -->
      <button mat-icon-button [matBadge]="notificationCount()" 
              matBadgeColor="accent" matBadgeSize="small"
              [matBadgeHidden]="notificationCount() === 0"
              [routerLink]="notificationRoute">
        <mat-icon>notifications</mat-icon>
      </button>
      
      <!-- User menu -->
      <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
        <div class="user-avatar">
          {{ userInitials() }}
        </div>
      </button>
      
      <!-- User dropdown menu -->
      <mat-menu #userMenu="matMenu" xPosition="before">
        <!-- User info header -->
        <div class="user-info px-4 py-3 border-b border-neutral-100">
          <div class="font-medium text-neutral-800">{{ userName() }}</div>
          <div class="text-sm text-neutral-500">{{ userEmail() }}</div>
        </div>
        
        <!-- Menu items -->
        <button mat-menu-item [routerLink]="settingsRoute">
          <mat-icon>settings</mat-icon>
          <span>Settings</span>
        </button>
        <button mat-menu-item (click)="logout()">
          <mat-icon>logout</mat-icon>
          <span>Sign Out</span>
        </button>
      </mat-menu>
    </mat-toolbar>
  `,
  
  // Inline styles
  styles: [`
    /* Header toolbar styling */
    .header-toolbar {
      background: white;
      border-bottom: 1px solid #e2e8f0;
      padding: 0 1rem;
      height: 64px;
    }
    
    /* Logo link */
    .logo-link {
      text-decoration: none;
      color: inherit;
    }
    
    .logo-link:hover {
      opacity: 0.9;
    }
    
    /* User avatar */
    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: linear-gradient(135deg, #2c5282, #319795);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
    }
    
    /* Text colors */
    .text-primary-600 { color: #2c5282; }
    .text-neutral-500 { color: #718096; }
    .text-neutral-800 { color: #2d3748; }
    .border-neutral-100 { border-color: #f7fafc; }
  `]
})
export class HeaderComponent {
  // -------------------------------------------------
  // INPUT PROPERTIES
  // Configure header based on portal type
  // -------------------------------------------------
  
  // Portal name displayed in header
  @Input() portalName = 'Parent Portal';
  
  // Home route for logo link
  @Input() homeRoute = '/parent/dashboard';
  
  // Settings route
  @Input() settingsRoute = '/parent/settings';
  
  // Notifications route
  @Input() notificationRoute = '/parent/notifications';

  // -------------------------------------------------
  // STATE SIGNALS
  // -------------------------------------------------
  
  // Notification count
  notificationCount = signal<number>(3);

  /**
   * Constructor
   */
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  // -------------------------------------------------
  // COMPUTED VALUES
  // -------------------------------------------------

  /**
   * userName - Get current user's full name
   */
  userName(): string {
    const user = this.authService.currentUser();
    if (!user) return 'Guest';
    return `${user.firstName} ${user.lastName}`;
  }

  /**
   * userEmail - Get current user's email
   */
  userEmail(): string {
    const user = this.authService.currentUser();
    return user?.email ?? '';
  }

  /**
   * userInitials - Get initials for avatar
   */
  userInitials(): string {
    const user = this.authService.currentUser();
    if (!user) return 'G';
    return `${user.firstName?.charAt(0) ?? ''}${user.lastName?.charAt(0) ?? ''}`;
  }

  // -------------------------------------------------
  // METHODS
  // -------------------------------------------------

  /**
   * toggleSidebar - Toggle mobile sidebar
   */
  toggleSidebar(): void {
    // TODO: Emit event to parent layout
    console.log('[Header] Toggle sidebar');
  }

  /**
   * logout - Sign out current user
   */
  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
