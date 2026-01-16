// =====================================================
// NEXUS FAMILY PASS - CHILDREN LIST COMPONENT
// Displays all children profiles for a parent with
// options to view, edit, or add new children
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
import { MatTooltipModule } from '@angular/material/tooltip';

// Import models
import { Child, EnergyLevel, SocialPreference } from '../../../../core/models';

/**
 * ChildrenListComponent - My Children Page
 * 
 * Displays a grid of child profile cards showing:
 * - Child's name, age, and avatar
 * - Interest tags from onboarding quiz
 * - Activity count for current month
 * - Quick actions (edit, view history)
 */
@Component({
  // Component selector
  selector: 'app-children-list',
  
  // Standalone component
  standalone: true,
  
  // Required imports
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatMenuModule,
    MatTooltipModule
  ],
  
  // Component template
  template: `
    <!-- Page container -->
    <div class="children-page">
      
      <!-- Page header -->
      <header class="page-header">
        <div class="header-content">
          <h1>My Children</h1>
          <p class="subtitle">Manage your children's profiles and preferences</p>
        </div>
        
        <!-- Add child button -->
        <button mat-raised-button color="primary" routerLink="/parent/children/new">
          <mat-icon>person_add</mat-icon>
          Add Child
        </button>
      </header>

      <!-- Children grid -->
      <div class="children-grid" *ngIf="children().length > 0">
        
        <!-- Child card -->
        <mat-card class="child-card" *ngFor="let child of children()">
          
          <!-- Card header with avatar and menu -->
          <div class="card-header">
            <!-- Avatar -->
            <div class="child-avatar" [style.background-color]="getAvatarColor(child.id)">
              {{ child.firstName.charAt(0) }}
            </div>
            
            <!-- Menu button -->
            <button mat-icon-button [matMenuTriggerFor]="childMenu" class="menu-btn">
              <mat-icon>more_vert</mat-icon>
            </button>
            
            <!-- Dropdown menu -->
            <mat-menu #childMenu="matMenu">
              <button mat-menu-item [routerLink]="['/parent/children', child.id, 'edit']">
                <mat-icon>edit</mat-icon>
                <span>Edit Profile</span>
              </button>
              <button mat-menu-item>
                <mat-icon>history</mat-icon>
                <span>Activity History</span>
              </button>
              <button mat-menu-item class="delete-option" (click)="confirmDelete(child)">
                <mat-icon>delete</mat-icon>
                <span>Remove</span>
              </button>
            </mat-menu>
          </div>

          <!-- Child info -->
          <div class="child-info">
            <h3 class="child-name">{{ child.firstName }}</h3>
            <p class="child-age">{{ child.age }} years old</p>
          </div>

          <!-- Preference badges -->
          <div class="preference-badges">
            <span class="badge energy" [matTooltip]="'Energy Level'">
              <mat-icon>{{ getEnergyIcon(child.energyLevel) }}</mat-icon>
              {{ getEnergyLabel(child.energyLevel) }}
            </span>
            <span class="badge social" [matTooltip]="'Social Preference'">
              <mat-icon>{{ getSocialIcon(child.socialPreference) }}</mat-icon>
              {{ getSocialLabel(child.socialPreference) }}
            </span>
          </div>

          <!-- Interest tags -->
          <div class="interests-section">
            <span class="section-label">Interests</span>
            <mat-chip-set class="interests-chips">
              <mat-chip *ngFor="let interest of child.interests.slice(0, 3)">
                {{ interest.interest }}
              </mat-chip>
              <mat-chip *ngIf="child.interests.length > 3" class="more-chip">
                +{{ child.interests.length - 3 }} more
              </mat-chip>
            </mat-chip-set>
          </div>

          <!-- Activity stats -->
          <div class="activity-stats">
            <mat-icon>event</mat-icon>
            <span>{{ child.activitiesThisMonth }} activities this month</span>
          </div>

          <!-- Card actions -->
          <div class="card-actions">
            <button mat-stroked-button [routerLink]="['/parent/children', child.id, 'edit']">
              <mat-icon>edit</mat-icon>
              Edit Profile
            </button>
            <button mat-raised-button color="primary" routerLink="/parent/activities" 
                    [queryParams]="{ childId: child.id }">
              <mat-icon>search</mat-icon>
              Find Activities
            </button>
          </div>
        </mat-card>
      </div>

      <!-- Empty state -->
      <div class="empty-state" *ngIf="children().length === 0">
        <div class="empty-content">
          <mat-icon>child_care</mat-icon>
          <h2>No children added yet</h2>
          <p>Add your first child to start receiving personalized activity recommendations</p>
          <button mat-raised-button color="primary" routerLink="/parent/children/new">
            <mat-icon>person_add</mat-icon>
            Add Your First Child
          </button>
        </div>
      </div>

    </div>
  `,
  
  // Component styles
  styles: [`
    /* Page container */
    .children-page {
      max-width: 1200px;                             /* Max width */
      margin: 0 auto;                                /* Center horizontally */
    }

    /* Page header */
    .page-header {
      display: flex;                                 /* Flexbox layout */
      justify-content: space-between;               /* Space between items */
      align-items: flex-start;                      /* Align to top */
      margin-bottom: 2rem;                          /* Bottom margin */
      flex-wrap: wrap;                              /* Wrap on mobile */
      gap: 1rem;                                    /* Gap for wrapping */
    }

    .header-content h1 {
      font-size: 1.75rem;                           /* Large heading */
      font-weight: 600;                             /* Semi-bold */
      color: #2d3748;                               /* Dark gray */
      margin: 0 0 0.5rem;                           /* Bottom margin only */
    }

    .subtitle {
      color: #718096;                               /* Gray text */
      margin: 0;                                    /* Remove margin */
    }

    /* Children grid */
    .children-grid {
      display: grid;                                /* Grid layout */
      grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
      gap: 1.5rem;                                  /* Gap between cards */
    }

    /* Child card */
    .child-card {
      padding: 1.5rem;                              /* Inner padding */
      border-radius: 16px;                          /* Rounded corners */
      transition: transform 0.2s, box-shadow 0.2s;  /* Smooth transition */
    }

    .child-card:hover {
      transform: translateY(-4px);                  /* Lift on hover */
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);   /* Stronger shadow */
    }

    /* Card header */
    .card-header {
      display: flex;                                /* Flexbox layout */
      justify-content: space-between;               /* Space between items */
      align-items: flex-start;                      /* Align to top */
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    /* Child avatar */
    .child-avatar {
      width: 64px;                                  /* Avatar size */
      height: 64px;
      border-radius: 50%;                           /* Circle shape */
      display: flex;                                /* Flexbox for centering */
      align-items: center;                          /* Center vertically */
      justify-content: center;                      /* Center horizontally */
      font-size: 1.5rem;                            /* Large initial */
      font-weight: 600;                             /* Semi-bold */
      color: white;                                 /* White text */
    }

    .menu-btn {
      color: #718096;                               /* Gray color */
    }

    /* Child info */
    .child-info {
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    .child-name {
      font-size: 1.25rem;                           /* Larger name */
      font-weight: 600;                             /* Semi-bold */
      color: #2d3748;                               /* Dark gray */
      margin: 0 0 0.25rem;                          /* Small bottom margin */
    }

    .child-age {
      color: #718096;                               /* Gray text */
      margin: 0;                                    /* Remove margin */
    }

    /* Preference badges */
    .preference-badges {
      display: flex;                                /* Flexbox layout */
      gap: 0.5rem;                                  /* Gap between badges */
      margin-bottom: 1rem;                          /* Bottom margin */
      flex-wrap: wrap;                              /* Wrap if needed */
    }

    .badge {
      display: flex;                                /* Flexbox layout */
      align-items: center;                          /* Center vertically */
      gap: 0.25rem;                                 /* Small gap */
      padding: 0.25rem 0.75rem;                     /* Badge padding */
      border-radius: 999px;                         /* Pill shape */
      font-size: 0.75rem;                           /* Small text */
      font-weight: 500;                             /* Medium weight */
    }

    .badge mat-icon {
      font-size: 14px;                              /* Small icon */
      width: 14px;
      height: 14px;
    }

    .badge.energy {
      background-color: rgba(237, 137, 54, 0.1);   /* Orange tint */
      color: #ed8936;                               /* Orange text */
    }

    .badge.social {
      background-color: rgba(49, 151, 149, 0.1);   /* Teal tint */
      color: #319795;                               /* Teal text */
    }

    /* Interests section */
    .interests-section {
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    .section-label {
      display: block;                               /* Block display */
      font-size: 0.75rem;                           /* Small text */
      color: #718096;                               /* Gray text */
      margin-bottom: 0.5rem;                        /* Bottom margin */
      text-transform: uppercase;                    /* Uppercase */
      letter-spacing: 0.5px;                        /* Letter spacing */
    }

    .interests-chips {
      display: flex;                                /* Flexbox layout */
      flex-wrap: wrap;                              /* Wrap chips */
      gap: 0.5rem;                                  /* Gap between chips */
    }

    .more-chip {
      background-color: #e2e8f0 !important;         /* Gray background */
      color: #718096 !important;                    /* Gray text */
    }

    /* Activity stats */
    .activity-stats {
      display: flex;                                /* Flexbox layout */
      align-items: center;                          /* Center vertically */
      gap: 0.5rem;                                  /* Gap */
      color: #718096;                               /* Gray text */
      font-size: 0.875rem;                          /* Smaller text */
      padding: 0.75rem;                             /* Padding */
      background-color: #f7fafc;                    /* Light background */
      border-radius: 8px;                           /* Rounded corners */
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    .activity-stats mat-icon {
      color: #319795;                               /* Accent color */
      font-size: 20px;                              /* Icon size */
      width: 20px;
      height: 20px;
    }

    /* Card actions */
    .card-actions {
      display: flex;                                /* Flexbox layout */
      gap: 0.75rem;                                 /* Gap between buttons */
    }

    .card-actions button {
      flex: 1;                                      /* Equal width */
    }

    /* Delete option in menu */
    .delete-option {
      color: #e53e3e !important;                    /* Red text */
    }

    /* Empty state */
    .empty-state {
      display: flex;                                /* Flexbox layout */
      justify-content: center;                      /* Center horizontally */
      align-items: center;                          /* Center vertically */
      min-height: 400px;                            /* Minimum height */
    }

    .empty-content {
      text-align: center;                           /* Center text */
      max-width: 400px;                             /* Max width */
    }

    .empty-content mat-icon {
      font-size: 80px;                              /* Large icon */
      width: 80px;
      height: 80px;
      color: #cbd5e0;                               /* Light gray */
      margin-bottom: 1rem;                          /* Bottom margin */
    }

    .empty-content h2 {
      font-size: 1.5rem;                            /* Heading size */
      font-weight: 600;                             /* Semi-bold */
      color: #2d3748;                               /* Dark gray */
      margin: 0 0 0.5rem;                           /* Bottom margin only */
    }

    .empty-content p {
      color: #718096;                               /* Gray text */
      margin: 0 0 1.5rem;                           /* Bottom margin */
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .children-grid {
        grid-template-columns: 1fr;                 /* Single column on mobile */
      }

      .card-actions {
        flex-direction: column;                     /* Stack buttons on mobile */
      }
    }
  `]
})
export class ChildrenListComponent implements OnInit {
  // -------------------------------------------------
  // STATE SIGNALS
  // -------------------------------------------------
  
