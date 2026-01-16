// =====================================================
// NEXUS FAMILY PASS - NOTIFICATION & REVIEW MODELS
// TypeScript interfaces for notifications, reviews,
// feedback, and user preferences
// =====================================================

// Import related models
import { Activity } from './activity.model';
import { Booking } from './booking.model';
import { Child } from './child.model';

// -----------------------------------------------------
// NOTIFICATION TYPE ENUM
// Categories of notifications sent to users
// Used for filtering and routing to channels
// -----------------------------------------------------
export enum NotificationType {
  BOOKING_CONFIRMED = 'booking_confirmed',     // Booking was confirmed
  BOOKING_REMINDER = 'booking_reminder',       // 24hr before activity
  BOOKING_CANCELLED = 'booking_cancelled',     // Venue cancelled
  WAITLIST_AVAILABLE = 'waitlist_available',   // Spot opened
  SUGGESTIONS_READY = 'suggestions_ready',     // Monthly curation complete
  FEEDBACK_REQUEST = 'feedback_request',       // Post-activity feedback
  CREDITS_EXPIRING = 'credits_expiring',       // 7-day warning
  SYSTEM = 'system'                            // System announcements
}

// -----------------------------------------------------
// NOTIFICATION INTERFACE
// Individual notification record
// Displayed in notification center
// -----------------------------------------------------
export interface Notification {
  id: string;                          // Unique notification ID
  userId: string;                      // Recipient user ID
  type: NotificationType;              // Notification category
  title: string;                       // Notification title
  body: string;                        // Notification content
  data?: Record<string, unknown>;      // Additional structured data
  bookingId?: string;                  // Related booking ID if any
  booking?: Booking;                   // Populated booking
  isRead: boolean;                     // Read status flag
  readAt?: Date;                       // When marked read
  channelsSent: string[];              // Channels delivered (email, push)
  actionUrl?: string;                  // URL to navigate when clicked
  createdAt: Date;                     // Notification creation time
}

// -----------------------------------------------------
// NOTIFICATION PREFERENCES INTERFACE
// User's notification channel preferences
// Controls how notifications are delivered
// -----------------------------------------------------
export interface NotificationPreferences {
  id: string;                          // Unique preference ID
  userId: string;                      // Preference owner ID
  notificationType: NotificationType;  // Which notification type
  emailEnabled: boolean;               // Send via email
  smsEnabled: boolean;                 // Send via SMS
  pushEnabled: boolean;                // Send via push notification
  whatsappEnabled: boolean;            // Send via WhatsApp
}

// -----------------------------------------------------
// NOTIFICATION SETTINGS INTERFACE
// Complete notification settings for a user
// Used in settings page
// -----------------------------------------------------
export interface NotificationSettings {
  preferences: NotificationPreferences[]; // Per-type preferences
  defaultChannel: 'email' | 'sms' | 'push'; // Default channel
  frequency: 'immediate' | 'daily_digest' | 'weekly_summary';
  quietHoursEnabled: boolean;          // Respect quiet hours
  quietHoursStart?: string;            // Quiet hours start (HH:mm)
  quietHoursEnd?: string;              // Quiet hours end (HH:mm)
}

// -----------------------------------------------------
// REVIEW INTERFACE
// Detailed parent review of an activity
// Displayed on activity detail page
// -----------------------------------------------------
export interface Review {
  id: string;                          // Unique review ID
  bookingId: string;                   // Source booking ID
  parentId: string;                    // Reviewer user ID
  parentInitials: string;              // Reviewer initials for privacy
  activityId: string;                  // Reviewed activity ID
  activity?: Activity;                 // Populated activity
  rating: number;                      // Star rating (1-5)
  wouldBookAgain?: boolean;            // Repeat intent indicator
  wouldRecommend?: boolean;            // Recommendation indicator
  reviewText?: string;                 // Written review content
  isPublished: boolean;                // Moderation flag
  venueResponse?: string;              // Venue's reply
  venueRespondedAt?: Date;             // Response timestamp
  createdAt: Date;                     // Review submission time
  updatedAt: Date;                     // Last edit time
}

