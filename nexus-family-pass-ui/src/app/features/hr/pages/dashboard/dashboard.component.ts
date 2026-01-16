// =====================================================
// NEXUS FAMILY PASS - HR ADMIN DASHBOARD COMPONENT
// Main dashboard for HR administrators showing company
// usage statistics, employee enrollment, and ROI metrics
// =====================================================

// Import Angular core decorators and types
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule for *ngIf, *ngFor directives
import { CommonModule } from '@angular/common';

// Import Router for navigation
import { RouterLink } from '@angular/router';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';               // Card container
import { MatButtonModule } from '@angular/material/button';           // Buttons
import { MatIconModule } from '@angular/material/icon';               // Icons
import { MatProgressBarModule } from '@angular/material/progress-bar'; // Progress bars
import { MatTableModule } from '@angular/material/table';             // Data tables
import { MatChipsModule } from '@angular/material/chips';             // Status chips
import { MatTooltipModule } from '@angular/material/tooltip';         // Tooltips

// Import AuthService for user data
import { AuthService } from '../../../../core/services/auth.service';

/**
 * HrDashboardComponent - HR Admin Portal Dashboard
 * 
 * This component provides HR administrators with:
 * - Company-wide usage statistics and KPIs
 * - Employee enrollment summary
 * - Utilization rate by department
 * - Recent activity feed
 * - Quick actions for common tasks
 * 
 * All data is anonymized/aggregated for privacy.
 */
