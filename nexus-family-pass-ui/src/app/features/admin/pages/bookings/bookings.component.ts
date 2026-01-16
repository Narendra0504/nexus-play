// =====================================================
// NEXUS FAMILY PASS - ADMIN BOOKINGS COMPONENT
// Platform admin component for viewing and managing
// all bookings across the platform. Provides oversight
// and intervention capabilities.
// =====================================================

// Import Angular core
import { Component, OnInit, signal, computed } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import FormsModule
import { FormsModule } from '@angular/forms';

// Import Angular Material components
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * Platform booking interface
 */
interface PlatformBooking {
  /** Unique booking ID */
  id: string;
  
  /** Activity name */
  activityName: string;
  
  /** Venue name */
  venueName: string;
  
  /** Parent name */
  parentName: string;
  
  /** Parent's company */
  company: string;
  
  /** Child name */
  childName: string;
  
  /** Booking date */
  date: string;
  
  /** Booking time */
  time: string;
  
  /** Credits used */
  credits: number;
  
  /** Booking status */
  status: 'confirmed' | 'completed' | 'cancelled' | 'no-show';
  
  /** Booking creation timestamp */
  createdAt: string;
}

/**
 * AdminBookingsComponent
 * 
 * Platform-wide booking management for admins.
 * Features:
 * - View all bookings across platform
 * - Filter by status, date range, company, venue
 * - Search by parent, child, or activity
 * - Booking details and intervention actions
 * - Export functionality
 */
