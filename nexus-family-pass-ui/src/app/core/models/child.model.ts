// =====================================================
// NEXUS FAMILY PASS - CHILD PROFILE MODELS
// TypeScript interfaces for child data, preferences,
// and onboarding quiz responses used for AI matching
// =====================================================

// -----------------------------------------------------
// ENERGY LEVEL ENUM
// Child's activity energy preference from onboarding quiz
// Used for matching children to appropriate activities
// -----------------------------------------------------
export enum EnergyLevel {
  CALM = 'calm',           // Prefers calm, focused activities
  BALANCED = 'balanced',   // Mix of active and calm activities
  HIGH = 'high'            // Prefers high-energy, active activities
}

// -----------------------------------------------------
// SOCIAL PREFERENCE ENUM
// Child's social setting preference from onboarding quiz
// Used for matching group size in activities
// -----------------------------------------------------
export enum SocialPreference {
  SOLO = 'solo',               // Prefers individual activities
  SMALL_GROUP = 'small_group', // Prefers small group settings (3-6 kids)
  LARGE_GROUP = 'large_group'  // Comfortable in large social settings
}

// -----------------------------------------------------
// INTEREST CATEGORIES
// Predefined interest tags that can be selected
// during onboarding quiz (max 3 selections)
// -----------------------------------------------------
export const INTEREST_CATEGORIES = [
  'STEM',              // Science, Technology, Engineering, Math
  'Arts & Crafts',     // Drawing, painting, crafting
  'Music',             // Musical instruments, singing
  'Sports',            // Physical sports and athletics
  'Nature',            // Outdoor exploration, animals
  'Cooking',           // Culinary activities
  'Reading',           // Reading clubs, storytelling
  'Building',          // Construction, LEGO, architecture
  'Dance',             // Dance classes, movement
  'Drama'              // Theater, acting, role-play
] as const;

// Type for interest categories (derived from array)
export type InterestCategory = typeof INTEREST_CATEGORIES[number];

// -----------------------------------------------------
// CONSTRAINT TYPES
// Types of constraints/things to avoid
// Used for filtering out inappropriate activities
// -----------------------------------------------------
export const ACTIVITY_CONSTRAINTS = [
  'Competitive',       // Avoid competitive activities
  'Messy',             // Avoid messy activities (paint, clay)
  'Loud',              // Avoid loud environments
  'Physical Contact'   // Avoid activities with physical contact
] as const;

export type ActivityConstraint = typeof ACTIVITY_CONSTRAINTS[number];

// -----------------------------------------------------
// ACCESSIBILITY NEEDS
// Accessibility accommodations the child may require
// Used for filtering venues with appropriate facilities
// -----------------------------------------------------
export const ACCESSIBILITY_NEEDS = [
  'Wheelchair accessible',  // Venue must be wheelchair accessible
  'Sensory-friendly',       // Low sensory environment needed
  'Hearing support',        // Hearing assistance available
  'Visual support'          // Visual assistance available
] as const;

export type AccessibilityNeed = typeof ACCESSIBILITY_NEEDS[number];

// -----------------------------------------------------
// CHILD INTERFACE
// Main interface representing a child profile
// Contains all information needed for activity matching
// -----------------------------------------------------
export interface Child {
  id: string;                          // Unique child identifier (UUID)
  parentId: string;                    // Parent user ID who created profile
  firstName: string;                   // Child's first name
  dateOfBirth: Date;                   // Child's date of birth
  age: number;                         // Calculated age in years
  gender?: 'boy' | 'girl' | 'non-binary' | 'prefer-not-to-say'; // Optional gender
  avatarUrl?: string;                  // Profile photo URL
  energyLevel: EnergyLevel;            // Energy preference from quiz
  socialPreference: SocialPreference;  // Social setting preference from quiz
  interests: ChildInterest[];          // Selected interest tags
  constraints: ChildConstraint[];      // Things to avoid
  accessibilityNeeds: AccessibilityNeed[]; // Accessibility requirements
  allergies?: string;                  // Allergy notes for venues
  medicalNotes?: string;               // Medical notes for venues
  onboardingCompleted: boolean;        // Quiz completion status
  parentalConsentAt?: Date;            // COPPA consent timestamp
  isActive: boolean;                   // Soft delete flag
  activitiesThisMonth: number;         // Count of activities this month
  createdAt: Date;                     // Profile creation timestamp
  updatedAt: Date;                     // Last update timestamp
}

