// =====================================================
// NEXUS FAMILY PASS - BOOKING & CREDIT MODELS
// TypeScript interfaces for bookings, waitlist,
// credit accounts, and transactions
// =====================================================

// Import related models
import { Activity, ActivitySlot, Venue } from './activity.model';
import { Child } from './child.model';

// -----------------------------------------------------
// BOOKING STATUS ENUM
// Lifecycle states for booking records
// Tracks from creation through completion or cancellation
// -----------------------------------------------------
export enum BookingStatus {
  PENDING = 'pending',                 // Awaiting venue confirmation
  CONFIRMED = 'confirmed',             // Venue confirmed booking
  COMPLETED = 'completed',             // Activity attended successfully
  CANCELLED_PARENT = 'cancelled_parent', // Parent cancelled
  CANCELLED_VENUE = 'cancelled_venue', // Venue cancelled
  NO_SHOW = 'no_show'                  // Child did not attend
}

// -----------------------------------------------------
// BOOKING INTERFACE
// Main booking record linking parent to activity slot
// Contains all booking details and status tracking
// -----------------------------------------------------
export interface Booking {
  id: string;                          // Unique booking identifier
  parentId: string;                    // Parent user who booked
  slotId: string;                      // Booked activity slot ID
  slot?: ActivitySlot;                 // Populated slot with activity
  activity?: Activity;                 // Populated activity details
  venue?: Venue;                       // Populated venue details
  children: BookingChild[];            // Children attending this booking
  status: BookingStatus;               // Current booking status
  totalCreditsCharged: number;         // Total credits for all children
  bookedAt: Date;                      // Booking creation timestamp
  confirmedAt?: Date;                  // Venue confirmation timestamp
  cancelledAt?: Date;                  // Cancellation timestamp
  cancellationReason?: string;         // Reason for cancellation
  attendedAt?: Date;                   // Attendance confirmation time
  canCancel: boolean;                  // Whether >48hrs remain
  createdAt: Date;                     // Record creation time
  updatedAt: Date;                     // Last status update
}

// -----------------------------------------------------
// BOOKING CHILD INTERFACE
// Individual child assigned to a booking
// Supports sibling/group bookings
// -----------------------------------------------------
export interface BookingChild {
  id: string;                          // Unique assignment ID
  bookingId: string;                   // Parent booking ID
  childId: string;                     // Attending child ID
  child?: Child;                       // Populated child object
  creditsCharged: number;              // Credits for this child
  attended?: boolean;                  // Individual attendance status
}

// -----------------------------------------------------
// WAITLIST INTERFACE
// Waitlist entry for a full activity slot
// Used when desired slot has no availability
// -----------------------------------------------------
export interface WaitlistEntry {
  id: string;                          // Unique waitlist entry ID
  parentId: string;                    // Waiting parent user ID
  childId: string;                     // For which child
  child?: Child;                       // Populated child object
  slotId: string;                      // Desired slot ID
  slot?: ActivitySlot;                 // Populated slot with activity
  activity?: Activity;                 // Populated activity
  position: number;                    // Queue position (1 = first)
  status: 'waiting' | 'notified' | 'expired' | 'converted';
  notifiedAt?: Date;                   // When spot-available sent
  expiresAt?: Date;                    // 4hr confirmation deadline
  createdAt: Date;                     // Joined waitlist time
}

// -----------------------------------------------------
// CREDIT TRANSACTION TYPE ENUM
// Categories of credit movements
// Used for transaction history and reporting
// -----------------------------------------------------
export enum CreditTransactionType {
  ALLOCATION = 'allocation',           // Monthly credit grant
  BOOKING = 'booking',                 // Credit deducted for booking
  REFUND = 'refund',                   // Credit returned for cancellation
  FORFEITURE = 'forfeiture',           // Credit lost (late cancel/no-show)
  EXPIRY = 'expiry',                   // Credit expired at month end
  ADJUSTMENT = 'adjustment'            // Manual admin adjustment
}

// -----------------------------------------------------
// CREDIT ACCOUNT INTERFACE
// Monthly credit balance for a parent user
// Tracks allocated, used, and remaining credits
// -----------------------------------------------------
export interface CreditAccount {
  id: string;                          // Unique account ID
  userId: string;                      // Account owner user ID
  periodYear: number;                  // Credit period year
  periodMonth: number;                 // Credit period month (1-12)
  allocatedCredits: number;            // Credits granted this period
  usedCredits: number;                 // Credits consumed
  expiredCredits: number;              // Credits lost to expiry
  remainingCredits: number;            // Computed remaining balance
  createdAt: Date;                     // Account creation time
  updatedAt: Date;                     // Last balance update
}

