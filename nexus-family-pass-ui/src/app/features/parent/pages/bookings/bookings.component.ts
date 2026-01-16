// =====================================================
// NEXUS FAMILY PASS - BOOKINGS COMPONENT
// My Bookings page with tabs for upcoming, past, and
// cancelled bookings with action options
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
import { MatTabsModule } from '@angular/material/tabs';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Import models
import { Booking, BookingStatus } from '../../../../core/models';

/**
 * BookingsComponent - My Bookings Page
 * 
 * Displays all bookings organized in tabs:
 * - Upcoming: Confirmed and pending bookings
 * - Past: Completed bookings with review option
 * - Cancelled: Cancelled bookings history
 */
@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatChipsModule,
    MatMenuModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Page container -->
    <div class="bookings-page">
      
      <!-- Page header -->
      <header class="page-header">
        <h1>My Bookings</h1>
        <button mat-raised-button color="primary" routerLink="/parent/activities">
          <mat-icon>add</mat-icon>
          Book New Activity
        </button>
      </header>

      <!-- Tabs for booking categories -->
      <mat-tab-group (selectedIndexChange)="onTabChange($event)" animationDuration="200ms">
        
        <!-- Upcoming bookings tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>event</mat-icon>
            Upcoming ({{ upcomingBookings().length }})
          </ng-template>
          
          <div class="tab-content">
            @if (upcomingBookings().length > 0) {
              <div class="bookings-list">
                @for (booking of upcomingBookings(); track booking.id) {
                  <mat-card class="booking-card">
                    <!-- Date badge -->
                    <div class="date-badge">
                      <span class="day">{{ booking.dayOfWeek }}</span>
                      <span class="date">{{ booking.dayNumber }}</span>
                      <span class="month">{{ booking.month }}</span>
                    </div>
                    
                    <!-- Booking info -->
                    <div class="booking-info">
                      <h3>{{ booking.activityName }}</h3>
                      <p class="venue">{{ booking.venueName }}</p>
                      <div class="meta-row">
                        <span class="time">
                          <mat-icon>schedule</mat-icon>
                          {{ booking.time }}
                        </span>
                        <span class="child">
                          <mat-icon>child_care</mat-icon>
                          {{ booking.childName }}
                        </span>
                      </div>
                    </div>
                    
                    <!-- Status and actions -->
                    <div class="booking-actions">
                      <span class="status-badge" [ngClass]="booking.status.toLowerCase()">
                        {{ booking.status }}
                      </span>
                      
                      <button mat-icon-button [matMenuTriggerFor]="bookingMenu">
                        <mat-icon>more_vert</mat-icon>
                      </button>
                      
                      <mat-menu #bookingMenu="matMenu">
                        <button mat-menu-item [routerLink]="['/parent/activities', booking.activityId]">
                          <mat-icon>visibility</mat-icon>
                          <span>View Activity</span>
                        </button>
                        <button mat-menu-item (click)="addToCalendar(booking)">
                          <mat-icon>calendar_today</mat-icon>
                          <span>Add to Calendar</span>
                        </button>
                        @if (booking.canCancel) {
                          <button mat-menu-item class="cancel-option" (click)="cancelBooking(booking)">
                            <mat-icon>cancel</mat-icon>
                            <span>Cancel Booking</span>
                          </button>
                        }
                      </mat-menu>
                    </div>
                  </mat-card>
                }
              </div>
            } @else {
              <div class="empty-state">
                <mat-icon>event_available</mat-icon>
                <h2>No upcoming bookings</h2>
                <p>Browse activities to make your first booking</p>
                <button mat-raised-button color="primary" routerLink="/parent/activities">
                  Browse Activities
                </button>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Past bookings tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>history</mat-icon>
            Past ({{ pastBookings().length }})
          </ng-template>
          
          <div class="tab-content">
            @if (pastBookings().length > 0) {
              <div class="bookings-list">
                @for (booking of pastBookings(); track booking.id) {
                  <mat-card class="booking-card past">
                    <div class="date-badge">
                      <span class="day">{{ booking.dayOfWeek }}</span>
                      <span class="date">{{ booking.dayNumber }}</span>
                      <span class="month">{{ booking.month }}</span>
                    </div>
                    
                    <div class="booking-info">
                      <h3>{{ booking.activityName }}</h3>
                      <p class="venue">{{ booking.venueName }}</p>
                      <div class="meta-row">
                        <span class="child">
                          <mat-icon>child_care</mat-icon>
                          {{ booking.childName }}
                        </span>
                      </div>
                    </div>
                    
                    <div class="booking-actions">
                      <span class="status-badge completed">Completed</span>
                      
                      @if (!booking.hasReview) {
                        <button mat-stroked-button color="primary" (click)="writeReview(booking)">
                          <mat-icon>rate_review</mat-icon>
                          Write Review
                        </button>
                      } @else {
                        <span class="reviewed-badge">
                          <mat-icon>check_circle</mat-icon>
                          Reviewed
                        </span>
                      }
                    </div>
                  </mat-card>
                }
              </div>
            } @else {
              <div class="empty-state">
                <mat-icon>history</mat-icon>
                <h2>No past bookings</h2>
                <p>Your completed activities will appear here</p>
              </div>
            }
          </div>
        </mat-tab>

        <!-- Cancelled bookings tab -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon>cancel</mat-icon>
            Cancelled ({{ cancelledBookings().length }})
          </ng-template>
          
          <div class="tab-content">
            @if (cancelledBookings().length > 0) {
              <div class="bookings-list">
                @for (booking of cancelledBookings(); track booking.id) {
                  <mat-card class="booking-card cancelled">
                    <div class="date-badge cancelled">
                      <span class="day">{{ booking.dayOfWeek }}</span>
                      <span class="date">{{ booking.dayNumber }}</span>
                      <span class="month">{{ booking.month }}</span>
                    </div>
                    
                    <div class="booking-info">
                      <h3>{{ booking.activityName }}</h3>
                      <p class="venue">{{ booking.venueName }}</p>
                      <p class="cancel-reason">
                        <mat-icon>info</mat-icon>
                        {{ booking.cancelReason }}
                      </p>
                    </div>
                    
                    <div class="booking-actions">
                      <span class="status-badge cancelled">Cancelled</span>
                      
                      <button mat-stroked-button [routerLink]="['/parent/activities', booking.activityId]">
                        Book Again
                      </button>
                    </div>
                  </mat-card>
                }
              </div>
            } @else {
              <div class="empty-state">
                <mat-icon>check_circle</mat-icon>
                <h2>No cancelled bookings</h2>
                <p>Great! You haven't cancelled any bookings</p>
              </div>
            }
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  styles: [`
    .bookings-page {
      max-width: 900px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 {
      font-size: 1.75rem;
      font-weight: 600;
      margin: 0;
    }

    .tab-content {
      padding: 1.5rem 0;
    }

    .bookings-list {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .booking-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.25rem;
      border-radius: 12px;
      transition: box-shadow 0.2s;
    }

    .booking-card:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    }

    .booking-card.past {
      opacity: 0.85;
    }

    .booking-card.cancelled {
      opacity: 0.7;
    }

    .date-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, #2c5282, #319795);
      color: white;
      padding: 0.75rem;
      border-radius: 12px;
      min-width: 70px;
    }

    .date-badge.cancelled {
      background: #a0aec0;
    }

    .date-badge .day {
      font-size: 0.625rem;
      text-transform: uppercase;
      opacity: 0.9;
    }

    .date-badge .date {
      font-size: 1.5rem;
      font-weight: 700;
      line-height: 1;
    }

    .date-badge .month {
      font-size: 0.75rem;
      text-transform: uppercase;
    }

    .booking-info {
      flex: 1;
    }

    .booking-info h3 {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.25rem;
    }

    .booking-info .venue {
      color: #718096;
      font-size: 0.875rem;
      margin: 0 0 0.5rem;
    }

    .meta-row {
      display: flex;
      gap: 1rem;
    }

    .meta-row span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #718096;
    }

    .meta-row mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .cancel-reason {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-size: 0.875rem;
      color: #718096;
      margin: 0;
    }

    .cancel-reason mat-icon {
      font-size: 16px;
      width: 16px;
      height: 16px;
    }

    .booking-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .status-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 999px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .status-badge.confirmed {
      background-color: rgba(56, 161, 105, 0.1);
      color: #38a169;
    }

    .status-badge.pending {
      background-color: rgba(237, 137, 54, 0.1);
      color: #ed8936;
    }

    .status-badge.completed {
      background-color: rgba(49, 151, 149, 0.1);
      color: #319795;
    }

    .status-badge.cancelled {
      background-color: rgba(160, 174, 192, 0.2);
      color: #718096;
    }

    .reviewed-badge {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      color: #38a169;
      font-size: 0.875rem;
    }

    .cancel-option {
      color: #e53e3e !important;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #cbd5e0;
      margin-bottom: 1rem;
    }

    .empty-state h2 {
      font-size: 1.25rem;
      color: #2d3748;
      margin: 0 0 0.5rem;
    }

    .empty-state p {
      color: #718096;
      margin: 0 0 1.5rem;
    }

    @media (max-width: 768px) {
      .booking-card {
        flex-wrap: wrap;
      }

      .booking-actions {
        width: 100%;
        margin-top: 1rem;
        justify-content: space-between;
      }
    }
  `]
})
export class BookingsComponent implements OnInit {
  // State signals
  upcomingBookings = signal<any[]>([]);
  pastBookings = signal<any[]>([]);
  cancelledBookings = signal<any[]>([]);

  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  onTabChange(index: number): void {
    console.log('[Bookings] Tab changed to:', index);
  }

