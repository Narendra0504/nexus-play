// =====================================================
// NEXUS FAMILY PASS - ADMIN VENUES COMPONENT
// Venue management page for system administrators
// List, filter, approve, and manage venue accounts
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Forms
import { FormsModule } from '@angular/forms';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';

/**
 * AdminVenuesComponent - Venue Management Page
 * 
 * Allows system administrators to:
 * - View all venue accounts
 * - Approve pending venues
 * - Manage venue status
 * - View venue performance
 */
@Component({
  // Component selector
  selector: 'app-admin-venues',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
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
    MatChipsModule,
    MatMenuModule,
    MatTabsModule
  ],
  
  // Inline template
  template: `
    <!-- Venues page container -->
    <div class="venues-container p-6">
      
      <!-- Page header -->
      <div class="page-header flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-display font-bold text-neutral-800">Venues</h1>
          <p class="text-neutral-500">{{ totalVenues() }} registered venues</p>
        </div>
        
        <button mat-raised-button color="primary" (click)="openAddVenueDialog()">
          <mat-icon>add</mat-icon>
          Add Venue
        </button>
      </div>

      <!-- Tabs for different venue states -->
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="mb-6">
        <mat-tab>
          <ng-template mat-tab-label>
            All Venues
            <mat-chip class="ml-2">{{ totalVenues() }}</mat-chip>
          </ng-template>
        </mat-tab>
        <mat-tab>
          <ng-template mat-tab-label>
            Pending Approval
            <mat-chip class="ml-2 bg-warning-100 text-warning-600">{{ pendingCount() }}</mat-chip>
          </ng-template>
        </mat-tab>
      </mat-tab-group>

      <!-- Filters -->
      <mat-card class="mb-6">
        <mat-card-content class="py-4">
          <div class="flex flex-wrap gap-4 items-end">
            
            <!-- Search -->
            <mat-form-field appearance="outline" class="flex-1 min-w-[250px]">
              <mat-label>Search venues</mat-label>
              <mat-icon matPrefix>search</mat-icon>
              <input matInput [(ngModel)]="searchQuery" placeholder="Venue name or city...">
            </mat-form-field>
            
            <!-- Category filter -->
            <mat-form-field appearance="outline" class="w-40">
              <mat-label>Category</mat-label>
              <mat-select [(ngModel)]="selectedCategory">
                <mat-option value="">All Categories</mat-option>
                <mat-option value="STEM">STEM</mat-option>
                <mat-option value="Arts">Arts</mat-option>
                <mat-option value="Sports">Sports</mat-option>
                <mat-option value="Music">Music</mat-option>
              </mat-select>
            </mat-form-field>
            
            <!-- Status filter -->
            <mat-form-field appearance="outline" class="w-40">
              <mat-label>Status</mat-label>
              <mat-select [(ngModel)]="selectedStatus">
                <mat-option value="">All Status</mat-option>
                <mat-option value="active">Active</mat-option>
                <mat-option value="pending">Pending</mat-option>
                <mat-option value="suspended">Suspended</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </mat-card-content>
      </mat-card>

      <!-- Venues table -->
      <mat-card>
        <mat-card-content class="p-0">
          <table mat-table [dataSource]="filteredVenues()" class="w-full">
            
            <!-- Venue Name -->
            <ng-container matColumnDef="venue">
              <th mat-header-cell *matHeaderCellDef>Venue</th>
              <td mat-cell *matCellDef="let row">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded bg-accent-100 flex items-center justify-center">
                    <mat-icon class="text-accent-600">storefront</mat-icon>
                  </div>
                  <div>
                    <div class="font-medium text-neutral-800">{{ row.name }}</div>
                    <div class="text-sm text-neutral-500">{{ row.location }}</div>
                  </div>
                </div>
              </td>
            </ng-container>
            
            <!-- Category -->
            <ng-container matColumnDef="category">
              <th mat-header-cell *matHeaderCellDef>Category</th>
              <td mat-cell *matCellDef="let row">{{ row.category }}</td>
            </ng-container>
            
            <!-- Activities -->
            <ng-container matColumnDef="activities">
              <th mat-header-cell *matHeaderCellDef>Activities</th>
              <td mat-cell *matCellDef="let row">{{ row.activityCount }}</td>
            </ng-container>
            
            <!-- Performance -->
            <ng-container matColumnDef="performance">
              <th mat-header-cell *matHeaderCellDef>Score</th>
              <td mat-cell *matCellDef="let row">
                <div class="flex items-center gap-1">
                  <mat-icon class="text-warning-500 text-base">star</mat-icon>
                  <span>{{ row.score }}</span>
                </div>
              </td>
            </ng-container>
            
            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <mat-chip [ngClass]="{
                  'bg-success-100 text-success-600': row.status === 'Active',
                  'bg-warning-100 text-warning-600': row.status === 'Pending',
                  'bg-danger-100 text-danger-600': row.status === 'Suspended'
                }">
                  {{ row.status }}
                </mat-chip>
              </td>
            </ng-container>
            
            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef></th>
              <td mat-cell *matCellDef="let row">
                <button mat-icon-button [matMenuTriggerFor]="venueMenu">
                  <mat-icon>more_vert</mat-icon>
                </button>
                <mat-menu #venueMenu="matMenu">
                  <button mat-menu-item (click)="viewVenue(row)">
                    <mat-icon>visibility</mat-icon>
                    <span>View Details</span>
                  </button>
                  @if (row.status === 'Pending') {
                    <button mat-menu-item class="text-success-600" (click)="approveVenue(row)">
                      <mat-icon>check_circle</mat-icon>
                      <span>Approve</span>
                    </button>
                    <button mat-menu-item class="text-danger-500" (click)="rejectVenue(row)">
                      <mat-icon>cancel</mat-icon>
                      <span>Reject</span>
                    </button>
                  }
                  @if (row.status === 'Active') {
                    <button mat-menu-item class="text-danger-500" (click)="suspendVenue(row)">
                      <mat-icon>block</mat-icon>
                      <span>Suspend</span>
                    </button>
                  }
                </mat-menu>
              </td>
            </ng-container>
            
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
          
          <!-- Paginator -->
          <mat-paginator [length]="totalVenues()"
                        [pageSize]="10"
                        [pageSizeOptions]="[10, 25, 50]"
                        showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `,
  
  // Inline styles
  styles: [`
    table { width: 100%; }
    
    .bg-accent-100 { background-color: rgba(49, 151, 149, 0.1); }
    .bg-success-100 { background-color: rgba(56, 161, 105, 0.1); }
    .bg-warning-100 { background-color: rgba(237, 137, 54, 0.1); }
    .bg-danger-100 { background-color: rgba(229, 62, 62, 0.1); }
    
    .text-accent-600 { color: #319795; }
    .text-success-600 { color: #38a169; }
    .text-warning-600 { color: #dd6b20; }
    .text-warning-500 { color: #ed8936; }
    .text-danger-600 { color: #c53030; }
    .text-danger-500 { color: #e53e3e; }
  `]
})
export class AdminVenuesComponent implements OnInit {
  // Table columns
  displayedColumns = ['venue', 'category', 'activities', 'performance', 'status', 'actions'];
  