  // Children list signal
  children = signal<any[]>([]);

  // Avatar colors for variety
  private avatarColors = [
    '#2c5282', '#319795', '#ed8936', '#9f7aea', 
    '#38a169', '#e53e3e', '#3182ce', '#d69e2e'
  ];

  /**
   * ngOnInit - Load children data
   */
  ngOnInit(): void {
    this.loadChildren();
  }

  /**
   * getAvatarColor - Get consistent color for child avatar
   * @param childId - Child ID for color selection
   */
  getAvatarColor(childId: string): string {
    // Use hash of ID to select consistent color
    const index = childId.charCodeAt(childId.length - 1) % this.avatarColors.length;
    return this.avatarColors[index];
  }

  /**
   * getEnergyIcon - Get icon for energy level
   * @param level - Energy level enum value
   */
  getEnergyIcon(level: EnergyLevel): string {
    switch (level) {
      case EnergyLevel.CALM: return 'spa';
      case EnergyLevel.BALANCED: return 'balance';
      case EnergyLevel.HIGH: return 'bolt';
      default: return 'help';
    }
  }

  /**
   * getEnergyLabel - Get label for energy level
   * @param level - Energy level enum value
   */
  getEnergyLabel(level: EnergyLevel): string {
    switch (level) {
      case EnergyLevel.CALM: return 'Calm';
      case EnergyLevel.BALANCED: return 'Balanced';
      case EnergyLevel.HIGH: return 'High Energy';
      default: return 'Unknown';
    }
  }

