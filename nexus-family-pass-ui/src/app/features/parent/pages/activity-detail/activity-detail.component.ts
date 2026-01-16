// =====================================================
// NEXUS FAMILY PASS - ACTIVITY DETAIL COMPONENT
// Detailed view of an activity with booking functionality,
// schedule calendar, venue info, and reviews
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Router
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

// Import Reactive Forms
import { ReactiveFormsModule, FormBuilder, FormControl } from '@angular/forms';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTabsModule } from '@angular/material/tabs';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';

/**
 * ActivityDetailComponent - Activity Detail Page
 * 
 * Comprehensive activity view including:
 * - Hero image carousel
 * - Activity info (name, venue, category, age range)
 * - Description and learning outcomes
 * - Schedule calendar with time slot selection
 * - Child selector for booking
 * - Sibling booking option
 * - Venue information section
 * - Reviews section
 */
@Component({
  // Component selector
  selector: 'app-activity-detail',
  
  // Standalone component
  standalone: true,
  
  // Required imports
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatTabsModule,
    MatExpansionModule,
    MatProgressBarModule,
    MatDialogModule,
    MatSnackBarModule,
    MatTooltipModule
  ],
  
  // Component template
  template: `
    <!-- Page container -->
    <div class="activity-detail-page">
      
      <!-- Back navigation -->
      <a routerLink="/parent/activities" class="back-link">
        <mat-icon>arrow_back</mat-icon>
        Back to Activities
      </a>

      <!-- Loading state -->
      @if (isLoading()) {
        <div class="loading-state">
          <div class="skeleton hero-skeleton"></div>
          <div class="skeleton title-skeleton"></div>
          <div class="skeleton desc-skeleton"></div>
        </div>
      } @else {
        
        <!-- Main content grid -->
        <div class="content-grid">
          
          <!-- Left column - Activity details -->
          <div class="details-column">
            
            <!-- Hero image section -->
            <section class="hero-section">
              <div class="hero-image">
                <img [src]="activity()?.imageUrl" [alt]="activity()?.name">
                
                <!-- Favorite button -->
                <button 
                  mat-icon-button 
                  class="favorite-btn"
                  (click)="toggleFavorite()"
                  [matTooltip]="activity()?.isFavorited ? 'Remove from favorites' : 'Add to favorites'">
                  <mat-icon>{{ activity()?.isFavorited ? 'favorite' : 'favorite_border' }}</mat-icon>
                </button>
                
                <!-- Category badge -->
                <span class="category-badge">{{ activity()?.category }}</span>
              </div>
            </section>

            <!-- Main info card -->
            <mat-card class="info-card">
              <h1 class="activity-name">{{ activity()?.name }}</h1>
              
              <!-- Venue info with score -->
              <div class="venue-info">
                <span class="venue-name">{{ activity()?.venueName }}</span>
                <div class="venue-score" [matTooltip]="'Based on ' + activity()?.totalReviews + ' reviews'">
                  <mat-icon>star</mat-icon>
                  <span>{{ activity()?.venueScore }}</span>
                </div>
              </div>
              
              <!-- Meta info chips -->
              <mat-chip-set class="meta-chips">
                <mat-chip>
                  <mat-icon>cake</mat-icon>
                  Ages {{ activity()?.minAge }}-{{ activity()?.maxAge }}
                </mat-chip>
                <mat-chip>
                  <mat-icon>schedule</mat-icon>
                  {{ activity()?.duration }} min
                </mat-chip>
                <mat-chip>
                  <mat-icon>toll</mat-icon>
                  {{ activity()?.credits }} credits
                </mat-chip>
                <mat-chip>
                  <mat-icon>{{ activity()?.skillLevel === 'beginner' ? 'school' : 'psychology' }}</mat-icon>
                  {{ activity()?.skillLevel | titlecase }}
                </mat-chip>
              </mat-chip-set>
            </mat-card>

            <!-- Description section -->
            <mat-card class="description-card">
              <h2>About this Activity</h2>
              <p>{{ activity()?.description }}</p>
              
              @if (activity()?.learningOutcomes) {
                <h3>What your child will learn</h3>
                <ul class="outcomes-list">
                  @for (outcome of activity()?.learningOutcomes; track outcome) {
                    <li>
                      <mat-icon>check_circle</mat-icon>
                      {{ outcome }}
                    </li>
                  }
                </ul>
              }
              
              @if (activity()?.whatToBring) {
                <h3>What to bring</h3>
                <p class="bring-note">{{ activity()?.whatToBring }}</p>
              }
            </mat-card>

            <!-- Venue information (collapsible) -->
            <mat-expansion-panel class="venue-panel">
              <mat-expansion-panel-header>
                <mat-panel-title>
                  <mat-icon>store</mat-icon>
                  Venue Information
                </mat-panel-title>
              </mat-expansion-panel-header>
              
              <div class="venue-details">
                <div class="venue-header">
                  <h3>{{ activity()?.venueName }}</h3>
                  <a mat-button color="primary">View all activities at this venue</a>
                </div>
                
                <p class="venue-address">
                  <mat-icon>location_on</mat-icon>
                  {{ activity()?.venueAddress }}
                </p>
                
                <!-- Performance score breakdown -->
                <div class="score-breakdown">
                  <h4>Performance Score Breakdown</h4>
                  
                  <div class="score-item">
                    <span class="score-label">Parent Rating</span>
                    <div class="score-bar">
                      <mat-progress-bar mode="determinate" [value]="96"></mat-progress-bar>
                    </div>
                    <span class="score-value">4.8/5</span>
                  </div>
                  
                  <div class="score-item">
                    <span class="score-label">Repeat Booking Rate</span>
                    <div class="score-bar">
                      <mat-progress-bar mode="determinate" [value]="85"></mat-progress-bar>
                    </div>
                    <span class="score-value">High</span>
                  </div>
                  
                  <div class="score-item">
                    <span class="score-label">Cancellation Rate</span>
                    <div class="score-bar">
                      <mat-progress-bar mode="determinate" [value]="95"></mat-progress-bar>
                    </div>
                    <span class="score-value">Low</span>
                  </div>
                </div>
              </div>
            </mat-expansion-panel>

            <!-- Reviews section -->
            <mat-card class="reviews-card">
              <div class="reviews-header">
                <h2>Reviews</h2>
                <div class="rating-summary">
                  <span class="average-rating">{{ activity()?.venueScore }}</span>
                  <div class="stars">
                    @for (star of [1,2,3,4,5]; track star) {
                      <mat-icon>{{ star <= Math.floor(activity()?.venueScore || 0) ? 'star' : 'star_border' }}</mat-icon>
                    }
                  </div>
                  <span class="review-count">{{ activity()?.totalReviews }} reviews</span>
                </div>
              </div>
              
              <!-- Review list -->
              <div class="reviews-list">
                @for (review of reviews(); track review.id) {
                  <div class="review-item">
                    <div class="review-header">
                      <div class="reviewer-avatar">{{ review.initials }}</div>
                      <div class="reviewer-info">
                        <div class="reviewer-rating">
                          @for (star of [1,2,3,4,5]; track star) {
                            <mat-icon class="small-star">{{ star <= review.rating ? 'star' : 'star_border' }}</mat-icon>
                          }
                        </div>
                        <span class="review-date">{{ review.date }}</span>
                      </div>
                    </div>
                    <p class="review-text">{{ review.text }}</p>
                  </div>
                }
              </div>
              
              <button mat-button color="primary" class="view-all-reviews">
                View All {{ activity()?.totalReviews }} Reviews
              </button>
            </mat-card>
          </div>

          <!-- Right column - Booking section -->
          <div class="booking-column">
            <mat-card class="booking-card">
              <h2>Book this Activity</h2>
              
              <!-- Schedule section -->
              <section class="schedule-section">
                <h3>Select a Date</h3>
                
                <!-- Simple date selector (simplified calendar) -->
                <div class="date-selector">
                  @for (slot of availableSlots(); track slot.id) {
                    <div 
                      class="date-option"
                      [class.selected]="selectedSlot()?.id === slot.id"
                      (click)="selectSlot(slot)">
                      <span class="day">{{ slot.dayName }}</span>
                      <span class="date">{{ slot.date }}</span>
                      <span class="time">{{ slot.time }}</span>
                      <span class="spots" [ngClass]="getSpotsClass(slot.spotsLeft)">
                        {{ slot.spotsLeft > 0 ? slot.spotsLeft + ' spots' : 'Waitlist' }}
                      </span>
                    </div>
                  }
                </div>
              </section>

              <!-- Child selector -->
              <section class="child-section">
                <h3>Select Child</h3>
                
                <mat-form-field appearance="outline" class="full-width">
                  <mat-label>Which child is this for?</mat-label>
                  <mat-select [formControl]="childControl">
                    @for (child of children(); track child.id) {
                      <mat-option [value]="child.id">
                        <span class="child-option">
                          {{ child.name }} ({{ child.age }} years)
                          @if (isChildCompatible(child)) {
                            <mat-icon class="compatible-icon">check_circle</mat-icon>
                          } @else {
                            <mat-icon class="incompatible-icon" matTooltip="Age may not be suitable">warning</mat-icon>
                          }
                        </span>
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>

                <!-- Sibling booking toggle -->
                @if (children().length > 1) {
                  <div class="sibling-toggle">
                    <mat-checkbox 
                      [formControl]="siblingBookingControl"
                      color="primary">
                      Book for siblings together
                    </mat-checkbox>
                    
                    @if (siblingBookingControl.value) {
                      <div class="sibling-selector">
                        @for (child of children(); track child.id) {
                          <mat-checkbox 
                            [checked]="selectedChildren().includes(child.id)"
                            (change)="toggleChildSelection(child.id)"
                            color="primary">
                            {{ child.name }} ({{ child.age }})
                          </mat-checkbox>
                        }
                      </div>
                    }
                  </div>
                }
              </section>

              <!-- Booking summary -->
              <section class="summary-section">
                <h3>Summary</h3>
                
                <div class="summary-details">
                  <div class="summary-row">
                    <span>Date & Time</span>
                    <span>{{ selectedSlot()?.dayName }}, {{ selectedSlot()?.date }} at {{ selectedSlot()?.time }}</span>
                  </div>
                  <div class="summary-row">
                    <span>Children</span>
                    <span>{{ getSelectedChildrenNames() }}</span>
                  </div>
                  <div class="summary-row total">
                    <span>Total Credits</span>
                    <span>{{ getTotalCredits() }} credits</span>
                  </div>
                </div>

                <!-- Credits balance -->
                <div class="credits-balance">
                  <mat-icon>toll</mat-icon>
                  <span>You have {{ creditsRemaining() }} credits remaining</span>
                </div>
              </section>

              <!-- Action buttons -->
              <div class="booking-actions">
                @if (selectedSlot()?.spotsLeft > 0) {
                  <button 
                    mat-raised-button 
                    color="primary"
                    class="book-btn"
                    [disabled]="!canBook()"
                    (click)="bookActivity()">
                    <mat-icon>event_available</mat-icon>
                    Book Now
                  </button>
                } @else {
                  <button 
                    mat-raised-button 
                    color="accent"
                    class="book-btn"
                    [disabled]="!canBook()"
                    (click)="joinWaitlist()">
                    <mat-icon>hourglass_empty</mat-icon>
                    Join Waitlist
                  </button>
                }
              </div>

              <!-- Cancellation policy -->
              <p class="cancellation-policy">
                <mat-icon>info</mat-icon>
                Free cancellation up to 48 hours before the activity
              </p>
            </mat-card>
          </div>
        </div>
      }
    </div>
  `,
  
  // Component styles
  styles: [`
    /* Page container */
    .activity-detail-page {
      max-width: 1200px;                             /* Max width */
      margin: 0 auto;                                /* Center horizontally */
    }

    /* Back link */
    .back-link {
      display: inline-flex;                          /* Inline flex */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
      color: #718096;                                /* Gray color */
      text-decoration: none;                         /* No underline */
      margin-bottom: 1rem;                           /* Bottom margin */
      font-size: 0.875rem;                           /* Smaller text */
    }

    .back-link:hover {
      color: #2c5282;                                /* Primary on hover */
    }

    /* Loading state */
    .loading-state {
      display: flex;                                  /* Flexbox layout */
      flex-direction: column;                        /* Stack vertically */
      gap: 1rem;                                     /* Gap */
    }

    .skeleton {
      background: linear-gradient(90deg, #e2e8f0 25%, #edf2f7 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 8px;                            /* Rounded corners */
    }

    .hero-skeleton { height: 300px; }
    .title-skeleton { height: 40px; width: 60%; }
    .desc-skeleton { height: 200px; }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    /* Content grid */
    .content-grid {
      display: grid;                                  /* Grid layout */
      grid-template-columns: 1fr 400px;              /* Main + sidebar */
      gap: 2rem;                                     /* Gap */
    }

    /* Hero section */
    .hero-image {
      position: relative;                            /* For positioning */
      border-radius: 16px;                           /* Rounded corners */
      overflow: hidden;                              /* Clip content */
      height: 300px;                                 /* Fixed height */
    }

    .hero-image img {
      width: 100%;                                    /* Full width */
      height: 100%;                                   /* Full height */
      object-fit: cover;                             /* Cover area */
    }

    .favorite-btn {
      position: absolute;                            /* Absolute positioning */
      top: 16px;                                     /* From top */
      right: 16px;                                   /* From right */
      background: rgba(255, 255, 255, 0.9);         /* White with opacity */
      color: #e53e3e;                                /* Red color */
    }

    .category-badge {
      position: absolute;                            /* Absolute positioning */
      bottom: 16px;                                  /* From bottom */
      left: 16px;                                    /* From left */
      background: rgba(44, 82, 130, 0.9);           /* Primary with opacity */
      color: white;                                  /* White text */
      padding: 0.5rem 1rem;                         /* Padding */
      border-radius: 999px;                          /* Pill shape */
      font-weight: 500;                              /* Medium weight */
    }

    /* Info card */
    .info-card {
      padding: 1.5rem;                               /* Inner padding */
      border-radius: 16px;                           /* Rounded corners */
      margin-top: 1rem;                              /* Top margin */
    }

    .activity-name {
      font-size: 1.75rem;                            /* Large heading */
      font-weight: 600;                              /* Semi-bold */
      color: #2d3748;                                /* Dark gray */
      margin: 0 0 0.75rem;                           /* Bottom margin */
    }

    .venue-info {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 1rem;                                     /* Gap */
      margin-bottom: 1rem;                           /* Bottom margin */
    }

    .venue-name {
      color: #718096;                                /* Gray color */
    }

    .venue-score {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.25rem;                                  /* Small gap */
      color: #ed8936;                                /* Orange color */
      font-weight: 600;                              /* Semi-bold */
    }

    .venue-score mat-icon {
      font-size: 20px;                               /* Icon size */
      width: 20px;
      height: 20px;
    }

    .meta-chips {
      display: flex;                                  /* Flexbox layout */
      flex-wrap: wrap;                               /* Wrap chips */
      gap: 0.5rem;                                   /* Gap */
    }

    .meta-chips mat-chip mat-icon {
      font-size: 16px;                               /* Small icon */
      width: 16px;
      height: 16px;
      margin-right: 0.25rem;                         /* Right margin */
    }

    /* Description card */
    .description-card {
      padding: 1.5rem;                               /* Inner padding */
      border-radius: 16px;                           /* Rounded corners */
      margin-top: 1rem;                              /* Top margin */
    }

    .description-card h2 {
      font-size: 1.25rem;                            /* Heading size */
      font-weight: 600;                              /* Semi-bold */
      margin: 0 0 1rem;                              /* Bottom margin */
    }

    .description-card h3 {
      font-size: 1rem;                               /* Subheading size */
      font-weight: 600;                              /* Semi-bold */
      margin: 1.5rem 0 0.75rem;                      /* Vertical margin */
    }

    .outcomes-list {
      list-style: none;                              /* Remove bullets */
      padding: 0;                                    /* Remove padding */
      margin: 0;                                     /* Remove margin */
    }

    .outcomes-list li {
      display: flex;                                  /* Flexbox layout */
      align-items: flex-start;                       /* Align to top */
      gap: 0.5rem;                                   /* Gap */
      margin-bottom: 0.5rem;                         /* Bottom margin */
    }

    .outcomes-list mat-icon {
      color: #38a169;                                /* Success color */
      font-size: 20px;                               /* Icon size */
      width: 20px;
      height: 20px;
    }

    .bring-note {
      background-color: #f7fafc;                     /* Light background */
      padding: 1rem;                                 /* Padding */
      border-radius: 8px;                            /* Rounded corners */
      border-left: 4px solid #ed8936;               /* Left border */
    }

    /* Venue panel */
    .venue-panel {
      margin-top: 1rem;                              /* Top margin */
    }

    .venue-panel mat-panel-title {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
    }

    .venue-details {
      padding: 1rem 0;                               /* Vertical padding */
    }

    .venue-header {
      display: flex;                                  /* Flexbox layout */
      justify-content: space-between;                /* Space between */
      align-items: center;                           /* Center vertically */
      margin-bottom: 1rem;                           /* Bottom margin */
    }

    .venue-header h3 {
      margin: 0;                                     /* Remove margin */
    }

    .venue-address {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
      color: #718096;                                /* Gray color */
      margin-bottom: 1.5rem;                         /* Bottom margin */
    }

    .score-breakdown h4 {
      font-size: 0.875rem;                           /* Smaller heading */
      color: #4a5568;                                /* Dark gray */
      margin: 0 0 1rem;                              /* Bottom margin */
    }

    .score-item {
      display: grid;                                  /* Grid layout */
      grid-template-columns: 120px 1fr 60px;         /* Columns */
      align-items: center;                           /* Center vertically */
      gap: 1rem;                                     /* Gap */
      margin-bottom: 0.75rem;                        /* Bottom margin */
    }

    .score-label {
      font-size: 0.875rem;                           /* Smaller text */
      color: #718096;                                /* Gray color */
    }

    .score-value {
      font-weight: 500;                              /* Medium weight */
      text-align: right;                             /* Align right */
    }

    /* Reviews card */
    .reviews-card {
      padding: 1.5rem;                               /* Inner padding */
      border-radius: 16px;                           /* Rounded corners */
      margin-top: 1rem;                              /* Top margin */
    }

    .reviews-header {
      display: flex;                                  /* Flexbox layout */
      justify-content: space-between;                /* Space between */
      align-items: center;                           /* Center vertically */
      margin-bottom: 1.5rem;                         /* Bottom margin */
    }

    .reviews-header h2 {
      margin: 0;                                     /* Remove margin */
    }

    .rating-summary {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
    }

    .average-rating {
      font-size: 1.5rem;                             /* Large text */
      font-weight: 700;                              /* Bold */
      color: #2d3748;                                /* Dark gray */
    }

    .stars mat-icon {
      color: #ed8936;                                /* Orange color */
      font-size: 20px;                               /* Icon size */
      width: 20px;
      height: 20px;
    }

    .review-count {
      color: #718096;                                /* Gray color */
      font-size: 0.875rem;                           /* Smaller text */
    }

    .review-item {
      padding: 1rem 0;                               /* Vertical padding */
      border-bottom: 1px solid #e2e8f0;              /* Bottom border */
    }

    .review-header {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.75rem;                                  /* Gap */
      margin-bottom: 0.5rem;                         /* Bottom margin */
    }

    .reviewer-avatar {
      width: 40px;                                    /* Avatar size */
      height: 40px;
      border-radius: 50%;                            /* Circle shape */
      background-color: #2c5282;                     /* Primary color */
      color: white;                                  /* White text */
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;                              /* Semi-bold */
    }

    .reviewer-rating {
      display: flex;                                  /* Flexbox layout */
    }

    .small-star {
      font-size: 16px !important;                    /* Small icon */
      width: 16px !important;
      height: 16px !important;
      color: #ed8936;                                /* Orange color */
    }

    .review-date {
      font-size: 0.75rem;                            /* Small text */
      color: #718096;                                /* Gray color */
    }

    .review-text {
      color: #4a5568;                                /* Dark gray */
      margin: 0;                                     /* Remove margin */
      line-height: 1.6;                              /* Line height */
    }

    .view-all-reviews {
      margin-top: 1rem;                              /* Top margin */
    }

    /* Booking card */
    .booking-card {
      padding: 1.5rem;                               /* Inner padding */
      border-radius: 16px;                           /* Rounded corners */
      position: sticky;                              /* Sticky positioning */
      top: 80px;                                     /* From top */
    }

    .booking-card h2 {
      font-size: 1.25rem;                            /* Heading size */
      font-weight: 600;                              /* Semi-bold */
      margin: 0 0 1.5rem;                            /* Bottom margin */
    }

    .booking-card h3 {
      font-size: 1rem;                               /* Subheading size */
      font-weight: 600;                              /* Semi-bold */
      margin: 0 0 0.75rem;                           /* Bottom margin */
    }

    /* Date selector */
    .date-selector {
      display: grid;                                  /* Grid layout */
      grid-template-columns: repeat(2, 1fr);         /* 2 columns */
      gap: 0.75rem;                                  /* Gap */
      margin-bottom: 1.5rem;                         /* Bottom margin */
    }

    .date-option {
      display: flex;                                  /* Flexbox layout */
      flex-direction: column;                        /* Stack vertically */
      align-items: center;                           /* Center horizontally */
      padding: 0.75rem;                              /* Padding */
      border: 2px solid #e2e8f0;                     /* Border */
      border-radius: 12px;                           /* Rounded corners */
      cursor: pointer;                               /* Pointer cursor */
      transition: all 0.2s;                          /* Smooth transition */
      text-align: center;                            /* Center text */
    }

    .date-option:hover {
      border-color: #2c5282;                         /* Primary border */
    }

    .date-option.selected {
      border-color: #2c5282;                         /* Primary border */
      background-color: rgba(44, 82, 130, 0.1);     /* Light background */
    }

    .date-option .day {
      font-size: 0.75rem;                            /* Small text */
      color: #718096;                                /* Gray color */
    }

    .date-option .date {
      font-weight: 600;                              /* Semi-bold */
      color: #2d3748;                                /* Dark gray */
    }

    .date-option .time {
      font-size: 0.875rem;                           /* Smaller text */
      color: #4a5568;                                /* Dark gray */
    }

    .date-option .spots {
      font-size: 0.75rem;                            /* Small text */
      padding: 0.125rem 0.5rem;                      /* Padding */
      border-radius: 999px;                          /* Pill shape */
      margin-top: 0.25rem;                           /* Top margin */
    }

    .spots.available {
      background-color: rgba(56, 161, 105, 0.1);   /* Green tint */
      color: #38a169;                                /* Green color */
    }

    .spots.low {
      background-color: rgba(237, 137, 54, 0.1);   /* Orange tint */
      color: #ed8936;                                /* Orange color */
    }

    .spots.waitlist {
      background-color: rgba(229, 62, 62, 0.1);    /* Red tint */
      color: #e53e3e;                                /* Red color */
    }

    /* Child section */
    .child-section {
      margin-bottom: 1.5rem;                         /* Bottom margin */
    }

    .full-width {
      width: 100%;                                    /* Full width */
    }

    .child-option {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
    }

    .compatible-icon {
      color: #38a169;                                /* Green color */
      font-size: 18px;                               /* Icon size */
    }

    .incompatible-icon {
      color: #ed8936;                                /* Orange color */
      font-size: 18px;                               /* Icon size */
    }

    .sibling-toggle {
      margin-top: 1rem;                              /* Top margin */
    }

    .sibling-selector {
      display: flex;                                  /* Flexbox layout */
      flex-direction: column;                        /* Stack vertically */
      gap: 0.5rem;                                   /* Gap */
      margin-top: 0.75rem;                           /* Top margin */
      padding-left: 1.5rem;                          /* Left padding */
    }

    /* Summary section */
    .summary-section {
      background-color: #f7fafc;                     /* Light background */
      padding: 1rem;                                 /* Padding */
      border-radius: 12px;                           /* Rounded corners */
      margin-bottom: 1.5rem;                         /* Bottom margin */
    }

    .summary-details {
      margin-bottom: 1rem;                           /* Bottom margin */
    }

    .summary-row {
      display: flex;                                  /* Flexbox layout */
      justify-content: space-between;                /* Space between */
      padding: 0.5rem 0;                             /* Vertical padding */
      font-size: 0.875rem;                           /* Smaller text */
    }

    .summary-row.total {
      border-top: 1px solid #e2e8f0;                 /* Top border */
      margin-top: 0.5rem;                            /* Top margin */
      padding-top: 0.75rem;                          /* Top padding */
      font-weight: 600;                              /* Semi-bold */
    }

    .credits-balance {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
      font-size: 0.875rem;                           /* Smaller text */
      color: #319795;                                /* Accent color */
    }

    /* Booking actions */
    .book-btn {
      width: 100%;                                    /* Full width */
      height: 48px;                                  /* Fixed height */
      font-size: 1rem;                               /* Font size */
    }

    .cancellation-policy {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
      font-size: 0.75rem;                            /* Small text */
      color: #718096;                                /* Gray color */
      margin: 1rem 0 0;                              /* Top margin only */
    }

    .cancellation-policy mat-icon {
      font-size: 16px;                               /* Small icon */
      width: 16px;
      height: 16px;
    }

    /* Responsive styles */
    @media (max-width: 1024px) {
      .content-grid {
        grid-template-columns: 1fr;                  /* Single column */
      }

      .booking-card {
        position: static;                            /* Remove sticky */
      }
    }
  `]
})
export class ActivityDetailComponent implements OnInit {
  // -------------------------------------------------
  // FORM CONTROLS
  // -------------------------------------------------
  childControl = new FormControl('');
  siblingBookingControl = new FormControl(false);

