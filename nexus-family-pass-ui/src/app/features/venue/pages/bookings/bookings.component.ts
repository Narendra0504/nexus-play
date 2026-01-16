// =====================================================
// NEXUS FAMILY PASS - VENUE BOOKINGS COMPONENT
// Booking calendar and management for venue administrators
// Shows scheduled sessions, attendance tracking
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
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';

/**
 * VenueBookingsComponent - Booking Management Page
 * 
 * Provides venue administrators with:
 * - Calendar view of upcoming sessions
 * - List view of bookings
 * - Attendance tracking functionality
 * - Booking details and management
 */
@Component({
  // Component selector
  selector: 'app-venue-bookings',
  
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
    MatTableModule,
    MatTabsModule,
    MatBadgeModule,
    MatMenuModule,
    MatDialogModule,
    MatProgressBarModule
  ],
  
  // Inline template
  template: `
    <!-- Bookings page container -->
    <div class="bookings-container p-6">
      
      <!-- Page header -->
      <div class="page-header flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-display font-bold text-neutral-800">Bookings</h1>
          <p class="text-neutral-500">Manage your scheduled sessions</p>
        </div>
        
        <div class="flex gap-2">
          <!-- View toggle buttons -->
          <div class="view-toggle">
            <button mat-icon-button 
                    [class.active]="currentView() === 'calendar'"
                    (click)="setView('calendar')">
              <mat-icon>calendar_view_month</mat-icon>
            </button>
            <button mat-icon-button 
                    [class.active]="currentView() === 'list'"
                    (click)="setView('list')">
              <mat-icon>view_list</mat-icon>
            </button>
          </div>
        </div>
      </div>

      <!-- Date navigation -->
      <mat-card class="date-nav-card mb-6">
        <mat-card-content class="py-3">
          <div class="flex items-center justify-between">
            <!-- Previous button -->
            <button mat-icon-button (click)="previousWeek()">
              <mat-icon>chevron_left</mat-icon>
            </button>
            
            <!-- Current week display -->
            <div class="text-center">
              <h2 class="text-lg font-medium text-neutral-800">{{ currentWeekLabel() }}</h2>
              <button mat-button color="primary" (click)="goToToday()">
                Today
              </button>
            </div>
            
            <!-- Next button -->
            <button mat-icon-button (click)="nextWeek()">
              <mat-icon>chevron_right</mat-icon>
            </button>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Calendar View -->
      @if (currentView() === 'calendar') {
        <div class="calendar-view">
          <!-- Week days header -->
          <div class="week-header grid grid-cols-7 gap-2 mb-4">
            <div *ngFor="let day of weekDays()" 
                 class="day-header text-center p-2 rounded-lg"
                 [class.today]="day.isToday">
              <div class="text-sm text-neutral-500">{{ day.dayName }}</div>
              <div class="text-lg font-medium" 
                   [class.text-primary-600]="day.isToday">{{ day.dayNumber }}</div>
            </div>
          </div>
          
          <!-- Sessions by day -->
          <div class="week-sessions grid grid-cols-7 gap-2">
            <div *ngFor="let day of weekDays()" class="day-sessions">
              <div *ngFor="let session of day.sessions" 
                   class="session-card p-3 rounded-lg mb-2 cursor-pointer"
                   [ngClass]="{
                     'bg-primary-100': session.status === 'confirmed',
                     'bg-warning-100': session.status === 'pending',
                     'bg-neutral-100': session.status === 'completed'
                   }"
                   (click)="viewSession(session)">
                <div class="text-xs font-medium text-neutral-600">{{ session.time }}</div>
                <div class="text-sm font-medium text-neutral-800 truncate">{{ session.activityName }}</div>
                <div class="text-xs text-neutral-500">{{ session.booked }}/{{ session.capacity }}</div>
              </div>
              
              <!-- Empty day placeholder -->
              <div *ngIf="day.sessions.length === 0" 
                   class="empty-day text-center py-8 text-neutral-300">
                <mat-icon>event_busy</mat-icon>
              </div>
            </div>
          </div>
        </div>
      }

      <!-- List View -->
      @if (currentView() === 'list') {
        <mat-card>
          <mat-card-content class="p-0">
            <table mat-table [dataSource]="upcomingSessions()" class="w-full">
              
              <!-- Date Column -->
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let row">
                  <div class="font-medium">{{ row.date }}</div>
                  <div class="text-sm text-neutral-500">{{ row.time }}</div>
                </td>
              </ng-container>
              
              <!-- Activity Column -->
              <ng-container matColumnDef="activity">
                <th mat-header-cell *matHeaderCellDef>Activity</th>
                <td mat-cell *matCellDef="let row">{{ row.activityName }}</td>
              </ng-container>
              
              <!-- Bookings Column -->
              <ng-container matColumnDef="bookings">
                <th mat-header-cell *matHeaderCellDef>Bookings</th>
                <td mat-cell *matCellDef="let row">
                  <div class="flex items-center gap-2">
                    <span>{{ row.booked }} / {{ row.capacity }}</span>
                    <mat-progress-bar mode="determinate" 
                                     [value]="(row.booked / row.capacity) * 100"
                                     class="w-16">
                    </mat-progress-bar>
                  </div>
                </td>
              </ng-container>
              
              <!-- Status Column -->
              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>Status</th>
                <td mat-cell *matCellDef="let row">
                  <mat-chip [ngClass]="{
                    'bg-success-100 text-success-600': row.status === 'confirmed',
                    'bg-warning-100 text-warning-600': row.status === 'pending'
                  }">
                    {{ row.status | titlecase }}
                  </mat-chip>
                </td>
              </ng-container>
              
              <!-- Actions Column -->
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let row">
                  <button mat-icon-button [matMenuTriggerFor]="sessionMenu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #sessionMenu="matMenu">
                    <button mat-menu-item (click)="viewSession(row)">
                      <mat-icon>visibility</mat-icon>
                      <span>View Details</span>
                    </button>
                    <button mat-menu-item (click)="markAttendance(row)">
                      <mat-icon>how_to_reg</mat-icon>
                      <span>Mark Attendance</span>
                    </button>
                    <button mat-menu-item (click)="sendReminders(row)">
                      <mat-icon>notifications</mat-icon>
                      <span>Send Reminders</span>
                    </button>
                    <button mat-menu-item class="text-danger-500" (click)="cancelSession(row)">
                      <mat-icon>cancel</mat-icon>
                      <span>Cancel Session</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>
              
              <tr mat-header-row *matHeaderRowDef="listColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: listColumns;"></tr>
            </table>
          </mat-card-content>
        </mat-card>
      }
    </div>
  `,
  
  // Inline styles
  styles: [`
    /* View toggle styling */
    .view-toggle {
      display: flex;
      background: #f7fafc;
      border-radius: 8px;
      padding: 4px;
    }
    
    .view-toggle button.active {
      background: white;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
    }
    
    /* Calendar view */
    .day-header.today {
      background: rgba(44, 82, 130, 0.1);
    }
    
    .session-card {
      transition: transform 0.2s;
    }
    
    .session-card:hover {
      transform: scale(1.02);
    }
    
    /* Color utilities */
    .bg-primary-100 { background-color: rgba(44, 82, 130, 0.1); }
    .bg-warning-100 { background-color: rgba(237, 137, 54, 0.1); }
    .bg-neutral-100 { background-color: #f7fafc; }
    .bg-success-100 { background-color: rgba(56, 161, 105, 0.1); }
    
    .text-primary-600 { color: #2c5282; }
    .text-success-600 { color: #38a169; }
    .text-warning-600 { color: #dd6b20; }
    .text-danger-500 { color: #e53e3e; }
  `]
})
export class VenueBookingsComponent implements OnInit {
  // Table columns
  listColumns = ['date', 'activity', 'bookings', 'status', 'actions'];
  
