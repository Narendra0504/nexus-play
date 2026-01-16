// =====================================================
// NEXUS FAMILY PASS - ACTIVITY & VENUE MODELS
// TypeScript interfaces for venues, activities,
// scheduling, and performance scoring
// =====================================================

// Import interest categories for activity categorization
import { InterestCategory } from './child.model';

// -----------------------------------------------------
// VENUE STATUS ENUM
// Lifecycle states for venue accounts
// Used for approval workflow and filtering
// -----------------------------------------------------
export enum VenueStatus {
  PENDING = 'pending',       // Awaiting admin approval
  ACTIVE = 'active',         // Approved and visible to parents
  SUSPENDED = 'suspended'    // Temporarily disabled
}

// -----------------------------------------------------
// ACTIVITY STATUS ENUM
// Lifecycle states for activity listings
// Used for venue management and filtering
// -----------------------------------------------------
export enum ActivityStatus {
  DRAFT = 'draft',           // Not yet published
  ACTIVE = 'active',         // Published and bookable
  PAUSED = 'paused',         // Temporarily hidden
  ARCHIVED = 'archived'      // No longer available
}

// -----------------------------------------------------
// SKILL LEVEL ENUM
// Activity difficulty/skill requirement levels
// Used for filtering and matching
// -----------------------------------------------------
export enum SkillLevel {
  BEGINNER = 'beginner',         // No prior experience needed
  INTERMEDIATE = 'intermediate', // Some experience helpful
  ADVANCED = 'advanced'          // Prior experience required
}

// -----------------------------------------------------
// ACTIVITY TAG OPTIONS
// Predefined tags for activity characteristics
// Used for filtering and NL search matching
// -----------------------------------------------------
export const ACTIVITY_TAGS = [
  'Indoor',            // Activity is indoors
  'Outdoor',           // Activity is outdoors
  'Messy',             // Activity involves mess (paint, etc.)
  'Competitive',       // Activity has competitive element
  'Calm',              // Quiet, focused activity
  'Social',            // Heavy social interaction
  'Solo-friendly',     // Can be done independently
  'Physical',          // Requires physical activity
  'Creative',          // Involves creativity
  'Educational'        // Learning-focused
] as const;

export type ActivityTag = typeof ACTIVITY_TAGS[number];

// -----------------------------------------------------
// VENUE INTERFACE
// Represents a venue/business offering activities
// Contains profile, location, and status information
// -----------------------------------------------------
export interface Venue {
  id: string;                      // Unique venue identifier
  adminUserId: string;             // Venue admin user ID
  name: string;                    // Venue display name
  description?: string;            // About the venue
  addressLine1: string;            // Street address
  addressLine2?: string;           // Suite/unit number
  city: string;                    // City name
  state: string;                   // State/province
  postalCode: string;              // ZIP/postal code
  country: string;                 // Country (default: USA)
  latitude?: number;               // Location latitude for geo queries
  longitude?: number;              // Location longitude for geo queries
  phone?: string;                  // Contact phone number
  email?: string;                  // Contact email
  websiteUrl?: string;             // Venue website
  logoUrl?: string;                // Venue logo image URL
  status: VenueStatus;             // Current venue status
  isVerified: boolean;             // Admin verification complete
  verifiedAt?: Date;               // Verification timestamp
  performanceScore?: number;       // Current performance score (0-100)
  totalReviews: number;            // Total review count
  averageRating: number;           // Average star rating (1-5)
  createdAt: Date;                 // Registration timestamp
  updatedAt: Date;                 // Last profile update
}

// -----------------------------------------------------
// VENUE PERFORMANCE SCORE INTERFACE
// AI-calculated venue quality score with components
// Used for curation filtering and display
// -----------------------------------------------------
export interface VenuePerformanceScore {
  id: string;                      // Unique score record ID
  venueId: string;                 // Scored venue ID
  overallScore: number;            // Combined score (0-100)
  ratingScore: number;             // Parent ratings component (40%)
  repeatBookingScore: number;      // Repeat booking rate (25%)
  cancellationScore: number;       // Low cancellation bonus (20%)
  attendanceScore: number;         // Attendance rate (15%)
  totalReviews: number;            // Review count for context
  totalBookings: number;           // Booking count for context
  calculatedAt: Date;              // When score was computed
  periodStart: Date;               // Score period start
  periodEnd: Date;                 // Score period end
}

// -----------------------------------------------------
// VENUE DOCUMENT INTERFACE
// Compliance documents uploaded by venue
// Required for approval process
// -----------------------------------------------------
export interface VenueDocument {
  id: string;                      // Unique document ID
  venueId: string;                 // Parent venue ID
  documentType: 'insurance' | 'background_check' | 'safety_audit' | 'business_license';
  fileUrl: string;                 // S3/storage URL
  fileName: string;                // Original filename
  expiryDate?: Date;               // Document expiration date
  isVerified: boolean;             // Admin verified flag
  verifiedBy?: string;             // Admin user ID who verified
  verifiedAt?: Date;               // Verification timestamp
  notes?: string;                  // Admin notes
  uploadedAt: Date;                // Upload timestamp
}

