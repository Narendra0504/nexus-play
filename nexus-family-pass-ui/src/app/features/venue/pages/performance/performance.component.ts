// =====================================================
// NEXUS FAMILY PASS - VENUE PERFORMANCE COMPONENT
// Performance analytics and metrics for venue administrators
// Shows ratings, repeat rates, and improvement suggestions
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';

/**
 * VenuePerformanceComponent - Performance Analytics Page
 * 
 * Displays venue performance metrics including:
 * - Overall performance score
 * - Parent ratings breakdown
 * - Repeat booking rates
 * - Cancellation statistics
 * - Improvement suggestions
 */
@Component({
  // Component selector
  selector: 'app-venue-performance',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatTabsModule,
    MatChipsModule
  ],
  
  // Inline template
  template: `
    <!-- Performance page container -->
    <div class="performance-container p-6">
      
      <!-- Page header -->
      <div class="page-header mb-6">
        <h1 class="text-2xl font-display font-bold text-neutral-800">Performance</h1>
        <p class="text-neutral-500">Track your venue's performance metrics</p>
      </div>

      <!-- Overall score card -->
      <mat-card class="score-card mb-6">
        <mat-card-content class="py-6">
          <div class="flex flex-col md:flex-row items-center gap-8">
            
            <!-- Score gauge -->
            <div class="score-gauge">
              <div class="gauge-circle" [class]="getScoreClass()">
                <span class="score-value">{{ overallScore() }}</span>
                <span class="score-label">/ 100</span>
              </div>
              <p class="text-center text-neutral-500 mt-2">Overall Score</p>
            </div>
            
            <!-- Score factors -->
            <div class="score-factors flex-1 grid grid-cols-2 md:grid-cols-4 gap-4">
              <div *ngFor="let factor of scoreFactors()" class="factor-item text-center">
                <div class="factor-value text-2xl font-bold" [class]="factor.colorClass">
                  {{ factor.value }}
                </div>
                <div class="factor-label text-sm text-neutral-500">{{ factor.label }}</div>
              </div>
            </div>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Metrics tabs -->
      <mat-tab-group animationDuration="200ms">
        
        <!-- Ratings Tab -->
        <mat-tab label="Ratings">
          <div class="tab-content pt-6">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              
              <!-- Rating distribution -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Rating Distribution</mat-card-title>
                  <mat-card-subtitle>Based on {{ totalReviews() }} reviews</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="pt-4">
                  <div class="space-y-3">
                    <div *ngFor="let rating of ratingDistribution()" class="flex items-center gap-3">
                      <span class="w-12 text-sm">{{ rating.stars }} stars</span>
                      <mat-progress-bar mode="determinate" 
                                       [value]="rating.percentage"
                                       class="flex-1">
                      </mat-progress-bar>
                      <span class="w-12 text-sm text-right">{{ rating.percentage }}%</span>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
              
              <!-- Rating trends -->
              <mat-card>
                <mat-card-header>
                  <mat-card-title>Rating Trend</mat-card-title>
                  <mat-card-subtitle>Last 6 months</mat-card-subtitle>
                </mat-card-header>
                <mat-card-content class="pt-4">
                  <!-- Chart placeholder -->
                  <div class="chart-placeholder h-48 bg-neutral-50 rounded-lg flex items-center justify-center">
                    <div class="text-center text-neutral-400">
                      <mat-icon>show_chart</mat-icon>
                      <p class="text-sm">Rating trend chart</p>
                    </div>
                  </div>
                </mat-card-content>
              </mat-card>
            </div>
          </div>
        </mat-tab>
        
        <!-- Bookings Tab -->
        <mat-tab label="Bookings">
          <div class="tab-content pt-6">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <!-- Total bookings -->
              <mat-card class="text-center p-4">
                <div class="text-3xl font-bold text-primary-600">{{ bookingStats().total }}</div>
                <div class="text-sm text-neutral-500">Total Bookings</div>
              </mat-card>
              
              <!-- Repeat rate -->
              <mat-card class="text-center p-4">
                <div class="text-3xl font-bold text-success-600">{{ bookingStats().repeatRate }}%</div>
                <div class="text-sm text-neutral-500">Repeat Rate</div>
              </mat-card>
              
              <!-- Cancellation rate -->
              <mat-card class="text-center p-4">
                <div class="text-3xl font-bold text-warning-600">{{ bookingStats().cancellationRate }}%</div>
                <div class="text-sm text-neutral-500">Cancellation Rate</div>
              </mat-card>
            </div>
            
            <!-- Popular activities -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Top Performing Activities</mat-card-title>
              </mat-card-header>
              <mat-card-content class="pt-4">
                <div class="space-y-4">
                  <div *ngFor="let activity of topActivities(); let i = index" 
                       class="flex items-center gap-4 p-3 bg-neutral-50 rounded-lg">
                    <span class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold">
                      {{ i + 1 }}
                    </span>
                    <div class="flex-1">
                      <div class="font-medium text-neutral-800">{{ activity.name }}</div>
                      <div class="text-sm text-neutral-500">{{ activity.bookings }} bookings</div>
                    </div>
                    <div class="text-right">
                      <div class="flex items-center gap-1 text-warning-500">
                        <mat-icon class="text-base">star</mat-icon>
                        {{ activity.rating }}
                      </div>
                    </div>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <!-- Insights Tab -->
        <mat-tab label="Insights">
          <div class="tab-content pt-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Improvement Suggestions</mat-card-title>
                <mat-card-subtitle>Based on parent feedback and data analysis</mat-card-subtitle>
              </mat-card-header>
              <mat-card-content class="pt-4">
                <div class="space-y-4">
                  <div *ngFor="let insight of insights()" 
                       class="insight-item p-4 rounded-lg"
                       [ngClass]="{
                         'bg-success-50': insight.type === 'positive',
                         'bg-warning-50': insight.type === 'suggestion',
                         'bg-info-50': insight.type === 'tip'
                       }">
                    <div class="flex items-start gap-3">
                      <mat-icon [ngClass]="{
                        'text-success-600': insight.type === 'positive',
                        'text-warning-600': insight.type === 'suggestion',
                        'text-info-600': insight.type === 'tip'
                      }">{{ insight.icon }}</mat-icon>
                      <div>
                        <h4 class="font-medium text-neutral-800">{{ insight.title }}</h4>
                        <p class="text-sm text-neutral-600 mt-1">{{ insight.description }}</p>
                      </div>
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
  
  // Inline styles
  styles: [`
    /* Score gauge styling */
    .score-gauge {
      flex-shrink: 0;
    }
    
    .gauge-circle {
      width: 140px;
      height: 140px;
      border-radius: 50%;
      border: 8px solid;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }
    
    .gauge-circle.excellent {
      border-color: #38a169;
    }
    
    .gauge-circle.good {
      border-color: #3182ce;
    }
    
    .gauge-circle.average {
      border-color: #ed8936;
    }
    
    .score-value {
      font-size: 2.5rem;
      font-weight: 700;
      line-height: 1;
    }
    
    .score-label {
      font-size: 0.875rem;
      color: #718096;
    }
    
    /* Chart placeholder */
    .chart-placeholder {
      border: 2px dashed #e2e8f0;
    }
    
    /* Color utilities */
    .text-primary-600 { color: #2c5282; }
    .text-success-600 { color: #38a169; }
    .text-warning-600 { color: #dd6b20; }
    .text-warning-500 { color: #ed8936; }
    .text-info-600 { color: #3182ce; }
    
    .bg-primary-100 { background-color: rgba(44, 82, 130, 0.1); }
    .bg-success-50 { background-color: rgba(56, 161, 105, 0.05); }
    .bg-warning-50 { background-color: rgba(237, 137, 54, 0.05); }
    .bg-info-50 { background-color: rgba(49, 130, 206, 0.05); }
  `]
})
export class VenuePerformanceComponent implements OnInit {
  // Overall score
  overallScore = signal<number>(92);
  
  // Total reviews
  totalReviews = signal<number>(156);
  
  // Score factors
  scoreFactors = signal<any[]>([]);
  
  // Rating distribution
  ratingDistribution = signal<any[]>([]);
  
  // Booking statistics
  bookingStats = signal({
    total: 1234,
    repeatRate: 65,
    cancellationRate: 3
  });
  
  // Top activities
  topActivities = signal<any[]>([]);
  
  // Insights/suggestions
  insights = signal<any[]>([]);

  /**
   * ngOnInit - Load performance data
   */
  ngOnInit(): void {
    this.loadScoreFactors();
    this.loadRatingDistribution();
    this.loadTopActivities();
    this.loadInsights();
  }

  /**
   * getScoreClass - Get CSS class based on score
   */
  getScoreClass(): string {
    const score = this.overallScore();
    if (score >= 90) return 'excellent';
    if (score >= 70) return 'good';
    return 'average';
  }

  /**
   * loadScoreFactors - Load score breakdown
   */
  private loadScoreFactors(): void {
    this.scoreFactors.set([
      { label: 'Rating', value: '4.8', colorClass: 'text-success-600' },
      { label: 'Repeat Rate', value: '65%', colorClass: 'text-primary-600' },
      { label: 'Response Time', value: '2h', colorClass: 'text-success-600' },
      { label: 'Cancellations', value: '3%', colorClass: 'text-success-600' }
    ]);
  }

  /**
   * loadRatingDistribution - Load rating breakdown
   */
  private loadRatingDistribution(): void {
    this.ratingDistribution.set([
      { stars: 5, percentage: 72 },
      { stars: 4, percentage: 18 },
      { stars: 3, percentage: 6 },
      { stars: 2, percentage: 3 },
      { stars: 1, percentage: 1 }
    ]);
  }

  /**
   * loadTopActivities - Load top performing activities
   */
  private loadTopActivities(): void {
    this.topActivities.set([
      { name: 'Junior Robotics Workshop', bookings: 234, rating: 4.9 },
      { name: 'Coding Fundamentals', bookings: 189, rating: 4.7 },
      { name: 'Game Design for Kids', bookings: 156, rating: 4.8 }
    ]);
  }

  /**
   * loadInsights - Load improvement insights
   */
  private loadInsights(): void {
    this.insights.set([
      { type: 'positive', icon: 'thumb_up', title: 'High Repeat Rate', description: 'Your 65% repeat booking rate is above average! Parents love bringing their children back.' },
      { type: 'suggestion', icon: 'lightbulb', title: 'Consider Weekend Sessions', description: 'Data shows high demand for Saturday morning slots. Consider adding more weekend availability.' },
      { type: 'tip', icon: 'info', title: 'Response Time', description: 'Quick response to inquiries leads to higher booking conversions. Your average is 2 hours - great job!' }
    ]);
  }
}