@Component({
  // Component selector
  selector: 'app-hr-dashboard',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,              // Common directives
    RouterLink,                // Router navigation
    MatCardModule,             // Material cards
    MatButtonModule,           // Material buttons
    MatIconModule,             // Material icons
    MatProgressBarModule,      // Progress bars
    MatTableModule,            // Data tables
    MatChipsModule,            // Status chips
    MatTooltipModule           // Tooltips
  ],
  
  // Inline template with detailed comments
  template: `
    <!-- HR Dashboard container -->
    <div class="dashboard-container p-6">
      
      <!-- ================================================ -->
      <!-- PAGE HEADER                                      -->
      <!-- ================================================ -->
      <div class="page-header mb-6">
        <div>
          <h1 class="text-2xl font-display font-bold text-neutral-800">
            HR Dashboard
          </h1>
          <p class="text-neutral-500">
            {{ companyName() }} - Employee Benefits Overview
          </p>
        </div>
        
        <!-- Date range selector (placeholder) -->
        <div class="flex gap-2">
          <button mat-stroked-button>
            <mat-icon>date_range</mat-icon>
            This Month
          </button>
          <button mat-stroked-button color="primary" routerLink="/hr/reports">
            <mat-icon>assessment</mat-icon>
            View Reports
          </button>
        </div>
      </div>

      <!-- ================================================ -->
      <!-- KEY METRICS CARDS ROW                            -->
      <!-- ================================================ -->
      <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <!-- Metric 1: Total Employees Enrolled -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-icon bg-primary-100">
              <mat-icon class="text-primary-600">people</mat-icon>
            </div>
            <div class="metric-value">{{ metrics().totalEmployees }}</div>
            <div class="metric-label">Employees Enrolled</div>
            <div class="metric-change positive">
              <mat-icon>trending_up</mat-icon>
              +{{ metrics().newEmployeesThisMonth }} this month
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Metric 2: Total Children Registered -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-icon bg-accent-100">
              <mat-icon class="text-accent-600">child_care</mat-icon>
            </div>
            <div class="metric-value">{{ metrics().totalChildren }}</div>
            <div class="metric-label">Children Registered</div>
            <div class="metric-change">
              Avg {{ metrics().avgChildrenPerEmployee }} per employee
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Metric 3: Utilization Rate -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-icon bg-success-100">
              <mat-icon class="text-success-600">trending_up</mat-icon>
            </div>
            <div class="metric-value">{{ metrics().utilizationRate }}%</div>
            <div class="metric-label">Utilization Rate</div>
            <mat-progress-bar 
              mode="determinate" 
              [value]="metrics().utilizationRate"
              color="primary">
            </mat-progress-bar>
          </mat-card-content>
        </mat-card>

        <!-- Metric 4: Total Activities Booked -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-icon bg-warning-100">
              <mat-icon class="text-warning-600">event</mat-icon>
            </div>
            <div class="metric-value">{{ metrics().totalBookings }}</div>
            <div class="metric-label">Activities This Month</div>
            <div class="metric-change positive">
              <mat-icon>trending_up</mat-icon>
              +12% vs last month
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- ================================================ -->
      <!-- MAIN CONTENT GRID                                -->
      <!-- ================================================ -->
      <div class="content-grid grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left Column: Department Breakdown (spans 2 cols) -->
        <div class="lg:col-span-2">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Utilization by Department</mat-card-title>
              <mat-card-subtitle>
                Credit usage across departments this month
              </mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <!-- Department table -->
              <table mat-table [dataSource]="departmentStats()" class="w-full">
                
                <!-- Department Name Column -->
                <ng-container matColumnDef="department">
                  <th mat-header-cell *matHeaderCellDef>Department</th>
                  <td mat-cell *matCellDef="let row">{{ row.name }}</td>
                </ng-container>
                
                <!-- Employees Column -->
                <ng-container matColumnDef="employees">
                  <th mat-header-cell *matHeaderCellDef>Employees</th>
                  <td mat-cell *matCellDef="let row">{{ row.employees }}</td>
                </ng-container>
                
                <!-- Credits Used Column -->
                <ng-container matColumnDef="creditsUsed">
                  <th mat-header-cell *matHeaderCellDef>Credits Used</th>
                  <td mat-cell *matCellDef="let row">
                    {{ row.creditsUsed }} / {{ row.creditsAllocated }}
                  </td>
                </ng-container>
                
                <!-- Utilization Column -->
                <ng-container matColumnDef="utilization">
                  <th mat-header-cell *matHeaderCellDef>Utilization</th>
                  <td mat-cell *matCellDef="let row">
                    <div class="flex items-center gap-2">
                      <mat-progress-bar 
                        mode="determinate" 
                        [value]="row.utilization"
                        class="flex-1">
                      </mat-progress-bar>
                      <span class="text-sm">{{ row.utilization }}%</span>
                    </div>
                  </td>
                </ng-container>
                
                <!-- Table header and rows -->
                <tr mat-header-row *matHeaderRowDef="departmentColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: departmentColumns;"></tr>
              </table>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Right Column: Quick Stats & Actions -->
        <div class="space-y-6">
          
          <!-- Subscription Status Card -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Subscription Status</mat-card-title>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-neutral-500">Plan Type</span>
                  <span class="font-medium">{{ subscription().planType }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-500">Credits/Employee</span>
                  <span class="font-medium">{{ subscription().creditsPerEmployee }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-500">Renewal Date</span>
                  <span class="font-medium">{{ subscription().renewalDate }}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-500">Status</span>
                  <mat-chip class="bg-success-100 text-success-600">Active</mat-chip>
                </div>
              </div>
              
              <button mat-stroked-button color="primary" class="w-full mt-4"
                      routerLink="/hr/subscription">
                Manage Subscription
              </button>
            </mat-card-content>
          </mat-card>

          <!-- Quick Actions Card -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <div class="space-y-2">
                <button mat-stroked-button class="w-full justify-start" 
                        routerLink="/hr/employees">
                  <mat-icon>person_add</mat-icon>
                  Add Employees
                </button>
                <button mat-stroked-button class="w-full justify-start"
                        routerLink="/hr/reports">
                  <mat-icon>download</mat-icon>
                  Export Report
                </button>
                <button mat-stroked-button class="w-full justify-start">
                  <mat-icon>email</mat-icon>
                  Send Reminder
                </button>
              </div>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- ================================================ -->
      <!-- RECENT ACTIVITY SECTION                          -->
      <!-- ================================================ -->
      <mat-card class="mt-6">
        <mat-card-header>
          <mat-card-title>Recent Activity</mat-card-title>
          <mat-card-subtitle>Latest enrollments and bookings</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="pt-4">
          <div class="activity-list space-y-4">
            <div *ngFor="let activity of recentActivity()" 
                 class="activity-item flex items-center gap-4 p-3 rounded-lg bg-neutral-50">
              
              <!-- Activity icon -->
              <div class="activity-icon p-2 rounded-full"
                   [ngClass]="{
                     'bg-primary-100': activity.type === 'enrollment',
                     'bg-accent-100': activity.type === 'booking',
                     'bg-success-100': activity.type === 'completion'
                   }">
                <mat-icon [ngClass]="{
                  'text-primary-600': activity.type === 'enrollment',
                  'text-accent-600': activity.type === 'booking',
                  'text-success-600': activity.type === 'completion'
                }">
                  {{ activity.icon }}
                </mat-icon>
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
        </mat-card-content>
      </mat-card>
    </div>
  `,
  
  // Inline styles with detailed comments
  styles: [`
    /* Page header layout */
    .page-header {
      display: flex;                       /* Flexbox row */
      justify-content: space-between;      /* Space items apart */
      align-items: flex-start;             /* Align to top */
      flex-wrap: wrap;                     /* Wrap on small screens */
      gap: 1rem;                           /* Gap between items */
    }

    /* Metric card styling */
    .metric-card {
      text-align: center;                  /* Center content */
    }

    .metric-card mat-card-content {
      padding: 1.5rem;                     /* Inner padding */
    }

    .metric-icon {
      width: 48px;                         /* Icon container size */
      height: 48px;
      border-radius: 50%;                  /* Circular shape */
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 1rem;                 /* Center with bottom margin */
    }

    .metric-value {
      font-size: 2rem;                     /* Large number */
      font-weight: 700;                    /* Bold */
      color: #2d3748;                      /* Dark gray */
      line-height: 1;                      /* Tight line height */
    }

    .metric-label {
      font-size: 0.875rem;                 /* Small text */
      color: #718096;                      /* Gray */
      margin: 0.5rem 0;                    /* Vertical margin */
    }

    .metric-change {
      font-size: 0.75rem;                  /* Extra small */
      color: #718096;                      /* Gray */
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.25rem;                        /* Small gap */
    }

    .metric-change.positive {
      color: #38a169;                      /* Green for positive */
    }

    .metric-change mat-icon {
      font-size: 1rem;                     /* Small icon */
      width: 1rem;
      height: 1rem;
    }

    /* Activity item hover effect */
    .activity-item {
      transition: background-color 0.2s;   /* Smooth transition */
    }

    .activity-item:hover {
      background-color: #edf2f7;           /* Slightly darker on hover */
    }

    /* Table styling */
    table {
      width: 100%;                         /* Full width table */
    }

    /* Background color utilities */
    .bg-primary-100 { background-color: rgba(44, 82, 130, 0.1); }
    .bg-accent-100 { background-color: rgba(49, 151, 149, 0.1); }
    .bg-success-100 { background-color: rgba(56, 161, 105, 0.1); }
    .bg-warning-100 { background-color: rgba(237, 137, 54, 0.1); }

    .text-primary-600 { color: #2c5282; }
    .text-accent-600 { color: #319795; }
    .text-success-600 { color: #38a169; }
    .text-warning-600 { color: #ed8936; }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .page-header {
        flex-direction: column;            /* Stack on mobile */
      }
    }
  `]
})
export class HrDashboardComponent implements OnInit {
  // -------------------------------------------------
  // TABLE COLUMN DEFINITIONS
  // -------------------------------------------------
  departmentColumns = ['department', 'employees', 'creditsUsed', 'utilization'];

