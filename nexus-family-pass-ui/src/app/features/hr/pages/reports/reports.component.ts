// =====================================================
// NEXUS FAMILY PASS - HR REPORTS COMPONENT
// Analytics and reporting page for HR administrators
// Shows usage trends, category breakdown, and ROI metrics
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';

/**
 * ReportsComponent - HR Analytics & Reports Page
 * 
 * Provides HR administrators with:
 * - Usage trends over time (chart placeholder)
 * - Category breakdown of activities
 * - Department comparison
 * - Exportable reports
 */
@Component({
  // Component selector
  selector: 'app-hr-reports',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTabsModule,
    MatTableModule
  ],
  
  // Inline template
  template: `
    <!-- Reports page container -->
    <div class="reports-container p-6">
      
      <!-- ================================================ -->
      <!-- PAGE HEADER                                      -->
      <!-- ================================================ -->
      <div class="page-header flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-display font-bold text-neutral-800">Reports & Analytics</h1>
          <p class="text-neutral-500">Track usage trends and ROI metrics</p>
        </div>
        
        <div class="flex gap-2 items-center">
          <!-- Date range selector -->
          <mat-form-field appearance="outline" class="w-40">
            <mat-label>Period</mat-label>
            <mat-select [(ngModel)]="selectedPeriod">
              <mat-option value="week">This Week</mat-option>
              <mat-option value="month">This Month</mat-option>
              <mat-option value="quarter">This Quarter</mat-option>
              <mat-option value="year">This Year</mat-option>
            </mat-select>
          </mat-form-field>
          
          <!-- Export button -->
          <button mat-raised-button color="primary" (click)="exportReport()">
            <mat-icon>download</mat-icon>
            Export Report
          </button>
        </div>
      </div>

      <!-- ================================================ -->
      <!-- REPORT TABS                                      -->
      <!-- ================================================ -->
      <mat-tab-group animationDuration="200ms">
        
        <!-- Overview Tab -->
        <mat-tab label="Overview">
          <div class="tab-content pt-6">
            
            <!-- Summary metrics row -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <mat-card *ngFor="let metric of summaryMetrics()" class="text-center p-4">
                <div class="text-3xl font-bold text-primary-600">{{ metric.value }}</div>
                <div class="text-sm text-neutral-500 mt-1">{{ metric.label }}</div>
                <div class="text-xs mt-2" [ngClass]="metric.change >= 0 ? 'text-success-600' : 'text-danger-500'">
                  <mat-icon class="text-sm align-middle">{{ metric.change >= 0 ? 'trending_up' : 'trending_down' }}</mat-icon>
                  {{ metric.change >= 0 ? '+' : '' }}{{ metric.change }}% vs last period
                </div>
              </mat-card>
            </div>
            
            <!-- Usage trend chart placeholder -->
            <mat-card class="mb-6">
              <mat-card-header>
                <mat-card-title>Usage Trend</mat-card-title>
                <mat-card-subtitle>Activities booked over time</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content class="pt-4">
                <!-- Chart placeholder - would use ng2-charts or similar -->
                <div class="chart-placeholder h-64 bg-neutral-50 rounded-lg flex items-center justify-center">
                  <div class="text-center text-neutral-400">
                    <mat-icon class="scale-150 mb-2">show_chart</mat-icon>
                    <p>Usage trend chart</p>
                    <p class="text-sm">Integration with charting library needed</p>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
            
            <!-- Category and department breakdown -->
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <!-- Category breakdown -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Activity Categories</mat-card-title>
                  <mat-card-subtitle>Breakdown by category</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="pt-4">
                  <div class="space-y-3">
                    <div *ngFor="let cat of categoryBreakdown()" class="flex items-center gap-3">
                      <div class="w-24 text-sm text-neutral-600">{{ cat.name }}</div>
                      <div class="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden">
                        <div class="h-full bg-primary-500 rounded-full" 
                             [style.width.%]="cat.percentage">
                        </div>
                      </div>
                      <div class="w-12 text-sm text-right text-neutral-600">{{ cat.percentage }}%</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <!-- Department breakdown -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Department Engagement</mat-card-title>
                  <mat-card-subtitle>Top participating departments</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="pt-4">
                  <div class="space-y-3">
                    <div *ngFor="let dept of departmentBreakdown()" class="flex items-center gap-3">
                      <div class="w-24 text-sm text-neutral-600">{{ dept.name }}</div>
                      <div class="flex-1 h-6 bg-neutral-100 rounded-full overflow-hidden">
                        <div class="h-full bg-accent-500 rounded-full" 
                             [style.width.%]="dept.utilization">
                        </div>
                      </div>
                      <div class="w-12 text-sm text-right text-neutral-600">{{ dept.utilization }}%</div>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
        
        <!-- Detailed Reports Tab -->
        <mat-tab label="Detailed Reports">
          <div class="tab-content pt-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Available Reports</mat-card-title>
                <mat-card-subtitle>Download detailed reports</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content class="pt-4">
                <div class="space-y-4">
                  <div *ngFor="let report of availableReports()" 
                       class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div class="flex items-center gap-4">
                      <mat-icon class="text-primary-600">description</mat-icon>
                      <div>
                        <div class="font-medium text-neutral-800">{{ report.name }}</div>
                        <div class="text-sm text-neutral-500">{{ report.description }}</div>
                      </div>
                    </div>
                    <button mat-stroked-button color="primary" (click)="downloadReport(report.id)">
                      <mat-icon>download</mat-icon>
                      Download
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  
  // Inline styles
  styles: [`
    .bg-primary-500 { background-color: #2c5282; }
    .bg-accent-500 { background-color: #319795; }
    .text-primary-600 { color: #2c5282; }
    .text-success-600 { color: #38a169; }
    .text-danger-500 { color: #e53e3e; }
    
    .chart-placeholder {
      border: 2px dashed #e2e8f0;
    }
  `]
})
export class ReportsComponent implements OnInit {
  // -------------------------------------------------
  // STATE
  // -------------------------------------------------
  selectedPeriod = 'month';
  
  // Summary metrics
  summaryMetrics = signal<any[]>([]);
  
  // Category breakdown
  categoryBreakdown = signal<any[]>([]);
  
  // Department breakdown
  departmentBreakdown = signal<any[]>([]);
  
  // Available reports
  availableReports = signal<any[]>([]);

  /**
   * ngOnInit - Load report data
   */
  ngOnInit(): void {
    this.loadSummaryMetrics();
    this.loadCategoryBreakdown();
    this.loadDepartmentBreakdown();
    this.loadAvailableReports();
  }

  /**
   * exportReport - Export current report
   */
  exportReport(): void {
    console.log('[Reports] Exporting report for period:', this.selectedPeriod);
  }

  /**
   * downloadReport - Download specific report
   */
  downloadReport(reportId: string): void {
    console.log('[Reports] Downloading report:', reportId);
  }

  // Private data loading methods
  private loadSummaryMetrics(): void {
    this.summaryMetrics.set([
      { label: 'Total Bookings', value: '312', change: 12 },
      { label: 'Utilization Rate', value: '72%', change: 5 },
      { label: 'Active Employees', value: '148', change: 8 },
      { label: 'Avg Credits Used', value: '7.2', change: -2 }
    ]);
  }

  private loadCategoryBreakdown(): void {
    this.categoryBreakdown.set([
      { name: 'STEM', percentage: 35 },
      { name: 'Sports', percentage: 25 },
      { name: 'Arts', percentage: 20 },
      { name: 'Music', percentage: 12 },
      { name: 'Other', percentage: 8 }
    ]);
  }

  private loadDepartmentBreakdown(): void {
    this.departmentBreakdown.set([
      { name: 'Engineering', utilization: 84 },
      { name: 'HR', utilization: 80 },
      { name: 'Sales', utilization: 75 },
      { name: 'Marketing', utilization: 70 },
      { name: 'Finance', utilization: 60 }
    ]);
  }

  private loadAvailableReports(): void {
    this.availableReports.set([
      { id: 'usage', name: 'Usage Report', description: 'Monthly usage summary by employee' },
      { id: 'credits', name: 'Credits Report', description: 'Credit allocation and consumption' },
      { id: 'roi', name: 'ROI Analysis', description: 'Return on investment metrics' },
      { id: 'engagement', name: 'Engagement Report', description: 'Employee engagement trends' }
    ]);
  }
}