  // -------------------------------------------------
  // STATE SIGNALS
  // -------------------------------------------------
  activity = signal<any>(null);
  availableSlots = signal<any[]>([]);
  selectedSlot = signal<any>(null);
  children = signal<any[]>([]);
  selectedChildren = signal<string[]>([]);
  reviews = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  creditsRemaining = signal<number>(7);

  // Math reference for template
  Math = Math;

  /**
   * Constructor
   */
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  /**
   * ngOnInit - Initialize component
   */
  ngOnInit(): void {
    const activityId = this.route.snapshot.params['id'];
    this.loadActivity(activityId);
    this.loadChildren();
  }

  /**
   * toggleFavorite - Toggle favorite status
   */
  toggleFavorite(): void {
    const current = this.activity();
    if (current) {
      this.activity.set({ ...current, isFavorited: !current.isFavorited });
    }
  }

  /**
   * selectSlot - Select a time slot
   */
  selectSlot(slot: any): void {
    this.selectedSlot.set(slot);
  }

  /**
   * getSpotsClass - Get CSS class for spots indicator
   */
  getSpotsClass(spotsLeft: number): string {
    if (spotsLeft === 0) return 'waitlist';
    if (spotsLeft <= 3) return 'low';
    return 'available';
  }

  /**
   * isChildCompatible - Check if child age is compatible
   */
  isChildCompatible(child: any): boolean {
    const act = this.activity();
    if (!act) return true;
    return child.age >= act.minAge && child.age <= act.maxAge;
  }

