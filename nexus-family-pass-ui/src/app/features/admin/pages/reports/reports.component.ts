// =====================================================
// NEXUS FAMILY PASS - ADMIN REPORTS COMPONENT
// Platform admin analytics and reporting dashboard.
// Provides comprehensive platform metrics, trends,
// and exportable reports.
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import FormsModule
import { FormsModule } from '@angular/forms';

// Import Angular Material components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * AdminReportsComponent
 * 
 * Platform-wide analytics and reporting.
 * Features:
 * - Key platform metrics (users, bookings, revenue)
 * - Trend charts (placeholder for chart library)
 * - Company performance leaderboard
 * - Venue performance leaderboard
 * - Category popularity
 * - Exportable reports
 */
@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatTableModule,
    MatProgressBarModule
  ],
  template: `
    <!-- Page container -->
    <div class="reports-container p-6">
      
      <!-- ============================================ -->
      <!-- PAGE HEADER                                  -->
      <!-- ============================================ -->
      <div class="page-header mb-6">
        <div class="header-content">
          <h1 class="page-title">Platform Analytics</h1>
          <p class="page-subtitle">Comprehensive platform performance metrics</p>
        </div>
        
        <div class="header-actions">
          <!-- Time period selector -->
          <mat-form-field appearance="outline" class="period-select">
            <mat-select [(ngModel)]="selectedPeriod" (selectionChange)="loadData()">
              <mat-option value="7d">Last 7 Days</mat-option>
              <mat-option value="30d">Last 30 Days</mat-option>
              <mat-option value="90d">Last 90 Days</mat-option>
              <mat-option value="ytd">Year to Date</mat-option>
            </mat-select>
          </mat-form-field>
          
          <button mat-stroked-button (click)="exportReport()">
            <mat-icon>download</mat-icon>
            Export Report
          </button>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- KEY METRICS                                  -->
      <!-- ============================================ -->
      <div class="metrics-grid mb-6">
        <!-- Total Users -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-header">
              <mat-icon class="metric-icon users">people</mat-icon>
              <span class="metric-change positive">+12%</span>
            </div>
            <div class="metric-value">{{ metrics().totalUsers | number }}</div>
            <div class="metric-label">Total Users</div>
            <mat-progress-bar mode="determinate" [value]="75"></mat-progress-bar>
          </mat-card-content>
        </mat-card>
        
        <!-- Active Subscriptions -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-header">
              <mat-icon class="metric-icon subscriptions">business</mat-icon>
              <span class="metric-change positive">+5%</span>
            </div>
            <div class="metric-value">{{ metrics().activeSubscriptions }}</div>
            <div class="metric-label">Active Subscriptions</div>
            <mat-progress-bar mode="determinate" [value]="60"></mat-progress-bar>
          </mat-card-content>
        </mat-card>
        
        <!-- Total Bookings -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-header">
              <mat-icon class="metric-icon bookings">event</mat-icon>
              <span class="metric-change positive">+18%</span>
            </div>
            <div class="metric-value">{{ metrics().totalBookings | number }}</div>
            <div class="metric-label">Total Bookings</div>
            <mat-progress-bar mode="determinate" [value]="82"></mat-progress-bar>
          </mat-card-content>
        </mat-card>
        
        <!-- Credit Utilization -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-header">
              <mat-icon class="metric-icon credits">toll</mat-icon>
              <span class="metric-change negative">-3%</span>
            </div>
            <div class="metric-value">{{ metrics().creditUtilization }}%</div>
            <div class="metric-label">Credit Utilization</div>
            <mat-progress-bar mode="determinate" [value]="metrics().creditUtilization"></mat-progress-bar>
          </mat-card-content>
        </mat-card>
        
        <!-- Active Venues -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-header">
              <mat-icon class="metric-icon venues">storefront</mat-icon>
              <span class="metric-change positive">+8%</span>
            </div>
            <div class="metric-value">{{ metrics().activeVenues }}</div>
            <div class="metric-label">Active Venues</div>
            <mat-progress-bar mode="determinate" [value]="68"></mat-progress-bar>
          </mat-card-content>
        </mat-card>
        
        <!-- Satisfaction Score -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="metric-header">
              <mat-icon class="metric-icon satisfaction">sentiment_satisfied</mat-icon>
              <span class="metric-change positive">+2%</span>
            </div>
            <div class="metric-value">{{ metrics().satisfactionScore }}</div>
            <div class="metric-label">Avg. Rating</div>
            <mat-progress-bar mode="determinate" [value]="metrics().satisfactionScore * 20"></mat-progress-bar>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- ============================================ -->
      <!-- TABBED REPORTS                               -->
      <!-- ============================================ -->
      <mat-tab-group>
        
        <!-- ======================================== -->
        <!-- TAB: COMPANY PERFORMANCE                 -->
        <!-- ======================================== -->
        <mat-tab label="Company Performance">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Top Companies by Engagement</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="companyPerformance()" class="performance-table">
                  
                  <!-- Rank -->
                  <ng-container matColumnDef="rank">
                    <th mat-header-cell *matHeaderCellDef>#</th>
                    <td mat-cell *matCellDef="let item; let i = index">{{ i + 1 }}</td>
                  </ng-container>
                  
                  <!-- Company -->
                  <ng-container matColumnDef="company">
                    <th mat-header-cell *matHeaderCellDef>Company</th>
                    <td mat-cell *matCellDef="let item">{{ item.name }}</td>
                  </ng-container>
                  
                  <!-- Employees -->
                  <ng-container matColumnDef="employees">
                    <th mat-header-cell *matHeaderCellDef>Employees</th>
                    <td mat-cell *matCellDef="let item">{{ item.employees }}</td>
                  </ng-container>
                  
                  <!-- Bookings -->
                  <ng-container matColumnDef="bookings">
                    <th mat-header-cell *matHeaderCellDef>Bookings</th>
                    <td mat-cell *matCellDef="let item">{{ item.bookings }}</td>
                  </ng-container>
                  
                  <!-- Utilization -->
                  <ng-container matColumnDef="utilization">
                    <th mat-header-cell *matHeaderCellDef>Utilization</th>
                    <td mat-cell *matCellDef="let item">
                      <div class="utilization-cell">
                        <mat-progress-bar mode="determinate" [value]="item.utilization"></mat-progress-bar>
                        <span>{{ item.utilization }}%</span>
                      </div>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="companyColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: companyColumns;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ======================================== -->
        <!-- TAB: VENUE PERFORMANCE                   -->
        <!-- ======================================== -->
        <mat-tab label="Venue Performance">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Top Venues by Bookings</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <table mat-table [dataSource]="venuePerformance()" class="performance-table">
                  
                  <!-- Rank -->
                  <ng-container matColumnDef="rank">
                    <th mat-header-cell *matHeaderCellDef>#</th>
                    <td mat-cell *matCellDef="let item; let i = index">{{ i + 1 }}</td>
                  </ng-container>
                  
                  <!-- Venue -->
                  <ng-container matColumnDef="venue">
                    <th mat-header-cell *matHeaderCellDef>Venue</th>
                    <td mat-cell *matCellDef="let item">{{ item.name }}</td>
                  </ng-container>
                  
                  <!-- Category -->
                  <ng-container matColumnDef="category">
                    <th mat-header-cell *matHeaderCellDef>Category</th>
                    <td mat-cell *matCellDef="let item">{{ item.category }}</td>
                  </ng-container>
                  
                  <!-- Bookings -->
                  <ng-container matColumnDef="bookings">
                    <th mat-header-cell *matHeaderCellDef>Bookings</th>
                    <td mat-cell *matCellDef="let item">{{ item.bookings }}</td>
                  </ng-container>
                  
                  <!-- Rating -->
                  <ng-container matColumnDef="rating">
                    <th mat-header-cell *matHeaderCellDef>Rating</th>
                    <td mat-cell *matCellDef="let item">
                      <div class="rating-cell">
                        <mat-icon>star</mat-icon>
                        <span>{{ item.rating }}</span>
                      </div>
                    </td>
                  </ng-container>
                  
                  <tr mat-header-row *matHeaderRowDef="venueColumns"></tr>
                  <tr mat-row *matRowDef="let row; columns: venueColumns;"></tr>
                </table>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ======================================== -->
        <!-- TAB: CATEGORY INSIGHTS                   -->
        <!-- ======================================== -->
        <mat-tab label="Category Insights">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Bookings by Category</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <div class="category-list">
                  <div 
                    *ngFor="let category of categoryInsights()"
                    class="category-item">
                    <div class="category-info">
                      <mat-icon [style.color]="category.color">{{ category.icon }}</mat-icon>
                      <span class="category-name">{{ category.name }}</span>
                    </div>
                    <div class="category-stats">
                      <span class="category-bookings">{{ category.bookings }} bookings</span>
                      <span class="category-percent">{{ category.percentage }}%</span>
                    </div>
                    <mat-progress-bar 
                      mode="determinate" 
                      [value]="category.percentage"
                      [style.--mdc-linear-progress-active-indicator-color]="category.color">
                    </mat-progress-bar>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ======================================== -->
        <!-- TAB: TRENDS                              -->
        <!-- ======================================== -->
        <mat-tab label="Trends">
          <div class="tab-content">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Platform Trends</mat-card-title>
              </mat-card-header>
              <mat-card-content>
                <!-- Placeholder for charts -->
                <div class="chart-placeholder">
                  <mat-icon>show_chart</mat-icon>
                  <p>Chart visualization would be rendered here</p>
                  <p class="hint">Integration with Chart.js or similar library</p>
                </div>
                
                <!-- Trend summary cards -->
                <div class="trend-cards">
                  <div class="trend-card positive">
                    <mat-icon>trending_up</mat-icon>
                    <div class="trend-info">
                      <span class="trend-label">Booking Growth</span>
                      <span class="trend-value">+23% vs last period</span>
                    </div>
                  </div>
                  <div class="trend-card positive">
                    <mat-icon>trending_up</mat-icon>
                    <div class="trend-info">
                      <span class="trend-label">New Users</span>
                      <span class="trend-value">+156 this week</span>
                    </div>
                  </div>
                  <div class="trend-card negative">
                    <mat-icon>trending_down</mat-icon>
                    <div class="trend-info">
                      <span class="trend-label">Cancellation Rate</span>
                      <span class="trend-value">-2.5% (improving)</span>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    /* Container */
    .reports-container {
      max-width: 1200px;
      margin: 0 auto;
    }

    /* Page header */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .page-title {
      font-size: 1.5rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0;
    }

    .page-subtitle {
      color: #718096;
      margin: 0.25rem 0 0;
    }

    .header-actions {
      display: flex;
      gap: 1rem;
      align-items: center;
    }

    .period-select {
      width: 150px;
    }

    /* Metrics grid */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(6, 1fr);
      gap: 1rem;
    }

    .metric-card mat-card-content {
      padding: 1rem !important;
    }

    .metric-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.5rem;
    }

    .metric-icon {
      font-size: 1.5rem;
      width: 1.5rem;
      height: 1.5rem;
    }

    .metric-icon.users { color: #2c5282; }
    .metric-icon.subscriptions { color: #805ad5; }
    .metric-icon.bookings { color: #38a169; }
    .metric-icon.credits { color: #d69e2e; }
    .metric-icon.venues { color: #319795; }
    .metric-icon.satisfaction { color: #ed8936; }

    .metric-change {
      font-size: 0.75rem;
      font-weight: 600;
      padding: 0.125rem 0.375rem;
      border-radius: 4px;
    }

    .metric-change.positive {
      background: #c6f6d5;
      color: #22543d;
    }

    .metric-change.negative {
      background: #fed7d7;
      color: #742a2a;
    }

    .metric-value {
      font-size: 1.75rem;
      font-weight: 700;
      color: #2d3748;
    }

    .metric-label {
      font-size: 0.75rem;
      color: #718096;
      margin-bottom: 0.5rem;
    }

    /* Tab content */
    .tab-content {
      padding: 1.5rem 0;
    }

    /* Performance tables */
    .performance-table {
      width: 100%;
    }

    .utilization-cell {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .utilization-cell mat-progress-bar {
      width: 100px;
    }

    .rating-cell {
      display: flex;
      align-items: center;
      gap: 0.25rem;
    }

    .rating-cell mat-icon {
      font-size: 1rem;
      width: 1rem;
      height: 1rem;
      color: #f6ad55;
    }

    /* Category list */
    .category-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .category-item {
      padding: 1rem;
      background: #f7fafc;
      border-radius: 8px;
    }

    .category-info {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.5rem;
    }

    .category-name {
      font-weight: 500;
      color: #2d3748;
    }

    .category-stats {
      display: flex;
      justify-content: space-between;
      font-size: 0.875rem;
      color: #718096;
      margin-bottom: 0.5rem;
    }

    /* Chart placeholder */
    .chart-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 200px;
      background: #f7fafc;
      border-radius: 8px;
      color: #a0aec0;
      margin-bottom: 1.5rem;
    }

    .chart-placeholder mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
      margin-bottom: 0.5rem;
    }

    .chart-placeholder .hint {
      font-size: 0.75rem;
    }

    /* Trend cards */
    .trend-cards {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
    }

    .trend-card {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 1rem;
      border-radius: 8px;
    }

    .trend-card.positive {
      background: #f0fff4;
    }

    .trend-card.positive mat-icon {
      color: #38a169;
    }

    .trend-card.negative {
      background: #fff5f5;
    }

    .trend-card.negative mat-icon {
      color: #e53e3e;
    }

    .trend-info {
      display: flex;
      flex-direction: column;
    }

    .trend-label {
      font-size: 0.75rem;
      color: #718096;
    }

    .trend-value {
      font-weight: 500;
      color: #2d3748;
    }

    /* Responsive */
    @media (max-width: 1024px) {
      .metrics-grid {
        grid-template-columns: repeat(3, 1fr);
      }

      .trend-cards {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .page-header {
        flex-direction: column;
        gap: 1rem;
      }
    }
  `]
})
export class AdminReportsComponent implements OnInit {
  // -------------------------------------------------
  // STATE
  // -------------------------------------------------
  
