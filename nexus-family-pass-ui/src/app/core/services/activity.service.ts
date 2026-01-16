// =====================================================
// NEXUS FAMILY PASS - ACTIVITY SERVICE
// Service for browsing, searching, and filtering activities.
// Handles activity data, curation suggestions, and
// natural language search functionality.
// =====================================================

// Import Angular core
import { Injectable, signal, computed } from '@angular/core';

// Import HttpClient for API calls
import { HttpClient } from '@angular/common/http';

// Import RxJS operators
import { Observable, of, delay, tap, map } from 'rxjs';

// Import activity models
import { 
  Activity, 
  ActivityFilter, 
  Venue, 
  CurationSuggestion,
  NLSearchResult,
  ActivitySlot 
} from '../models';

/**
 * ActivityService - Activity Discovery and Management
 * 
 * This service handles all activity-related operations:
 * - Browsing and filtering activities
 * - Natural language search
 * - AI-powered curation suggestions
 * - Activity detail retrieval
 * - Slot availability checking
 * 
 * Uses Angular Signals for reactive state management.
 * 
 * @example
 * ```typescript
 * // Inject the service
 * constructor(private activityService: ActivityService) {}
 * 
 * // Search activities
 * this.activityService.searchActivities(filter).subscribe();
 * 
 * // Get curated suggestions
 * const suggestions = this.activityService.suggestions();
 * ```
 */
@Injectable({
  // Provided in root - singleton instance
  providedIn: 'root'
})
export class ActivityService {
  // -------------------------------------------------
  // PRIVATE STATE SIGNALS
  // -------------------------------------------------

  /**
   * Signal holding the current list of activities
   * Updated after search/filter operations
   */
  private activitiesSignal = signal<Activity[]>([]);

  /**
   * Signal for curated suggestions
   * AI-generated recommendations for user's children
   */
  private suggestionsSignal = signal<CurationSuggestion[]>([]);

  /**
   * Signal tracking loading state
   */
  private loadingSignal = signal<boolean>(false);

  /**
   * Signal for current filter state
   * Persists filter selections across navigation
   */
  private currentFilterSignal = signal<ActivityFilter>({});

  /**
   * Signal for natural language search results
   */
  private nlSearchResultsSignal = signal<NLSearchResult | null>(null);

  // -------------------------------------------------
  // PUBLIC COMPUTED SIGNALS
  // -------------------------------------------------

  /**
   * Read-only access to activities
   */
  readonly activities = this.activitiesSignal.asReadonly();

  /**
   * Read-only access to suggestions
   */
  readonly suggestions = this.suggestionsSignal.asReadonly();

  /**
   * Read-only access to loading state
   */
  readonly isLoading = this.loadingSignal.asReadonly();

  /**
   * Read-only access to current filter
   */
  readonly currentFilter = this.currentFilterSignal.asReadonly();

  /**
   * Read-only access to NL search results
   */
  readonly nlSearchResults = this.nlSearchResultsSignal.asReadonly();

  /**
   * Computed signal for activity count
   */
  readonly activityCount = computed(() => this.activitiesSignal().length);

  /**
   * Computed signal for available categories
   * Derived from current activities
   */
  readonly availableCategories = computed(() => {
    const categories = new Set(this.activitiesSignal().map(a => a.category));
    return Array.from(categories).sort();
  });

  // -------------------------------------------------
  // CONSTRUCTOR
  // -------------------------------------------------

  /**
   * Constructor - Inject dependencies
   * @param http - HttpClient for API requests
   */
  constructor(private http: HttpClient) {
    console.log('[ActivityService] Service initialized');
  }

  // -------------------------------------------------
  // PUBLIC METHODS - ACTIVITY DISCOVERY
  // -------------------------------------------------

  /**
   * searchActivities - Search and filter activities
   * 
   * Applies filters and returns matching activities.
   * Updates local state with results.
   * 
   * @param filter - Filter criteria
   * @returns Observable<Activity[]>
   */
  searchActivities(filter: ActivityFilter = {}): Observable<Activity[]> {
    // Set loading state
    this.loadingSignal.set(true);
    
    // Update current filter
    this.currentFilterSignal.set(filter);

    // TODO: Replace with actual API call
    // const params = this.buildQueryParams(filter);
    // return this.http.get<Activity[]>('/api/activities', { params });

    // Mock implementation
    return of(this.getMockActivities()).pipe(
      delay(400),
      map(activities => this.applyFilters(activities, filter)),
      tap(results => {
        this.activitiesSignal.set(results);
        this.loadingSignal.set(false);
        console.log('[ActivityService] Found activities:', results.length);
      })
    );
  }

