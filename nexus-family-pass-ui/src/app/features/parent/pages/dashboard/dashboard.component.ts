// =====================================================
// NEXUS FAMILY PASS - PARENT DASHBOARD COMPONENT
// Main dashboard for parent users showing credits,
// curated suggestions, upcoming bookings, and quick actions
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
import { MatChipsModule } from '@angular/material/chips';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';

// Import models
import { CurationSuggestion, Booking, CreditSummary } from '../../../../core/models';

// Import services
import { AuthService } from '../../../../core/services/auth.service';

/**
 * DashboardComponent - Parent Portal Main Dashboard
 * 
 * This is the main landing page for parent users featuring:
 * - Welcome banner with user greeting
 * - Credit summary with usage progress
 * - Monthly curated activity suggestions carousel
 * - Upcoming bookings list
 * - Quick action cards for common tasks
 */
@Component({
  // Component selector
  selector: 'app-parent-dashboard',
  
  // Standalone component
  standalone: true,
  
  // Required imports
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule,
    MatBadgeModule,
    MatTooltipModule
  ],
  
  // Component template
  template: `
    <!-- Dashboard container -->
    <div class="dashboard-container">
      
      <!-- ========================================== -->
      <!-- SECTION 1: Welcome Banner with Credits    -->
      <!-- ========================================== -->
      <section class="welcome-section">
        <mat-card class="welcome-card">
          <div class="welcome-content">
            <!-- Greeting text -->
            <div class="greeting">
              <h1>Welcome back, {{ firstName() }}!</h1>
              <p class="date-text">{{ currentDate() }}</p>
            </div>
            
            <!-- Credits summary -->
            <div class="credits-summary">
              <div class="credits-header">
                <mat-icon>toll</mat-icon>
                <span>Credits this month</span>
              </div>
              
              <div class="credits-display">
                <span class="credits-remaining">{{ creditSummary().remaining }}</span>
                <span class="credits-total">/ {{ creditSummary().allocated }}</span>
              </div>
              
              <!-- Progress bar showing usage -->
              <mat-progress-bar 
                mode="determinate" 
                [value]="creditSummary().usagePercentage"
                color="primary">
              </mat-progress-bar>
              
              <p class="credits-expiry">
                <mat-icon>schedule</mat-icon>
                {{ creditSummary().expiringIn }} days until credits expire
              </p>
            </div>
          </div>
        </mat-card>
      </section>

      <!-- ========================================== -->
      <!-- SECTION 2: Curated Suggestions Carousel   -->
      <!-- ========================================== -->
      <section class="suggestions-section">
        <div class="section-header">
          <h2>
            <mat-icon>auto_awesome</mat-icon>
            Picked for your children this month
          </h2>
          <a routerLink="/parent/activities" class="view-all-link">
            View All Suggestions
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <!-- Suggestions carousel -->
        <div class="suggestions-carousel">
          <div 
            class="suggestion-card" 
            *ngFor="let suggestion of suggestions()">
            
            <!-- Activity image -->
            <div class="suggestion-image">
              <img [src]="suggestion.imageUrl" [alt]="suggestion.activityName">
              <span class="category-badge">{{ suggestion.category }}</span>
            </div>
            
            <!-- Card content -->
            <div class="suggestion-content">
              <!-- Activity name -->
              <h3 class="activity-name">{{ suggestion.activityName }}</h3>
              
              <!-- Venue with score -->
              <div class="venue-info">
                <span class="venue-name">{{ suggestion.venueName }}</span>
                <span class="venue-score">
                  <mat-icon>star</mat-icon>
                  {{ suggestion.venueScore }}
                </span>
              </div>
              
              <!-- Age range and date -->
              <div class="activity-meta">
                <mat-chip-set>
                  <mat-chip>Ages {{ suggestion.ageRange }}</mat-chip>
                  <mat-chip>{{ suggestion.credits }} credits</mat-chip>
                </mat-chip-set>
              </div>
              
              <!-- Recommended for -->
              <p class="recommended-for">
                <mat-icon>child_care</mat-icon>
                {{ suggestion.recommendedFor }}
              </p>
              
              <!-- Date/time -->
              <p class="suggested-time">
                <mat-icon>event</mat-icon>
                {{ suggestion.suggestedDate }} at {{ suggestion.suggestedTime }}
              </p>
              
              <!-- Action buttons -->
              <div class="suggestion-actions">
                <button mat-raised-button color="primary" 
                        [routerLink]="['/parent/activities', suggestion.activityId]">
                  Book Now
                </button>
                <button mat-stroked-button (click)="dismissSuggestion(suggestion.id)">
                  Not Interested
                </button>
              </div>
            </div>
          </div>
          
          <!-- Empty state -->
          <div *ngIf="suggestions().length === 0" class="empty-suggestions">
            <mat-icon>auto_awesome</mat-icon>
            <p>Add children to get personalized suggestions</p>
            <button mat-raised-button color="primary" routerLink="/parent/children/new">
              Add Your First Child
            </button>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- SECTION 3: Upcoming Bookings              -->
      <!-- ========================================== -->
      <section class="bookings-section">
        <div class="section-header">
          <h2>
            <mat-icon>event</mat-icon>
            Coming up
          </h2>
          <a routerLink="/parent/bookings" class="view-all-link">
            View All Bookings
            <mat-icon>arrow_forward</mat-icon>
          </a>
        </div>

        <!-- Bookings list -->
        <div class="bookings-list">
          <mat-card 
            class="booking-card" 
            *ngFor="let booking of upcomingBookings()">
            
            <!-- Booking date badge -->
            <div class="booking-date-badge">
              <span class="day">{{ booking.dayOfWeek }}</span>
              <span class="date">{{ booking.dayNumber }}</span>
              <span class="month">{{ booking.month }}</span>
            </div>
            
            <!-- Booking details -->
            <div class="booking-details">
              <h4>{{ booking.activityName }}</h4>
              <p class="venue">{{ booking.venueName }}</p>
              <p class="time">
                <mat-icon>schedule</mat-icon>
                {{ booking.time }}
              </p>
              <p class="child">
                <mat-icon>child_care</mat-icon>
                {{ booking.childName }}
              </p>
            </div>
            
            <!-- Status badge -->
            <div class="booking-status" [ngClass]="booking.status.toLowerCase()">
              {{ booking.status }}
            </div>
          </mat-card>
          
          <!-- Empty state -->
          <div *ngIf="upcomingBookings().length === 0" class="empty-bookings">
            <mat-icon>event_available</mat-icon>
            <p>No upcoming bookings</p>
            <button mat-raised-button color="primary" routerLink="/parent/activities">
              Browse Activities
            </button>
          </div>
        </div>
      </section>

      <!-- ========================================== -->
      <!-- SECTION 4: Quick Actions                  -->
      <!-- ========================================== -->
      <section class="quick-actions-section">
        <h2>Quick Actions</h2>
        
        <div class="actions-grid">
          <!-- Search Activities -->
          <mat-card class="action-card" routerLink="/parent/activities">
            <mat-icon class="action-icon">search</mat-icon>
            <h3>Search Activities</h3>
            <p>Find the perfect activity for your child</p>
          </mat-card>
          
          <!-- Add Child -->
          <mat-card class="action-card" routerLink="/parent/children/new">
            <mat-icon class="action-icon">person_add</mat-icon>
            <h3>Add a Child</h3>
            <p>Create a profile for another child</p>
          </mat-card>
          
          <!-- View Waitlist -->
          <mat-card class="action-card" routerLink="/parent/waitlist">
            <mat-icon class="action-icon" [matBadge]="waitlistCount()" matBadgeColor="warn">
              schedule
            </mat-icon>
            <h3>View Waitlist</h3>
            <p>Check your waitlist status</p>
          </mat-card>
          
          <!-- Manage Preferences -->
          <mat-card class="action-card" routerLink="/parent/settings">
            <mat-icon class="action-icon">tune</mat-icon>
            <h3>Manage Preferences</h3>
            <p>Update notification and location settings</p>
          </mat-card>
        </div>
      </section>

    </div>
  `,
  
  // Component styles
  styles: [`
    /* Dashboard container */
    .dashboard-container {
      max-width: 1200px;                             /* Max width for content */
      margin: 0 auto;                                /* Center horizontally */
    }

    /* Section spacing */
    section {
      margin-bottom: 2rem;                           /* Space between sections */
    }

    /* Section headers */
    .section-header {
      display: flex;                                 /* Flexbox layout */
      justify-content: space-between;               /* Space between items */
      align-items: center;                          /* Center vertically */
      margin-bottom: 1rem;                          /* Space below */
    }

    .section-header h2 {
      display: flex;                                /* Flex for icon alignment */
      align-items: center;                          /* Center vertically */
      gap: 0.5rem;                                  /* Gap between icon and text */
      font-size: 1.25rem;                           /* Heading size */
      font-weight: 600;                             /* Semi-bold */
      color: #2d3748;                               /* Dark gray */
      margin: 0;                                    /* Remove margin */
    }

    .section-header mat-icon {
      color: #2c5282;                               /* Primary color */
    }

    .view-all-link {
      display: flex;                                /* Flex for icon alignment */
      align-items: center;                          /* Center vertically */
      gap: 0.25rem;                                 /* Small gap */
      color: #2c5282;                               /* Primary color */
      font-size: 0.875rem;                          /* Smaller text */
      text-decoration: none;                        /* Remove underline */
    }

    .view-all-link:hover {
      text-decoration: underline;                   /* Underline on hover */
    }

    /* ========================================== */
    /* Welcome Section Styles                    */
    /* ========================================== */
    .welcome-card {
      background: linear-gradient(135deg, #2c5282 0%, #319795 100%);
      color: white;
      padding: 1.5rem;
      border-radius: 16px;
    }

    .welcome-content {
      display: flex;                                /* Flexbox layout */
      justify-content: space-between;               /* Space between items */
      align-items: center;                          /* Center vertically */
      flex-wrap: wrap;                              /* Wrap on small screens */
      gap: 1.5rem;                                  /* Gap between items */
    }

    .greeting h1 {
      font-size: 1.75rem;                           /* Large heading */
      font-weight: 600;                             /* Semi-bold */
      margin: 0 0 0.5rem;                           /* Bottom margin only */
    }

    .date-text {
      opacity: 0.9;                                 /* Slightly transparent */
      margin: 0;                                    /* Remove margin */
    }

    .credits-summary {
      background: rgba(255, 255, 255, 0.15);        /* Semi-transparent white */
      padding: 1.25rem;                             /* Inner padding */
      border-radius: 12px;                          /* Rounded corners */
      min-width: 280px;                             /* Minimum width */
    }

    .credits-header {
      display: flex;                                /* Flexbox layout */
      align-items: center;                          /* Center vertically */
      gap: 0.5rem;                                  /* Gap between items */
      font-size: 0.875rem;                          /* Smaller text */
      margin-bottom: 0.5rem;                        /* Bottom margin */
    }

    .credits-display {
      font-size: 2rem;                              /* Large display */
      font-weight: 700;                             /* Bold */
      margin-bottom: 0.75rem;                       /* Bottom margin */
    }

    .credits-remaining {
      font-size: 2.5rem;                            /* Extra large */
    }

    .credits-total {
      opacity: 0.7;                                 /* Slightly transparent */
      font-size: 1.25rem;                           /* Smaller than remaining */
    }

    .credits-expiry {
      display: flex;                                /* Flexbox layout */
      align-items: center;                          /* Center vertically */
      gap: 0.5rem;                                  /* Gap between items */
      font-size: 0.875rem;                          /* Smaller text */
      margin: 0.75rem 0 0;                          /* Top margin only */
      opacity: 0.9;                                 /* Slightly transparent */
    }

    .credits-expiry mat-icon {
      font-size: 18px;                              /* Smaller icon */
      width: 18px;
      height: 18px;
    }

    /* ========================================== */
    /* Suggestions Section Styles                */
    /* ========================================== */
    .suggestions-carousel {
      display: flex;                                /* Flexbox layout */
      gap: 1.5rem;                                  /* Gap between cards */
      overflow-x: auto;                             /* Horizontal scroll */
      padding: 0.5rem 0;                            /* Vertical padding */
      scroll-snap-type: x mandatory;                /* Snap scrolling */
    }

    .suggestion-card {
      flex: 0 0 340px;                              /* Fixed width cards */
      background: white;                            /* White background */
      border-radius: 16px;                          /* Rounded corners */
      overflow: hidden;                             /* Clip content */
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);    /* Subtle shadow */
      scroll-snap-align: start;                     /* Snap to start */
      transition: transform 0.2s, box-shadow 0.2s;  /* Smooth transition */
    }

    .suggestion-card:hover {
      transform: translateY(-4px);                  /* Lift on hover */
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);   /* Stronger shadow */
    }

    .suggestion-image {
      position: relative;                           /* For badge positioning */
      height: 160px;                                /* Fixed image height */
    }

    .suggestion-image img {
      width: 100%;                                  /* Full width */
      height: 100%;                                 /* Full height */
      object-fit: cover;                            /* Cover the area */
    }

    .category-badge {
      position: absolute;                           /* Absolute positioning */
      top: 12px;                                    /* From top */
      left: 12px;                                   /* From left */
      background: rgba(44, 82, 130, 0.9);           /* Primary with opacity */
      color: white;                                 /* White text */
      padding: 0.25rem 0.75rem;                     /* Badge padding */
      border-radius: 999px;                         /* Pill shape */
      font-size: 0.75rem;                           /* Small text */
      font-weight: 500;                             /* Medium weight */
    }

    .suggestion-content {
      padding: 1rem;                                /* Inner padding */
    }

    .activity-name {
      font-size: 1.125rem;                          /* Slightly larger */
      font-weight: 600;                             /* Semi-bold */
      color: #2d3748;                               /* Dark gray */
      margin: 0 0 0.5rem;                           /* Bottom margin only */
    }

    .venue-info {
      display: flex;                                /* Flexbox layout */
      align-items: center;                          /* Center vertically */
      justify-content: space-between;               /* Space between */
      margin-bottom: 0.75rem;                       /* Bottom margin */
    }

    .venue-name {
      color: #718096;                               /* Gray color */
      font-size: 0.875rem;                          /* Smaller text */
    }

    .venue-score {
      display: flex;                                /* Flexbox layout */
      align-items: center;                          /* Center vertically */
      gap: 0.25rem;                                 /* Small gap */
      color: #ed8936;                               /* Orange color */
      font-weight: 600;                             /* Semi-bold */
    }

    .venue-score mat-icon {
      font-size: 16px;                              /* Small icon */
      width: 16px;
      height: 16px;
    }

    .activity-meta {
      margin-bottom: 0.75rem;                       /* Bottom margin */
    }

    .recommended-for, .suggested-time {
      display: flex;                                /* Flexbox layout */
      align-items: center;                          /* Center vertically */
      gap: 0.5rem;                                  /* Gap between items */
      color: #718096;                               /* Gray color */
      font-size: 0.875rem;                          /* Smaller text */
      margin: 0.5rem 0;                             /* Vertical margin */
    }

    .recommended-for mat-icon, .suggested-time mat-icon {
      font-size: 18px;                              /* Small icon */
      width: 18px;
      height: 18px;
      color: #319795;                               /* Accent color */
    }

    .suggestion-actions {
      display: flex;                                /* Flexbox layout */
      gap: 0.75rem;                                 /* Gap between buttons */
      margin-top: 1rem;                             /* Top margin */
    }

    .suggestion-actions button {
      flex: 1;                                      /* Equal width buttons */
    }

    .empty-suggestions {
      display: flex;                                /* Flexbox layout */
      flex-direction: column;                       /* Stack vertically */
      align-items: center;                          /* Center horizontally */
      justify-content: center;                      /* Center vertically */
      padding: 3rem;                                /* Large padding */
      background: white;                            /* White background */
      border-radius: 16px;                          /* Rounded corners */
      text-align: center;                           /* Center text */
      width: 100%;                                  /* Full width */
    }

    .empty-suggestions mat-icon {
      font-size: 48px;                              /* Large icon */
      width: 48px;
      height: 48px;
      color: #cbd5e0;                               /* Light gray */
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    .empty-suggestions p {
      color: #718096;                               /* Gray text */
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    /* ========================================== */
    /* Bookings Section Styles                   */
    /* ========================================== */
    .bookings-list {
      display: flex;                                /* Flexbox layout */
      flex-direction: column;                       /* Stack vertically */
      gap: 1rem;                                    /* Gap between cards */
    }

    .booking-card {
      display: flex;                                /* Flexbox layout */
      align-items: center;                          /* Center vertically */
      gap: 1.5rem;                                  /* Gap between items */
      padding: 1rem 1.5rem;                         /* Inner padding */
      border-radius: 12px;                          /* Rounded corners */
    }

    .booking-date-badge {
      display: flex;                                /* Flexbox layout */
      flex-direction: column;                       /* Stack vertically */
      align-items: center;                          /* Center horizontally */
      background: linear-gradient(135deg, #2c5282, #319795);
      color: white;                                 /* White text */
      padding: 0.75rem;                             /* Inner padding */
      border-radius: 12px;                          /* Rounded corners */
      min-width: 64px;                              /* Minimum width */
    }

    .booking-date-badge .day {
      font-size: 0.625rem;                          /* Very small text */
      text-transform: uppercase;                    /* Uppercase */
      opacity: 0.9;                                 /* Slightly transparent */
    }

    .booking-date-badge .date {
      font-size: 1.5rem;                            /* Large number */
      font-weight: 700;                             /* Bold */
      line-height: 1;                               /* Tight line height */
    }

    .booking-date-badge .month {
      font-size: 0.75rem;                           /* Small text */
      text-transform: uppercase;                    /* Uppercase */
    }

    .booking-details {
      flex: 1;                                      /* Take remaining space */
    }

    .booking-details h4 {
      font-size: 1rem;                              /* Normal size */
      font-weight: 600;                             /* Semi-bold */
      color: #2d3748;                               /* Dark gray */
      margin: 0 0 0.25rem;                          /* Bottom margin only */
    }

    .booking-details .venue {
      color: #718096;                               /* Gray text */
      font-size: 0.875rem;                          /* Smaller text */
      margin: 0 0 0.5rem;                           /* Bottom margin */
    }

    .booking-details .time, .booking-details .child {
      display: flex;                                /* Flexbox layout */
      align-items: center;                          /* Center vertically */
      gap: 0.25rem;                                 /* Small gap */
      color: #718096;                               /* Gray text */
      font-size: 0.875rem;                          /* Smaller text */
      margin: 0.25rem 0;                            /* Small vertical margin */
    }

    .booking-details mat-icon {
      font-size: 16px;                              /* Small icon */
      width: 16px;
      height: 16px;
    }

    .booking-status {
      padding: 0.375rem 1rem;                       /* Badge padding */
      border-radius: 999px;                         /* Pill shape */
      font-size: 0.75rem;                           /* Small text */
      font-weight: 600;                             /* Semi-bold */
      text-transform: uppercase;                    /* Uppercase */
    }

    .booking-status.confirmed {
      background-color: rgba(56, 161, 105, 0.1);    /* Green tint */
      color: #38a169;                               /* Green text */
    }

    .booking-status.pending {
      background-color: rgba(237, 137, 54, 0.1);   /* Orange tint */
      color: #ed8936;                               /* Orange text */
    }

    .empty-bookings {
      display: flex;                                /* Flexbox layout */
      flex-direction: column;                       /* Stack vertically */
      align-items: center;                          /* Center horizontally */
      padding: 2rem;                                /* Padding */
      background: white;                            /* White background */
      border-radius: 12px;                          /* Rounded corners */
      text-align: center;                           /* Center text */
    }

    .empty-bookings mat-icon {
      font-size: 48px;                              /* Large icon */
      width: 48px;
      height: 48px;
      color: #cbd5e0;                               /* Light gray */
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    .empty-bookings p {
      color: #718096;                               /* Gray text */
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    /* ========================================== */
    /* Quick Actions Section Styles              */
    /* ========================================== */
    .quick-actions-section h2 {
      font-size: 1.25rem;                           /* Heading size */
      font-weight: 600;                             /* Semi-bold */
      color: #2d3748;                               /* Dark gray */
      margin: 0 0 1rem;                             /* Bottom margin */
    }

    .actions-grid {
      display: grid;                                /* Grid layout */
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: 1rem;                                    /* Gap between cards */
    }

    .action-card {
      padding: 1.5rem;                              /* Inner padding */
      border-radius: 12px;                          /* Rounded corners */
      cursor: pointer;                              /* Pointer cursor */
      transition: transform 0.2s, box-shadow 0.2s;  /* Smooth transition */
      text-align: center;                           /* Center text */
    }

    .action-card:hover {
      transform: translateY(-4px);                  /* Lift on hover */
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);   /* Stronger shadow */
    }

    .action-icon {
      font-size: 48px;                              /* Large icon */
      width: 48px;
      height: 48px;
      color: #2c5282;                               /* Primary color */
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    .action-card h3 {
      font-size: 1rem;                              /* Normal size */
      font-weight: 600;                             /* Semi-bold */
      color: #2d3748;                               /* Dark gray */
      margin: 0 0 0.5rem;                           /* Bottom margin only */
    }

    .action-card p {
      color: #718096;                               /* Gray text */
      font-size: 0.875rem;                          /* Smaller text */
      margin: 0;                                    /* Remove margin */
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .welcome-content {
        flex-direction: column;                     /* Stack on mobile */
        text-align: center;                         /* Center text */
      }

      .credits-summary {
        width: 100%;                                /* Full width on mobile */
      }

      .suggestion-card {
        flex: 0 0 280px;                            /* Smaller cards on mobile */
      }

      .booking-card {
        flex-wrap: wrap;                            /* Wrap on mobile */
      }

      .booking-status {
        width: 100%;                                /* Full width on mobile */
        text-align: center;                         /* Center text */
        margin-top: 0.5rem;                         /* Top margin */
      }
    }
  `]
})
export class DashboardComponent implements OnInit {
  // -------------------------------------------------
  // STATE SIGNALS
  // -------------------------------------------------
  