  selectedPeriod: string = '30d';
  
  metrics = signal({
    totalUsers: 2847,
    activeSubscriptions: 48,
    totalBookings: 12543,
    creditUtilization: 73,
    activeVenues: 156,
    satisfactionScore: 4.6
  });
  
  companyPerformance = signal([
    { name: 'Acme Corp', employees: 245, bookings: 1234, utilization: 85 },
    { name: 'TechCorp', employees: 189, bookings: 987, utilization: 78 },
    { name: 'StartupXYZ', employees: 67, bookings: 432, utilization: 92 },
    { name: 'BigCo Inc', employees: 512, bookings: 2341, utilization: 65 },
    { name: 'InnovateCo', employees: 134, bookings: 654, utilization: 71 }
  ]);
  
  venuePerformance = signal([
    { name: 'Code Ninjas West', category: 'STEM', bookings: 456, rating: 4.8 },
    { name: 'Art Studio Plus', category: 'Arts', bookings: 389, rating: 4.7 },
    { name: 'Sports Academy', category: 'Sports', bookings: 367, rating: 4.5 },
    { name: 'Music World', category: 'Music', bookings: 298, rating: 4.9 },
    { name: 'Dance Studio', category: 'Dance', bookings: 234, rating: 4.6 }
  ]);
  
  categoryInsights = signal([
    { name: 'STEM', icon: 'science', color: '#2c5282', bookings: 3421, percentage: 27 },
    { name: 'Arts & Crafts', icon: 'palette', color: '#805ad5', bookings: 2987, percentage: 24 },
    { name: 'Sports', icon: 'sports_soccer', color: '#38a169', bookings: 2543, percentage: 20 },
    { name: 'Music', icon: 'music_note', color: '#d69e2e', bookings: 1876, percentage: 15 },
    { name: 'Dance', icon: 'directions_run', color: '#ed64a6', bookings: 1098, percentage: 9 },
    { name: 'Other', icon: 'more_horiz', color: '#718096', bookings: 618, percentage: 5 }
  ]);
  
  companyColumns = ['rank', 'company', 'employees', 'bookings', 'utilization'];
  venueColumns = ['rank', 'venue', 'category', 'bookings', 'rating'];

  ngOnInit(): void {
    this.loadData();
  }

  loadData(): void {
    console.log('[AdminReports] Loading data for period:', this.selectedPeriod);
    // TODO: Load data from API based on selected period
  }

  exportReport(): void {
    console.log('[AdminReports] Exporting report...');
  }
}