  // Current view mode
  currentView = signal<'calendar' | 'list'>('calendar');
  
  // Current week label
  currentWeekLabel = signal<string>('January 15 - 21, 2024');
  
  // Week days with sessions
  weekDays = signal<any[]>([]);
  
  // Upcoming sessions for list view
  upcomingSessions = signal<any[]>([]);

  /**
   * ngOnInit - Load booking data
   */
  ngOnInit(): void {
    this.loadWeekData();
    this.loadUpcomingSessions();
  }

  /**
   * setView - Change view mode
   */
  setView(view: 'calendar' | 'list'): void {
    this.currentView.set(view);
  }

  /**
   * previousWeek - Navigate to previous week
   */
  previousWeek(): void {
    console.log('[Bookings] Previous week');
  }

  /**
   * nextWeek - Navigate to next week
   */
  nextWeek(): void {
    console.log('[Bookings] Next week');
  }

  /**
   * goToToday - Navigate to current week
   */
  goToToday(): void {
    console.log('[Bookings] Go to today');
  }

  /**
   * viewSession - Open session details
   */
  viewSession(session: any): void {
    console.log('[Bookings] View session:', session);
  }

  /**
   * markAttendance - Open attendance dialog
   */
  markAttendance(session: any): void {
    console.log('[Bookings] Mark attendance:', session);
  }