  addToCalendar(booking: any): void {
    // TODO: Generate calendar event
    this.snackBar.open('Calendar event downloaded', 'Close', { duration: 3000 });
  }

  cancelBooking(booking: any): void {
    // TODO: Show confirmation dialog and call API
    console.log('[Bookings] Cancel requested:', booking.id);
    this.snackBar.open('Booking cancelled. Credits have been refunded.', 'Close', {
      duration: 4000,
      panelClass: ['snackbar-success']
    });
  }

  writeReview(booking: any): void {
    // TODO: Open review modal
    console.log('[Bookings] Review requested:', booking.id);
  }

  private loadBookings(): void {
    // Mock data
    this.upcomingBookings.set([
      {
        id: 'book_001',
        activityId: 'act_001',
        activityName: 'Junior Coding Class',
        venueName: 'Code Ninjas West',
        dayOfWeek: 'SAT',
        dayNumber: '18',
        month: 'JAN',
        time: '10:00 AM - 11:30 AM',
        childName: 'Emma',
        status: 'Confirmed',
        canCancel: true
      },
      {
        id: 'book_002',
        activityId: 'act_002',
        activityName: 'Music Discovery',
        venueName: 'Harmony Music School',
        dayOfWeek: 'SUN',
        dayNumber: '19',
        month: 'JAN',
        time: '2:00 PM - 3:00 PM',
        childName: 'Jake',
        status: 'Pending',
        canCancel: true
      }
    ]);

    this.pastBookings.set([
      {
        id: 'book_003',
        activityId: 'act_003',
        activityName: 'Creative Art Studio',
        venueName: 'Artful Kids Academy',
        dayOfWeek: 'SAT',
        dayNumber: '11',
        month: 'JAN',
        childName: 'Emma',
        hasReview: true
      },
      {
        id: 'book_004',
        activityId: 'act_004',
        activityName: 'Soccer Skills',
        venueName: 'City Sports Complex',
        dayOfWeek: 'SUN',
        dayNumber: '5',
        month: 'JAN',
        childName: 'Jake',
        hasReview: false
      }
    ]);

    this.cancelledBookings.set([
      {
        id: 'book_005',
        activityId: 'act_005',
        activityName: 'Nature Explorers',
        venueName: 'Green Valley Park',
        dayOfWeek: 'SAT',
        dayNumber: '28',
        month: 'DEC',
        cancelReason: 'Cancelled by parent - Schedule conflict'
      }
    ]);
  }
}