  /**
   * naturalLanguageSearch - AI-powered natural language search
   * 
   * Processes a natural language query and returns
   * interpreted results with filter suggestions.
   * 
   * @param query - Natural language search query
   * @returns Observable<NLSearchResult>
   * 
   * @example
   * ```typescript
   * service.naturalLanguageSearch('art classes for my 6 year old on weekends')
   * ```
   */
  naturalLanguageSearch(query: string): Observable<NLSearchResult> {
    // Set loading state
    this.loadingSignal.set(true);

    // TODO: Replace with actual AI endpoint
    // return this.http.post<NLSearchResult>('/api/activities/nl-search', { query });

    // Mock NL search result
    const mockResult: NLSearchResult = {
      originalQuery: query,
      interpretedFilters: {
        category: query.toLowerCase().includes('art') ? 'Arts' : undefined,
        ageRange: { min: 5, max: 8 },
        dayOfWeek: query.toLowerCase().includes('weekend') ? ['saturday', 'sunday'] : undefined
      },
      suggestedActivities: [],
      clarifyingQuestions: []
    };

    return of(mockResult).pipe(
      delay(600),
      tap(result => {
        this.nlSearchResultsSignal.set(result);
        // Apply interpreted filters
        this.searchActivities(result.interpretedFilters).subscribe();
        console.log('[ActivityService] NL Search interpreted:', result.interpretedFilters);
      })
    );
  }

  /**
   * getActivityById - Fetch single activity with full details
   * 
   * @param id - Activity ID
   * @returns Observable<Activity | null>
   */
  getActivityById(id: string): Observable<Activity | null> {
    // Check cache first
    const cached = this.activitiesSignal().find(a => a.id === id);
    if (cached) {
      return of(cached);
    }

    // TODO: Fetch from API
    // return this.http.get<Activity>(`/api/activities/${id}`);

    // Mock: find in mock data
    const activity = this.getMockActivities().find(a => a.id === id) ?? null;
    return of(activity).pipe(delay(200));
  }

  /**
   * getActivitySlots - Get available time slots for an activity
   * 
   * @param activityId - Activity ID
   * @param startDate - Start of date range
   * @param endDate - End of date range
   * @returns Observable<ActivitySlot[]>
   */
  getActivitySlots(
    activityId: string, 
    startDate: string, 
    endDate: string
  ): Observable<ActivitySlot[]> {
    // TODO: API call
    // return this.http.get<ActivitySlot[]>(
    //   `/api/activities/${activityId}/slots`,
    //   { params: { startDate, endDate } }
    // );

    // Mock slots
    const mockSlots: ActivitySlot[] = [
      {
        id: 'slot_001',
        activityId,
        startTime: '2024-01-20T10:00:00',
        endTime: '2024-01-20T11:30:00',
        capacity: 10,
        bookedCount: 6,
        availableSpots: 4,
        status: 'available'
      },
      {
        id: 'slot_002',
        activityId,
        startTime: '2024-01-20T14:00:00',
        endTime: '2024-01-20T15:30:00',
        capacity: 10,
        bookedCount: 10,
        availableSpots: 0,
        status: 'full'
      },
      {
        id: 'slot_003',
        activityId,
        startTime: '2024-01-21T10:00:00',
        endTime: '2024-01-21T11:30:00',
        capacity: 10,
        bookedCount: 3,
        availableSpots: 7,
        status: 'available'
      }
    ];

    return of(mockSlots).pipe(delay(200));
  }

  // -------------------------------------------------
  // PUBLIC METHODS - CURATION
  // -------------------------------------------------

  /**
   * loadCurationSuggestions - Get AI-curated suggestions
   * 
   * Fetches personalized activity suggestions based on
   * children's profiles, interests, and past bookings.
   * 
   * @param childIds - Optional specific children to get suggestions for
   * @returns Observable<CurationSuggestion[]>
   */
  loadCurationSuggestions(childIds?: string[]): Observable<CurationSuggestion[]> {
    this.loadingSignal.set(true);

    // TODO: API call with child context
    // return this.http.get<CurationSuggestion[]>('/api/curation/suggestions', {
    //   params: { childIds: childIds?.join(',') }
    // });

    // Mock suggestions
    const mockSuggestions: CurationSuggestion[] = [
      {
        id: 'sug_001',
        activityId: 'act_001',
        activityName: 'Junior Robotics Workshop',
        venueName: 'Code Ninjas West',
        venueScore: 4.8,
        category: 'STEM',
        ageRange: '6-10',
        credits: 2,
        matchScore: 95,
        matchReasons: ['Matches high interest in STEM', 'Perfect age range for Emma'],
        recommendedFor: 'Emma',
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
        matchScore: 88,
        matchReasons: ['Medium interest in Arts', 'Good for both Emma & Jake'],
        recommendedFor: 'Emma & Jake',
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
        matchScore: 92,
        matchReasons: ['High interest in Sports', 'Perfect for active kids'],
        recommendedFor: 'Jake',
        suggestedDate: 'Sat, Jan 27',
        suggestedTime: '9:00 AM',
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400&h=200&fit=crop'
      }
    ];

    return of(mockSuggestions).pipe(
      delay(500),
      tap(suggestions => {
        this.suggestionsSignal.set(suggestions);
        this.loadingSignal.set(false);
        console.log('[ActivityService] Loaded suggestions:', suggestions.length);
      })
    );
  }

