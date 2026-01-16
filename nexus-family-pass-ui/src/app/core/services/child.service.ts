// =====================================================
// NEXUS FAMILY PASS - CHILD SERVICE
// Service for managing children profiles, preferences,
// and onboarding quiz data. Handles CRUD operations
// and local caching of child data.
// =====================================================

// Import Angular core for injectable decorator
import { Injectable, signal, computed } from '@angular/core';

// Import HttpClient for API calls
import { HttpClient } from '@angular/common/http';

// Import RxJS operators
import { Observable, of, delay, tap } from 'rxjs';

// Import child model and related types
import { 
  Child, 
  ChildInterest, 
  ChildConstraint, 
  EnergyLevel, 
  SocialPreference,
  OnboardingQuizState 
} from '../models';

/**
 * ChildService - Child Profile Management
 * 
 * This service handles all operations related to children profiles:
 * - Fetching children for current user
 * - Creating new child profiles
 * - Updating child information
 * - Managing interests and constraints
 * - Onboarding quiz flow management
 * 
 * Uses Angular Signals for reactive state management.
 * 
 * @example
 * ```typescript
 * // Inject the service
 * constructor(private childService: ChildService) {}
 * 
 * // Get all children
 * const children = this.childService.children();
 * 
 * // Add a new child
 * this.childService.addChild(newChildData).subscribe();
 * ```
 */
@Injectable({
  // Provided in root - singleton instance
  providedIn: 'root'
})
export class ChildService {
  // -------------------------------------------------
  // PRIVATE STATE SIGNALS
  // Internal state managed via signals
  // -------------------------------------------------

  /**
   * Signal holding the array of children for current user
   * Updated when children are loaded or modified
   */
  private childrenSignal = signal<Child[]>([]);

  /**
   * Signal tracking loading state for children data
   * True when an API call is in progress
   */
  private loadingSignal = signal<boolean>(false);

  /**
   * Signal for tracking onboarding quiz state
   * Used when adding a new child through the quiz flow
   */
  private quizStateSignal = signal<OnboardingQuizState | null>(null);

  // -------------------------------------------------
  // PUBLIC COMPUTED SIGNALS
  // Read-only access to state for components
  // -------------------------------------------------

  /**
   * Read-only access to children array
   * Components should use this to display children
   */
  readonly children = this.childrenSignal.asReadonly();

  /**
   * Read-only access to loading state
   * Use for showing loading indicators
   */
  readonly isLoading = this.loadingSignal.asReadonly();

  /**
   * Read-only access to quiz state
   * Used by onboarding components
   */
  readonly quizState = this.quizStateSignal.asReadonly();

  /**
   * Computed signal for total number of children
   * Useful for display and validation
   */
  readonly childCount = computed(() => this.childrenSignal().length);

  /**
   * Computed signal to check if user has any children
   * Returns true if at least one child exists
   */
  readonly hasChildren = computed(() => this.childrenSignal().length > 0);

  // -------------------------------------------------
  // CONSTRUCTOR
  // -------------------------------------------------

  /**
   * Constructor - Inject dependencies
   * @param http - HttpClient for making API requests
   */
  constructor(private http: HttpClient) {
    // Log service initialization
    console.log('[ChildService] Service initialized');
  }

  // -------------------------------------------------
  // PUBLIC METHODS - CRUD OPERATIONS
  // -------------------------------------------------

  /**
   * loadChildren - Fetch all children for current user
   * 
   * Makes API call to retrieve children and updates local state.
   * Uses loading signal to track request status.
   * 
   * @returns Observable<Child[]> - Stream of children array
   */
  loadChildren(): Observable<Child[]> {
    // Set loading state to true
    this.loadingSignal.set(true);

    // TODO: Replace with actual API call
    // return this.http.get<Child[]>('/api/children');

    // Mock implementation for demo
    return of(this.getMockChildren()).pipe(
      // Simulate network delay
      delay(500),
      // Update local state when response arrives
      tap(children => {
        // Store children in signal
        this.childrenSignal.set(children);
        // Clear loading state
        this.loadingSignal.set(false);
        // Log for debugging
        console.log('[ChildService] Loaded children:', children.length);
      })
    );
  }