@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule,
    MatSnackBarModule
  ],
  template: `
    <!-- Page container -->
    <div class="bookings-container p-6">
      
      <!-- ============================================ -->
      <!-- PAGE HEADER                                  -->
      <!-- ============================================ -->
      <div class="page-header mb-6">
        <div class="header-content">
          <h1 class="page-title">Booking Management</h1>
          <p class="page-subtitle">View and manage all platform bookings</p>
        </div>
        
        <button mat-stroked-button (click)="exportBookings()">
          <mat-icon>download</mat-icon>
          Export Bookings
        </button>
      </div>

      <!-- ============================================ -->
      <!-- STATS CARDS                                  -->
      <!-- ============================================ -->
      <div class="stats-grid mb-6">
        <!-- Total Bookings -->
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon total">
              <mat-icon>event</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().total }}</span>
              <span class="stat-label">Total Bookings</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Confirmed -->
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon confirmed">
              <mat-icon>check_circle</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().confirmed }}</span>
              <span class="stat-label">Confirmed</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Completed -->
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon completed">
              <mat-icon>task_alt</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().completed }}</span>
              <span class="stat-label">Completed</span>
            </div>
          </mat-card-content>
        </mat-card>
        
        <!-- Cancelled -->
        <mat-card class="stat-card">
          <mat-card-content>
            <div class="stat-icon cancelled">
              <mat-icon>cancel</mat-icon>
            </div>
            <div class="stat-info">
              <span class="stat-value">{{ stats().cancelled }}</span>
              <span class="stat-label">Cancelled</span>
            </div>
          </mat-card-content>
        </mat-card>
      </div>

      <!-- ============================================ -->
      <!-- FILTERS                                      -->
      <!-- ============================================ -->
      <mat-card class="filters-card mb-4">
        <mat-card-content>
          <div class="filters-grid">
            <!-- Search -->
            <mat-form-field appearance="outline" class="search-field">
              <mat-label>Search</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input 
                matInput 
                [(ngModel)]="searchQuery"
                placeholder="Search by name, activity..."
                (input)="applyFilters()">
            </mat-form-field>
            
            <!-- Status filter -->
            <mat-form-field appearance="outline">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="statusFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All Statuses</mat-option>
                <mat-option value="confirmed">Confirmed</mat-option>
                <mat-option value="completed">Completed</mat-option>
                <mat-option value="cancelled">Cancelled</mat-option>
                <mat-option value="no-show">No-Show</mat-option>
              </mat-select>
            </mat-form-field>
            
            <!-- Company filter -->
            <mat-form-field appearance="outline">
              <mat-label>Company</mat-label>
              <mat-select [(ngModel)]="companyFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All Companies</mat-option>
                <mat-option value="Acme Corp">Acme Corp</mat-option>
                <mat-option value="TechCorp">TechCorp</mat-option>
                <mat-option value="StartupXYZ">StartupXYZ</mat-option>
              </mat-select>
            </mat-form-field>
            
            <!-- Venue filter -->
            <mat-form-field appearance="outline">
              <mat-label>Venue</mat-label>
              <mat-select [(ngModel)]="venueFilter" (selectionChange)="applyFilters()">
                <mat-option value="">All Venues</mat-option>
                <mat-option value="Code Ninjas West">Code Ninjas West</mat-option>
                <mat-option value="Art Studio Plus">Art Studio Plus</mat-option>
                <mat-option value="Sports Academy">Sports Academy</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- ============================================ -->
      <!-- BOOKINGS TABLE                               -->
      <!-- ============================================ -->
      <mat-card class="table-card">
        <mat-card-content>
          <table mat-table [dataSource]="paginatedBookings()" class="bookings-table">
            
            <!-- Booking ID Column -->
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>Booking ID</th>
              <td mat-cell *matCellDef="let booking">
                <span class="booking-id">{{ booking.id }}</span>
              </td>
            </ng-container>

            <!-- Activity Column -->
            <ng-container matColumnDef="activity">
              <th mat-header-cell *matHeaderCellDef>Activity</th>
              <td mat-cell *matCellDef="let booking">
                <div class="activity-cell">
                  <span class="activity-name">{{ booking.activityName }}</span>
                  <span class="venue-name">{{ booking.venueName }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Parent Column -->
            <ng-container matColumnDef="parent">
              <th mat-header-cell *matHeaderCellDef>Parent / Child</th>
              <td mat-cell *matCellDef="let booking">
                <div class="parent-cell">
                  <span class="parent-name">{{ booking.parentName }}</span>
                  <span class="child-name">{{ booking.childName }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Company Column -->
            <ng-container matColumnDef="company">
              <th mat-header-cell *matHeaderCellDef>Company</th>
              <td mat-cell *matCellDef="let booking">
                {{ booking.company }}
              </td>
            </ng-container>

            <!-- Date/Time Column -->
            <ng-container matColumnDef="datetime">
              <th mat-header-cell *matHeaderCellDef>Date/Time</th>
              <td mat-cell *matCellDef="let booking">
                <div class="datetime-cell">
                  <span>{{ booking.date }}</span>
                  <span class="time">{{ booking.time }}</span>
                </div>
              </td>
            </ng-container>

            <!-- Credits Column -->
            <ng-container matColumnDef="credits">
              <th mat-header-cell *matHeaderCellDef>Credits</th>
              <td mat-cell *matCellDef="let booking">
                <span class="credits-value">{{ booking.credits }}</span>
              </td>
            </ng-container>

            <!-- Status Column -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let booking">
                <mat-chip class="status-chip" [ngClass]="booking.status">
                  {{ booking.status | titlecase }}
                </mat-chip>
              </td>
            </ng-container>

            <!-- Actions Column -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let booking">
                <button mat-icon-button [matMenuTriggerFor]="bookingMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #bookingMenu="matMenu">
                  <button mat-menu-item (click)="viewDetails(booking)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  <button 
                    mat-menu-item 
                    *ngIf="booking.status === 'confirmed'"
                    (click)="cancelBooking(booking)">
                    <mat-icon>cancel</mat-icon>
                    <span>Cancel Booking</span>
                  </button>
                  <button mat-menu-item (click)="contactParent(booking)">
                    <mat-icon>email</mat-icon>
                    <span>Contact Parent</span>
                  </button>
                  <button mat-menu-item (click)="contactVenue(booking)">
                    <mat-icon>business</mat-icon>
                    <span>Contact Venue</span>
                  </button>
                </mat-menu>
              </td>
            </ng-container>

            <!-- Table rows -->
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <!-- Paginator -->
          <mat-paginator
            [length]="filteredBookings().length"
            [pageSize]="pageSize"
            [pageSizeOptions]="[10, 25, 50]"
            (page)="onPageChange($event)"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    /* Container */
    .bookings-container {
      max-width: 1400px;
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

    /* Stats grid */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }

    .stat-card mat-card-content {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem !important;
    }

    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .stat-icon.total { background: #ebf8ff; color: #2c5282; }
    .stat-icon.confirmed { background: #f0fff4; color: #38a169; }
    .stat-icon.completed { background: #faf5ff; color: #805ad5; }
    .stat-icon.cancelled { background: #fff5f5; color: #e53e3e; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-value {
      font-size: 1.5rem;
      font-weight: 700;
      color: #2d3748;
    }

    .stat-label {
      font-size: 0.75rem;
      color: #718096;
    }

    /* Filters */
    .filters-grid {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr 1fr;
      gap: 1rem;
      align-items: center;
    }

    /* Table */
    .bookings-table {
      width: 100%;
    }

    .booking-id {
      font-family: monospace;
      font-size: 0.75rem;
      color: #718096;
    }

    .activity-cell,
    .parent-cell,
    .datetime-cell {
      display: flex;
      flex-direction: column;
    }

    .activity-name,
    .parent-name {
      font-weight: 500;
      color: #2d3748;
    }

    .venue-name,
    .child-name,
    .time {
      font-size: 0.75rem;
      color: #718096;
    }

    .credits-value {
      font-weight: 600;
      color: #2c5282;
    }

    /* Status chips */
    .status-chip.confirmed { background: #c6f6d5 !important; color: #22543d !important; }
    .status-chip.completed { background: #e9d8fd !important; color: #553c9a !important; }
    .status-chip.cancelled { background: #fed7d7 !important; color: #742a2a !important; }
    .status-chip.no-show { background: #fefcbf !important; color: #744210 !important; }

    /* Responsive */
    @media (max-width: 1024px) {
      .stats-grid {
        grid-template-columns: repeat(2, 1fr);
      }

      .filters-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 768px) {
      .filters-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class AdminBookingsComponent implements OnInit {
  // -------------------------------------------------
  // STATE
  // -------------------------------------------------
  
  bookings = signal<PlatformBooking[]>([]);
  searchQuery: string = '';
  statusFilter: string = '';
  companyFilter: string = '';
  venueFilter: string = '';
  pageIndex: number = 0;
  pageSize: number = 10;
  
  displayedColumns = ['id', 'activity', 'parent', 'company', 'datetime', 'credits', 'status', 'actions'];

  // -------------------------------------------------
  // COMPUTED
  // -------------------------------------------------
  
  stats = computed(() => {
    const all = this.bookings();
    return {
      total: all.length,
      confirmed: all.filter(b => b.status === 'confirmed').length,
      completed: all.filter(b => b.status === 'completed').length,
      cancelled: all.filter(b => b.status === 'cancelled').length
    };
  });
  
  filteredBookings = computed(() => {
    let result = this.bookings();
    
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      result = result.filter(b => 
        b.activityName.toLowerCase().includes(query) ||
        b.parentName.toLowerCase().includes(query) ||
        b.childName.toLowerCase().includes(query)
      );
    }
    
    if (this.statusFilter) {
      result = result.filter(b => b.status === this.statusFilter);
    }
    
    if (this.companyFilter) {
      result = result.filter(b => b.company === this.companyFilter);
    }
    
    if (this.venueFilter) {
      result = result.filter(b => b.venueName === this.venueFilter);
    }
    
    return result;
  });
  
  paginatedBookings = computed(() => {
    const start = this.pageIndex * this.pageSize;
    return this.filteredBookings().slice(start, start + this.pageSize);
  });

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadBookings();
  }

  private loadBookings(): void {
    // Mock booking data
    this.bookings.set([
      {
        id: 'BK-001234',
        activityName: 'Junior Robotics',
        venueName: 'Code Ninjas West',
        parentName: 'Sarah Smith',
        company: 'Acme Corp',
        childName: 'Emma Smith',
        date: 'Jan 20, 2024',
        time: '10:00 AM',
        credits: 2,
        status: 'confirmed',
        createdAt: '2024-01-15'
      },
      {
        id: 'BK-001235',
        activityName: 'Art Studio',
        venueName: 'Art Studio Plus',
        parentName: 'John Doe',
        company: 'TechCorp',
        childName: 'Jake Doe',
        date: 'Jan 18, 2024',
        time: '2:00 PM',
        credits: 1,
        status: 'completed',
        createdAt: '2024-01-10'
      },
      {
        id: 'BK-001236',
        activityName: 'Soccer Skills',
        venueName: 'Sports Academy',
        parentName: 'Mike Wilson',
        company: 'StartupXYZ',
        childName: 'Max Wilson',
        date: 'Jan 19, 2024',
        time: '11:00 AM',
        credits: 1,
        status: 'cancelled',
        createdAt: '2024-01-12'
      },
      {
        id: 'BK-001237',
        activityName: 'Piano Lessons',
        venueName: 'Music Academy',
        parentName: 'Lisa Brown',
        company: 'Acme Corp',
        childName: 'Lily Brown',
        date: 'Jan 17, 2024',
        time: '3:00 PM',
        credits: 1,
        status: 'no-show',
        createdAt: '2024-01-14'
      }
    ]);
  }

  applyFilters(): void {
    this.pageIndex = 0;
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
  }

  viewDetails(booking: PlatformBooking): void {
    console.log('[AdminBookings] View details:', booking.id);
  }

  cancelBooking(booking: PlatformBooking): void {
    console.log('[AdminBookings] Cancel booking:', booking.id);
    this.snackBar.open('Booking cancelled', 'OK', { duration: 3000 });
  }

  contactParent(booking: PlatformBooking): void {
    console.log('[AdminBookings] Contact parent:', booking.parentName);
  }

  contactVenue(booking: PlatformBooking): void {
    console.log('[AdminBookings] Contact venue:', booking.venueName);
  }

  exportBookings(): void {
    console.log('[AdminBookings] Exporting bookings...');
    this.snackBar.open('Booking export started', 'OK', { duration: 3000 });
  }
}