// -----------------------------------------------------
// CHILD INTEREST INTERFACE
// Individual interest tag associated with a child
// Includes weight for AI matching priority
// -----------------------------------------------------
export interface ChildInterest {
  id: string;                          // Unique record ID
  childId: string;                     // Parent child ID
  interest: InterestCategory;          // Interest category name
  source: 'quiz' | 'feedback' | 'inferred'; // How interest was added
  weight: number;                      // Relevance weight (0.0-1.0)
  createdAt: Date;                     // When added
}

// -----------------------------------------------------
// CHILD CONSTRAINT INTERFACE
// Individual constraint associated with a child
// Used for filtering out inappropriate activities
// -----------------------------------------------------
export interface ChildConstraint {
  id: string;                          // Unique record ID
  childId: string;                     // Parent child ID
  constraintType: 'avoid' | 'allergy' | 'accessibility'; // Constraint category
  value: string;                       // Constraint value
  notes?: string;                      // Additional notes for venues
  createdAt: Date;                     // When added
}

// -----------------------------------------------------
// CHILD FORM DATA INTERFACE
// Data structure for add/edit child form
// Used for form binding and validation
// -----------------------------------------------------
export interface ChildFormData {
  firstName: string;                   // Required - child's name
  dateOfBirth: string;                 // Required - date in ISO format
  gender?: string;                     // Optional gender selection
  avatarUrl?: string;                  // Optional photo URL
  energyLevel: EnergyLevel;            // Quiz answer 1
  socialPreference: SocialPreference;  // Quiz answer 2
  interests: InterestCategory[];       // Quiz answer 3 (max 3)
  constraints: ActivityConstraint[];   // Things to avoid
  allergies?: string;                  // Allergy notes
  medicalNotes?: string;               // Medical notes
  accessibilityNeeds: AccessibilityNeed[]; // Accessibility requirements
}

// -----------------------------------------------------
// ONBOARDING QUIZ STATE INTERFACE
// Tracks progress through the onboarding quiz
// Used for multi-step form navigation
// -----------------------------------------------------
export interface OnboardingQuizState {
  currentStep: number;                 // Current step (1-3)
  totalSteps: number;                  // Total steps (3)
  answers: {
    energyLevel?: EnergyLevel;         // Step 1 answer
    socialPreference?: SocialPreference; // Step 2 answer
    interests?: InterestCategory[];    // Step 3 answers
  };
  isComplete: boolean;                 // All steps completed
}

// -----------------------------------------------------
// SIBLING GROUP INTERFACE
// Represents a group of siblings for group booking
// Used when booking activities for multiple children
// -----------------------------------------------------
export interface SiblingGroup {
  children: Child[];                   // Array of sibling children
  commonInterests: InterestCategory[]; // Interests shared by all siblings
  ageRange: {                          // Age range of the group
    min: number;
    max: number;
  };
  compatibleActivities: string[];      // Activity IDs suitable for all
}

// -----------------------------------------------------
// CHILD VECTOR REFERENCE INTERFACE
// Reference to Pinecone vector for AI matching
// Used for semantic search and recommendations
// -----------------------------------------------------
export interface ChildVectorReference {
  id: string;                          // Unique record ID
  childId: string;                     // Parent child ID
  pineconeVectorId: string;            // Pinecone vector ID
  vectorVersion: number;               // Version for tracking updates
  lastUpdatedAt: Date;                 // Last vector refresh time
}

// -----------------------------------------------------
// UTILITY FUNCTION TYPE
// Calculate age from date of birth
// Used when displaying child's age
// -----------------------------------------------------
export function calculateAge(dateOfBirth: Date): number {
  const today = new Date();                    // Get current date
  const birthDate = new Date(dateOfBirth);     // Parse DOB
  let age = today.getFullYear() - birthDate.getFullYear(); // Year difference
  const monthDiff = today.getMonth() - birthDate.getMonth(); // Month difference
  
  // Adjust if birthday hasn't occurred this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;                                     // Subtract one year
  }
  
  return age;                                  // Return calculated age
}