  /**
   * getChildById - Fetch a single child by ID
   * 
   * First checks local cache, then makes API call if needed.
   * 
   * @param id - The unique identifier of the child
   * @returns Observable<Child | null> - The child or null if not found
   */
  getChildById(id: string): Observable<Child | null> {
    // Check if child exists in local state
    const cachedChild = this.childrenSignal().find(c => c.id === id);
    
    // Return cached child if found
    if (cachedChild) {
      console.log('[ChildService] Returning cached child:', id);
      return of(cachedChild);
    }

    // TODO: Fetch from API if not in cache
    // return this.http.get<Child>(`/api/children/${id}`);

    // Mock: return null if not found
    return of(null);
  }

  /**
   * addChild - Create a new child profile
   * 
   * Sends child data to API and updates local state on success.
   * 
   * @param childData - Partial child data (without ID)
   * @returns Observable<Child> - The created child with ID
   */
  addChild(childData: Omit<Child, 'id' | 'createdAt' | 'updatedAt'>): Observable<Child> {
    // Set loading state
    this.loadingSignal.set(true);

    // TODO: Replace with actual API call
    // return this.http.post<Child>('/api/children', childData);

    // Mock implementation
    const newChild: Child = {
      ...childData,
      id: `child_${Date.now()}`,                  // Generate mock ID
      createdAt: new Date().toISOString(),        // Set creation timestamp
      updatedAt: new Date().toISOString()         // Set update timestamp
    };

    return of(newChild).pipe(
      delay(300),
      tap(child => {
        // Add to local state
        this.childrenSignal.update(children => [...children, child]);
        // Clear loading
        this.loadingSignal.set(false);
        console.log('[ChildService] Child added:', child.id);
      })
    );
  }

  /**
   * updateChild - Update an existing child profile
   * 
   * Sends updated data to API and updates local state on success.
   * 
   * @param id - The child's ID
   * @param updates - Partial child data to update
   * @returns Observable<Child> - The updated child
   */
  updateChild(id: string, updates: Partial<Child>): Observable<Child> {
    // Set loading state
    this.loadingSignal.set(true);

    // TODO: Replace with actual API call
    // return this.http.patch<Child>(`/api/children/${id}`, updates);

    // Find existing child
    const existingChild = this.childrenSignal().find(c => c.id === id);
    
    if (!existingChild) {
      this.loadingSignal.set(false);
      throw new Error(`Child not found: ${id}`);
    }

    // Create updated child
    const updatedChild: Child = {
      ...existingChild,
      ...updates,
      updatedAt: new Date().toISOString()
    };

    return of(updatedChild).pipe(
      delay(300),
      tap(child => {
        // Update in local state
        this.childrenSignal.update(children =>
          children.map(c => c.id === id ? child : c)
        );
        this.loadingSignal.set(false);
        console.log('[ChildService] Child updated:', id);
      })
    );
  }

  /**
   * deleteChild - Remove a child profile
   * 
   * Deletes child from API and removes from local state.
   * 
   * @param id - The child's ID to delete
   * @returns Observable<void>
   */
  deleteChild(id: string): Observable<void> {
    // Set loading state
    this.loadingSignal.set(true);

    // TODO: Replace with actual API call
    // return this.http.delete<void>(`/api/children/${id}`);

    return of(undefined).pipe(
      delay(300),
      tap(() => {
        // Remove from local state
        this.childrenSignal.update(children =>
          children.filter(c => c.id !== id)
        );
        this.loadingSignal.set(false);
        console.log('[ChildService] Child deleted:', id);
      })
    );
  }

  // -------------------------------------------------
  // PUBLIC METHODS - INTERESTS & CONSTRAINTS
  // -------------------------------------------------

  /**
   * updateInterests - Update a child's interests
   * 
   * @param childId - The child's ID
   * @param interests - Array of interest objects
   * @returns Observable<Child>
   */
  updateInterests(childId: string, interests: ChildInterest[]): Observable<Child> {
    return this.updateChild(childId, { interests });
  }

  /**
   * updateConstraints - Update a child's constraints
   * 
   * @param childId - The child's ID
   * @param constraints - Array of constraint objects
   * @returns Observable<Child>
   */
  updateConstraints(childId: string, constraints: ChildConstraint[]): Observable<Child> {
    return this.updateChild(childId, { constraints });
  }

  // -------------------------------------------------
  // PUBLIC METHODS - ONBOARDING QUIZ
  // -------------------------------------------------

  /**
   * startOnboardingQuiz - Initialize quiz state for new child
   * 
   * Creates a fresh quiz state for the onboarding flow.
   */
  startOnboardingQuiz(): void {
    const initialState: OnboardingQuizState = {
      currentStep: 1,
      totalSteps: 5,
      answers: {},
      isComplete: false
    };
    
    this.quizStateSignal.set(initialState);
    console.log('[ChildService] Quiz started');
  }