// -----------------------------------------------------
// REVIEW FORM DATA INTERFACE
// Data submitted when writing a review
// Used by review modal form
// -----------------------------------------------------
export interface ReviewFormData {
  bookingId: string;                   // Booking being reviewed
  rating: number;                      // Star rating (1-5)
  wouldBookAgain: boolean;             // Repeat intent
  wouldRecommend: boolean;             // Recommendation
  reviewText?: string;                 // Written review
}

// -----------------------------------------------------
// ACTIVITY FEEDBACK INTERFACE
// Quick thumbs up/down post-activity feedback
// Used for AI vector updates
// -----------------------------------------------------
export interface ActivityFeedback {
  id: string;                          // Unique feedback ID
  bookingId: string;                   // Source booking ID
  childId: string;                     // Child who attended
  child?: Child;                       // Populated child
  isPositive: boolean;                 // Thumbs up (true) or down
  positiveTags?: string[];             // What they liked
  negativeTags?: string[];             // What to improve
  comment?: string;                    // Optional text comment
  createdAt: Date;                     // Feedback timestamp
}

// -----------------------------------------------------
// FEEDBACK FORM DATA INTERFACE
// Data submitted in quick feedback modal
// Appears 1 hour after activity
// -----------------------------------------------------
export interface FeedbackFormData {
  bookingId: string;                   // Booking to give feedback for
  childId: string;                     // Child who attended
  isPositive: boolean;                 // Thumbs up/down
  tags?: string[];                     // Selected tags
  comment?: string;                    // Optional comment
}

// -----------------------------------------------------
// POSITIVE FEEDBACK TAGS
// Tag options when giving positive feedback
// -----------------------------------------------------
export const POSITIVE_FEEDBACK_TAGS = [
  'Fun',               // Activity was fun
  'Educational',       // Learned something
  'Social',            // Good social interaction
  'Creative',          // Expressed creativity
  'Engaging',          // Kept child engaged
  'Age-appropriate'    // Good for child's age
] as const;

export type PositiveFeedbackTag = typeof POSITIVE_FEEDBACK_TAGS[number];

// -----------------------------------------------------
// NEGATIVE FEEDBACK TAGS
// Tag options when giving negative feedback
// -----------------------------------------------------
export const NEGATIVE_FEEDBACK_TAGS = [
  'Organization',      // Poor organization
  'Content',           // Content not as expected
  'Instructor',        // Instructor issues
  'Facility',          // Facility problems
  'Age-mismatch',      // Not right for child's age
  'Duration'           // Too long/short
] as const;

export type NegativeFeedbackTag = typeof NEGATIVE_FEEDBACK_TAGS[number];

// -----------------------------------------------------
// REVIEW SUMMARY INTERFACE
// Aggregate review statistics for activity/venue
// Displayed in activity detail and venue cards
// -----------------------------------------------------
export interface ReviewSummary {
  averageRating: number;               // Average star rating
  totalReviews: number;                // Total review count
  ratingDistribution: {                // Count per star level
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
  wouldBookAgainPercentage: number;    // % who would book again
  wouldRecommendPercentage: number;    // % who would recommend
  recentReviews: Review[];             // Last 3-5 reviews
}

// -----------------------------------------------------
// VENUE FEEDBACK SUMMARY INTERFACE
// Aggregate feedback for venue performance
// Used in venue performance dashboard
// -----------------------------------------------------
export interface VenueFeedbackSummary {
  venueId: string;                     // Venue ID
  periodStart: Date;                   // Summary period start
  periodEnd: Date;                     // Summary period end
  totalFeedback: number;               // Total feedback count
  positiveCount: number;               // Positive feedback count
  negativeCount: number;               // Negative feedback count
  positivePercentage: number;          // Positive percentage
  topPositiveTags: string[];           // Most common positive tags
  topNegativeTags: string[];           // Most common negative tags
  improvementSuggestions: string[];    // AI-generated improvement tips
}
