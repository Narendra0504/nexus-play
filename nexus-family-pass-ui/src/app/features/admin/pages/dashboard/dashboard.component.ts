// =====================================================
// NEXUS FAMILY PASS - ADMIN DASHBOARD COMPONENT
// Platform-wide dashboard for system administrators
// Shows global metrics, health status, and alerts
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Router
import { RouterLink } from '@angular/router';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';

/**
 * AdminDashboardComponent - System Admin Dashboard
 * 
 * Provides system administrators with:
 * - Platform-wide usage statistics
 * - System health monitoring
 * - Recent activity and alerts
 * - Quick access to management functions
 */
@Component({
  // Component selector
  selector: 'app-admin-dashboard',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTableModule,
    MatChipsModule,
    MatBadgeModule
  ],
  
  // Inline template
  template: `
    <!-- Admin Dashboard container -->
    <div class="dashboard-container p-6">
      
      <!-- Page header -->
      <div class="page-header flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-display font-bold text-neutral-800">Admin Dashboard</h1>
          <p class="text-neutral-500">Platform overview and system health</p>
        </div>
        
        <!-- System status indicator -->
        <div class="flex items-center gap-2 px-4 py-2 bg-success-100 rounded-lg">
          <span class="w-2 h-2 bg-success-500 rounded-full animate-pulse"></span>
          <span class="text-sm text-success-600">All Systems Operational</span>
        </div>
      </div>

      <!-- ================================================ -->
      <!-- PLATFORM METRICS                                 -->
      <!-- ================================================ -->
      <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <!-- Total Companies -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="flex items-center gap-3">
              <div class="metric-icon bg-primary-100">
                <mat-icon class="text-primary-600">business</mat-icon>
              </div>
              <div>
                <div class="metric-value">{{ platformMetrics().totalCompanies }}</div>
                <div class="metric-label">Companies</div>
              </div>
            </div>
            <div class="metric-change">+{{ platformMetrics().newCompaniesThisMonth }} this month</div>
          </mat-card-content>
        </mat-card>

        <!-- Total Venues -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="flex items-center gap-3">
              <div class="metric-icon bg-accent-100">
                <mat-icon class="text-accent-600">storefront</mat-icon>
              </div>
              <div>
                <div class="metric-value">{{ platformMetrics().totalVenues }}</div>
                <div class="metric-label">Venues</div>
              </div>
            </div>
            <div class="metric-change">+{{ platformMetrics().newVenuesThisMonth }} this month</div>
          </mat-card-content>
        </mat-card>

        <!-- Total Users -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="flex items-center gap-3">
              <div class="metric-icon bg-success-100">
                <mat-icon class="text-success-600">people</mat-icon>
              </div>
              <div>
                <div class="metric-value">{{ platformMetrics().totalUsers | number }}</div>
                <div class="metric-label">Total Users</div>
              </div>
            </div>
            <div class="metric-change">{{ platformMetrics().activeToday | number }} active today</div>
          </mat-card-content>
        </mat-card>

        <!-- Total Bookings -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="flex items-center gap-3">
              <div class="metric-icon bg-warning-100">
                <mat-icon class="text-warning-600">event</mat-icon>
              </div>
              <div>
                <div class="metric-value">{{ platformMetrics().totalBookings | number }}</div>
                <div class="metric-label">Bookings This Month</div>
              </div>
            </div>
            <div class="metric-change text-success-600">+15% vs last month</div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- ================================================ -->
      <!-- MAIN CONTENT GRID                                -->
      <!-- ================================================ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Activity & Alerts (spans 2 cols) -->
        <div class="lg:col-span-2 space-y-6">
          
          <!-- Recent Activity -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Recent Activity</mat-card-title>
              <mat-card-subtitle>Platform-wide events</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <div class="space-y-3">
                <div *ngFor="let activity of recentActivity()" 
                     class="activity-item flex items-center gap-4 p-3 rounded-lg bg-neutral-50">
                  
                  <!-- Activity icon -->
                  <div class="activity-icon p-2 rounded-full"
                       [ngClass]="activity.iconClass">
                    <mat-icon>{{ activity.icon }}</mat-icon>
                  </div>
                  
                  <!-- Activity details -->
                  <div class="flex-1">
                    <p class="font-medium text-neutral-800">{{ activity.title }}</p>
                    <p class="text-sm text-neutral-500">{{ activity.description }}</p>
                  </div>
                  
                  <!-- Timestamp -->
                  <span class="text-sm text-neutral-400">{{ activity.time }}</span>
                </div>
              </div>
              
              <button mat-button color="primary" class="w-full mt-4">
                View All Activity
              </button>
            </mat-card-content>
          </mat-card>

          <!-- System Alerts -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                System Alerts
                <mat-badge [matBadge]="alerts().length" matBadgeColor="warn" *ngIf="alerts().length > 0">
                </mat-badge>
              </mat-card-title>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              @if (alerts().length === 0) {
                <div class="text-center py-8 text-neutral-400">
                  <mat-icon class="scale-150 mb-2">check_circle</mat-icon>
                  <p>No active alerts</p>
                </div>
              } @else {
                <div class="space-y-3">
                  <div *ngFor="let alert of alerts()" 
                       class="alert-item p-3 rounded-lg"
                       [ngClass]="{
                         'bg-danger-50 border-l-4 border-danger-500': alert.severity === 'high',
                         'bg-warning-50 border-l-4 border-warning-500': alert.severity === 'medium',
                         'bg-info-50 border-l-4 border-info-500': alert.severity === 'low'
                       }">
                    <div class="flex items-start gap-3">
                      <mat-icon [ngClass]="{
                        'text-danger-500': alert.severity === 'high',
                        'text-warning-500': alert.severity === 'medium',
                        'text-info-500': alert.severity === 'low'
                      }">{{ alert.icon }}</mat-icon>
                      <div class="flex-1">
                        <h4 class="font-medium text-neutral-800">{{ alert.title }}</h4>
                        <p class="text-sm text-neutral-600">{{ alert.message }}</p>
                      </div>
                      <button mat-icon-button>
                        <mat-icon>close</mat-icon>
                      </button>
                    </div>
                  </div>
                </div>
              }
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Right Column: Quick Actions & Stats -->
        <div class="space-y-6">
          
          <!-- Quick Actions -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <div class="space-y-2">
                <button mat-stroked-button class="w-full justify-start" routerLink="/admin/companies">
                  <mat-icon>business</mat-icon>
                  Manage Companies
                </button>
                <button mat-stroked-button class="w-full justify-start" routerLink="/admin/venues">
                  <mat-icon>storefront</mat-icon>
                  Manage Venues
                </button>
                <button mat-stroked-button class="w-full justify-start" routerLink="/admin/users">
                  <mat-icon>people</mat-icon>
                  Manage Users
                </button>
                <button mat-stroked-button class="w-full justify-start" routerLink="/admin/settings">
                  <mat-icon>settings</mat-icon>
                  System Settings
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- System Health -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>System Health</mat-card-title>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <div class="space-y-4">
                <div *ngFor="let service of systemHealth()" class="service-status">
                  <div class="flex justify-between items-center mb-1">
                    <span class="text-sm text-neutral-600">{{ service.name }}</span>
                    <span class="text-xs" 
                          [ngClass]="{
                            'text-success-600': service.status === 'healthy',
                            'text-warning-600': service.status === 'degraded',
                            'text-danger-600': service.status === 'down'
                          }">
                      {{ service.status | titlecase }}
                    </span>
                  </div>
                  <mat-progress-bar mode="determinate" 
                                   [value]="service.uptime"
                                   [color]="service.status === 'healthy' ? 'primary' : 'warn'">
                  </mat-progress-bar>
                </div>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Pending Approvals -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>
                Pending Approvals
                <mat-badge matBadge="3" matBadgeColor="accent"></mat-badge>
              </mat-card-title>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <div class="space-y-3">
                <div class="flex justify-between items-center">
                  <span class="text-sm text-neutral-600">New Venues</span>
                  <mat-chip class="bg-accent-100 text-accent-600">2</mat-chip>
                </div>
                <div class="flex justify-between items-center">
                  <span class="text-sm text-neutral-600">Company Requests</span>
                  <mat-chip class="bg-accent-100 text-accent-600">1</mat-chip>
                </div>
              </div>
              
              <button mat-stroked-button color="primary" class="w-full mt-4" 
                      routerLink="/admin/approvals">
                Review All
              </button>
            </mat-card-content>
          </mat-card>
        </div>
      </div>
    </div>
  `,
  
  // Inline styles
  styles: [`
    /* Metric card styling */
    .metric-card mat-card-content {
      padding: 1rem;
    }

    .metric-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .metric-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
      line-height: 1;
    }

    .metric-label {
      font-size: 0.75rem;
      color: #718096;
      margin-top: 0.25rem;
    }

    .metric-change {
      font-size: 0.75rem;
      color: #718096;
      margin-top: 0.5rem;
    }

    /* Activity item hover */
    .activity-item {
      transition: background-color 0.2s;
    }
    
    .activity-item:hover {
      background-color: #edf2f7;
    }

    /* Color utilities */
    .bg-primary-100 { background-color: rgba(44, 82, 130, 0.1); }
    .bg-accent-100 { background-color: rgba(49, 151, 149, 0.1); }
    .bg-success-100 { background-color: rgba(56, 161, 105, 0.1); }
    .bg-warning-100 { background-color: rgba(237, 137, 54, 0.1); }
    .bg-danger-50 { background-color: rgba(229, 62, 62, 0.05); }
    .bg-warning-50 { background-color: rgba(237, 137, 54, 0.05); }
    .bg-info-50 { background-color: rgba(49, 130, 206, 0.05); }

    .text-primary-600 { color: #2c5282; }
    .text-accent-600 { color: #319795; }
    .text-success-600 { color: #38a169; }
    .text-success-500 { color: #48bb78; }
    .text-warning-600 { color: #dd6b20; }
    .text-warning-500 { color: #ed8936; }
    .text-danger-600 { color: #c53030; }
    .text-danger-500 { color: #e53e3e; }
    .text-info-500 { color: #3182ce; }

    .bg-success-500 { background-color: #48bb78; }
    .border-danger-500 { border-color: #e53e3e; }
    .border-warning-500 { border-color: #ed8936; }
    .border-info-500 { border-color: #3182ce; }
  `]
})
export class AdminDashboardComponent implements OnInit {
  // Platform-wide metrics
  platformMetrics = signal({
    totalCompanies: 45,
    newCompaniesThisMonth: 3,
    totalVenues: 128,
    newVenuesThisMonth: 8,
    totalUsers: 12456,
    activeToday: 2341,
    totalBookings: 8923
  });

