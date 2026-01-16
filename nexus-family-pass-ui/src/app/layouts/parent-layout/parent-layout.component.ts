// =====================================================
// NEXUS FAMILY PASS - PARENT LAYOUT COMPONENT
// Main layout shell for the Parent Portal with sidebar
// navigation, top header, and content area
// =====================================================

// Import Angular core decorators
import { Component, signal, computed } from '@angular/core';

// Import CommonModule for directives
import { CommonModule } from '@angular/common';

// Import Router modules
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Import Angular Material modules
import { MatSidenavModule } from '@angular/material/sidenav';     // Sidenav container
import { MatToolbarModule } from '@angular/material/toolbar';     // Top toolbar
import { MatListModule } from '@angular/material/list';           // Navigation list
import { MatIconModule } from '@angular/material/icon';           // Icons
import { MatButtonModule } from '@angular/material/button';       // Buttons
import { MatMenuModule } from '@angular/material/menu';           // Dropdown menu
import { MatBadgeModule } from '@angular/material/badge';         // Notification badge
import { MatTooltipModule } from '@angular/material/tooltip';     // Tooltips
import { MatDividerModule } from '@angular/material/divider';     // Dividers

// Import AuthService for user info and logout
import { AuthService } from '../../core/services/auth.service';

/**
 * ParentLayoutComponent - Parent Portal Layout Shell
 * 
 * This component provides the layout structure for all parent portal pages:
 * - Responsive sidebar navigation (collapsible on mobile)
 * - Top toolbar with user info and notifications
 * - Main content area with router outlet
 * - Footer section
 * 
 * Uses Angular Material sidenav for responsive behavior
 */
