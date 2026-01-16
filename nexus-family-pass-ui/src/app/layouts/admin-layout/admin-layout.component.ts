// =====================================================
// NEXUS FAMILY PASS - ADMIN LAYOUT COMPONENT
// Layout shell for Platform Admin Portal with full
// system management capabilities
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
import { MatBadgeModule } from '@angular/material/badge';

// Import AuthService
import { AuthService } from '../../core/services/auth.service';

/**
 * AdminLayoutComponent - Platform Admin Portal Layout
 * 
 * Provides layout for platform administrators:
 * - System dashboard
 * - Venue management and approval
 * - Corporate account management
 * - System configuration
 */
@Component({
  // Component selector
  selector: 'app-admin-layout',
  
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
    MatBadgeModule
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
            <mat-icon class="logo-icon">admin_panel_settings</mat-icon>
            <span class="logo-text">Admin Portal</span>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- System status -->
        <div class="system-status">
          <div class="status-item">
            <div class="status-indicator healthy"></div>
            <span>System Status: Healthy</span>
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

        <!-- Quick stats -->
        <div class="sidebar-stats">
          <mat-divider></mat-divider>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-value">{{ totalBookings() }}</span>
              <span class="stat-label">Total Bookings</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ activeVenues() }}</span>
              <span class="stat-label">Active Venues</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ corporateAccounts() }}</span>
              <span class="stat-label">Corporates</span>
            </div>
            <div class="stat-item">
              <span class="stat-value">{{ activeUsers() }}</span>
              <span class="stat-label">Active Users</span>
            </div>
          </div>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="main-content">
        
        <!-- Top toolbar -->
        <mat-toolbar class="top-toolbar admin-toolbar">
          <button mat-icon-button (click)="sidenav.toggle()" *ngIf="isMobile()">
            <mat-icon>menu</mat-icon>
          </button>
          
          <span class="toolbar-title">Platform Administration</span>
          <span class="toolbar-spacer"></span>

          <!-- Alerts indicator -->
          <button 
            mat-icon-button 
            [matBadge]="alertCount()" 
            [matBadgeHidden]="alertCount() === 0"
            matBadgeColor="warn"
            matBadgeSize="small">
            <mat-icon>warning</mat-icon>
          </button>

          <!-- User menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">{{ userInitials() }}</div>
          </button>

          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              <span class="user-name">{{ userName() }}</span>
              <span class="user-role">Platform Administrator</span>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/admin/settings">
              <mat-icon>settings</mat-icon>
              <span>System Settings</span>
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
          <p>&copy; 2024 Nexus Family Pass - Admin Portal | v1.0.0</p>
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
      background-color: #171923;
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

    .logo-icon { color: #9f7aea; font-size: 28px; width: 28px; height: 28px; }
    .logo-text { color: white; font-size: 1.125rem; font-weight: 600; }

    /* System status */
    .system-status {
      padding: 1rem;
    }

    .status-item {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      color: #a0aec0;
      font-size: 0.875rem;
    }

    .status-indicator {
      width: 8px;
      height: 8px;
      border-radius: 50%;
    }

    .status-indicator.healthy { background-color: #48bb78; }
    .status-indicator.warning { background-color: #ed8936; }
    .status-indicator.error { background-color: #e53e3e; }

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
      background-color: #9f7aea !important; 
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

    /* Sidebar stats */
    .sidebar-stats {
      margin-top: auto;
      padding: 1rem;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      background-color: rgba(255, 255, 255, 0.05);
      padding: 0.75rem;
      border-radius: 8px;
    }

    .stat-value { color: white; font-size: 1.25rem; font-weight: 600; }
    .stat-label { color: #718096; font-size: 0.625rem; text-transform: uppercase; }

    /* Main content */
    .main-content {
      display: flex;
      flex-direction: column;
      background-color: #f7fafc;
    }

    .admin-toolbar {
      background-color: #553c9a !important;
    }

    .top-toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-title { font-size: 1.125rem; font-weight: 500; }
    .toolbar-spacer { flex: 1; }

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
    }
  `]
})
export class AdminLayoutComponent {
  // Navigation items for admin portal
  navItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/admin/dashboard' },
    { icon: 'store', label: 'Venues', route: '/admin/venues', badge: 3 },
    { icon: 'business', label: 'Corporate Accounts', route: '/admin/corporates' },
    { icon: 'settings', label: 'System Settings', route: '/admin/settings' }
  ];

  // State signals
  isMobile = signal<boolean>(window.innerWidth < 768);
  alertCount = signal<number>(3);
  totalBookings = signal<number>(12847);
  activeVenues = signal<number>(145);
  corporateAccounts = signal<number>(28);
  activeUsers = signal<number>(3420);

  // Computed values
  userName = computed(() => this.authService.userName());
  userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (!user) return '';
    return (user.firstName?.charAt(0) + user.lastName?.charAt(0)).toUpperCase();
  });

  constructor(private authService: AuthService) {
    window.addEventListener('resize', () => this.isMobile.set(window.innerWidth < 768));
  }

  logout(): void {
    this.authService.logout();
  }
}