  /**
   * toggleChildSelection - Toggle child in sibling booking
   */
  toggleChildSelection(childId: string): void {
    const current = this.selectedChildren();
    if (current.includes(childId)) {
      this.selectedChildren.set(current.filter(id => id !== childId));
    } else {
      this.selectedChildren.set([...current, childId]);
    }
  }

  /**
   * getSelectedChildrenNames - Get names of selected children
   */
  getSelectedChildrenNames(): string {
    if (this.siblingBookingControl.value) {
      const selected = this.selectedChildren();
      return this.children()
        .filter(c => selected.includes(c.id))
        .map(c => c.name)
        .join(', ') || 'None selected';
    }
    const childId = this.childControl.value;
    const child = this.children().find(c => c.id === childId);
    return child?.name || 'None selected';
  }

  /**
   * getTotalCredits - Calculate total credits
   */
  getTotalCredits(): number {
    const act = this.activity();
    if (!act) return 0;
    
    const childCount = this.siblingBookingControl.value 
      ? this.selectedChildren().length 
      : 1;
    
    return act.credits * childCount;
  }

  /**
   * canBook - Check if booking is allowed
   */
  canBook(): boolean {
    if (!this.selectedSlot()) return false;
    if (this.siblingBookingControl.value) {
      return this.selectedChildren().length > 0;
    }
    return !!this.childControl.value;
  }