// -----------------------------------------------------
// CREDIT TRANSACTION INTERFACE
// Individual credit movement record
// Provides audit trail for all credit changes
// -----------------------------------------------------
export interface CreditTransaction {
  id: string;                          // Unique transaction ID
  creditAccountId: string;             // Parent account ID
  transactionType: CreditTransactionType; // Type of transaction
  amount: number;                      // Credits moved (+/-)
  balanceAfter: number;                // Balance after transaction
  bookingId?: string;                  // Related booking if any
  booking?: Booking;                   // Populated booking
  description: string;                 // Human-readable description
  createdBy?: string;                  // User who initiated (null=system)
  createdAt: Date;                     // Transaction timestamp
}

// -----------------------------------------------------
// CREDIT SUMMARY INTERFACE
// Summarized credit status for display
// Used in dashboard and header
// -----------------------------------------------------
export interface CreditSummary {
  currentPeriod: {                     // Current month period info
    year: number;
    month: number;
    monthName: string;                 // "January", "February", etc.
  };
  allocated: number;                   // Total allocated this month
  used: number;                        // Credits used this month
  remaining: number;                   // Credits available
  expiringIn: number;                  // Days until expiry
  usagePercentage: number;             // Percentage used (0-100)
}

// -----------------------------------------------------
// BOOKING REQUEST INTERFACE
// Data submitted when creating a booking
// Used by booking form/modal
// -----------------------------------------------------
export interface BookingRequest {
  slotId: string;                      // Slot to book
  childIds: string[];                  // Children to book for
  isSiblingBooking: boolean;           // Multiple children flag
}

// -----------------------------------------------------
// BOOKING CANCELLATION REQUEST INTERFACE
// Data submitted when cancelling a booking
// -----------------------------------------------------
export interface CancellationRequest {
  bookingId: string;                   // Booking to cancel
  reason?: string;                     // Optional cancellation reason
}

// -----------------------------------------------------
// BOOKING FILTER INTERFACE
// Filter criteria for booking history
// Used in My Bookings page
// -----------------------------------------------------
export interface BookingFilter {
  status?: BookingStatus[];            // Filter by status
  childId?: string;                    // Filter by child
  dateFrom?: Date;                     // Date range start
  dateTo?: Date;                       // Date range end
  tab: 'upcoming' | 'past' | 'cancelled'; // Current tab
}

// -----------------------------------------------------
// BOOKING CONFIRMATION INTERFACE
// Response after successful booking
// Displayed in confirmation modal
// -----------------------------------------------------
export interface BookingConfirmation {
  booking: Booking;                    // Created booking record
  creditsDeducted: number;             // Credits used
  creditsRemaining: number;            // Remaining balance
  calendarEvent: {                     // Calendar export data
    title: string;
    startDate: Date;
    endDate: Date;
    location: string;
    description: string;
  };
}

// -----------------------------------------------------
// ATTENDANCE RECORD INTERFACE
// Attendance tracking for venue sessions
// Used in venue portal attendance page
// -----------------------------------------------------
export interface AttendanceRecord {
  bookingChildId: string;              // Booking child assignment ID
  childFirstName: string;              // Child's first name
  childLastInitial: string;            // Last initial for privacy
  age: number;                         // Child's age
  parentContact?: string;              // Contact (revealed day-of only)
  status: 'pending' | 'present' | 'no_show'; // Attendance status
  notes?: string;                      // Allergies, accessibility needs
}

// -----------------------------------------------------
// SESSION SUMMARY INTERFACE
// Summary of a venue session for attendance page
// -----------------------------------------------------
export interface SessionSummary {
  slotId: string;                      // Session slot ID
  activityName: string;                // Activity name
  date: Date;                          // Session date
  startTime: string;                   // Start time
  endTime: string;                     // End time
  bookedCount: number;                 // Number of bookings
  capacity: number;                    // Total capacity
  attendees: AttendanceRecord[];       // Attendance records
  isComplete: boolean;                 // Session marked complete
}