  // -------------------------------------------------
  // STATE SIGNALS
  // Reactive state for dashboard data
  // -------------------------------------------------
  
  // Company name (would come from API)
  companyName = signal<string>('TechCorp Inc.');

  // Key metrics
  metrics = signal({
    totalEmployees: 156,
    newEmployeesThisMonth: 12,
    totalChildren: 234,
    avgChildrenPerEmployee: 1.5,
    utilizationRate: 72,
    totalBookings: 312
  });

  // Department statistics
  departmentStats = signal<any[]>([]);

  // Subscription info
  subscription = signal({
    planType: 'Premium',
    creditsPerEmployee: 10,
    renewalDate: 'Mar 15, 2024',
    status: 'active'
  });

  // Recent activity feed
  recentActivity = signal<any[]>([]);

  /**
   * Constructor
   * @param authService - Auth service for user data
   */
  constructor(private authService: AuthService) {}

  /**
   * ngOnInit - Load dashboard data
   */
  ngOnInit(): void {
    // Load mock data for demo
    this.loadDepartmentStats();
    this.loadRecentActivity();
  }

  // -------------------------------------------------
  // PRIVATE METHODS
  // Data loading helpers
  // -------------------------------------------------

  /**
   * loadDepartmentStats - Load department utilization data
   */
  private loadDepartmentStats(): void {
    // Mock data for demo
    this.departmentStats.set([
      { name: 'Engineering', employees: 45, creditsUsed: 380, creditsAllocated: 450, utilization: 84 },
      { name: 'Sales', employees: 32, creditsUsed: 240, creditsAllocated: 320, utilization: 75 },
      { name: 'Marketing', employees: 28, creditsUsed: 196, creditsAllocated: 280, utilization: 70 },
      { name: 'Operations', employees: 25, creditsUsed: 150, creditsAllocated: 250, utilization: 60 },
      { name: 'Finance', employees: 18, creditsUsed: 108, creditsAllocated: 180, utilization: 60 },
      { name: 'HR', employees: 8, creditsUsed: 64, creditsAllocated: 80, utilization: 80 }
    ]);
  }

  /**
   * loadRecentActivity - Load activity feed
   */
  private loadRecentActivity(): void {
    // Mock data for demo
    this.recentActivity.set([
      {
        type: 'enrollment',
        icon: 'person_add',
        title: 'New Employee Enrolled',
        description: 'John D. from Engineering joined the program',
        time: '2 hours ago'
      },
      {
        type: 'booking',
        icon: 'event',
        title: 'Activity Booked',
        description: '3 employees booked activities for this weekend',
        time: '4 hours ago'
      },
      {
        type: 'completion',
        icon: 'check_circle',
        title: 'Activities Completed',
        description: '8 activities completed today',
        time: '6 hours ago'
      },
      {
        type: 'enrollment',
        icon: 'child_care',
        title: 'Children Added',
        description: '5 new children profiles created',
        time: 'Yesterday'
      }
    ]);
  }
}
