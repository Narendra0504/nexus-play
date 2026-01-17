// =====================================================
// NEXUS FAMILY PASS - PARENT LAYOUT COMPONENT
// Main layout wrapper for parent portal with sidebar,
// header, and content area
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
  selector: 'app-parent-layout',
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
        <!-- Logo Section -->
        <div class="sidebar-header">
          <div class="logo" *ngIf="!sidebarCollapsed()">
            <div class="logo-icon">
              <mat-icon>family_restroom</mat-icon>
            </div>
            <div class="logo-text">
              <span class="logo-title">Nexus</span>
              <span class="logo-subtitle">Family Pass</span>
            </div>
          </div>
          <div class="logo-mini" *ngIf="sidebarCollapsed()">
            <mat-icon>family_restroom</mat-icon>
          </div>
        </div>

        <!-- Navigation -->
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

        <!-- Credits Card -->
        <div class="sidebar-credits" *ngIf="!sidebarCollapsed()">
          <div class="credits-card">
            <div class="credits-header">
              <div class="credits-icon">
                <mat-icon>stars</mat-icon>
              </div>
              <div class="credits-text">
                <span class="credits-label">Credits Remaining</span>
              </div>
            </div>
            <div class="credits-value-row">
              <span class="credits-current">{{ credits() }}</span>
              <span class="credits-divider">/</span>
              <span class="credits-total">{{ totalCredits() }}</span>
            </div>
            <div class="credits-progress">
              <div class="progress-bar" [style.width.%]="creditsPercentage()"></div>
            </div>
            <span class="credits-hint">Use them before they expire!</span>
          </div>
        </div>

        <!-- Collapse Toggle -->
        <button class="collapse-toggle" (click)="toggleSidebar()">
          <mat-icon>{{ sidebarCollapsed() ? 'chevron_right' : 'chevron_left' }}</mat-icon>
        </button>
      </aside>

      <!-- Main Content Area -->
      <div class="main-wrapper" [class.sidebar-collapsed]="sidebarCollapsed()">
        <!-- Header -->
        <header class="header">
          <div class="header-left">
            <button mat-icon-button class="menu-toggle hide-desktop" (click)="toggleMobileSidebar()">
              <mat-icon>menu</mat-icon>
            </button>
            <div class="greeting hide-mobile">
              <h1 class="greeting-title">{{ getGreeting() }}, {{ userName() }}! 👋</h1>
              <p class="greeting-subtitle">Let's find something fun for your kids today</p>
            </div>
          </div>

          <div class="header-right">
            <!-- Credits Display (Header) -->
            <div class="header-credits">
              <div class="credits-badge">
                <mat-icon>stars</mat-icon>
                <div class="credits-info">
                  <span class="credits-number">{{ credits() }}<span class="credits-max">/{{ totalCredits() }}</span></span>
                  <span class="credits-text">Credits</span>
                </div>
              </div>
            </div>

            <!-- Notifications -->
            <button mat-icon-button class="notification-btn" [routerLink]="['/parent/notifications']">
              <mat-icon>notifications</mat-icon>
              <span class="notification-count" *ngIf="notificationCount() > 0">
                {{ notificationCount() > 9 ? '9+' : notificationCount() }}
              </span>
            </button>

            <!-- User Menu -->
            <button mat-button [matMenuTriggerFor]="userMenu" class="user-menu-btn">
              <div class="user-avatar">{{ userInitials() }}</div>
              <div class="user-info hide-mobile">
                <span class="user-name">{{ userName() }}</span>
                <span class="user-role">Parent Account</span>
              </div>
              <mat-icon class="dropdown-icon hide-mobile">keyboard_arrow_down</mat-icon>
            </button>

            <mat-menu #userMenu="matMenu" class="user-dropdown">
              <div class="menu-header">
                <div class="menu-avatar">{{ userInitials() }}</div>
                <div class="menu-user-info">
                  <span class="menu-user-name">{{ userName() }}</span>
                  <span class="menu-user-email">{{ userEmail() }}</span>
                </div>
              </div>
              <mat-divider></mat-divider>
              <button mat-menu-item routerLink="/parent/settings">
                <mat-icon>settings</mat-icon>
                <span>Settings</span>
              </button>
              <button mat-menu-item routerLink="/parent/children">
                <mat-icon>face</mat-icon>
                <span>My Children</span>
              </button>
              <button mat-menu-item routerLink="/parent/bookings">
                <mat-icon>calendar_today</mat-icon>
                <span>My Bookings</span>
              </button>
              <mat-divider></mat-divider>
              <button mat-menu-item (click)="logout()" class="logout-item">
                <mat-icon>logout</mat-icon>
                <span>Sign Out</span>
              </button>
            </mat-menu>
          </div>
        </header>

        <!-- Page Content -->
        <main class="main-content">
          <router-outlet></router-outlet>
        </main>
      </div>

      <!-- Mobile Sidebar Overlay -->
      <div class="sidebar-overlay" 
           [class.visible]="mobileSidebarOpen()" 
           (click)="toggleMobileSidebar()">
      </div>

      <!-- Mobile Sidebar -->
      <aside class="mobile-sidebar" [class.open]="mobileSidebarOpen()">
        <div class="mobile-sidebar-header">
          <div class="logo">
            <div class="logo-icon">
              <mat-icon>family_restroom</mat-icon>
            </div>
            <div class="logo-text">
              <span class="logo-title">Nexus</span>
              <span class="logo-subtitle">Family Pass</span>
            </div>
          </div>
          <button mat-icon-button class="close-btn" (click)="toggleMobileSidebar()">
            <mat-icon>close</mat-icon>
          </button>
        </div>

        <!-- Mobile Credits -->
        <div class="mobile-credits">
          <div class="credits-icon">
            <mat-icon>stars</mat-icon>
          </div>
          <div class="credits-details">
            <span class="credits-value">{{ credits() }} / {{ totalCredits() }}</span>
            <span class="credits-label">Credits Remaining</span>
          </div>
        </div>

        <nav class="sidebar-nav">
          <a *ngFor="let item of navItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             class="nav-item"
             (click)="toggleMobileSidebar()">
            <div class="nav-icon">
              <mat-icon>{{ item.icon }}</mat-icon>
              <span class="nav-badge" *ngIf="item.badge">{{ item.badge }}</span>
            </div>
            <span class="nav-label">{{ item.label }}</span>
          </a>
        </nav>
      </aside>
    </div>
  `,
  styles: [`
    /* =====================================================
       LAYOUT CONTAINER
       ===================================================== */
    .layout-container {
      display: flex;
      min-height: 100vh;
      background: var(--color-background);
    }

    /* =====================================================
       SIDEBAR (Desktop)
       ===================================================== */
    .sidebar {
      width: 280px;
      background: linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%);
      display: flex;
      flex-direction: column;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
      transition: width 0.3s ease;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
    }

    .sidebar.collapsed {
      width: 80px;
    }

    @media (max-width: 768px) {
      .sidebar {
        display: none;
      }
    }

    .sidebar-header {
      padding: 24px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .logo-icon {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .logo-icon mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    .logo-text {
      display: flex;
      flex-direction: column;
    }

    .logo-title {
      font-family: var(--font-family-display);
      font-size: 20px;
      font-weight: 800;
      color: white;
      line-height: 1.1;
    }

    .logo-subtitle {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
    }

    .logo-mini {
      width: 48px;
      height: 48px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto;
    }

    .logo-mini mat-icon {
      font-size: 28px;
      width: 28px;
      height: 28px;
      color: white;
    }

    /* =====================================================
       NAVIGATION
       ===================================================== */
    .sidebar-nav {
      flex: 1;
      padding: 16px 12px;
      overflow-y: auto;
    }

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
      cursor: pointer;
    }

    .nav-item:hover {
      background: rgba(255, 255, 255, 0.15);
      color: white;
    }

    .nav-item.active {
      background: rgba(255, 255, 255, 0.25);
      color: white;
    }

    .nav-item.active .nav-icon mat-icon {
      color: white;
    }

    .nav-icon {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 24px;
      height: 24px;
    }

    .nav-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: rgba(255, 255, 255, 0.8);
    }

    .nav-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      min-width: 18px;
      height: 18px;
      background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
      border-radius: 50%;
      color: white;
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 4px;
      box-shadow: 0 2px 6px rgba(249, 115, 22, 0.5);
    }

    .nav-label {
      font-size: 15px;
      font-weight: 600;
      white-space: nowrap;
    }

    .sidebar.collapsed .nav-item {
      justify-content: center;
      padding: 14px;
    }

    /* =====================================================
       SIDEBAR CREDITS CARD
       ===================================================== */
    .sidebar-credits {
      padding: 16px;
      margin-top: auto;
    }

    .credits-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      border-radius: 20px;
      padding: 20px;
    }

    .credits-header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 16px;
    }

    .credits-card .credits-icon {
      width: 44px;
      height: 44px;
      background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
    }

    .credits-card .credits-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
      color: #1f2937;
    }

    .credits-card .credits-text {
      flex: 1;
    }

    .credits-card .credits-label {
      font-size: 13px;
      color: rgba(255, 255, 255, 0.9);
      font-weight: 600;
    }

    .credits-value-row {
      display: flex;
      align-items: baseline;
      justify-content: center;
      gap: 4px;
      margin-bottom: 12px;
    }

    .credits-current {
      font-family: var(--font-family-display);
      font-size: 42px;
      font-weight: 800;
      color: white;
      line-height: 1;
    }

    .credits-divider {
      font-size: 24px;
      color: rgba(255, 255, 255, 0.5);
      font-weight: 600;
    }

    .credits-total {
      font-size: 24px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 700;
    }

    .credits-progress {
      height: 8px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 8px;
    }

    .progress-bar {
      height: 100%;
      background: linear-gradient(90deg, #fbbf24, #f97316);
      border-radius: 4px;
      transition: width 0.5s ease;
    }

    .credits-hint {
      display: block;
      text-align: center;
      font-size: 11px;
      color: rgba(255, 255, 255, 0.6);
      font-weight: 500;
    }

    /* =====================================================
       COLLAPSE TOGGLE
       ===================================================== */
    .collapse-toggle {
      position: absolute;
      right: -14px;
      top: 50%;
      transform: translateY(-50%);
      width: 28px;
      height: 28px;
      background: white;
      border: none;
      border-radius: 50%;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
      z-index: 10;
    }

    .collapse-toggle mat-icon {
      font-size: 18px;
      width: 18px;
      height: 18px;
      color: var(--color-primary);
    }

    .collapse-toggle:hover {
      transform: translateY(-50%) scale(1.1);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    }

    @media (max-width: 768px) {
      .collapse-toggle {
        display: none;
      }
    }

    /* =====================================================
       MAIN WRAPPER
       ===================================================== */
    .main-wrapper {
      flex: 1;
      margin-left: 280px;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      transition: margin-left 0.3s ease;
      background: var(--color-background);
    }

    .main-wrapper.sidebar-collapsed {
      margin-left: 80px;
    }

    @media (max-width: 768px) {
      .main-wrapper {
        margin-left: 0 !important;
      }
    }

    /* =====================================================
       HEADER
       ===================================================== */
    .header {
      background: white;
      padding: 16px 32px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--color-border);
      position: sticky;
      top: 0;
      z-index: 50;
      gap: 16px;
    }

    @media (max-width: 768px) {
      .header {
        padding: 12px 16px;
      }
    }

    .header-left {
      display: flex;
      align-items: center;
      gap: 16px;
      flex: 1;
      min-width: 0;
    }

    .menu-toggle mat-icon {
      color: var(--color-text-primary);
    }

    .greeting {
      min-width: 0;
    }

    .greeting-title {
      font-family: var(--font-family-display);
      font-size: 24px;
      font-weight: 700;
      color: var(--color-text-primary);
      margin: 0;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .greeting-subtitle {
      font-size: 14px;
      color: var(--color-text-secondary);
      margin: 0;
    }

    .header-right {
      display: flex;
      align-items: center;
      gap: 16px;
      flex-shrink: 0;
    }

    /* =====================================================
       HEADER CREDITS BADGE
       ===================================================== */
    .header-credits {
      display: flex;
      align-items: center;
    }

    .credits-badge {
      display: flex;
      align-items: center;
      gap: 10px;
      background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
      padding: 8px 16px;
      border-radius: 16px;
      box-shadow: 0 4px 12px rgba(251, 191, 36, 0.35);
    }

    .credits-badge mat-icon {
      font-size: 22px;
      width: 22px;
      height: 22px;
      color: #1f2937;
    }

    .credits-badge .credits-info {
      display: flex;
      flex-direction: column;
      line-height: 1.1;
    }

    .credits-badge .credits-number {
      font-size: 18px;
      font-weight: 800;
      color: #1f2937;
    }

    .credits-badge .credits-max {
      font-size: 14px;
      font-weight: 600;
      color: rgba(31, 41, 55, 0.7);
    }

    .credits-badge .credits-text {
      font-size: 10px;
      font-weight: 700;
      color: rgba(31, 41, 55, 0.8);
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }

    @media (max-width: 480px) {
      .credits-badge {
        padding: 6px 12px;
      }
      
      .credits-badge .credits-info {
        display: none;
      }
      
      .credits-badge::after {
        content: attr(data-credits);
        font-weight: 800;
        color: #1f2937;
      }
    }

    /* =====================================================
       NOTIFICATION BUTTON
       ===================================================== */
    .notification-btn {
      position: relative;
      width: 44px;
      height: 44px;
      border-radius: 14px !important;
      background: var(--color-gray-100);
      flex-shrink: 0;
    }

    .notification-btn mat-icon {
      color: var(--color-text-secondary);
      font-size: 24px;
    }

    .notification-btn:hover {
      background: var(--color-primary-50);
    }

    .notification-btn:hover mat-icon {
      color: var(--color-primary);
    }

    .notification-count {
      position: absolute;
      top: 2px;
      right: 2px;
      min-width: 20px;
      height: 20px;
      background: linear-gradient(135deg, #f97316 0%, #ef4444 100%);
      border-radius: 10px;
      color: white;
      font-size: 11px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 0 5px;
      border: 2px solid white;
      box-shadow: 0 2px 6px rgba(249, 115, 22, 0.4);
    }

    /* =====================================================
       USER MENU BUTTON
       ===================================================== */
    .user-menu-btn {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px;
      padding-right: 12px;
      border-radius: 16px !important;
      background: var(--color-gray-50);
      border: 1px solid var(--color-border);
      min-height: 48px;
      flex-shrink: 0;
    }

    .user-menu-btn:hover {
      background: var(--color-gray-100);
      border-color: var(--color-gray-300);
    }

    .user-avatar {
      width: 36px;
      height: 36px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #ec4899 100%);
      border-radius: 10px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 14px;
      flex-shrink: 0;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      line-height: 1.2;
    }

    .user-name {
      font-weight: 700;
      color: var(--color-text-primary);
      font-size: 14px;
    }

    .user-role {
      font-size: 11px;
      color: var(--color-text-secondary);
      font-weight: 500;
    }

    .dropdown-icon {
      color: var(--color-text-muted);
      font-size: 20px;
      width: 20px;
      height: 20px;
    }

    @media (max-width: 768px) {
      .user-menu-btn {
        padding: 6px;
      }
    }

    /* =====================================================
       USER DROPDOWN MENU
       ===================================================== */
    :host ::ng-deep .user-dropdown {
      margin-top: 8px;
      border-radius: 20px !important;
      min-width: 280px !important;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15) !important;
      border: 1px solid var(--color-border);
      overflow: hidden;
    }

    .menu-header {
      display: flex;
      align-items: center;
      gap: 14px;
      padding: 20px;
      background: linear-gradient(135deg, var(--color-primary-50) 0%, #fdf2f8 100%);
    }

    .menu-avatar {
      width: 52px;
      height: 52px;
      background: linear-gradient(135deg, var(--color-primary) 0%, #ec4899 100%);
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 20px;
      box-shadow: 0 4px 12px rgba(124, 58, 237, 0.3);
    }

    .menu-user-info {
      display: flex;
      flex-direction: column;
    }

    .menu-user-name {
      font-weight: 700;
      color: var(--color-text-primary);
      font-size: 16px;
    }

    .menu-user-email {
      font-size: 13px;
      color: var(--color-text-secondary);
    }

    .logout-item {
      color: var(--color-danger) !important;
    }

    .logout-item mat-icon {
      color: var(--color-danger) !important;
    }

    /* =====================================================
       MAIN CONTENT
       ===================================================== */
    .main-content {
      flex: 1;
      padding: 24px 32px;
      overflow-y: auto;
    }

    @media (max-width: 768px) {
      .main-content {
        padding: 16px;
      }
    }

    /* =====================================================
       MOBILE SIDEBAR
       ===================================================== */
    .sidebar-overlay {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(4px);
      z-index: 200;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .sidebar-overlay.visible {
      display: block;
      opacity: 1;
    }

    .mobile-sidebar {
      display: none;
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      width: 300px;
      background: linear-gradient(180deg, #4c1d95 0%, #5b21b6 50%, #6d28d9 100%);
      z-index: 300;
      transform: translateX(-100%);
      transition: transform 0.3s ease;
      flex-direction: column;
      box-shadow: 4px 0 24px rgba(0, 0, 0, 0.2);
    }

    .mobile-sidebar.open {
      transform: translateX(0);
    }

    @media (max-width: 768px) {
      .mobile-sidebar {
        display: flex;
      }
    }

    .mobile-sidebar-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 20px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .close-btn mat-icon {
      color: white;
    }

    /* Mobile Credits */
    .mobile-credits {
      display: flex;
      align-items: center;
      gap: 14px;
      margin: 16px;
      padding: 16px;
      background: rgba(255, 255, 255, 0.15);
      border-radius: 16px;
    }

    .mobile-credits .credits-icon {
      width: 48px;
      height: 48px;
      background: linear-gradient(135deg, #fbbf24 0%, #f97316 100%);
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(251, 191, 36, 0.4);
    }

    .mobile-credits .credits-icon mat-icon {
      font-size: 26px;
      width: 26px;
      height: 26px;
      color: #1f2937;
    }

    .mobile-credits .credits-details {
      display: flex;
      flex-direction: column;
    }

    .mobile-credits .credits-value {
      font-family: var(--font-family-display);
      font-size: 22px;
      font-weight: 800;
      color: white;
    }

    .mobile-credits .credits-label {
      font-size: 12px;
      color: rgba(255, 255, 255, 0.7);
      font-weight: 600;
    }

    /* =====================================================
       RESPONSIVE HELPERS
       ===================================================== */
    .hide-mobile {
      display: block;
    }

    .hide-desktop {
      display: none;
    }

    @media (max-width: 768px) {
      .hide-mobile {
        display: none !important;
      }
      
      .hide-desktop {
        display: block !important;
      }
    }
  `]
})
export class ParentLayoutComponent implements OnInit {
  sidebarCollapsed = signal(false);
  mobileSidebarOpen = signal(false);
  credits = signal(7);
  totalCredits = signal(10);
  notificationCount = signal(3);

  navItems: NavItem[] = [
    { icon: 'dashboard', label: 'Dashboard', route: '/parent/dashboard' },
    { icon: 'search', label: 'Browse Activities', route: '/parent/activities' },
    { icon: 'face', label: 'My Children', route: '/parent/children' },
    { icon: 'calendar_today', label: 'Bookings', route: '/parent/bookings' },
    { icon: 'schedule', label: 'Waitlist', route: '/parent/waitlist', badge: 2 },
    { icon: 'notifications', label: 'Notifications', route: '/parent/notifications', badge: 3 },
    { icon: 'settings', label: 'Settings', route: '/parent/settings' }
  ];

  userName = computed(() => this.authService.userFullName() || 'Parent');
  userEmail = computed(() => this.authService.currentUser()?.email || '');
  userInitials = computed(() => {
    const user = this.authService.currentUser();
    if (user) {
      return (user.firstName?.[0] || '') + (user.lastName?.[0] || '');
    }
    return 'P';
  });

  creditsPercentage = computed(() => (this.credits() / this.totalCredits()) * 100);

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Initialize
  }

  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  }

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  toggleMobileSidebar(): void {
    this.mobileSidebarOpen.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}