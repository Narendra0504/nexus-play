// =====================================================
// NEXUS FAMILY PASS - HR LAYOUT COMPONENT
// Layout shell for HR Admin Portal with sidebar
// navigation for employee management and reports
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

// Import AuthService
import { AuthService } from '../../core/services/auth.service';

/**
 * HrLayoutComponent - HR Admin Portal Layout
 * 
 * Provides layout structure for HR administrators:
 * - Dashboard overview
 * - Employee management
 * - Usage reports
 * - Subscription management
 */
@Component({
  // Component selector
  selector: 'app-hr-layout',
  
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
    MatTooltipModule
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
            <mat-icon class="logo-icon">business</mat-icon>
            <span class="logo-text">HR Portal</span>
          </div>
        </div>

        <mat-divider></mat-divider>

        <!-- Company info card -->
        <div class="company-info">
          <span class="company-name">TechCorp Inc.</span>
          <span class="plan-badge">Premium Plan</span>
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
          </a>
        </mat-nav-list>

        <!-- Quick stats -->
        <div class="sidebar-stats">
          <mat-divider></mat-divider>
          <div class="stat-item">
            <span class="stat-value">156</span>
            <span class="stat-label">Active Employees</span>
          </div>
          <div class="stat-item">
            <span class="stat-value">78%</span>
            <span class="stat-label">Utilization Rate</span>
          </div>
        </div>
      </mat-sidenav>

      <!-- Main content -->
      <mat-sidenav-content class="main-content">
        
        <!-- Top toolbar -->
        <mat-toolbar class="top-toolbar" color="primary">
          <button mat-icon-button (click)="sidenav.toggle()" *ngIf="isMobile()">
            <mat-icon>menu</mat-icon>
          </button>
          
          <span class="toolbar-title">HR Dashboard</span>
          <span class="toolbar-spacer"></span>

          <!-- User menu -->
          <button mat-icon-button [matMenuTriggerFor]="userMenu">
            <div class="user-avatar">{{ userInitials() }}</div>
          </button>

          <mat-menu #userMenu="matMenu">
            <div class="user-menu-header">
              <span class="user-name">{{ userName() }}</span>
              <span class="user-role">HR Administrator</span>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item routerLink="/hr/settings">
              <mat-icon>settings</mat-icon>
              <span>Settings</span>
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
          <p>&copy; 2024 Nexus Family Pass - HR Portal</p>
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
      background-color: #1a365d;
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

    .logo-icon { color: #4fd1c5; font-size: 28px; width: 28px; height: 28px; }
    .logo-text { color: white; font-size: 1.125rem; font-weight: 600; }

    /* Company info */
    .company-info {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .company-name { color: white; font-weight: 600; }
    
    .plan-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      background-color: rgba(79, 209, 197, 0.2);
      color: #4fd1c5;
      border-radius: 999px;
      font-size: 0.75rem;
      width: fit-content;
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
      background-color: #2c5282 !important; 
      color: white !important; 
    }

    /* Sidebar stats */
    .sidebar-stats {
      margin-top: auto;
      padding: 1rem;
    }

    .stat-item {
      display: flex;
      flex-direction: column;
      padding: 0.75rem 0;
    }

    .stat-value { color: white; font-size: 1.5rem; font-weight: 600; }
    .stat-label { color: #a0aec0; font-size: 0.75rem; }

    /* Main content */
    .main-content {
      display: flex;
      flex-direction: column;
      background-color: #f7fafc;
    }

    .top-toolbar { position: sticky; top: 0; z-index: 100; }
    .toolbar-title { font-size: 1.125rem; font-weight: 500; }
    .toolbar-spacer { flex: 1; }

    .user-avatar {
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background-color: #4fd1c5;
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
export class HrLayoutComponent {
  // Navigation items for HR portal
  navItems = [
    { icon: 'dashboard', label: 'Dashboard', route: '/hr/dashboard' },
    { icon: 'people', label: 'Employees', route: '/hr/employees' },
    { icon: 'bar_chart', label: 'Usage Reports', route: '/hr/reports' },
    { icon: 'credit_card', label: 'Subscription', route: '/hr/subscription' },
    { icon: 'settings', label: 'Settings', route: '/hr/settings' }
  ];

  // State signals
  isMobile = signal<boolean>(window.innerWidth < 768);

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

  logout(): void {
    this.authService.logout();
  }
}