  /**
   * bookActivity - Create booking
   */
  bookActivity(): void {
    // TODO: Call API to create booking
    console.log('[Activity] Booking:', {
      slot: this.selectedSlot(),
      children: this.siblingBookingControl.value 
        ? this.selectedChildren() 
        : [this.childControl.value]
    });

    this.snackBar.open('Activity booked successfully!', 'View Bookings', {
      duration: 5000,
      panelClass: ['snackbar-success']
    }).onAction().subscribe(() => {
      this.router.navigate(['/parent/bookings']);
    });
  }

  /**
   * joinWaitlist - Join waitlist for full slot
   */
  joinWaitlist(): void {
    // TODO: Call API to join waitlist
    this.snackBar.open('Added to waitlist! We\'ll notify you when a spot opens.', 'Close', {
      duration: 5000,
      panelClass: ['snackbar-success']
    });
  }

  /**
   * loadActivity - Load activity data
   */
  private loadActivity(id: string): void {
    // Mock data for demo
    setTimeout(() => {
      this.activity.set({
        id: id,
        name: 'Junior Robotics Workshop',
        venueName: 'Code Ninjas West',
        venueScore: 4.8,
        totalReviews: 156,
        venueAddress: '123 Tech Street, San Francisco, CA 94105',
        category: 'STEM',
        minAge: 6,
        maxAge: 12,
        duration: 90,
        credits: 2,
        skillLevel: 'beginner',
        isFavorited: false,
        description: 'Introduce your child to the exciting world of robotics! In this hands-on workshop, kids will learn the basics of programming and engineering by building and coding their own robots.',
        learningOutcomes: [
          'Basic programming concepts and logical thinking',
          'Engineering principles and problem-solving',
          'Teamwork and collaboration skills',
          'Hands-on experience with robotics kits'
        ],
        whatToBring: 'Just bring enthusiasm! All materials and equipment are provided.',
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800&h=400&fit=crop'
      });

      this.availableSlots.set([
        { id: 'slot_1', dayName: 'SAT', date: 'Jan 20', time: '10:00 AM', spotsLeft: 5 },
        { id: 'slot_2', dayName: 'SAT', date: 'Jan 20', time: '2:00 PM', spotsLeft: 2 },
        { id: 'slot_3', dayName: 'SUN', date: 'Jan 21', time: '10:00 AM', spotsLeft: 8 },
        { id: 'slot_4', dayName: 'SUN', date: 'Jan 21', time: '2:00 PM', spotsLeft: 0 }
      ]);

      this.reviews.set([
        { id: 'rev_1', initials: 'SJ', rating: 5, date: 'Jan 10, 2024', text: 'My daughter absolutely loved this workshop! She came home so excited about robots and has been talking about it all week.' },
        { id: 'rev_2', initials: 'MC', rating: 4, date: 'Jan 5, 2024', text: 'Great introduction to robotics. The instructors were patient and made it fun for all the kids.' },
        { id: 'rev_3', initials: 'EW', rating: 5, date: 'Dec 28, 2023', text: 'Perfect for curious kids who love building things. Well organized and educational.' }
      ]);

      this.selectedSlot.set(this.availableSlots()[0]);
      this.isLoading.set(false);
    }, 800);
  }

  /**
   * loadChildren - Load children data
   */
  private loadChildren(): void {
    this.children.set([
      { id: 'child_001', name: 'Emma', age: 8 },
      { id: 'child_002', name: 'Jake', age: 5 }
    ]);
    this.childControl.setValue('child_001');
  }
}
