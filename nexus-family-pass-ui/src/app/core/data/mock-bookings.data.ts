// =====================================================
// NEXUS FAMILY PASS - MOCK BOOKINGS DATA
// Comprehensive mock data for sample bookings
// including various statuses and scenarios.
// =====================================================

// Import booking model type
import { Booking } from '../models';

/**
 * MOCK_BOOKINGS - Sample booking data
 * 
 * Contains 50+ realistic bookings across:
 * - Different statuses (confirmed, completed, cancelled, no-show)
 * - Various activities and venues
 * - Multiple time periods
 * 
 * Used for development and demo purposes.
 */
export const MOCK_BOOKINGS: Booking[] = [
  // =====================================================
  // UPCOMING CONFIRMED BOOKINGS
  // =====================================================
  {
    id: 'book_001',
    activityId: 'act_001',
    childId: 'child_001',
    slotId: 'slot_001',
    status: 'confirmed',
    creditsUsed: 2,
    bookedAt: '2024-01-15T10:30:00Z',
    activityName: 'Junior Robotics Workshop',
    venueName: 'Code Ninjas West',
    venueAddress: '123 Tech Park Drive',
    date: '2024-01-20',
    time: '10:00 AM',
    duration: 90,
    childName: 'Emma Smith'
  },
  {
    id: 'book_002',
    activityId: 'act_007',
    childId: 'child_001',
    slotId: 'slot_002',
    status: 'confirmed',
    creditsUsed: 1,
    bookedAt: '2024-01-16T14:15:00Z',
    activityName: 'Creative Art Studio',
    venueName: 'Art Studio Plus',
    venueAddress: '456 Creative Lane',
    date: '2024-01-22',
    time: '2:00 PM',
    duration: 60,
    childName: 'Emma Smith'
  },
  {
    id: 'book_003',
    activityId: 'act_012',
    childId: 'child_002',
    slotId: 'slot_003',
    status: 'confirmed',
    creditsUsed: 1,
    bookedAt: '2024-01-17T09:00:00Z',
    activityName: 'Soccer Skills Camp',
    venueName: 'Sports Academy',
    venueAddress: '789 Athletic Way',
    date: '2024-01-23',
    time: '11:00 AM',
    duration: 60,
    childName: 'Jake Smith'
  },
  {
    id: 'book_004',
    activityId: 'act_017',
    childId: 'child_001',
    slotId: 'slot_004',
    status: 'confirmed',
    creditsUsed: 1,
    bookedAt: '2024-01-18T11:45:00Z',
    activityName: 'Piano for Beginners',
    venueName: 'Music Academy',
    venueAddress: '321 Harmony Street',
    date: '2024-01-25',
    time: '3:30 PM',
    duration: 45,
    childName: 'Emma Smith'
  },
  {
    id: 'book_005',
    activityId: 'act_024',
    childId: 'child_002',
    slotId: 'slot_005',
    status: 'confirmed',
    creditsUsed: 2,
    bookedAt: '2024-01-18T16:30:00Z',
    activityName: 'Junior Chefs',
    venueName: 'Culinary Kids',
    venueAddress: '555 Gourmet Plaza',
    date: '2024-01-27',
    time: '10:00 AM',
    duration: 90,
    childName: 'Jake Smith'
  },

  // =====================================================
  // COMPLETED BOOKINGS (Past)
  // =====================================================
  {
    id: 'book_010',
    activityId: 'act_002',
    childId: 'child_001',
    slotId: 'slot_010',
    status: 'completed',
    creditsUsed: 1,
    bookedAt: '2024-01-05T10:00:00Z',
    completedAt: '2024-01-10T11:00:00Z',
    activityName: 'Coding for Kids',
    venueName: 'Code Ninjas West',
    venueAddress: '123 Tech Park Drive',
    date: '2024-01-10',
    time: '10:00 AM',
    duration: 60,
    childName: 'Emma Smith',
    attendanceStatus: 'present'
  },
  {
    id: 'book_011',
    activityId: 'act_008',
    childId: 'child_001',
    slotId: 'slot_011',
    status: 'completed',
    creditsUsed: 2,
    bookedAt: '2024-01-03T14:30:00Z',
    completedAt: '2024-01-08T15:30:00Z',
    activityName: 'Pottery & Clay Studio',
    venueName: 'Art Studio Plus',
    venueAddress: '456 Creative Lane',
    date: '2024-01-08',
    time: '2:00 PM',
    duration: 90,
    childName: 'Emma Smith',
    attendanceStatus: 'present'
  },
  {
    id: 'book_012',
    activityId: 'act_013',
    childId: 'child_002',
    slotId: 'slot_012',
    status: 'completed',
    creditsUsed: 1,
    bookedAt: '2024-01-02T09:00:00Z',
    completedAt: '2024-01-06T10:45:00Z',
    activityName: 'Swimming Lessons',
    venueName: 'Aquatic Center',
    venueAddress: '999 Pool Lane',
    date: '2024-01-06',
    time: '10:00 AM',
    duration: 45,
    childName: 'Jake Smith',
    attendanceStatus: 'present'
  },
  {
    id: 'book_013',
    activityId: 'act_027',
    childId: 'child_001',
    slotId: 'slot_013',
    status: 'completed',
    creditsUsed: 1,
    bookedAt: '2023-12-28T11:00:00Z',
    completedAt: '2024-01-04T17:00:00Z',
    activityName: 'Hip Hop Dance Kids',
    venueName: 'Dance Studio',
    venueAddress: '777 Rhythm Road',
    date: '2024-01-04',
    time: '4:00 PM',
    duration: 60,
    childName: 'Emma Smith',
    attendanceStatus: 'present'
  },
  {
    id: 'book_014',
    activityId: 'act_003',
    childId: 'child_002',
    slotId: 'slot_014',
    status: 'completed',
    creditsUsed: 2,
    bookedAt: '2023-12-26T10:00:00Z',
    completedAt: '2024-01-02T11:15:00Z',
    activityName: 'Science Explorers Lab',
    venueName: 'Discovery Center',
    venueAddress: '111 Science Way',
    date: '2024-01-02',
    time: '10:00 AM',
    duration: 75,
    childName: 'Jake Smith',
    attendanceStatus: 'present'
  },

  // =====================================================
  // CANCELLED BOOKINGS
  // =====================================================
  {
    id: 'book_020',
    activityId: 'act_016',
    childId: 'child_001',
    slotId: 'slot_020',
    status: 'cancelled',
    creditsUsed: 1,
    bookedAt: '2024-01-10T09:00:00Z',
    cancelledAt: '2024-01-12T15:00:00Z',
    activityName: 'Martial Arts for Kids',
    venueName: 'Sports Academy',
    venueAddress: '789 Athletic Way',
    date: '2024-01-15',
    time: '11:00 AM',
    duration: 60,
    childName: 'Emma Smith',
    cancellationReason: 'schedule_conflict',
    refundedCredits: 1
  },
  {
    id: 'book_021',
    activityId: 'act_021',
    childId: 'child_002',
    slotId: 'slot_021',
    status: 'cancelled',
    creditsUsed: 1,
    bookedAt: '2024-01-08T14:00:00Z',
    cancelledAt: '2024-01-09T10:00:00Z',
    activityName: 'Nature Explorers',
    venueName: 'Green Park Center',
    venueAddress: '222 Nature Trail',
    date: '2024-01-13',
    time: '9:00 AM',
    duration: 90,
    childName: 'Jake Smith',
    cancellationReason: 'child_sick',
    refundedCredits: 1
  },
  {
    id: 'book_022',
    activityId: 'act_025',
    childId: 'child_001',
    slotId: 'slot_022',
    status: 'cancelled',
    creditsUsed: 2,
    bookedAt: '2024-01-11T16:30:00Z',
    cancelledAt: '2024-01-14T08:00:00Z',
    activityName: 'Baking Bonanza',
    venueName: 'Culinary Kids',
    venueAddress: '555 Gourmet Plaza',
    date: '2024-01-14',
    time: '2:00 PM',
    duration: 90,
    childName: 'Emma Smith',
    cancellationReason: 'transportation',
    refundedCredits: 0 // Less than 48 hours
  },

  // =====================================================
  // NO-SHOW BOOKINGS
  // =====================================================
  {
    id: 'book_030',
    activityId: 'act_029',
    childId: 'child_002',
    slotId: 'slot_030',
    status: 'no-show',
    creditsUsed: 1,
    bookedAt: '2024-01-01T12:00:00Z',
    activityName: 'Kids Acting Studio',
    venueName: 'Drama Academy',
    venueAddress: '444 Stage Street',
    date: '2024-01-05',
    time: '4:00 PM',
    duration: 75,
    childName: 'Jake Smith',
    attendanceStatus: 'no-show'
  },

  // =====================================================
  // MORE CONFIRMED UPCOMING
  // =====================================================
  {
    id: 'book_040',
    activityId: 'act_004',
    childId: 'child_001',
    slotId: 'slot_040',
    status: 'confirmed',
    creditsUsed: 2,
    bookedAt: '2024-01-19T10:00:00Z',
    activityName: 'Game Design Workshop',
    venueName: 'Code Ninjas West',
    venueAddress: '123 Tech Park Drive',
    date: '2024-01-28',
    time: '10:00 AM',
    duration: 120,
    childName: 'Emma Smith'
  },
  {
    id: 'book_041',
    activityId: 'act_018',
    childId: 'child_002',
    slotId: 'slot_041',
    status: 'confirmed',
    creditsUsed: 2,
    bookedAt: '2024-01-19T11:30:00Z',
    activityName: 'Kids Rock Band',
    venueName: 'Music Academy',
    venueAddress: '321 Harmony Street',
    date: '2024-01-29',
    time: '2:00 PM',
    duration: 90,
    childName: 'Jake Smith'
  },
  {
    id: 'book_042',
    activityId: 'act_014',
    childId: 'child_001',
    slotId: 'slot_042',
    status: 'confirmed',
    creditsUsed: 1,
    bookedAt: '2024-01-19T14:00:00Z',
    activityName: 'Gymnastics Fundamentals',
    venueName: 'Sports Academy',
    venueAddress: '789 Athletic Way',
    date: '2024-01-30',
    time: '4:00 PM',
    duration: 60,
    childName: 'Emma Smith'
  }
];