  // Tab state
  selectedTabIndex = 0;
  
  // Filter state
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  
  // Data
  totalVenues = signal<number>(128);
  pendingCount = signal<number>(2);
  filteredVenues = signal<any[]>([]);

  /**
   * ngOnInit - Load venues
   */
  ngOnInit(): void {
    this.loadVenues();
  }

  /**
   * openAddVenueDialog - Open dialog to add venue
   */
  openAddVenueDialog(): void {
    console.log('[Admin Venues] Open add dialog');
  }

  /**
   * viewVenue - View venue details
   */
  viewVenue(venue: any): void {
    console.log('[Admin Venues] View:', venue);
  }

  /**
   * approveVenue - Approve pending venue
   */
  approveVenue(venue: any): void {
    console.log('[Admin Venues] Approve:', venue);
  }

  /**
   * rejectVenue - Reject pending venue
   */
  rejectVenue(venue: any): void {
    console.log('[Admin Venues] Reject:', venue);
  }

  /**
   * suspendVenue - Suspend active venue
   */
  suspendVenue(venue: any): void {
    console.log('[Admin Venues] Suspend:', venue);
  }

  /**
   * loadVenues - Load venue data
   */
  private loadVenues(): void {
    this.filteredVenues.set([
      { id: '1', name: 'Code Ninjas West', location: 'San Francisco, CA', category: 'STEM', activityCount: 8, score: 4.8, status: 'Active' },
      { id: '2', name: 'Artful Kids Academy', location: 'Oakland, CA', category: 'Arts', activityCount: 12, score: 4.6, status: 'Active' },
      { id: '3', name: 'Soccer Stars', location: 'San Jose, CA', category: 'Sports', activityCount: 5, score: 4.7, status: 'Active' },
      { id: '4', name: 'Music Together', location: 'Palo Alto, CA', category: 'Music', activityCount: 6, score: 4.9, status: 'Active' },
      { id: '5', name: 'New Venue Studio', location: 'Berkeley, CA', category: 'Arts', activityCount: 0, score: 0, status: 'Pending' }
    ]);
  }
}