// -----------------------------------------------------
// ACTIVITY INTERFACE
// Main interface for activity listings
// Contains all details needed for display and booking
// -----------------------------------------------------
export interface Activity {
  id: string;                      // Unique activity identifier
  venueId: string;                 // Parent venue ID
  venue?: Venue;                   // Populated venue object
  name: string;                    // Activity display name
  shortDescription?: string;       // Card display description (150 char)
  fullDescription?: string;        // Detailed description
  category: InterestCategory;      // Primary category for matching
  minAge: number;                  // Minimum age requirement
  maxAge: number;                  // Maximum age requirement
  durationMinutes: number;         // Activity length in minutes
  capacityPerSlot: number;         // Max children per session
  creditsRequired: number;         // Credits to book (default: 1)
  skillLevel: SkillLevel;          // Difficulty level
  parentRequired: boolean;         // Parent must attend
  whatToBring?: string;            // Items to bring list
  learningOutcomes?: string;       // What child will learn
  tags: ActivityTag[];             // Activity characteristic tags
  images: ActivityImage[];         // Activity photos
  status: ActivityStatus;          // Current status
  averageRating: number;           // Average review rating
  totalReviews: number;            // Review count
  isFavorited?: boolean;           // Whether current user favorited
  createdAt: Date;                 // Listing creation time
  updatedAt: Date;                 // Last update time
}

// -----------------------------------------------------
// ACTIVITY IMAGE INTERFACE
// Photos associated with an activity
// First image (order 0) is the primary display image
// -----------------------------------------------------
export interface ActivityImage {
  id: string;                      // Unique image ID
  activityId: string;              // Parent activity ID
  imageUrl: string;                // Image storage URL
  displayOrder: number;            // Sort order (0 = primary)
  altText?: string;                // Accessibility alt text
}

// -----------------------------------------------------
// ACTIVITY SCHEDULE INTERFACE
// Recurring schedule pattern for activities
// Used to generate bookable time slots
// -----------------------------------------------------
export interface ActivitySchedule {
  id: string;                      // Unique schedule ID
  activityId: string;              // Parent activity ID
  dayOfWeek: number;               // 0=Sunday, 6=Saturday
  startTime: string;               // Session start time (HH:mm)
  nexusSlots: number;              // Slots allocated to platform
  effectiveFrom: Date;             // Pattern start date
  effectiveUntil?: Date;           // Pattern end date (null=ongoing)
  isActive: boolean;               // Currently active pattern
}

// -----------------------------------------------------
// ACTIVITY SLOT INTERFACE
// Specific bookable time slot instance
// Generated from schedule patterns
// -----------------------------------------------------
export interface ActivitySlot {
  id: string;                      // Unique slot identifier
  activityId: string;              // Parent activity ID
  activity?: Activity;             // Populated activity object
  scheduleId?: string;             // Source schedule pattern ID
  slotDate: Date;                  // Date of this slot
  startTime: string;               // Start time (HH:mm)
  endTime: string;                 // End time (HH:mm)
  totalCapacity: number;           // Max children for slot
  nexusCapacity: number;           // Platform-allocated spots
  bookedCount: number;             // Currently booked count
  availableSpots: number;          // Remaining spots
  status: 'available' | 'full' | 'cancelled'; // Slot status
  cancelledReason?: string;        // If cancelled, why
}

// -----------------------------------------------------
// ACTIVITY FILTER INTERFACE
// Filter criteria for activity search
// Used in browse activities page
// -----------------------------------------------------
export interface ActivityFilter {
  query?: string;                  // Natural language search query
  childId?: string;                // Filter by child fit
  categories?: InterestCategory[]; // Category filter
  minAge?: number;                 // Minimum age filter
  maxAge?: number;                 // Maximum age filter
  dateFrom?: Date;                 // Date range start
  dateTo?: Date;                   // Date range end
  timeOfDay?: ('morning' | 'afternoon' | 'evening')[]; // Time preference
  maxDistance?: number;            // Max distance in minutes
  minVenueScore?: number;          // Minimum venue score
  siblingFriendly?: boolean;       // Group activities only
  tags?: ActivityTag[];            // Activity tags filter
  sortBy?: 'relevance' | 'date' | 'distance' | 'score' | 'credits';
  sortOrder?: 'asc' | 'desc';      // Sort direction
}

// -----------------------------------------------------
// NL SEARCH RESULT INTERFACE
// Natural language search parsed result
// Contains extracted attributes from user query
// -----------------------------------------------------
export interface NLSearchResult {
  originalQuery: string;           // Raw user input
  parsedAttributes: {              // Extracted attributes
    indoor?: boolean;              // Extracted indoor preference
    outdoor?: boolean;             // Extracted outdoor preference
    messy?: boolean;               // Extracted messy preference
    competitive?: boolean;         // Extracted competitive preference
    energyLevel?: 'calm' | 'high'; // Extracted energy preference
    ageRange?: { min: number; max: number }; // Extracted age
    category?: InterestCategory;   // Extracted category
    negations: string[];           // Things to avoid
  };
  suggestedActivities: Activity[]; // Matching activities
  confidence: number;              // Parse confidence (0-1)
}

// -----------------------------------------------------
// CURATION SUGGESTION INTERFACE
// AI-generated monthly activity recommendation
// Presented to parents on dashboard
// -----------------------------------------------------
export interface CurationSuggestion {
  id: string;                      // Unique suggestion ID
  parentId: string;                // Target parent user ID
  childId: string;                 // For which child
  child?: { firstName: string };   // Populated child name
  activityId: string;              // Suggested activity ID
  activity?: Activity;             // Populated activity
  slotId?: string;                 // Recommended slot ID
  slot?: ActivitySlot;             // Populated slot
  suggestionRank: number;          // 1, 2, or 3 priority
  matchScore: number;              // Similarity score (0-1)
  matchReasoning?: string;         // Why this was suggested
  status: 'pending' | 'approved' | 'rejected' | 'expired';
  parentResponseAt?: Date;         // When parent acted
  periodYear: number;              // Suggestion period year
  periodMonth: number;             // Suggestion period month
  siblingMatch?: boolean;          // Suitable for siblings
  matchedSiblings?: string[];      // Sibling IDs if group match
  createdAt: Date;                 // Generation timestamp
}