  /**
   * dismissSuggestion - Mark a suggestion as not interested
   * 
   * @param suggestionId - The suggestion ID to dismiss
   * @returns Observable<void>
   */
  dismissSuggestion(suggestionId: string): Observable<void> {
    // TODO: API call
    // return this.http.post<void>(`/api/curation/suggestions/${suggestionId}/dismiss`, {});

    return of(undefined).pipe(
      tap(() => {
        // Remove from local state
        this.suggestionsSignal.update(suggestions =>
          suggestions.filter(s => s.id !== suggestionId)
        );
        console.log('[ActivityService] Dismissed suggestion:', suggestionId);
      })
    );
  }

  // -------------------------------------------------
  // PUBLIC METHODS - FILTER MANAGEMENT
  // -------------------------------------------------

  /**
   * updateFilter - Update a single filter value
   * 
   * @param key - Filter key
   * @param value - Filter value
   */
  updateFilter(key: keyof ActivityFilter, value: any): void {
    this.currentFilterSignal.update(filter => ({
      ...filter,
      [key]: value
    }));
  }

  /**
   * clearFilters - Reset all filters
   */
  clearFilters(): void {
    this.currentFilterSignal.set({});
    this.nlSearchResultsSignal.set(null);
    console.log('[ActivityService] Filters cleared');
  }

  // -------------------------------------------------
  // PRIVATE HELPER METHODS
  // -------------------------------------------------

  /**
   * applyFilters - Filter activities based on criteria
   * 
   * @param activities - Activities to filter
   * @param filter - Filter criteria
   * @returns Filtered activities
   */
  private applyFilters(activities: Activity[], filter: ActivityFilter): Activity[] {
    return activities.filter(activity => {
      // Category filter
      if (filter.category && activity.category !== filter.category) {
        return false;
      }

      // Age range filter
      if (filter.ageRange) {
        if (activity.minAge > filter.ageRange.max || activity.maxAge < filter.ageRange.min) {
          return false;
        }
      }

      // Search text filter
      if (filter.searchText) {
        const searchLower = filter.searchText.toLowerCase();
        const matchesName = activity.name.toLowerCase().includes(searchLower);
        const matchesDesc = activity.description?.toLowerCase().includes(searchLower);
        if (!matchesName && !matchesDesc) {
          return false;
        }
      }

      // Credits filter
      if (filter.maxCredits && activity.creditCost > filter.maxCredits) {
        return false;
      }

      return true;
    });
  }

  /**
   * getMockActivities - Generate mock activities for demo
   */
  private getMockActivities(): Activity[] {
    return [
      {
        id: 'act_001',
        venueId: 'ven_001',
        name: 'Junior Robotics Workshop',
        description: 'Hands-on robotics for kids! Learn to build and program simple robots.',
        shortDescription: 'Build and program robots',
        category: 'STEM',
        minAge: 6,
        maxAge: 10,
        duration: 90,
        creditCost: 2,
        imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=400',
        tags: ['indoor', 'educational', 'hands-on'],
        status: 'active',
        rating: 4.8,
        reviewCount: 45
      },
      {
        id: 'act_002',
        venueId: 'ven_002',
        name: 'Creative Art Studio',
        description: 'Express creativity through painting, drawing, and mixed media.',
        shortDescription: 'Painting and creative arts',
        category: 'Arts',
        minAge: 4,
        maxAge: 12,
        duration: 60,
        creditCost: 1,
        imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400',
        tags: ['indoor', 'creative', 'messy'],
        status: 'active',
        rating: 4.6,
        reviewCount: 32
      },
      {
        id: 'act_003',
        venueId: 'ven_003',
        name: 'Soccer Skills Camp',
        description: 'Learn soccer fundamentals in a fun, supportive environment.',
        shortDescription: 'Soccer fundamentals',
        category: 'Sports',
        minAge: 5,
        maxAge: 8,
        duration: 60,
        creditCost: 1,
        imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=400',
        tags: ['outdoor', 'active', 'team'],
        status: 'active',
        rating: 4.5,
        reviewCount: 28
      },
      {
        id: 'act_004',
        venueId: 'ven_004',
        name: 'Piano for Beginners',
        description: 'Introduction to piano with focus on fun and fundamentals.',
        shortDescription: 'Learn piano basics',
        category: 'Music',
        minAge: 5,
        maxAge: 12,
        duration: 45,
        creditCost: 1,
        imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=400',
        tags: ['indoor', 'individual', 'musical'],
        status: 'active',
        rating: 4.7,
        reviewCount: 19
      },
      {
        id: 'act_005',
        venueId: 'ven_001',
        name: 'Coding for Kids',
        description: 'Learn programming concepts through games and projects.',
        shortDescription: 'Programming fundamentals',
        category: 'STEM',
        minAge: 8,
        maxAge: 12,
        duration: 60,
        creditCost: 1,
        imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400',
        tags: ['indoor', 'educational', 'technology'],
        status: 'active',
        rating: 4.9,
        reviewCount: 52
      }
    ];
  }
}