  // Recent activity
  recentActivity = signal<any[]>([]);

  // System alerts
  alerts = signal<any[]>([]);

  // System health
  systemHealth = signal<any[]>([]);

  /**
   * ngOnInit - Load dashboard data
   */
  ngOnInit(): void {
    this.loadRecentActivity();
    this.loadAlerts();
    this.loadSystemHealth();
  }

  /**
   * loadRecentActivity - Load platform activity
   */
  private loadRecentActivity(): void {
    this.recentActivity.set([
      { icon: 'business', iconClass: 'bg-primary-100 text-primary-600', title: 'New Company Onboarded', description: 'Acme Corp joined the platform', time: '15 min ago' },
      { icon: 'storefront', iconClass: 'bg-accent-100 text-accent-600', title: 'Venue Approved', description: 'Sunshine Art Studio is now live', time: '1 hour ago' },
      { icon: 'people', iconClass: 'bg-success-100 text-success-600', title: 'User Milestone', description: 'Platform reached 12,000 users', time: '3 hours ago' },
      { icon: 'flag', iconClass: 'bg-warning-100 text-warning-600', title: 'Review Flagged', description: 'A review requires moderation', time: '5 hours ago' }
    ]);
  }

  /**
   * loadAlerts - Load system alerts
   */
  private loadAlerts(): void {
    this.alerts.set([
      { severity: 'low', icon: 'info', title: 'Scheduled Maintenance', message: 'Database maintenance scheduled for Sunday 2AM-4AM PST' }
    ]);
  }

  /**
   * loadSystemHealth - Load system health status
   */
  private loadSystemHealth(): void {
    this.systemHealth.set([
      { name: 'API Server', status: 'healthy', uptime: 99.9 },
      { name: 'Database', status: 'healthy', uptime: 99.8 },
      { name: 'Search Service', status: 'healthy', uptime: 99.5 },
      { name: 'Email Service', status: 'healthy', uptime: 99.7 }
    ]);
  }
}
