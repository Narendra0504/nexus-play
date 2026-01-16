// =====================================================
// NEXUS FAMILY PASS - VENUE DASHBOARD COMPONENT
// Main dashboard for venue administrators showing
// booking overview, performance metrics, and calendar
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
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatBadgeModule } from '@angular/material/badge';

// Import AuthService
import { AuthService } from '../../../../core/services/auth.service';

/**
 * VenueDashboardComponent - Venue Admin Portal Dashboard
 * 
 * Provides venue administrators with:
 * - Today's session overview
 * - Performance score summary
 * - Upcoming bookings calendar
 * - Quick actions for common tasks
 */
@Component({
  // Component selector
  selector: 'app-venue-dashboard',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatBadgeModule
  ],
  
  // Inline template
  template: `
    <!-- Venue Dashboard container -->
    <div class="dashboard-container p-6">
      
      <!-- ================================================ -->
      <!-- WELCOME HEADER                                   -->
      <!-- ================================================ -->
      <div class="welcome-header mb-6">
        <h1 class="text-2xl font-display font-bold text-neutral-800">
          Welcome back, {{ venueName() }}!
        </h1>
        <p class="text-neutral-500">{{ currentDate() }}</p>
      </div>

      <!-- ================================================ -->
      <!-- METRICS ROW                                      -->
      <!-- ================================================ -->
      <div class="metrics-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        <!-- Today's Sessions -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="flex items-center gap-3">
              <div class="metric-icon bg-primary-100">
                <mat-icon class="text-primary-600">today</mat-icon>
              </div>
              <div>
                <div class="metric-value">{{ metrics().todaySessions }}</div>
                <div class="metric-label">Sessions Today</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Total Bookings This Week -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="flex items-center gap-3">
              <div class="metric-icon bg-accent-100">
                <mat-icon class="text-accent-600">event</mat-icon>
              </div>
              <div>
                <div class="metric-value">{{ metrics().weeklyBookings }}</div>
                <div class="metric-label">Bookings This Week</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Performance Score -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="flex items-center gap-3">
              <div class="metric-icon bg-success-100">
                <mat-icon class="text-success-600">star</mat-icon>
              </div>
              <div>
                <div class="metric-value">{{ metrics().performanceScore }}</div>
                <div class="metric-label">Performance Score</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>

        <!-- Pending Actions -->
        <mat-card class="metric-card">
          <mat-card-content>
            <div class="flex items-center gap-3">
              <div class="metric-icon bg-warning-100">
                <mat-icon class="text-warning-600">pending_actions</mat-icon>
              </div>
              <div>
                <div class="metric-value">{{ metrics().pendingActions }}</div>
                <div class="metric-label">Pending Actions</div>
              </div>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- ================================================ -->
      <!-- MAIN CONTENT GRID                                -->
      <!-- ================================================ -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        <!-- Left column: Today's Sessions (spans 2 cols) -->
        <div class="lg:col-span-2">
          <mat-card>
            <mat-card-header>
              <mat-card-title>Today's Sessions</mat-card-title>
              <mat-card-subtitle>{{ currentDateShort() }}</mat-card-subtitle>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <div class="space-y-4">
                <div *ngFor="let session of todaySessions()" 
                     class="session-item flex items-center gap-4 p-4 bg-neutral-50 rounded-lg">
                  
                  <!-- Time badge -->
                  <div class="time-badge text-center bg-white p-2 rounded-lg shadow-sm min-w-[70px]">
                    <div class="text-lg font-bold text-primary-600">{{ session.time }}</div>
                  </div>
                  
                  <!-- Session details -->
                  <div class="flex-1">
                    <h4 class="font-medium text-neutral-800">{{ session.activityName }}</h4>
                    <p class="text-sm text-neutral-500">
                      {{ session.booked }} / {{ session.capacity }} booked
                    </p>
                  </div>
                  
                  <!-- Status chip -->
                  <mat-chip [ngClass]="{
                    'bg-success-100 text-success-600': session.status === 'confirmed',
                    'bg-warning-100 text-warning-600': session.status === 'pending'
                  }">
                    {{ session.status | titlecase }}
                  </mat-chip>
                  
                  <!-- Action button -->
                  <button mat-stroked-button color="primary" 
                          [routerLink]="['/venue/bookings', session.id]">
                    Manage
                  </button>
                </div>
                
                <!-- Empty state -->
                <div *ngIf="todaySessions().length === 0" 
                     class="text-center py-8 text-neutral-400">
                  <mat-icon class="scale-150 mb-2">event_available</mat-icon>
                  <p>No sessions scheduled for today</p>
                </div>
              </div>
              
              <div class="mt-4 text-center">
                <a routerLink="/venue/bookings" class="text-primary-600 hover:underline">
                  View Full Calendar →
                </a>
              </div>
            </mat-card-content>
          </mat-card>
        </div>

        <!-- Right column: Quick Actions & Performance -->
        <div class="space-y-6">
          
          <!-- Quick Actions Card -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Quick Actions</mat-card-title>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <div class="space-y-2">
                <button mat-stroked-button class="w-full justify-start" 
                        routerLink="/venue/activities/new">
                  <mat-icon>add_circle</mat-icon>
                  Add New Activity
                </button>
                <button mat-stroked-button class="w-full justify-start"
                        routerLink="/venue/bookings">
                  <mat-icon>calendar_today</mat-icon>
                  View Calendar
                </button>
                <button mat-stroked-button class="w-full justify-start"
                        routerLink="/venue/performance">
                  <mat-icon>insights</mat-icon>
                  View Performance
                </button>
                <button mat-stroked-button class="w-full justify-start"
                        routerLink="/venue/settings">
                  <mat-icon>settings</mat-icon>
                  Venue Settings
                </button>
              </div>
            </mat-card-content>
          </mat-card>

          <!-- Performance Summary Card -->
          <mat-card>
            <mat-card-header>
              <mat-card-title>Performance Summary</mat-card-title>
            </mat-card-header>
            
            <mat-card-content class="pt-4">
              <div class="text-center mb-4">
                <!-- Score gauge placeholder -->
                <div class="w-24 h-24 rounded-full border-8 border-success-500 
                            flex items-center justify-center mx-auto">
                  <span class="text-2xl font-bold text-neutral-800">
                    {{ performance().overallScore }}
                  </span>
                </div>
                <p class="text-sm text-neutral-500 mt-2">Overall Score</p>
              </div>
              
              <div class="space-y-3 text-sm">
                <div class="flex justify-between">
                  <span class="text-neutral-500">Parent Ratings</span>
                  <span class="font-medium">{{ performance().ratings }}/5</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-500">Repeat Bookings</span>
                  <span class="font-medium">{{ performance().repeatRate }}%</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-neutral-500">Cancellation Rate</span>
                  <span class="font-medium">{{ performance().cancellationRate }}%</span>
                </div>
              </div>
              
              <a routerLink="/venue/performance" 
                 class="block text-center text-primary-600 hover:underline mt-4 text-sm">
                View Detailed Analytics →
              </a>
            </mat-card-content>
          </mat-card>
        </div>
      </div>

      <!-- ================================================ -->
      <!-- RECENT REVIEWS                                   -->
      <!-- ================================================ -->
      <mat-card class="mt-6">
        <mat-card-header>
          <mat-card-title>Recent Reviews</mat-card-title>
          <mat-card-subtitle>What parents are saying</mat-card-subtitle>
        </mat-card-header>
        
        <mat-card-content class="pt-4">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div *ngFor="let review of recentReviews()" 
                 class="review-card p-4 bg-neutral-50 rounded-lg">
              
              <!-- Rating stars -->
              <div class="flex items-center gap-1 mb-2">
                <mat-icon *ngFor="let star of [1,2,3,4,5]"
                          [class]="star <= review.rating ? 'text-warning-500' : 'text-neutral-300'">
                  star
                </mat-icon>
              </div>
              
              <!-- Review text -->
              <p class="text-neutral-600 text-sm mb-2">{{ review.text }}</p>
              
              <!-- Activity and date -->
              <div class="text-xs text-neutral-400">
                {{ review.activityName }} • {{ review.date }}
              </div>
            </div>
          </div>
          
          <!-- Empty state -->
          <div *ngIf="recentReviews().length === 0" 
               class="text-center py-8 text-neutral-400">
            <mat-icon class="scale-150 mb-2">rate_review</mat-icon>
            <p>No reviews yet</p>
          </div>
        </mat-card-content>
      </mat-card>
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

    /* Color utilities */
    .bg-primary-100 { background-color: rgba(44, 82, 130, 0.1); }
    .bg-accent-100 { background-color: rgba(49, 151, 149, 0.1); }
    .bg-success-100 { background-color: rgba(56, 161, 105, 0.1); }
    .bg-warning-100 { background-color: rgba(237, 137, 54, 0.1); }

    .text-primary-600 { color: #2c5282; }
    .text-accent-600 { color: #319795; }
    .text-success-600 { color: #38a169; }
    .text-warning-600 { color: #ed8936; }
    .text-warning-500 { color: #ed8936; }
    
    .border-success-500 { border-color: #38a169; }

    /* Session item hover */
    .session-item {
      transition: background-color 0.2s;
    }
    .session-item:hover {
      background-color: #edf2f7;
    }
  `]
})
export class VenueDashboardComponent implements OnInit {
  // -------------------------------------------------
  // STATE SIGNALS
  // -------------------------------------------------
  