  // Credit summary signal
  creditSummary = signal<CreditSummary>({
    currentPeriod: { year: 2024, month: 1, monthName: 'January' },
    allocated: 10,
    used: 3,
    remaining: 7,
    expiringIn: 16,
    usagePercentage: 30
  });

  // Curated suggestions signal
  suggestions = signal<any[]>([]);

  // Upcoming bookings signal
  upcomingBookings = signal<any[]>([]);

  // Waitlist count signal
  waitlistCount = signal<number>(2);

  // -------------------------------------------------
  // COMPUTED VALUES
  // -------------------------------------------------
  
  // User's first name from auth service
  firstName = () => {
    const user = this.authService.currentUser();
    return user?.firstName ?? 'there';
  };

  // Current formatted date
  currentDate = () => {
    const options: Intl.DateTimeFormatOptions = { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    };
    return new Date().toLocaleDateString('en-US', options);
  };

  /**
   * Constructor
   * @param authService - Auth service for user info
   */
  constructor(private authService: AuthService) {}

  /**
   * ngOnInit - Load dashboard data
   */
  ngOnInit(): void {
    // Load mock data for demo
    this.loadSuggestions();
    this.loadUpcomingBookings();
  }

  /**
   * dismissSuggestion - Remove a suggestion from the list
   * @param suggestionId - ID of suggestion to dismiss
   */
  dismissSuggestion(suggestionId: string): void {
    // Filter out the dismissed suggestion
    this.suggestions.update(current => 
      current.filter(s => s.id !== suggestionId)
    );
    
    // TODO: Call API to mark suggestion as dismissed
    console.log('[Dashboard] Suggestion dismissed:', suggestionId);
  }