@Component({
  // CSS selector
  selector: 'app-parent-layout',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,              // Common directives
    RouterOutlet,              // Router outlet for child routes
    RouterLink,                // Router links
    RouterLinkActive,          // Active link styling
    MatSidenavModule,          // Material sidenav
    MatToolbarModule,          // Material toolbar
    MatListModule,             // Material list
    MatIconModule,             // Material icons
    MatButtonModule,           // Material buttons
    MatMenuModule,             // Material menu
    MatBadgeModule,            // Material badge
    MatTooltipModule,          // Material tooltip
    MatDividerModule           // Material divider
  ],
  
  // Component template
  template: `
    <!-- Main layout container using Material sidenav -->
    <mat-sidenav-container class="layout-container">
      
      <!-- 
        Sidebar Navigation
        Mode changes based on screen size (over on mobile, side on desktop)
      -->
      <mat-sidenav 
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="sidebar"
        [class.collapsed]="sidebarCollapsed()">
        
        <!-- Sidebar header with logo -->
        <div class="sidebar-header">
          <!-- Logo and app name -->
          <div class="logo" *ngIf="!sidebarCollapsed()">
            <mat-icon class="logo-icon">family_restroom</mat-icon>
            <span class="logo-text">Nexus Family Pass</span>
          </div>
          
          <!-- Collapsed state - icon only -->
          <div class="logo-collapsed" *ngIf="sidebarCollapsed()">
            <mat-icon class="logo-icon">family_restroom</mat-icon>
          </div>
          
          <!-- Collapse toggle button (desktop only) -->
          <button 
            mat-icon-button 
            class="collapse-btn"
            (click)="toggleSidebar()"
            *ngIf="!isMobile()"
            [matTooltip]="sidebarCollapsed() ? 'Expand menu' : 'Collapse menu'">
            <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          </button>
        </div>

        <mat-divider></mat-divider>

        <!-- Navigation list -->
        <mat-nav-list class="nav-list">
          <!-- Navigation items using *ngFor -->
          <a 
            mat-list-item
            *ngFor="let item of navItems"
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.exact }"
            class="nav-item"
            (click)="onNavItemClick()">
            
            <!-- Navigation icon -->
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            
            <!-- Navigation label (hidden when collapsed) -->
            <span matListItemTitle *ngIf="!sidebarCollapsed()">{{ item.label }}</span>
            
            <!-- Badge for notifications -->
            <span 
              *ngIf="item.badge && item.badge() > 0 && !sidebarCollapsed()" 
              class="nav-badge">
              {{ item.badge() }}
            </span>
          </a>
        </mat-nav-list>

        <!-- Sidebar footer with credits info -->
        <div class="sidebar-footer" *ngIf="!sidebarCollapsed()">
          <mat-divider></mat-divider>
          <div class="credits-info">
            <mat-icon>toll</mat-icon>
            <div class="credits-text">
              <span class="credits-label">Credits Remaining</span>
              <span class="credits-value">{{ creditsRemaining() }}</span>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <!-- Main content area -->
      <mat-sidenav-content class="main-content">
        
        <!-- Top toolbar/header -->
        <mat-toolbar class="top-toolbar" color="primary">
          
          <!-- Mobile menu toggle -->
          <button 
            mat-icon-button 
            (click)="sidenav.toggle()"
            class="menu-toggle"
            *ngIf="isMobile()">
            <mat-icon>menu</mat-icon>
          </button>

          <!-- Page title or breadcrumb area -->
          <span class="toolbar-title">{{ pageTitle() }}</span>

          <!-- Spacer to push items to right -->
          <span class="toolbar-spacer"></span>

          <!-- Notification bell -->
          <button 
            mat-icon-button
            [matBadge]="unreadNotifications()"
            [matBadgeHidden]="unreadNotifications() === 0"
            matBadgeColor="warn"
            matBadgeSize="small"
            routerLink="/parent/notifications"
            matTooltip="Notifications">
            <mat-icon>notifications</mat-icon>
          </button>

          <!-- User menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu" class="user-menu-trigger">
            <!-- User avatar -->
            <div class="user-avatar">
              {{ userInitials() }}
            </div>
          </button>

          <!-- User dropdown menu -->
          <mat-menu #userMenu="matMenu" xPosition="before">
            <!-- User info header -->
            <div class="user-menu-header">
              <div class="user-avatar large">{{ userInitials() }}</div>
              <div class="user-info">
                <span class="user-name">{{ userName() }}</span>
                <span class="user-email">{{ userEmail() }}</span>
              </div>
            </div>
            
            <mat-divider></mat-divider>
            
            <!-- Menu items -->
            <button mat-menu-item routerLink="/parent/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
            </button>
            
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page content - router outlet renders child components here -->
        <main class="page-content" id="main-content">
          <router-outlet></router-outlet>
        </main>

        <!-- Footer -->
        <footer class="page-footer">
          <p>&copy; 2024 Nexus Family Pass. All rights reserved.</p>
        </footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  
  // Component styles
  styles: [`
    /* Layout container - full viewport */
    .layout-container {
      height: 100vh;                                  /* Full viewport height */
    }

    /* Sidebar styles */
    .sidebar {
      width: 260px;                                   /* Sidebar width */
      background-color: #1a202c;                      /* Dark background */
      transition: width 0.3s ease;                    /* Smooth width transition */
    }

    .sidebar.collapsed {
      width: 64px;                                    /* Collapsed width */
    }

    /* Sidebar header */
    .sidebar-header {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                            /* Center vertically */
      justify-content: space-between;                 /* Space between items */
      padding: 1rem;                                  /* Padding */
      min-height: 64px;                               /* Match toolbar height */
    }

    /* Logo styling */
    .logo {
      display: flex;                                  /* Flexbox for icon + text */
      align-items: center;                            /* Center vertically */
      gap: 0.5rem;                                    /* Space between icon and text */
    }

    .logo-icon {
      color: #319795;                                 /* Accent color */
      font-size: 28px;                                /* Icon size */
      width: 28px;
      height: 28px;
    }

    .logo-text {
      color: white;                                   /* White text */
      font-size: 1.125rem;                            /* Font size */
      font-weight: 600;                               /* Semi-bold */
    }

    .logo-collapsed {
      display: flex;
      justify-content: center;
      width: 100%;
    }

    .collapse-btn {
      color: #a0aec0;                                 /* Gray color */
    }

    /* Navigation list */
    .nav-list {
      padding: 0.5rem 0;                              /* Vertical padding */
    }

    .nav-item {
      color: #a0aec0 !important;                      /* Gray text */
      margin: 0.25rem 0.5rem;                         /* Item margin */
      border-radius: 8px;                             /* Rounded corners */
      transition: all 0.2s;                           /* Smooth transition */
    }

    .nav-item:hover {
      background-color: rgba(255, 255, 255, 0.1) !important; /* Hover background */
      color: white !important;                        /* White text on hover */
    }

    .nav-item.active {
      background-color: #2c5282 !important;           /* Active background */
      color: white !important;                        /* White text */
    }

    .nav-item mat-icon {
      color: inherit;                                 /* Inherit text color */
    }

    .nav-badge {
      background-color: #e53e3e;                      /* Red badge */
      color: white;                                   /* White text */
      font-size: 0.75rem;                             /* Small font */
      padding: 0.125rem 0.5rem;                       /* Padding */
      border-radius: 999px;                           /* Pill shape */
      margin-left: auto;                              /* Push to right */
    }

    /* Sidebar footer */
    .sidebar-footer {
      margin-top: auto;                               /* Push to bottom */
      padding: 1rem;                                  /* Padding */
    }

    .credits-info {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                            /* Center vertically */
      gap: 0.75rem;                                   /* Gap between items */
      padding: 0.75rem;                               /* Padding */
      background-color: rgba(49, 151, 149, 0.2);      /* Teal tint background */
      border-radius: 8px;                             /* Rounded corners */
      margin-top: 1rem;                               /* Top margin */
    }

    .credits-info mat-icon {
      color: #319795;                                 /* Accent color */
    }

    .credits-text {
      display: flex;                                  /* Flexbox layout */
      flex-direction: column;                         /* Stack vertically */
    }

    .credits-label {
      font-size: 0.75rem;                             /* Small font */
      color: #a0aec0;                                 /* Gray color */
    }

    .credits-value {
      font-size: 1.25rem;                             /* Larger font */
      font-weight: 600;                               /* Semi-bold */
      color: white;                                   /* White color */
    }

    /* Main content area */
    .main-content {
      display: flex;                                  /* Flexbox layout */
      flex-direction: column;                         /* Stack vertically */
      background-color: #f7fafc;                      /* Light background */
    }

    /* Top toolbar */
    .top-toolbar {
      position: sticky;                               /* Stick to top */
      top: 0;                                         /* At top edge */
      z-index: 100;                                   /* Above content */
    }

    .menu-toggle {
      margin-right: 0.5rem;                           /* Right margin */
    }

    .toolbar-title {
      font-size: 1.125rem;                            /* Title font size */
      font-weight: 500;                               /* Medium weight */
    }

    .toolbar-spacer {
      flex: 1;                                        /* Take remaining space */
    }

    /* User avatar */
    .user-avatar {
      width: 36px;                                    /* Avatar size */
      height: 36px;
      border-radius: 50%;                             /* Circle shape */
      background-color: #319795;                      /* Accent background */
      color: white;                                   /* White text */
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;                            /* Font size */
      font-weight: 600;                               /* Semi-bold */
    }

    .user-avatar.large {
      width: 48px;                                    /* Larger avatar */
      height: 48px;
      font-size: 1rem;                                /* Larger font */
    }

    /* User menu header */
    .user-menu-header {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                            /* Center vertically */
      gap: 0.75rem;                                   /* Gap between items */
      padding: 1rem;                                  /* Padding */
    }

    .user-info {
      display: flex;                                  /* Flexbox layout */
      flex-direction: column;                         /* Stack vertically */
    }

    .user-name {
      font-weight: 600;                               /* Semi-bold */
      color: #2d3748;                                 /* Dark text */
    }

    .user-email {
      font-size: 0.875rem;                            /* Smaller font */
      color: #718096;                                 /* Gray text */
    }

    /* Page content */
    .page-content {
      flex: 1;                                        /* Take remaining space */
      padding: 1.5rem;                                /* Content padding */
      overflow-y: auto;                               /* Scroll if needed */
    }

    /* Page footer */
    .page-footer {
      padding: 1rem;                                  /* Padding */
      text-align: center;                             /* Center text */
      color: #718096;                                 /* Gray text */
      font-size: 0.875rem;                            /* Smaller font */
      border-top: 1px solid #e2e8f0;                  /* Top border */
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .sidebar {
        width: 260px !important;                      /* Full width on mobile */
      }
      
      .page-content {
        padding: 1rem;                                /* Less padding on mobile */
      }
    }
  `]
})
export class ParentLayoutComponent {
  // -------------------------------------------------
  // NAVIGATION ITEMS
  // Configuration for sidebar menu items
  // -------------------------------------------------
  
  // Define navigation items with icons, routes, and labels
  navItems = [
    { 
      icon: 'dashboard',           // Material icon name
      label: 'Dashboard',          // Display label
      route: '/parent/dashboard',  // Router link
      exact: true                  // Exact route matching
    },
    { 
      icon: 'people', 
      label: 'My Children', 
      route: '/parent/children',
      exact: false
    },
    { 
      icon: 'search', 
      label: 'Browse Activities', 
      route: '/parent/activities',
      exact: false
    },
    { 
      icon: 'event', 
      label: 'My Bookings', 
      route: '/parent/bookings',
      exact: false
    },
    { 
      icon: 'schedule', 
      label: 'Waitlist', 
      route: '/parent/waitlist',
      exact: false,
      badge: signal(2)             // Signal for dynamic badge count
    },
    { 
      icon: 'notifications', 
      label: 'Notifications', 
      route: '/parent/notifications',
      exact: false,
      badge: signal(5)             // Unread notification count
    },
    { 
      icon: 'settings', 
      label: 'Settings', 
      route: '/parent/settings',
      exact: false
    }
  ];

  // -------------------------------------------------
  // STATE SIGNALS
  // Reactive state management
  // -------------------------------------------------
  
  // Whether sidebar is collapsed (desktop only)
  sidebarCollapsed = signal<boolean>(false);
  
  // Whether device is mobile (based on viewport width)
  isMobile = signal<boolean>(window.innerWidth < 768);
  
  // Current page title
  pageTitle = signal<string>('Dashboard');
  
  // Credits remaining count
  creditsRemaining = signal<number>(7);
  
  // Unread notifications count
  unreadNotifications = signal<number>(5);

  // -------------------------------------------------
  // COMPUTED VALUES FROM AUTH SERVICE
  // -------------------------------------------------
  
  // User's display name
  userName = computed(() => this.authService.userName());
  
  // User's email
  userEmail = computed(() => this.authService.currentUser()?.email ?? '');
  
  // User's initials for avatar
  userInitials = computed(() => {
    const user = this.authService.currentUser();         // Get current user
    if (!user) return '';                                 // Return empty if no user
    const first = user.firstName?.charAt(0) ?? '';       // First initial
    const last = user.lastName?.charAt(0) ?? '';         // Last initial
    return (first + last).toUpperCase();                 // Combine and uppercase
  });

  /**
   * Constructor - Inject dependencies
   * @param authService - Authentication service
   */
  constructor(private authService: AuthService) {
    // Listen for window resize to update mobile state
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth < 768);
    });
  }

  /**
   * toggleSidebar - Toggle sidebar collapsed state
   */
  toggleSidebar(): void {
    this.sidebarCollapsed.update(collapsed => !collapsed);
  }

  /**
   * onNavItemClick - Handle navigation item click
   * Closes sidebar on mobile after navigation
   */
  onNavItemClick(): void {
    // Close sidebar on mobile after clicking nav item
    // This provides better UX on small screens
  }

  /**
   * logout - Log out the current user
   */
  logout(): void {
    this.authService.logout();
  }
}
