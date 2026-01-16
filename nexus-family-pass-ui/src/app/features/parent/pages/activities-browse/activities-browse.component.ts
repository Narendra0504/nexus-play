// =====================================================
// NEXUS FAMILY PASS - ACTIVITIES BROWSE COMPONENT
// Browse and search activities with NL search, filters,
// and grid display of available activities
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Router
import { RouterLink, ActivatedRoute } from '@angular/router';

// Import Reactive Forms
import { ReactiveFormsModule, FormControl } from '@angular/forms';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatDividerModule } from '@angular/material/divider';

// Import models
import { Activity, INTEREST_CATEGORIES } from '../../../../core/models';

/**
 * ActivitiesBrowseComponent - Browse Activities Page
 * 
 * Features:
 * - Natural language search with AI parsing
 * - Traditional filter sidebar
 * - Responsive activity card grid
 * - Sorting and pagination
 */
@Component({
  // Component selector
  selector: 'app-activities-browse',
  
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
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    MatCheckboxModule,
    MatSliderModule,
    MatChipsModule,
    MatExpansionModule,
    MatBadgeModule,
    MatTooltipModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatDividerModule
  ],
  
  // Component template
  template: `
    <!-- Page container with sidenav for filters -->
    <mat-sidenav-container class="browse-container">
      
      <!-- Filter sidebar -->
      <mat-sidenav 
        #filterDrawer
        [mode]="isMobile() ? 'over' : 'side'"
        [opened]="!isMobile()"
        class="filter-sidebar">
        
        <!-- Filter header -->
        <div class="filter-header">
          <h2>
            <mat-icon>filter_list</mat-icon>
            Filters
          </h2>
          <button mat-button color="primary" (click)="clearFilters()">
            Clear All
          </button>
        </div>

        <!-- Natural Language Search - Prominent at top -->
        <div class="nl-search-section">
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Describe what you're looking for...</mat-label>
            <textarea 
              matInput 
              [formControl]="nlSearchControl"
              rows="2"
              placeholder="e.g., 'something creative but not messy for my 7-year-old'">
            </textarea>
            <mat-icon matPrefix>auto_awesome</mat-icon>
          </mat-form-field>
          
          <button 
            mat-raised-button 
            color="accent" 
            class="search-btn"
            (click)="performNLSearch()"
            [disabled]="isSearching()">
            @if (isSearching()) {
              <mat-spinner diameter="20"></mat-spinner>
            } @else {
              <mat-icon>search</mat-icon>
            }
            AI Search
          </button>
          
          <p class="search-hint">
            <mat-icon>lightbulb</mat-icon>
            Try: "outdoor activities for my 7-year-old that aren't competitive"
          </p>
        </div>

        <mat-divider></mat-divider>

        <!-- Traditional Filters -->
        <div class="traditional-filters">
          <p class="filter-section-label">Or filter manually:</p>
          
          <!-- Child selector -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Filter by child</mat-label>
            <mat-select [formControl]="childFilterControl">
              <mat-option value="">All children</mat-option>
              <mat-option value="child_001">Emma (8 years)</mat-option>
              <mat-option value="child_002">Jake (5 years)</mat-option>
            </mat-select>
            <mat-icon matPrefix>child_care</mat-icon>
          </mat-form-field>

          <!-- Category multi-select -->
          <mat-form-field appearance="outline" class="full-width">
            <mat-label>Categories</mat-label>
            <mat-select [formControl]="categoryFilterControl" multiple>
              @for (category of categories; track category) {
                <mat-option [value]="category">{{ category }}</mat-option>
              }
            </mat-select>
            <mat-icon matPrefix>category</mat-icon>
          </mat-form-field>

          <!-- Age range -->
          <div class="filter-group">
            <label class="filter-label">Age Range</label>
            <div class="age-inputs">
              <mat-form-field appearance="outline" class="age-field">
                <mat-label>Min</mat-label>
                <input matInput type="number" [formControl]="minAgeControl" min="3" max="18">
              </mat-form-field>
              <span class="age-separator">to</span>
              <mat-form-field appearance="outline" class="age-field">
                <mat-label>Max</mat-label>
                <input matInput type="number" [formControl]="maxAgeControl" min="3" max="18">
              </mat-form-field>
            </div>
          </div>

          <!-- Time of day checkboxes -->
          <div class="filter-group">
            <label class="filter-label">Time of Day</label>
            <div class="checkbox-group">
              <mat-checkbox [formControl]="morningControl">Morning</mat-checkbox>
              <mat-checkbox [formControl]="afternoonControl">Afternoon</mat-checkbox>
              <mat-checkbox [formControl]="eveningControl">Evening</mat-checkbox>
            </div>
          </div>

          <!-- Distance slider -->
          <div class="filter-group">
            <label class="filter-label">Max Distance: {{ distanceControl.value }} min drive</label>
            <mat-slider min="5" max="30" step="5" discrete>
              <input matSliderThumb [formControl]="distanceControl">
            </mat-slider>
          </div>

          <!-- Venue score minimum -->
          <div class="filter-group">
            <label class="filter-label">Min Venue Score: {{ minScoreControl.value }}+</label>
            <mat-slider min="0" max="100" step="10" discrete>
              <input matSliderThumb [formControl]="minScoreControl">
            </mat-slider>
          </div>

          <!-- Sibling-friendly toggle -->
          <div class="filter-group">
            <mat-checkbox [formControl]="siblingFriendlyControl" color="primary">
              <span class="checkbox-label">
                <mat-icon>groups</mat-icon>
                Sibling-friendly activities only
              </span>
            </mat-checkbox>
          </div>

          <!-- Apply filters button (mobile only) -->
          @if (isMobile()) {
            <button 
              mat-raised-button 
              color="primary" 
              class="apply-filters-btn"
              (click)="applyFilters(); filterDrawer.close()">
              Apply Filters
            </button>
          }
        </div>
      </mat-sidenav>

      <!-- Main content area -->
      <mat-sidenav-content class="main-content">
        
        <!-- Search header -->
        <div class="search-header">
          <div class="header-left">
            <!-- Mobile filter toggle -->
            @if (isMobile()) {
              <button mat-icon-button (click)="filterDrawer.toggle()">
                <mat-icon [matBadge]="activeFilterCount()" matBadgeColor="accent">
                  filter_list
                </mat-icon>
              </button>
            }
            
            <h1>Browse Activities</h1>
            <span class="results-count">{{ activities().length }} activities found</span>
          </div>
          
          <div class="header-right">
            <!-- Sort dropdown -->
            <mat-form-field appearance="outline" class="sort-field">
              <mat-label>Sort by</mat-label>
              <mat-select [formControl]="sortControl">
                <mat-option value="relevance">Relevance</mat-option>
                <mat-option value="date">Date</mat-option>
                <mat-option value="distance">Distance</mat-option>
                <mat-option value="score">Venue Score</mat-option>
                <mat-option value="credits">Credits (Low to High)</mat-option>
              </mat-select>
            </mat-form-field>
          </div>
        </div>

        <!-- Loading state -->
        @if (isLoading()) {
          <div class="loading-state">
            <mat-spinner diameter="48"></mat-spinner>
            <p>Finding the best activities for you...</p>
          </div>
        } @else {
          
          <!-- Activities grid -->
          <div class="activities-grid">
            @for (activity of activities(); track activity.id) {
              <mat-card class="activity-card">
                
                <!-- Activity image -->
                <div class="card-image">
                  <img [src]="activity.imageUrl" [alt]="activity.name">
                  
                  <!-- Category badge overlay -->
                  <span class="category-badge">{{ activity.category }}</span>
                  
                  <!-- Favorite button -->
                  <button 
                    mat-icon-button 
                    class="favorite-btn"
                    (click)="toggleFavorite(activity)"
                    [matTooltip]="activity.isFavorited ? 'Remove from favorites' : 'Add to favorites'">
                    <mat-icon>{{ activity.isFavorited ? 'favorite' : 'favorite_border' }}</mat-icon>
                  </button>
                </div>

                <!-- Card content -->
                <mat-card-content class="card-content">
                  <!-- Activity name -->
                  <h3 class="activity-name">{{ activity.name }}</h3>
                  
                  <!-- Venue with score -->
                  <div class="venue-row">
                    <span class="venue-name">{{ activity.venueName }}</span>
                    <span class="venue-score">
                      <mat-icon>star</mat-icon>
                      {{ activity.venueScore }}
                    </span>
                  </div>
                  
                  <!-- Age range and credits -->
                  <div class="activity-meta">
                    <span class="age-range">
                      <mat-icon>cake</mat-icon>
                      Ages {{ activity.minAge }}-{{ activity.maxAge }}
                    </span>
                    <span class="credits">
                      <mat-icon>toll</mat-icon>
                      {{ activity.credits }} credits
                    </span>
                  </div>
                  
                  <!-- Next available date -->
                  <p class="next-available">
                    <mat-icon>event</mat-icon>
                    Next: {{ activity.nextAvailable }}
                  </p>
                  
                  <!-- Availability indicator -->
                  <div class="availability" [ngClass]="getAvailabilityClass(activity.spotsLeft)">
                    @if (activity.spotsLeft > 0) {
                      <mat-icon>event_available</mat-icon>
                      <span>{{ activity.spotsLeft }} spots left</span>
                    } @else {
                      <mat-icon>hourglass_empty</mat-icon>
                      <span>Waitlist only</span>
                    }
                  </div>
                </mat-card-content>

                <!-- Card actions -->
                <mat-card-actions class="card-actions">
                  @if (activity.spotsLeft > 0) {
                    <button 
                      mat-raised-button 
                      color="primary"
                      [routerLink]="['/parent/activities', activity.id]">
                      Book Now
                    </button>
                  } @else {
                    <button 
                      mat-stroked-button 
                      color="primary"
                      [routerLink]="['/parent/activities', activity.id]">
                      Join Waitlist
                    </button>
                  }
                </mat-card-actions>
              </mat-card>
            }
          </div>

          <!-- Empty state -->
          @if (activities().length === 0) {
            <div class="empty-state">
              <mat-icon>search_off</mat-icon>
              <h2>No activities found</h2>
              <p>Try adjusting your filters or search criteria</p>
              <button mat-raised-button color="primary" (click)="clearFilters()">
                Clear All Filters
              </button>
            </div>
          }

          <!-- Load more button -->
          @if (activities().length > 0 && hasMore()) {
            <div class="load-more">
              <button mat-stroked-button (click)="loadMore()">
                Load More Activities
              </button>
            </div>
          }
        }
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  
  // Component styles
  styles: [`
    /* Browse container */
    .browse-container {
      height: calc(100vh - 64px - 3rem);             /* Full height minus toolbar and padding */
    }

    /* Filter sidebar */
    .filter-sidebar {
      width: 320px;                                   /* Fixed sidebar width */
      padding: 1.5rem;                                /* Inner padding */
      background-color: white;                        /* White background */
    }

    .filter-header {
      display: flex;                                  /* Flexbox layout */
      justify-content: space-between;                /* Space between items */
      align-items: center;                           /* Center vertically */
      margin-bottom: 1.5rem;                         /* Bottom margin */
    }

    .filter-header h2 {
      display: flex;                                  /* Flexbox for icon */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
      font-size: 1.25rem;                            /* Heading size */
      font-weight: 600;                              /* Semi-bold */
      margin: 0;                                     /* Remove margin */
    }

    /* NL Search section */
    .nl-search-section {
      margin-bottom: 1.5rem;                         /* Bottom margin */
    }

    .search-btn {
      width: 100%;                                    /* Full width */
      margin-bottom: 0.75rem;                        /* Bottom margin */
    }

    .search-hint {
      display: flex;                                  /* Flexbox layout */
      align-items: flex-start;                       /* Align to top */
      gap: 0.5rem;                                   /* Gap */
      font-size: 0.75rem;                            /* Small text */
      color: #718096;                                /* Gray color */
      margin: 0;                                     /* Remove margin */
    }

    .search-hint mat-icon {
      font-size: 16px;                               /* Small icon */
      width: 16px;
      height: 16px;
      color: #ed8936;                                /* Warning color */
    }

    /* Traditional filters */
    .traditional-filters {
      margin-top: 1.5rem;                            /* Top margin */
    }

    .filter-section-label {
      font-size: 0.875rem;                           /* Smaller text */
      color: #718096;                                /* Gray color */
      margin: 0 0 1rem;                              /* Bottom margin */
    }

    .full-width {
      width: 100%;                                    /* Full width */
    }

    .filter-group {
      margin-bottom: 1.5rem;                         /* Bottom margin */
    }

    .filter-label {
      display: block;                                /* Block display */
      font-size: 0.875rem;                           /* Smaller text */
      font-weight: 500;                              /* Medium weight */
      color: #4a5568;                                /* Dark gray */
      margin-bottom: 0.5rem;                         /* Bottom margin */
    }

    .age-inputs {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
    }

    .age-field {
      flex: 1;                                        /* Equal width */
    }

    .age-separator {
      color: #718096;                                /* Gray color */
    }

    .checkbox-group {
      display: flex;                                  /* Flexbox layout */
      flex-direction: column;                        /* Stack vertically */
      gap: 0.5rem;                                   /* Gap */
    }

    .checkbox-label {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
    }

    .apply-filters-btn {
      width: 100%;                                    /* Full width */
      margin-top: 1rem;                              /* Top margin */
    }

    /* Main content */
    .main-content {
      padding: 1.5rem;                               /* Inner padding */
      background-color: #f7fafc;                     /* Light background */
    }

    /* Search header */
    .search-header {
      display: flex;                                  /* Flexbox layout */
      justify-content: space-between;                /* Space between */
      align-items: center;                           /* Center vertically */
      margin-bottom: 1.5rem;                         /* Bottom margin */
      flex-wrap: wrap;                               /* Wrap on mobile */
      gap: 1rem;                                     /* Gap */
    }

    .header-left {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 1rem;                                     /* Gap */
    }

    .header-left h1 {
      font-size: 1.5rem;                             /* Heading size */
      font-weight: 600;                              /* Semi-bold */
      margin: 0;                                     /* Remove margin */
    }

    .results-count {
      color: #718096;                                /* Gray color */
      font-size: 0.875rem;                           /* Smaller text */
    }

    .sort-field {
      width: 180px;                                   /* Fixed width */
    }

    /* Loading state */
    .loading-state {
      display: flex;                                  /* Flexbox layout */
      flex-direction: column;                        /* Stack vertically */
      align-items: center;                           /* Center horizontally */
      justify-content: center;                       /* Center vertically */
      padding: 4rem;                                 /* Large padding */
      text-align: center;                            /* Center text */
    }

    .loading-state p {
      margin-top: 1rem;                              /* Top margin */
      color: #718096;                                /* Gray color */
    }

    /* Activities grid */
    .activities-grid {
      display: grid;                                  /* Grid layout */
      grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
      gap: 1.5rem;                                   /* Gap between cards */
    }

    /* Activity card */
    .activity-card {
      border-radius: 16px;                           /* Rounded corners */
      overflow: hidden;                              /* Clip content */
      transition: transform 0.2s, box-shadow 0.2s;  /* Smooth transition */
    }

    .activity-card:hover {
      transform: translateY(-4px);                   /* Lift on hover */
      box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);   /* Stronger shadow */
    }

    /* Card image */
    .card-image {
      position: relative;                            /* For positioning badges */
      height: 180px;                                 /* Fixed height */
    }

    .card-image img {
      width: 100%;                                    /* Full width */
      height: 100%;                                   /* Full height */
      object-fit: cover;                             /* Cover the area */
    }

    .category-badge {
      position: absolute;                            /* Absolute positioning */
      top: 12px;                                     /* From top */
      left: 12px;                                    /* From left */
      background: rgba(44, 82, 130, 0.9);           /* Primary with opacity */
      color: white;                                  /* White text */
      padding: 0.25rem 0.75rem;                     /* Badge padding */
      border-radius: 999px;                          /* Pill shape */
      font-size: 0.75rem;                            /* Small text */
      font-weight: 500;                              /* Medium weight */
    }

    .favorite-btn {
      position: absolute;                            /* Absolute positioning */
      top: 8px;                                      /* From top */
      right: 8px;                                    /* From right */
      background: rgba(255, 255, 255, 0.9);         /* White with opacity */
      color: #e53e3e;                                /* Red color */
    }

    /* Card content */
    .card-content {
      padding: 1rem;                                 /* Inner padding */
    }

    .activity-name {
      font-size: 1.125rem;                           /* Slightly larger */
      font-weight: 600;                              /* Semi-bold */
      color: #2d3748;                                /* Dark gray */
      margin: 0 0 0.5rem;                            /* Bottom margin */
    }

    .venue-row {
      display: flex;                                  /* Flexbox layout */
      justify-content: space-between;                /* Space between */
      align-items: center;                           /* Center vertically */
      margin-bottom: 0.75rem;                        /* Bottom margin */
    }

    .venue-name {
      color: #718096;                                /* Gray color */
      font-size: 0.875rem;                           /* Smaller text */
    }

    .venue-score {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.25rem;                                  /* Small gap */
      color: #ed8936;                                /* Orange color */
      font-weight: 600;                              /* Semi-bold */
      font-size: 0.875rem;                           /* Smaller text */
    }

    .venue-score mat-icon {
      font-size: 16px;                               /* Small icon */
      width: 16px;
      height: 16px;
    }

    .activity-meta {
      display: flex;                                  /* Flexbox layout */
      gap: 1rem;                                     /* Gap */
      margin-bottom: 0.75rem;                        /* Bottom margin */
    }

    .age-range, .credits {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.25rem;                                  /* Small gap */
      font-size: 0.875rem;                           /* Smaller text */
      color: #718096;                                /* Gray color */
    }

    .age-range mat-icon, .credits mat-icon {
      font-size: 16px;                               /* Small icon */
      width: 16px;
      height: 16px;
    }

    .next-available {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
      font-size: 0.875rem;                           /* Smaller text */
      color: #4a5568;                                /* Dark gray */
      margin: 0 0 0.75rem;                           /* Bottom margin */
    }

    .next-available mat-icon {
      font-size: 18px;                               /* Small icon */
      width: 18px;
      height: 18px;
      color: #319795;                                /* Accent color */
    }

    .availability {
      display: flex;                                  /* Flexbox layout */
      align-items: center;                           /* Center vertically */
      gap: 0.5rem;                                   /* Gap */
      padding: 0.5rem 0.75rem;                       /* Padding */
      border-radius: 8px;                            /* Rounded corners */
      font-size: 0.875rem;                           /* Smaller text */
      font-weight: 500;                              /* Medium weight */
    }

    .availability mat-icon {
      font-size: 18px;                               /* Small icon */
      width: 18px;
      height: 18px;
    }

    .availability.high {
      background-color: rgba(56, 161, 105, 0.1);   /* Green tint */
      color: #38a169;                                /* Green color */
    }

    .availability.low {
      background-color: rgba(237, 137, 54, 0.1);   /* Orange tint */
      color: #ed8936;                                /* Orange color */
    }

    .availability.none {
      background-color: rgba(229, 62, 62, 0.1);    /* Red tint */
      color: #e53e3e;                                /* Red color */
    }

    /* Card actions */
    .card-actions {
      padding: 0 1rem 1rem;                          /* Padding */
    }

    .card-actions button {
      width: 100%;                                    /* Full width */
    }

    /* Empty state */
    .empty-state {
      display: flex;                                  /* Flexbox layout */
      flex-direction: column;                        /* Stack vertically */
      align-items: center;                           /* Center horizontally */
      justify-content: center;                       /* Center vertically */
      padding: 4rem;                                 /* Large padding */
      text-align: center;                            /* Center text */
    }

    .empty-state mat-icon {
      font-size: 64px;                               /* Large icon */
      width: 64px;
      height: 64px;
      color: #cbd5e0;                                /* Light gray */
      margin-bottom: 1rem;                           /* Bottom margin */
    }

    .empty-state h2 {
      font-size: 1.25rem;                            /* Heading size */
      color: #2d3748;                                /* Dark gray */
      margin: 0 0 0.5rem;                            /* Bottom margin */
    }

    .empty-state p {
      color: #718096;                                /* Gray color */
      margin: 0 0 1.5rem;                            /* Bottom margin */
    }

    /* Load more */
    .load-more {
      display: flex;                                  /* Flexbox layout */
      justify-content: center;                       /* Center horizontally */
      margin-top: 2rem;                              /* Top margin */
    }

    /* Responsive styles */
    @media (max-width: 768px) {
      .filter-sidebar {
        width: 100%;                                  /* Full width on mobile */
      }

      .activities-grid {
        grid-template-columns: 1fr;                  /* Single column */
      }

      .search-header {
        flex-direction: column;                      /* Stack vertically */
        align-items: stretch;                        /* Stretch items */
      }

      .sort-field {
        width: 100%;                                  /* Full width */
      }
    }
  `]
})
export class ActivitiesBrowseComponent implements OnInit {
  // -------------------------------------------------
  // FORM CONTROLS
  // -------------------------------------------------
  nlSearchControl = new FormControl('');
  childFilterControl = new FormControl('');
  categoryFilterControl = new FormControl([]);
  minAgeControl = new FormControl(3);
  maxAgeControl = new FormControl(18);
  morningControl = new FormControl(false);
  afternoonControl = new FormControl(false);
  eveningControl = new FormControl(false);
  distanceControl = new FormControl(15);
  minScoreControl = new FormControl(70);
  siblingFriendlyControl = new FormControl(false);
  sortControl = new FormControl('relevance');

  // -------------------------------------------------
  // STATE SIGNALS
  // -------------------------------------------------
  activities = signal<any[]>([]);
  isLoading = signal<boolean>(false);
  isSearching = signal<boolean>(false);
  isMobile = signal<boolean>(window.innerWidth < 768);
  hasMore = signal<boolean>(true);
  activeFilterCount = signal<number>(0);

  // -------------------------------------------------
  // CONSTANTS
  // -------------------------------------------------
  categories = INTEREST_CATEGORIES;

  /**
   * Constructor
   */
  constructor(
    private route: ActivatedRoute
  ) {
    // Listen for window resize
    window.addEventListener('resize', () => {
      this.isMobile.set(window.innerWidth < 768);
    });
  }

  /**
   * ngOnInit - Initialize component
   */
  ngOnInit(): void {
    // Check for childId query param
    const childId = this.route.snapshot.queryParams['childId'];
    if (childId) {
      this.childFilterControl.setValue(childId);
    }
    
    // Load initial activities
    this.loadActivities();
  }

  /**
   * performNLSearch - Execute natural language search
   */
  performNLSearch(): void {
    const query = this.nlSearchControl.value;
    if (!query) return;

    this.isSearching.set(true);
    
    // TODO: Call AI search API
    console.log('[Browse] NL Search:', query);
    
    // Simulate API delay
    setTimeout(() => {
      this.isSearching.set(false);
      this.loadActivities();
    }, 1500);
  }

  /**
   * clearFilters - Reset all filters
   */
  clearFilters(): void {
    this.nlSearchControl.reset();
    this.childFilterControl.reset();
    this.categoryFilterControl.reset();
    this.minAgeControl.setValue(3);
    this.maxAgeControl.setValue(18);
    this.morningControl.setValue(false);
    this.afternoonControl.setValue(false);
    this.eveningControl.setValue(false);
    this.distanceControl.setValue(15);
    this.minScoreControl.setValue(70);
    this.siblingFriendlyControl.setValue(false);
    
    this.loadActivities();
  }

  /**
   * applyFilters - Apply current filters
   */
  applyFilters(): void {
    this.loadActivities();
  }

  /**
   * toggleFavorite - Toggle activity favorite status
   */
  toggleFavorite(activity: any): void {
    activity.isFavorited = !activity.isFavorited;
    // TODO: Call API to update favorite
  }

  /**
   * getAvailabilityClass - Get CSS class for availability
   */
  getAvailabilityClass(spotsLeft: number): string {
    if (spotsLeft === 0) return 'none';
    if (spotsLeft <= 3) return 'low';
    return 'high';
  }

  /**
   * loadMore - Load more activities
   */
  loadMore(): void {
    // TODO: Implement pagination
    console.log('[Browse] Loading more activities...');
  }

  /**
   * loadActivities - Load activities from API
   */
  private loadActivities(): void {
    this.isLoading.set(true);
    
    // Mock data for demo
    setTimeout(() => {
      this.activities.set([
        {
          id: 'act_001',
          name: 'Junior Robotics Workshop',
          venueName: 'Code Ninjas West',
          venueScore: 4.8,
          category: 'STEM',
          minAge: 6,
          maxAge: 12,
          credits: 2,
          nextAvailable: 'Sat, Jan 20 at 10:00 AM',
          spotsLeft: 5,
          isFavorited: false,
          imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400&h=200&fit=crop'
        },
        {
          id: 'act_002',
          name: 'Creative Art Studio',
          venueName: 'Artful Kids Academy',
          venueScore: 4.6,
          category: 'Arts & Crafts',
          minAge: 4,
          maxAge: 12,
          credits: 1,
          nextAvailable: 'Sun, Jan 21 at 2:00 PM',
          spotsLeft: 2,
          isFavorited: true,
          imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&h=200&fit=crop'
        },
        {
          id: 'act_003',
          name: 'Soccer Skills Camp',
          venueName: 'City Sports Complex',
          venueScore: 4.5,
          category: 'Sports',
          minAge: 5,
          maxAge: 10,
          credits: 1,
          nextAvailable: 'Sat, Jan 27 at 9:00 AM',
          spotsLeft: 8,
          isFavorited: false,
          imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop'
        },
        {
          id: 'act_004',
          name: 'Music Discovery Class',
          venueName: 'Harmony Music School',
          venueScore: 4.9,
          category: 'Music',
          minAge: 3,
          maxAge: 8,
          credits: 1,
          nextAvailable: 'Sun, Jan 21 at 11:00 AM',
          spotsLeft: 0,
          isFavorited: false,
          imageUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=400&h=200&fit=crop'
        },
        {
          id: 'act_005',
          name: 'Nature Explorers',
          venueName: 'Green Valley Park',
          venueScore: 4.7,
          category: 'Nature',
          minAge: 5,
          maxAge: 12,
          credits: 1,
          nextAvailable: 'Sat, Jan 27 at 10:00 AM',
          spotsLeft: 12,
          isFavorited: false,
          imageUrl: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400&h=200&fit=crop'
        },
        {
          id: 'act_006',
          name: 'Kids Cooking Class',
          venueName: 'Little Chefs Kitchen',
          venueScore: 4.8,
          category: 'Cooking',
          minAge: 6,
          maxAge: 14,
          credits: 2,
          nextAvailable: 'Sun, Jan 28 at 3:00 PM',
          spotsLeft: 4,
          isFavorited: false,
          imageUrl: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop'
        }
      ]);
      
      this.isLoading.set(false);
    }, 800);
  }
}