  /**
   * sendReminders - Send reminder notifications
   */
  sendReminders(session: any): void {
    console.log('[Bookings] Send reminders:', session);
  }

  /**
   * cancelSession - Cancel a session
   */
  cancelSession(session: any): void {
    console.log('[Bookings] Cancel session:', session);
  }

  /**
   * loadWeekData - Load week calendar data
   */
  private loadWeekData(): void {
    this.weekDays.set([
      { dayName: 'Mon', dayNumber: '15', isToday: false, sessions: [
        { id: '1', time: '10:00 AM', activityName: 'Junior Robotics', booked: 8, capacity: 10, status: 'confirmed' }
      ]},
      { dayName: 'Tue', dayNumber: '16', isToday: true, sessions: [
        { id: '2', time: '2:00 PM', activityName: 'Coding Class', booked: 6, capacity: 8, status: 'confirmed' },
        { id: '3', time: '4:00 PM', activityName: 'Game Design', booked: 4, capacity: 10, status: 'pending' }
      ]},
      { dayName: 'Wed', dayNumber: '17', isToday: false, sessions: [] },
      { dayName: 'Thu', dayNumber: '18', isToday: false, sessions: [
        { id: '4', time: '10:00 AM', activityName: 'Junior Robotics', booked: 10, capacity: 10, status: 'confirmed' }
      ]},
      { dayName: 'Fri', dayNumber: '19', isToday: false, sessions: [] },
      { dayName: 'Sat', dayNumber: '20', isToday: false, sessions: [
        { id: '5', time: '9:00 AM', activityName: 'Weekend Workshop', booked: 12, capacity: 15, status: 'confirmed' },
        { id: '6', time: '2:00 PM', activityName: 'Advanced Coding', booked: 5, capacity: 8, status: 'confirmed' }
      ]},
      { dayName: 'Sun', dayNumber: '21', isToday: false, sessions: [] }
    ]);
  }

  /**
   * loadUpcomingSessions - Load sessions for list view
   */
  private loadUpcomingSessions(): void {
    this.upcomingSessions.set([
      { id: '1', date: 'Mon, Jan 15', time: '10:00 AM', activityName: 'Junior Robotics Workshop', booked: 8, capacity: 10, status: 'confirmed' },
      { id: '2', date: 'Tue, Jan 16', time: '2:00 PM', activityName: 'Coding Fundamentals', booked: 6, capacity: 8, status: 'confirmed' },
      { id: '3', date: 'Tue, Jan 16', time: '4:00 PM', activityName: 'Game Design', booked: 4, capacity: 10, status: 'pending' },
      { id: '4', date: 'Thu, Jan 18', time: '10:00 AM', activityName: 'Junior Robotics Workshop', booked: 10, capacity: 10, status: 'confirmed' },
      { id: '5', date: 'Sat, Jan 20', time: '9:00 AM', activityName: 'Weekend Workshop', booked: 12, capacity: 15, status: 'confirmed' }
    ]);
  }
}