  /**
   * updateQuizAnswer - Save an answer during quiz
   * 
   * @param questionKey - The question identifier
   * @param answer - The user's answer
   */
  updateQuizAnswer(questionKey: string, answer: any): void {
    this.quizStateSignal.update(state => {
      if (!state) return state;
      
      return {
        ...state,
        answers: {
          ...state.answers,
          [questionKey]: answer
        }
      };
    });
  }

  /**
   * nextQuizStep - Advance to next quiz step
   */
  nextQuizStep(): void {
    this.quizStateSignal.update(state => {
      if (!state) return state;
      
      const nextStep = state.currentStep + 1;
      return {
        ...state,
        currentStep: nextStep,
        isComplete: nextStep > state.totalSteps
      };
    });
  }

  /**
   * previousQuizStep - Go back to previous quiz step
   */
  previousQuizStep(): void {
    this.quizStateSignal.update(state => {
      if (!state) return state;
      
      return {
        ...state,
        currentStep: Math.max(1, state.currentStep - 1)
      };
    });
  }

  /**
   * completeQuiz - Finish quiz and create child from answers
   * 
   * @returns Observable<Child> - The created child
   */
  completeQuiz(): Observable<Child> {
    const state = this.quizStateSignal();
    
    if (!state) {
      throw new Error('No quiz in progress');
    }

    // Convert quiz answers to child data
    const childData = this.quizAnswersToChildData(state.answers);
    
    // Create the child
    return this.addChild(childData).pipe(
      tap(() => {
        // Clear quiz state
        this.quizStateSignal.set(null);
        console.log('[ChildService] Quiz completed, child created');
      })
    );
  }

  /**
   * cancelQuiz - Abandon the current quiz
   */
  cancelQuiz(): void {
    this.quizStateSignal.set(null);
    console.log('[ChildService] Quiz cancelled');
  }

  // -------------------------------------------------
  // PRIVATE HELPER METHODS
  // -------------------------------------------------

  /**
   * quizAnswersToChildData - Convert quiz answers to child model
   * 
   * @param answers - Quiz answer object
   * @returns Partial<Child> - Child data ready for creation
   */
  private quizAnswersToChildData(answers: Record<string, any>): Omit<Child, 'id' | 'createdAt' | 'updatedAt'> {
    return {
      userId: 'current_user',                     // Would come from auth
      firstName: answers['firstName'] ?? '',
      lastName: answers['lastName'] ?? '',
      dateOfBirth: answers['dateOfBirth'] ?? '',
      gender: answers['gender'],
      avatarUrl: answers['avatarUrl'],
      energyLevel: answers['energyLevel'] ?? EnergyLevel.MODERATE,
      socialPreference: answers['socialPreference'] ?? SocialPreference.MIXED,
      interests: answers['interests'] ?? [],
      constraints: answers['constraints'] ?? []
    };
  }

  /**
   * getMockChildren - Generate mock children for demo
   * 
   * @returns Child[] - Array of mock children
   */
  private getMockChildren(): Child[] {
    return [
      {
        id: 'child_001',
        userId: 'user_001',
        firstName: 'Emma',
        lastName: 'Johnson',
        dateOfBirth: '2017-05-15',
        gender: 'female',
        avatarUrl: undefined,
        energyLevel: EnergyLevel.HIGH,
        socialPreference: SocialPreference.GROUP,
        interests: [
          { category: 'STEM', level: 'high', specificInterests: ['robotics', 'coding'] },
          { category: 'Arts', level: 'medium', specificInterests: ['painting'] }
        ],
        constraints: [
          { type: 'allergy', description: 'Peanut allergy', severity: 'severe' }
        ],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-10T00:00:00Z'
      },
      {
        id: 'child_002',
        userId: 'user_001',
        firstName: 'Jake',
        lastName: 'Johnson',
        dateOfBirth: '2019-08-22',
        gender: 'male',
        avatarUrl: undefined,
        energyLevel: EnergyLevel.MODERATE,
        socialPreference: SocialPreference.MIXED,
        interests: [
          { category: 'Sports', level: 'high', specificInterests: ['soccer', 'swimming'] },
          { category: 'Music', level: 'low', specificInterests: ['drums'] }
        ],
        constraints: [],
        createdAt: '2024-01-01T00:00:00Z',
        updatedAt: '2024-01-05T00:00:00Z'
      }
    ];
  }
}
