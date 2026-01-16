// =====================================================
// NEXUS FAMILY PASS - VENUE LAYOUT COMPONENT
// Layout shell for Venue Admin Portal with navigation
// for activity management, bookings, and performance
// =====================================================

// Import Angular core
import { Component, signal, computed } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Router modules
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

// Import Angular Material modules
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';

// Import AuthService
import { AuthService } from '../../core/services/auth.service';

/**
 * VenueLayoutComponent - Venue Admin Portal Layout
 * 
 * Provides layout structure for venue administrators:
 * - Dashboard with performance score
 * - Activity management
 * - Booking calendar and attendance
 * - Performance analytics
 */
@Component({
  // Component selector
  selector: 'app-venue-layout',
  
  // Standalone component
  standalone: true,
  
  // Required imports
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatSidenavModule,
    MatToolbarModule,
    MatListModule,
    MatIconModule,
    MatButtonModule,
    MatMenuModule,
    MatDividerModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  
  // Component template
  template: `
    <!-- Layout container -->
    <mat-sidenav-container class="layout-container">
      
      <!-- Sidebar navigation -->
      <mat-sidenav 
        #sidenav
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="sidebar">
        
        <!-- Sidebar header -->
        <div class="sidebar-header">
          <div class="logo">
            <mat-icon class="logo-icon">store</mat-icon>
            <span class="logo-text">Venue Portal</span>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Venue info card -->
        <div class="venue-info">
          <span class="venue-name">Code Ninjas West</span>
          <div class="score-container">
            <span class="score-label">Performance Score</span>
            <div class="score-display">
              <span class="score-value">{{ venueScore() }}</span>
              <span class="score-max">/100</span>
            </div>
            <mat-progress-bar 
              mode="determinate" 
              [value]="venueScore()"
              [color]="getScoreColor()">
            </mat-progress-bar>
          </div>
        </div>

        <!-- Navigation list -->
        <mat-nav-list class="nav-list">
          <a 
            mat-list-item
            *ngFor="let item of navItems"
            [routerLink]="item.route"
            routerLinkActive="active"
            class="nav-item">
            <mat-icon matListItemIcon>{{ item.icon }}</mat-icon>
            <span matListItemTitle>{{ item.label }}</span>
            <span *ngIf="item.badge" class="nav-badge">{{ item.badge }}</span>
          </a>
        </mat-nav-list>

        <!-- Quick actions -->
        <div class="sidebar-actions">
          <mat-divider></mat-divider>
          <button mat-stroked-button color="accent" class="action-btn" routerLink="/venue/activities/new">
            <mat-icon>add</mat-icon>
            Add New Activity
          </button>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="main-content">
        
        <!-- Top toolbar -->
        <mat-toolbar class="top-toolbar venue-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" *ngIf="isMobile()">
            <mat-icon>menu</mat-icon>
          </button>
          
          <span class="toolbar-title">Venue Dashboard</span>
          <span class="toolbar-spacer"></span>

          <!-- Today's bookings indicator -->
          <div class="today-bookings" matTooltip="Today's bookings">
            <mat-icon>event</mat-icon>
            <span>{{ todayBookings() }} bookings today</span>
          </div>

          <!-- User menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">{{ userInitials() }}</div>
          </button>

          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              <span class="user-name">{{ userName() }}</span>
              <span class="user-role">Venue Administrator</span>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/venue/settings">
              <mat-icon>settings</mat-icon>
              <span>Venue Settings</span>
            </button>
            <button mat-menu-item (click)="logout()">
              <mat-icon>logout</mat-icon>
              <span>Logout</span>
            </button>
          </mat-menu>
        </mat-toolbar>

        <!-- Page content -->
        <main class="page-content">
          <router-outlet></router-outlet>
        </main>

        <!-- Footer -->
        <footer class="page-footer">
          <p>&copy; 2024 Nexus Family Pass - Venue Portal</p>
        </footer>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  
  // Component styles
  styles: [`
    /* Layout container */
    .layout-container { height: 100vh; }

    /* Sidebar */
    .sidebar {
      width: 260px;
      background-color: #1a202c;
    }

    .sidebar-header {
      padding: 1rem;
      min-height: 64px;
      display: flex;
      align-items: center;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon { color: #ed8936; font-size: 28px; width: 28px; height: 28px; }
    .logo-text { color: white; font-size: 1.125rem; font-weight: 600; }

    /* Venue info */
    .venue-info {
      padding: 1rem;
    }

    .venue-name { 
      color: white; 
      font-weight: 600; 
      font-size: 1.125rem;
      display: block;
      margin-bottom: 1rem;
    }

    .score-container {
      background-color: rgba(255, 255, 255, 0.05);
      border-radius: 8px;
      padding: 0.75rem;
    }

    .score-label {
      color: #a0aec0;
      font-size: 0.75rem;
      display: block;
      margin-bottom: 0.5rem;
    }

    .score-display {
      display: flex;
      align-items: baseline;
      margin-bottom: 0.5rem;
    }

    .score-value {
      color: #48bb78;
      font-size: 2rem;
      font-weight: 700;
    }

    .score-max {
      color: #718096;
      font-size: 1rem;
      margin-left: 0.25rem;
    }

    /* Navigation */
    .nav-list { padding: 0.5rem 0; }

    .nav-item {
      color: #a0aec0 !important;
      margin: 0.25rem 0.5rem;
      border-radius: 8px;
    }

    .nav-item:hover { 
      background-color: rgba(255, 255, 255, 0.1) !important; 
      color: white !important; 
    }

    .nav-item.active { 
      background-color: #ed8936 !important; 
      color: white !important; 
    }

    .nav-badge {
      background-color: #e53e3e;
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 999px;
      margin-left: auto;
    }

    /* Sidebar actions */
    .sidebar-actions {
      margin-top: auto;
      padding: 1rem;
    }

    .action-btn {
      width: 100%;
      margin-top: 1rem;
    }

    /* Main content */
    .main-content {
      display: flex;
      flex-direction: column;
      background-color: #f7fafc;
    }

    .venue-toolbar {
      background-color: #ed8936 !important;
    }

    .top-toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-title { font-size: 1.125rem; font-weight: 500; }
    .toolbar-spacer { flex: 1; }

    .today-bookings {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      background-color: rgba(255, 255, 255, 0.2);
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-size: 0.875rem;
      margin-right: 1rem;
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: rgba(255, 255, 255, 0.3);
      color: white;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
      font-weight: 600;
    }

    .user-menu-header {
      padding: 1rem;
      display: flex;
      flex-direction: column;
    }

    .user-name { font-weight: 600; color: #2d3748; }
    .user-role { font-size: 0.875rem; color: #718096; }

    .page-content { flex: 1; padding: 1.5rem; overflow-y: auto; }

    .page-footer {
      padding: 1rem;
      text-align: center;
      color: #718096;
      font-size: 0.875rem;
      border-top: 1px solid #e2e8f0;
    }

    @media (max-width: 768px) {
      .sidebar { width: 260px !important; }
      .page-content { padding: 1rem; }
      .today-bookings { display: none; }
    }
  `]
})
export class VenueLayoutComponent {
  // Navigation items for venue portal
  navItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/venue/dashboard' },
    { icon: 'local_activity', label: 'Activities', route: '/venue/activities' },
    { icon: 'calendar_today', label: 'Bookings', route: '/venue/bookings', badge: 3 },
    { icon: 'trending_up', label: 'Performance', route: '/venue/performance' },
    { icon: 'settings', label: 'Settings', route: '/venue/settings' }
  ];

  // State signals
  isMobile = signal<boolean>(window.innerWidth < 768);
  venueScore = signal<number>(87);
  todayBookings = signal<number>(12);

  // Computed values from auth service
  userName = computed(() => this.authService.userName());
  userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return (user.firstName?.charAt(0) + user.lastName?.charAt(0)).toUpperCase();
  });

  constructor(private authService: AuthService) {
    window.addEventListener('resize', () => this.isMobile.set(window.innerWidth < 768));
  }

  // Get color based on score
  getScoreColor(): 'primary' | 'accent' | 'warn' {
    const score = this.venueScore();
    if (score >= 80) return 'primary';     // Green/good
    if (score >= 60) return 'accent';      // Yellow/warning
    return 'warn';                          // Red/danger
  }

  logout(): void {
    this.authService.logout();
  }
}
