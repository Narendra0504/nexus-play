// =====================================================
// NEXUS FAMILY PASS - SIDEBAR COMPONENT
// Reusable sidebar navigation component used across
// all portal layouts. Supports collapsible state and
// role-based menu items.
// =====================================================

// Import Angular core
import { Component, Input, Output, EventEmitter, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Router
import { RouterLink, RouterLinkActive } from '@angular/router';

// Import Angular Material modules
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDividerModule } from '@angular/material/divider';

/**
 * MenuItem - Navigation item interface
 */
export interface MenuItem {
  /** Display label */
  label: string;
  /** Material icon name */
  icon: string;
  /** Router link path */
  route: string;
  /** Badge count (optional) */
  badge?: number;
  /** Whether item is disabled */
  disabled?: boolean;
}

/**
 * SidebarComponent - Navigation Sidebar
 * 
 * Reusable sidebar component that:
 * - Displays navigation menu items
 * - Supports collapsed/expanded states
 * - Shows active route highlighting
 * - Displays badge counts for notifications
 * 
 * @example
 * ```html
 * <app-sidebar
 *   [menuItems]="parentMenuItems"
 *   [collapsed]="isSidebarCollapsed"
 *   (collapseChange)="onCollapseChange($event)">
 * </app-sidebar>
 * ```
 */
@Component({
  // Component selector
  selector: 'app-sidebar',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    RouterLink,
    RouterLinkActive,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatDividerModule
  ],
  
  // Inline template
  template: `
    <!-- Sidebar container -->
    <aside class="sidebar" 
           [class.collapsed]="collapsed"
           [class.expanded]="!collapsed">
      
      <!-- Logo section -->
      <div class="sidebar-header">
        <div class="logo" *ngIf="!collapsed">
          <mat-icon class="logo-icon">family_restroom</mat-icon>
          <span class="logo-text">Nexus</span>
        </div>
        <mat-icon class="logo-icon-small" *ngIf="collapsed">family_restroom</mat-icon>
      </div>

      <!-- Navigation menu -->
      <nav class="sidebar-nav">
        <mat-nav-list>
          <a mat-list-item
             *ngFor="let item of menuItems"
             [routerLink]="item.route"
             routerLinkActive="active"
             [routerLinkActiveOptions]="{ exact: item.route.split('/').length <= 2 }"
             [disabled]="item.disabled"
             [matTooltip]="collapsed ? item.label : ''"
             matTooltipPosition="right">
            
            <!-- Icon -->
            <mat-icon matListItemIcon [matBadge]="item.badge" 
                      [matBadgeHidden]="!item.badge"
                      matBadgeColor="warn"
                      matBadgeSize="small">
              {{ item.icon }}
            </mat-icon>
            
            <!-- Label (hidden when collapsed) -->
            <span matListItemTitle *ngIf="!collapsed">{{ item.label }}</span>
            
            <!-- Badge (shown only when not collapsed) -->
            <span *ngIf="item.badge && !collapsed" 
                  class="badge">
              {{ item.badge }}
            </span>
          </a>
        </mat-nav-list>
      </nav>

      <!-- Bottom section -->
      <div class="sidebar-footer">
        <mat-divider></mat-divider>
        
        <!-- Collapse toggle button -->
        <button class="collapse-toggle" (click)="toggleCollapse()">
          <mat-icon>{{ collapsed ? 'chevron_right' : 'chevron_left' }}</mat-icon>
          <span *ngIf="!collapsed">Collapse</span>
        </button>
      </div>
    </aside>
  `,
  
  // Inline styles
  styles: [`
    /* Sidebar base styles */
    .sidebar {
      display: flex;
      flex-direction: column;
      height: 100%;
      background-color: #1a202c;
      color: white;
      transition: width 0.3s ease;
      overflow: hidden;
    }

    .sidebar.expanded {
      width: 240px;
    }

    .sidebar.collapsed {
      width: 64px;
    }

    /* Header/Logo section */
    .sidebar-header {
      padding: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 64px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .logo-icon, .logo-icon-small {
      color: #319795;
      font-size: 32px;
      width: 32px;
      height: 32px;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      font-family: 'Poppins', sans-serif;
    }

    /* Navigation section */
    .sidebar-nav {
      flex: 1;
      overflow-y: auto;
      padding: 0.5rem 0;
    }

    .sidebar-nav mat-nav-list {
      padding: 0;
    }

    .sidebar-nav a {
      color: rgba(255, 255, 255, 0.7);
      margin: 0.25rem 0.5rem;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .sidebar-nav a:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .sidebar-nav a.active {
      background-color: rgba(49, 151, 149, 0.2);
      color: #319795;
    }

    .sidebar-nav a.active mat-icon {
      color: #319795;
    }

    .sidebar-nav mat-icon {
      color: rgba(255, 255, 255, 0.7);
    }

    /* Badge styling */
    .badge {
      background-color: #e53e3e;
      color: white;
      font-size: 0.75rem;
      padding: 0.125rem 0.5rem;
      border-radius: 9999px;
      margin-left: auto;
    }

    /* Footer section */
    .sidebar-footer {
      margin-top: auto;
      padding: 0.5rem;
    }

    .collapse-toggle {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      width: 100%;
      padding: 0.75rem 1rem;
      background: transparent;
      border: none;
      color: rgba(255, 255, 255, 0.5);
      cursor: pointer;
      border-radius: 8px;
      transition: all 0.2s;
    }

    .collapse-toggle:hover {
      background-color: rgba(255, 255, 255, 0.1);
      color: white;
    }

    .collapsed .collapse-toggle {
      justify-content: center;
      padding: 0.75rem;
    }

    /* Collapsed state adjustments */
    .collapsed .sidebar-nav a {
      justify-content: center;
      padding: 0.75rem;
    }
  `]
})
export class SidebarComponent {
  // -------------------------------------------------
  // INPUTS
  // -------------------------------------------------

  /**
   * Menu items to display in the sidebar
   */
  @Input() menuItems: MenuItem[] = [];

  /**
   * Whether sidebar is collapsed
   */
  @Input() collapsed: boolean = false;

  // -------------------------------------------------
  // OUTPUTS
  // -------------------------------------------------

  /**
   * Event emitted when collapse state changes
   */
  @Output() collapseChange = new EventEmitter<boolean>();

  // -------------------------------------------------
  // METHODS
  // -------------------------------------------------

  /**
   * toggleCollapse - Toggle sidebar collapsed state
   */
  toggleCollapse(): void {
    this.collapsed = !this.collapsed;
    this.collapseChange.emit(this.collapsed);
  }
}
