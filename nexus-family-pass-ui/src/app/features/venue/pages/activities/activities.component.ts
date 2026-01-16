// =====================================================
// NEXUS FAMILY PASS - VENUE ACTIVITIES COMPONENT
// Activity listings management for venue administrators
// CRUD operations for venue's activity offerings
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
import { MatMenuModule } from '@angular/material/menu';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';

/**
 * VenueActivitiesComponent - Activity Management Page
 * 
 * Allows venue administrators to:
 * - View all their activity listings
 * - Create new activities
 * - Edit existing activities
 * - Manage activity status (active/paused/archived)
 */
@Component({
  // Component selector
  selector: 'app-venue-activities',
  
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
    MatMenuModule,
    MatTabsModule,
    MatBadgeModule
  ],
  
  // Inline template
  template: `
    <!-- Activities page container -->
    <div class="activities-container p-6">
      
      <!-- Page header -->
      <div class="page-header flex justify-between items-start mb-6">
        <div>
          <h1 class="text-2xl font-display font-bold text-neutral-800">My Activities</h1>
          <p class="text-neutral-500">Manage your activity listings</p>
        </div>
        
        <button mat-raised-button color="primary" routerLink="/venue/activities/new">
          <mat-icon>add</mat-icon>
          Add New Activity
        </button>
      </div>

      <!-- Status filter tabs -->
      <mat-tab-group [(selectedIndex)]="selectedTabIndex" class="mb-6">
        <mat-tab>
          <ng-template mat-tab-label>
            Active
            <mat-chip class="ml-2 bg-success-100 text-success-600">
              {{ getActivityCount('active') }}
            </mat-chip>
          </ng-template>
        </mat-tab>
        <mat-tab>
          <ng-template mat-tab-label>
            Paused
            <mat-chip class="ml-2 bg-warning-100 text-warning-600">
              {{ getActivityCount('paused') }}
            </mat-chip>
          </ng-template>
        </mat-tab>
        <mat-tab>
          <ng-template mat-tab-label>
            Draft
            <mat-chip class="ml-2 bg-neutral-100 text-neutral-600">
              {{ getActivityCount('draft') }}
            </mat-chip>
          </ng-template>
        </mat-tab>
      </mat-tab-group>

      <!-- Activities grid -->
      <div class="activities-grid grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <mat-card *ngFor="let activity of filteredActivities()" class="activity-card">
          
          <!-- Activity image -->
          <div class="activity-image relative">
            <img [src]="activity.imageUrl" [alt]="activity.name" 
                 class="w-full h-40 object-cover">
            
            <!-- Category badge -->
            <span class="absolute top-2 left-2 px-2 py-1 bg-white/90 rounded text-xs font-medium">
              {{ activity.category }}
            </span>
            
            <!-- Status indicator -->
            <span class="absolute top-2 right-2 px-2 py-1 rounded text-xs font-medium"
                  [ngClass]="{
                    'bg-success-500 text-white': activity.status === 'active',
                    'bg-warning-500 text-white': activity.status === 'paused',
                    'bg-neutral-400 text-white': activity.status === 'draft'
                  }">
              {{ activity.status | titlecase }}
            </span>
          </div>
          
          <mat-card-content class="pt-4">
            <!-- Activity name -->
            <h3 class="text-lg font-medium text-neutral-800 mb-1">{{ activity.name }}</h3>
            
            <!-- Details row -->
            <div class="flex gap-4 text-sm text-neutral-500 mb-3">
              <span class="flex items-center gap-1">
                <mat-icon class="text-base">child_care</mat-icon>
                Ages {{ activity.ageRange }}
              </span>
              <span class="flex items-center gap-1">
                <mat-icon class="text-base">schedule</mat-icon>
                {{ activity.duration }} min
              </span>
            </div>
            
            <!-- Credits and rating -->
            <div class="flex justify-between items-center text-sm mb-4">
              <span class="font-medium text-primary-600">{{ activity.credits }} credits</span>
              <span class="flex items-center gap-1 text-neutral-500">
                <mat-icon class="text-warning-500 text-base">star</mat-icon>
                {{ activity.rating }} ({{ activity.reviewCount }})
              </span>
            </div>
            
            <!-- Booking stats -->
            <div class="bg-neutral-50 p-3 rounded-lg text-sm">
              <div class="flex justify-between mb-1">
                <span class="text-neutral-500">This week</span>
                <span class="font-medium">{{ activity.weeklyBookings }} bookings</span>
              </div>
              <div class="flex justify-between">
                <span class="text-neutral-500">Total</span>
                <span class="font-medium">{{ activity.totalBookings }} bookings</span>
              </div>
            </div>
          </mat-card-content>
          
          <mat-card-actions class="px-4 pb-4">
            <!-- Edit button -->
            <button mat-stroked-button [routerLink]="['/venue/activities', activity.id, 'edit']">
              <mat-icon>edit</mat-icon>
              Edit
            </button>
            
            <!-- More actions menu -->
            <button mat-icon-button [matMenuTriggerFor]="activityMenu">
              <mat-icon>more_vert</mat-icon>
            </button>
            
            <mat-menu #activityMenu="matMenu">
              <button mat-menu-item (click)="viewSchedule(activity)">
                <mat-icon>calendar_today</mat-icon>
                <span>View Schedule</span>
              </button>
              <button mat-menu-item (click)="duplicateActivity(activity)">
                <mat-icon>content_copy</mat-icon>
                <span>Duplicate</span>
              </button>
              <button mat-menu-item (click)="toggleStatus(activity)">
                <mat-icon>{{ activity.status === 'active' ? 'pause' : 'play_arrow' }}</mat-icon>
                <span>{{ activity.status === 'active' ? 'Pause' : 'Activate' }}</span>
              </button>
              <button mat-menu-item class="text-danger-500" (click)="archiveActivity(activity)">
                <mat-icon>archive</mat-icon>
                <span>Archive</span>
              </button>
            </mat-menu>
          </mat-card-actions>
        </mat-card>
        
        <!-- Empty state -->
        <div *ngIf="filteredActivities().length === 0" 
             class="col-span-full text-center py-12">
          <mat-icon class="scale-150 text-neutral-300 mb-4">event_note</mat-icon>
          <h3 class="text-lg font-medium text-neutral-600 mb-2">No activities found</h3>
          <p class="text-neutral-500 mb-4">
            {{ getEmptyStateMessage() }}
          </p>
          <button mat-raised-button color="primary" routerLink="/venue/activities/new">
            Create Your First Activity
          </button>
        </div>
      </div>
    </div>
  `,
  
  // Inline styles
  styles: [`
    .activity-card {
      transition: box-shadow 0.2s;
    }
    .activity-card:hover {
      box-shadow: 0 8px 24px rgba(0,0,0,0.12);
    }
    
    .activity-image img {
      border-radius: 4px 4px 0 0;
    }
    
    /* Color utilities */
    .bg-success-100 { background-color: rgba(56, 161, 105, 0.1); }
    .bg-success-500 { background-color: #38a169; }
    .bg-warning-100 { background-color: rgba(237, 137, 54, 0.1); }
    .bg-warning-500 { background-color: #ed8936; }
    .bg-neutral-100 { background-color: #f7fafc; }
    .bg-neutral-400 { background-color: #a0aec0; }
    
    .text-success-600 { color: #38a169; }
    .text-warning-500 { color: #ed8936; }
    .text-warning-600 { color: #dd6b20; }
    .text-neutral-600 { color: #4a5568; }
    .text-primary-600 { color: #2c5282; }
    .text-danger-500 { color: #e53e3e; }
  `]
})
export class VenueActivitiesComponent implements OnInit {
  // Selected tab index
  selectedTabIndex = 0;
  
