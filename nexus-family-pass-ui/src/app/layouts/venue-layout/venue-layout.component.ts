// =====================================================
// NEXUS FAMILY PASS - VENUE LAYOUT COMPONENT
// Layout for venue admin portal
// =====================================================

import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet, Router } from '@angular/router';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  icon: string;
  label: string;
  route: string;
  badge?: number;
}

@Component({
  selector: 'app-venue-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatMenuModule,
    MatTooltipModule,
    MatDividerModule
  ],
  template: `
    <div class="layout-container">
      <!-- Sidebar -->
      <aside class="sidebar" [class.collapsed]="sidebarCollapsed()">
        <div class="sidebar-header">
          <div class="logo" *ngIf="!sidebarCollapsed()">
            <div class="logo-icon">
              <mat-icon>storefront</mat-icon>
            </div>
            <div class="logo-text">
              <span class="logo-title">Nexus</span>
              <span class="logo-subtitle">Venue Portal</span>
            </div>
          </div>
          <div class="logo-mini" *ngIf="sidebarCollapsed()">
            <mat-icon>storefront</mat-icon>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             [matTooltip]="sidebarCollapsed() ? item.label : ''"
             matTooltipPosition="right">
            <div class="nav-icon">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span class="nav-badge" *ngIf="item.badge">{{ item.badge }}</span>
            </div>
            <span class="nav-label" *ngIf="!sidebarCollapsed()">{{ item.label }}</span>
          </a>
        </nav>

        <div class="sidebar-stats" *ngIf="!sidebarCollapsed()">
          <div class="stat-card">
            <div class="stat-row">
              <span class="stat-label">Today's Bookings</span>
              <span class="stat-value">{{ todayBookings() }}</span>
            </div>
            <div class="stat-row">
              <span class="stat-label">This Month Revenue</span>
              <span class="stat-value">{{ '$' + monthRevenue() }}</span>
            </div>
          </div>
        </div>

        <button class="collapse-toggle" (click)="toggleSidebar()">
          <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper" [class.sidebar-collapsed]="sidebarCollapsed()">
        <header class="header">
          <div class="header-left">
            <button mat-icon-button class="menu-toggle hide-desktop" (click)="toggleMobileSidebar()">
              <mat-icon>menu</mat-icon>
            </button>
            <div class="page-info hide-mobile">
              <h1 class="page-title">Venue Dashboard</h1>
              <p class="page-subtitle">Manage your activities and bookings</p>
            </div>
          </div>

          <div class="header-right">
            <button mat-icon-button class="notification-btn">
              <mat-icon>notifications</mat-icon>
              <span class="notification-badge" *ngIf="notificationCount() > 0">{{ notificationCount() }}</span>
            </button>

            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
              <div class="user-avatar">{{ userInitials() }}</div>
              <span class="user-name hide-mobile">{{ userName() }}</span>
              <mat-icon class="hide-mobile">expand_more</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" class="user-dropdown">
              <div class="menu-header">
                <div class="menu-avatar">{{ userInitials() }}</div>
                <div class="menu-user-info">
                  <span class="menu-user-name">{{ userName() }}</span>
                  <span class="menu-user-role">Venue Administrator</span>
                </div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/venue/settings">
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()" class="logout-item">
                <mat-icon>logout</mat-icon>
                <span>Sign Out</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Sidebar Overlay -->
      <div class="sidebar-overlay" [class.visible]="mobileSidebarOpen()" (click)="toggleMobileSidebar()"></div>

      <!-- Mobile Sidebar -->
      <aside class="mobile-sidebar" [class.open]="mobileSidebarOpen()">
        <div class="sidebar-header">
          <div class="logo">
            <div class="logo-icon"><mat-icon>storefront</mat-icon></div>
            <div class="logo-text">
              <span class="logo-title">Nexus</span>
              <span class="logo-subtitle">Venue Portal</span>
            </div>
          </div>
          <button mat-icon-button (click)="toggleMobileSidebar()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             (click)="toggleMobileSidebar()">
            <div class="nav-icon"><mat-icon>{{ item.icon }}</mat-icon></div>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </nav>
      </aside>
    </div>
  `,
  styles: [`
    .layout-container { display: flex; min-height: 100vh; background: var(--color-background); }

    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #c2410c 0%, #ea580c 50%, #f97316 100%);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0; left: 0; bottom: 0;
      z-index: 100;
      transition: width 0.3s ease;
      box-shadow: 4px 0 20px rgba(0, 0, 0, 0.15);

      &.collapsed { width: 80px; }
      @media (max-width: 768px) { display: none; }
    }

    .sidebar-header { padding: 24px; border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    .logo { display: flex; align-items: center; gap: 12px; }

    .logo-icon {
      width: 48px; height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    }

    .logo-text { display: flex; flex-direction: column; }
    .logo-title { font-family: var(--font-family-display); font-size: 20px; font-weight: 800; color: white; }
    .logo-subtitle { font-size: 12px; color: rgba(255, 255, 255, 0.7); font-weight: 600; }

    .logo-mini {
      width: 48px; height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      margin: 0 auto;
      mat-icon { font-size: 28px; width: 28px; height: 28px; color: white; }
    }

    .sidebar-nav { flex: 1; padding: 16px 12px; overflow-y: auto; }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 14px 16px;
      margin-bottom: 6px;
      border-radius: 14px;
      color: rgba(255, 255, 255, 0.8);
      text-decoration: none;
      transition: all 0.2s ease;

      &:hover { background: rgba(255, 255, 255, 0.15); color: white; }
      &.active { background: rgba(255, 255, 255, 0.25); color: white; }
    }

    .nav-icon {
      position: relative;
      display: flex; align-items: center; justify-content: center;
      width: 24px; height: 24px;
      mat-icon { font-size: 24px; width: 24px; height: 24px; color: rgba(255, 255, 255, 0.8); }
    }

    .nav-badge {
      position: absolute;
      top: -6px; right: -6px;
      min-width: 18px; height: 18px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-radius: 50%;
      color: white;
      font-size: 10px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
    }

    .nav-label { font-size: 15px; font-weight: 600; white-space: nowrap; }
    .sidebar.collapsed .nav-item { justify-content: center; padding: 14px; }

    .sidebar-stats { padding: 16px; margin-top: auto; }
    .stat-card { background: rgba(255, 255, 255, 0.15); border-radius: 16px; padding: 16px; }
    .stat-row {
      display: flex; justify-content: space-between; align-items: center; padding: 8px 0;
      &:not(:last-child) { border-bottom: 1px solid rgba(255, 255, 255, 0.1); }
    }
    .stat-label { font-size: 12px; color: rgba(255, 255, 255, 0.7); font-weight: 600; }
    .stat-value { font-size: 16px; color: white; font-weight: 800; }

    .collapse-toggle {
      position: absolute;
      right: -14px; top: 50%;
      transform: translateY(-50%);
      width: 28px; height: 28px;
      background: white;
      border: none;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex; align-items: center; justify-content: center;
      mat-icon { font-size: 18px; width: 18px; height: 18px; color: #ea580c; }
      &:hover { transform: translateY(-50%) scale(1.1); }
      @media (max-width: 768px) { display: none; }
    }

    .main-wrapper {
      flex: 1;
      margin-left: 280px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
      background: var(--color-background);

      &.sidebar-collapsed { margin-left: 80px; }
      @media (max-width: 768px) { margin-left: 0 !important; }
    }

    .header {
      background: white;
      padding: 16px 32px;
      display: flex; align-items: center; justify-content: space-between;
      border-bottom: 1px solid var(--color-border);
      position: sticky; top: 0; z-index: 50;
      @media (max-width: 768px) { padding: 12px 16px; }
    }

    .header-left { display: flex; align-items: center; gap: 16px; }
    .page-title { font-family: var(--font-family-display); font-size: 24px; font-weight: 700; margin: 0; }
    .page-subtitle { font-size: 14px; color: var(--color-text-secondary); margin: 0; }
    .header-right { display: flex; align-items: center; gap: 12px; }

    .notification-btn {
      position: relative;
      width: 44px; height: 44px;
      border-radius: 12px !important;
      background: var(--color-gray-100);
      mat-icon { color: var(--color-text-secondary); }
      &:hover { background: rgba(249, 115, 22, 0.1); mat-icon { color: #ea580c; } }
    }

    .notification-badge {
      position: absolute;
      top: 4px; right: 4px;
      min-width: 20px; height: 20px;
      background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
      border-radius: 10px;
      color: white;
      font-size: 11px; font-weight: 800;
      display: flex; align-items: center; justify-content: center;
      border: 2px solid white;
    }

    .user-menu-btn {
      display: flex; align-items: center; gap: 10px;
      padding: 6px 12px 6px 6px;
      border-radius: 12px !important;
      background: var(--color-gray-50);
      border: 1px solid var(--color-border);
    }

    .user-avatar {
      width: 36px; height: 36px;
      background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
      border-radius: 10px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 14px;
    }

    .user-name { font-weight: 600; color: var(--color-text-primary); font-size: 14px; }

    ::ng-deep .user-dropdown { margin-top: 8px; border-radius: 16px !important; min-width: 260px !important; }

    .menu-header { display: flex; align-items: center; gap: 14px; padding: 16px; }
    .menu-avatar {
      width: 48px; height: 48px;
      background: linear-gradient(135deg, #ea580c 0%, #f97316 100%);
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      color: white; font-weight: 800; font-size: 18px;
    }
    .menu-user-info { display: flex; flex-direction: column; }
    .menu-user-name { font-weight: 700; font-size: 15px; }
    .menu-user-role { font-size: 13px; color: var(--color-text-secondary); }
    .logout-item { color: var(--color-danger) !important; mat-icon { color: var(--color-danger) !important; } }

    .main-content { flex: 1; padding: 24px 32px; @media (max-width: 768px) { padding: 16px; } }

    .sidebar-overlay {
      display: none;
      position: fixed; top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 200;
      opacity: 0;
      transition: opacity 0.3s ease;
      &.visible { display: block; opacity: 1; }
    }

    .mobile-sidebar {
      display: none;
      position: fixed; top: 0; left: 0; bottom: 0;
      width: 300px;
      background: linear-gradient(180deg, #c2410c 0%, #ea580c 50%, #f97316 100%);
      z-index: 300;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      flex-direction: column;

      &.open { transform: translateX(0); }
      @media (max-width: 768px) { display: flex; }
      .sidebar-header { display: flex; align-items: center; justify-content: space-between; button mat-icon { color: white; } }
    }

    .hide-mobile { @media (max-width: 768px) { display: none !important; } }
    .hide-desktop { @media (min-width: 769px) { display: none !important; } }
  `]
})
export class VenueLayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  todayBookings = signal(18);
  monthRevenue = signal(4250);
  notificationCount = signal(5);

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/venue/dashboard' },
    { icon: 'event', label: 'Activities', route: '/venue/activities' },
    { icon: 'calendar_today', label: 'Bookings', route: '/venue/bookings', badge: 3 },
    { icon: 'trending_up', label: 'Performance', route: '/venue/performance' },
    { icon: 'settings', label: 'Settings', route: '/venue/settings' }
  ];

  userName = computed(() => this.authService.userFullName() || 'Venue Admin');
  userInitials = computed(() => {
    const user = this.authService.currentUser();
    return user ? (user.firstName?.[0] || '') + (user.lastName?.[0] || '') : 'VA';
  });

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {}

  toggleSidebar(): void { this.sidebarCollapsed.update(v => !v); }
  toggleMobileSidebar(): void { this.mobileSidebarOpen.update(v => !v); }
  logout(): void { this.authService.logout(); }
}