  /**
   * loadSuggestions - Load mock curated suggestions
   */
  private loadSuggestions(): void {
    // Mock data for demo
    this.suggestions.set([
      {
        id: 'sug_001',
        activityId: 'act_001',
        activityName: 'Junior Robotics Workshop',
        venueName: 'Code Ninjas West',
        venueScore: 4.8,
        category: 'STEM',
        ageRange: '6-10',
        credits: 2,
        recommendedFor: 'Perfect for Emma',
        suggestedDate: 'Sat, Jan 20',
        suggestedTime: '10:00 AM',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop'
      },
      {
        id: 'sug_002',
        activityId: 'act_002',
        activityName: 'Creative Art Studio',
        venueName: 'Artful Kids Academy',
        venueScore: 4.6,
        category: 'Arts',
        ageRange: '4-12',
        credits: 1,
        recommendedFor: 'Great for Emma & Jake',
        suggestedDate: 'Sun, Jan 21',
        suggestedTime: '2:00 PM',
        imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=200&fit=crop'
      },
      {
        id: 'sug_003',
        activityId: 'act_003',
        activityName: 'Soccer Skills Camp',
        venueName: 'City Sports Complex',
        venueScore: 4.5,
        category: 'Sports',
        ageRange: '5-8',
        credits: 1,
        recommendedFor: 'Perfect for Jake',
        suggestedDate: 'Sat, Jan 27',
        suggestedTime: '9:00 AM',
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop'
      }
    ]);
  }

  /**
   * loadUpcomingBookings - Load mock upcoming bookings
   */
  private loadUpcomingBookings(): void {
    // Mock data for demo
    this.upcomingBookings.set([
      {
        id: 'book_001',
        activityName: 'Junior Coding Class',
        venueName: 'Code Ninjas West',
        dayOfWeek: 'SAT',
        dayNumber: '18',
        month: 'JAN',
        time: '10:00 AM - 11:30 AM',
        childName: 'Emma',
        status: 'Confirmed'
      },
      {
        id: 'book_002',
        activityName: 'Music Discovery',
        venueName: 'Harmony Music School',
        dayOfWeek: 'SUN',
        dayNumber: '19',
        month: 'JAN',
        time: '2:00 PM - 3:00 PM',
        childName: 'Jake',
        status: 'Pending'
      },
      {
        id: 'book_003',
        activityName: 'Swim Lessons',
        venueName: 'Aqua Kids Center',
        dayOfWeek: 'TUE',
        dayNumber: '21',
        month: 'JAN',
        time: '4:00 PM - 5:00 PM',
        childName: 'Emma',
        status: 'Confirmed'
      }
    ]);
  }
}