  // All activities
  activities = signal<any[]>([]);
  
  // Filtered activities based on tab
  filteredActivities = signal<any[]>([]);

  /**
   * ngOnInit - Load activities
   */
  ngOnInit(): void {
    this.loadActivities();
  }

  /**
   * getActivityCount - Get count for each status
   */
  getActivityCount(status: string): number {
    return this.activities().filter(a => a.status === status).length;
  }

  /**
   * getEmptyStateMessage - Get message based on tab
   */
  getEmptyStateMessage(): string {
    const messages: Record<number, string> = {
      0: "You don't have any active activities yet.",
      1: "You don't have any paused activities.",
      2: "You don't have any draft activities."
    };
    return messages[this.selectedTabIndex] || '';
  }

  /**
   * viewSchedule - View activity schedule
   */
  viewSchedule(activity: any): void {
    console.log('[Activities] View schedule:', activity.id);
  }

  /**
   * duplicateActivity - Create a copy of activity
   */
  duplicateActivity(activity: any): void {
    console.log('[Activities] Duplicate:', activity.id);
  }

  /**
   * toggleStatus - Toggle active/paused status
   */
  toggleStatus(activity: any): void {
    console.log('[Activities] Toggle status:', activity.id);
  }

  /**
   * archiveActivity - Archive activity
   */
  archiveActivity(activity: any): void {
    console.log('[Activities] Archive:', activity.id);
  }

  /**
   * loadActivities - Load mock activity data
   */
  private loadActivities(): void {
    const mockActivities = [
      { id: '1', name: 'Junior Robotics Workshop', category: 'STEM', ageRange: '6-10', duration: 90, credits: 2, rating: 4.8, reviewCount: 45, status: 'active', weeklyBookings: 12, totalBookings: 234, imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop' },
      { id: '2', name: 'Coding Fundamentals', category: 'STEM', ageRange: '8-12', duration: 60, credits: 1, rating: 4.6, reviewCount: 32, status: 'active', weeklyBookings: 8, totalBookings: 156, imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=200&fit=crop' },
      { id: '3', name: 'Game Design for Kids', category: 'STEM', ageRange: '10-14', duration: 120, credits: 2, rating: 4.9, reviewCount: 28, status: 'active', weeklyBookings: 6, totalBookings: 89, imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=400&h=200&fit=crop' },
      { id: '4', name: '3D Printing Workshop', category: 'STEM', ageRange: '8-14', duration: 90, credits: 2, rating: 4.5, reviewCount: 15, status: 'paused', weeklyBookings: 0, totalBookings: 45, imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=400&h=200&fit=crop' }
    ];
    
    this.activities.set(mockActivities);
    this.filterActivities();
  }

  /**
   * filterActivities - Filter based on selected tab
   */
  private filterActivities(): void {
    const statusMap: Record<number, string> = { 0: 'active', 1: 'paused', 2: 'draft' };
    const status = statusMap[this.selectedTabIndex];
    this.filteredActivities.set(
      this.activities().filter(a => a.status === status)
    );
  }
}