  /**
   * getSocialIcon - Get icon for social preference
   * @param pref - Social preference enum value
   */
  getSocialIcon(pref: SocialPreference): string {
    switch (pref) {
      case SocialPreference.SOLO: return 'person';
      case SocialPreference.SMALL_GROUP: return 'group';
      case SocialPreference.LARGE_GROUP: return 'groups';
      default: return 'help';
    }
  }

  /**
   * getSocialLabel - Get label for social preference
   * @param pref - Social preference enum value
   */
  getSocialLabel(pref: SocialPreference): string {
    switch (pref) {
      case SocialPreference.SOLO: return 'Solo';
      case SocialPreference.SMALL_GROUP: return 'Small Group';
      case SocialPreference.LARGE_GROUP: return 'Large Group';
      default: return 'Unknown';
    }
  }

  /**
   * confirmDelete - Show delete confirmation
   * @param child - Child to delete
   */
  confirmDelete(child: any): void {
    // TODO: Show confirmation dialog
    console.log('[Children] Delete requested for:', child.firstName);
  }

  /**
   * loadChildren - Load mock children data
   */
  private loadChildren(): void {
    // Mock data for demo
    this.children.set([
      {
        id: 'child_001',
        firstName: 'Emma',
        age: 8,
        energyLevel: EnergyLevel.BALANCED,
        socialPreference: SocialPreference.SMALL_GROUP,
        interests: [
          { interest: 'STEM' },
          { interest: 'Arts & Crafts' },
          { interest: 'Music' }
        ],
        activitiesThisMonth: 3
      },
      {
        id: 'child_002',
        firstName: 'Jake',
        age: 5,
        energyLevel: EnergyLevel.HIGH,
        socialPreference: SocialPreference.LARGE_GROUP,
        interests: [
          { interest: 'Sports' },
          { interest: 'Nature' },
          { interest: 'Building' }
        ],
        activitiesThisMonth: 2
      }
    ]);
  }
}