  // Venue name
  venueName = signal<string>('Code Ninjas West');

  // Metrics
  metrics = signal({
    todaySessions: 4,
    weeklyBookings: 28,
    performanceScore: 92,
    pendingActions: 2
  });

  // Today's sessions
  todaySessions = signal<any[]>([]);

  // Performance summary
  performance = signal({
    overallScore: 92,
    ratings: 4.8,
    repeatRate: 65,
    cancellationRate: 3
  });

  // Recent reviews
  recentReviews = signal<any[]>([]);

  /**
   * Constructor
   */
  constructor(private authService: AuthService) {}

  /**
   * ngOnInit - Load dashboard data
   */
  ngOnInit(): void {
    this.loadTodaySessions();
    this.loadRecentReviews();
  }

  /**
   * currentDate - Get formatted current date
   */
  currentDate(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  /**
   * currentDateShort - Get short date format
   */
  currentDateShort(): string {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  // -------------------------------------------------
  // PRIVATE METHODS
  // -------------------------------------------------

  private loadTodaySessions(): void {
    this.todaySessions.set([
      { id: 'ses_001', activityName: 'Junior Robotics', time: '10:00 AM', booked: 8, capacity: 10, status: 'confirmed' },
      { id: 'ses_002', activityName: 'Coding Fundamentals', time: '2:00 PM', booked: 6, capacity: 8, status: 'confirmed' },
      { id: 'ses_003', activityName: 'Game Design Workshop', time: '4:00 PM', booked: 5, capacity: 10, status: 'pending' }
    ]);
  }

  private loadRecentReviews(): void {
    this.recentReviews.set([
      { rating: 5, text: 'My daughter loved the robotics class! Great instructors.', activityName: 'Junior Robotics', date: '2 days ago' },
      { rating: 4, text: 'Fun coding class, wish it was a bit longer.', activityName: 'Coding Fundamentals', date: '5 days ago' },
      { rating: 5, text: 'Amazing experience! Will definitely book again.', activityName: 'Game Design', date: '1 week ago' }
    ]);
  }
}