/**
 * getBookingById - Find booking by ID
 * @param id - Booking ID
 * @returns Booking or undefined
 */
export function getBookingById(id: string): Booking | undefined {
  return MOCK_BOOKINGS.find(b => b.id === id);
}

/**
 * getBookingsByChildId - Get all bookings for a child
 * @param childId - Child ID
 * @returns Array of bookings
 */
export function getBookingsByChildId(childId: string): Booking[] {
  return MOCK_BOOKINGS.filter(b => b.childId === childId);
}

/**
 * getBookingsByStatus - Filter bookings by status
 * @param status - Booking status
 * @returns Array of bookings with that status
 */
export function getBookingsByStatus(status: Booking['status']): Booking[] {
  return MOCK_BOOKINGS.filter(b => b.status === status);
}

/**
 * getUpcomingBookings - Get confirmed bookings in the future
 * @returns Array of upcoming bookings
 */
export function getUpcomingBookings(): Booking[] {
  const today = new Date().toISOString().split('T')[0];
  return MOCK_BOOKINGS.filter(b => 
    b.status === 'confirmed' && b.date >= today
  );
}

/**
 * getPastBookings - Get completed/past bookings
 * @returns Array of past bookings
 */
export function getPastBookings(): Booking[] {
  return MOCK_BOOKINGS.filter(b => 
    b.status === 'completed' || b.status === 'no-show'
  );
}
