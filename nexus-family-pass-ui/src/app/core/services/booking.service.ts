// =====================================================
// NEXUS FAMILY PASS - BOOKING SERVICE
// Service for managing bookings, waitlists, credits,
// and attendance tracking. Core transactional service.
// =====================================================

// Import Angular core
import { Injectable, signal, computed } from '@angular/core';

// Import HttpClient for API calls
import { HttpClient } from '@angular/common/http';

// Import RxJS operators
import { Observable, of, delay, tap, throwError } from 'rxjs';

// Import booking models
import { 
  Booking, 
  BookingStatus, 
  WaitlistEntry, 
  CreditAccount,
  CreditTransaction,
  CreditSummary,
  AttendanceRecord
} from '../models';

/**
 * BookingService - Booking and Credit Management
 * 
 * This service handles all booking-related operations:
 * - Creating and managing bookings
 * - Waitlist management
 * - Credit balance and transactions
 * - Attendance tracking
 * - Booking cancellations and modifications
 * 
 * Uses Angular Signals for reactive state management.
 * 
 * @example
 * ```typescript
 * // Create a booking
 * this.bookingService.createBooking({
 *   activityId: 'act_001',
 *   slotId: 'slot_001',
 *   childIds: ['child_001']
 * }).subscribe();
 * 
 * // Check credit balance
 * const credits = this.bookingService.creditSummary();
 * ```
 */
@Injectable({
  // Provided in root - singleton instance
  providedIn: 'root'
})
export class BookingService {
  // -------------------------------------------------
  // PRIVATE STATE SIGNALS
  // -------------------------------------------------

  /**
   * Signal for user's bookings
   */
  private bookingsSignal = signal<Booking[]>([]);

  /**
   * Signal for user's waitlist entries
   */
  private waitlistSignal = signal<WaitlistEntry[]>([]);

  /**
   * Signal for credit summary
   */
  private creditSummarySignal = signal<CreditSummary | null>(null);

  /**
   * Signal for loading state
   */
  private loadingSignal = signal<boolean>(false);

  // -------------------------------------------------
  // PUBLIC COMPUTED SIGNALS
  // -------------------------------------------------

  /**
   * Read-only bookings
   */
  readonly bookings = this.bookingsSignal.asReadonly();

  /**
   * Read-only waitlist
   */
  readonly waitlist = this.waitlistSignal.asReadonly();

  /**
   * Read-only credit summary
   */
  readonly creditSummary = this.creditSummarySignal.asReadonly();

  /**
   * Read-only loading state
   */
  readonly isLoading = this.loadingSignal.asReadonly();

  /**
   * Computed: upcoming bookings (confirmed, future dates)
   */
  readonly upcomingBookings = computed(() => {
    const now = new Date();
    return this.bookingsSignal()
      .filter(b => 
        b.status === BookingStatus.CONFIRMED && 
        new Date(b.scheduledDate) >= now
      )
      .sort((a, b) => 
        new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      );
  });

  /**
   * Computed: past bookings
   */
  readonly pastBookings = computed(() => {
    const now = new Date();
    return this.bookingsSignal()
      .filter(b => new Date(b.scheduledDate) < now)
      .sort((a, b) => 
        new Date(b.scheduledDate).getTime() - new Date(a.scheduledDate).getTime()
      );
  });

  /**
   * Computed: remaining credits
   */
  readonly remainingCredits = computed(() => {
    return this.creditSummarySignal()?.remaining ?? 0;
  });

  /**
   * Computed: booking count
   */
  readonly bookingCount = computed(() => this.bookingsSignal().length);

  /**
   * Computed: waitlist count
   */
  readonly waitlistCount = computed(() => this.waitlistSignal().length);

  // -------------------------------------------------
  // CONSTRUCTOR
  // -------------------------------------------------

  /**
   * Constructor - Inject dependencies
   */
  constructor(private http: HttpClient) {
    console.log('[BookingService] Service initialized');
  }

  // -------------------------------------------------
  // PUBLIC METHODS - BOOKINGS
  // -------------------------------------------------

  /**
   * loadBookings - Fetch user's bookings
   * 
   * @returns Observable<Booking[]>
   */
  loadBookings(): Observable<Booking[]> {
    this.loadingSignal.set(true);

    // TODO: API call
    // return this.http.get<Booking[]>('/api/bookings');

    return of(this.getMockBookings()).pipe(
      delay(400),
      tap(bookings => {
        this.bookingsSignal.set(bookings);
        this.loadingSignal.set(false);
        console.log('[BookingService] Loaded bookings:', bookings.length);
      })
    );
  }

  /**
   * createBooking - Create a new booking
   * 
   * @param bookingData - Booking details
   * @returns Observable<Booking>
   */
  createBooking(bookingData: {
    activityId: string;
    slotId: string;
    childIds: string[];
    notes?: string;
  }): Observable<Booking> {
    this.loadingSignal.set(true);

    // Check credit balance first
    const creditCost = 2; // Would come from activity
    const remaining = this.remainingCredits();
    
    if (remaining < creditCost) {
      this.loadingSignal.set(false);
      return throwError(() => new Error('Insufficient credits'));
    }

    // TODO: API call
    // return this.http.post<Booking>('/api/bookings', bookingData);

    // Mock booking creation
    const newBooking: Booking = {
      id: `book_${Date.now()}`,
      userId: 'current_user',
      activityId: bookingData.activityId,
      slotId: bookingData.slotId,
      childIds: bookingData.childIds,
      status: BookingStatus.CONFIRMED,
      creditsCost: creditCost,
      scheduledDate: '2024-01-20T10:00:00',
      notes: bookingData.notes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    return of(newBooking).pipe(
      delay(500),
      tap(booking => {
        // Add to bookings
        this.bookingsSignal.update(bookings => [...bookings, booking]);
        
        // Deduct credits
        this.creditSummarySignal.update(summary => {
          if (!summary) return summary;
          return {
            ...summary,
            used: summary.used + creditCost,
            remaining: summary.remaining - creditCost,
            usagePercentage: Math.round(((summary.used + creditCost) / summary.allocated) * 100)
          };
        });
        
        this.loadingSignal.set(false);
        console.log('[BookingService] Booking created:', booking.id);
      })
    );
  }

  /**
   * cancelBooking - Cancel an existing booking
   * 
   * @param bookingId - Booking ID to cancel
   * @param reason - Cancellation reason
   * @returns Observable<Booking>
   */
  cancelBooking(bookingId: string, reason?: string): Observable<Booking> {
    this.loadingSignal.set(true);

    // TODO: API call
    // return this.http.post<Booking>(`/api/bookings/${bookingId}/cancel`, { reason });

    const booking = this.bookingsSignal().find(b => b.id === bookingId);
    if (!booking) {
      this.loadingSignal.set(false);
      return throwError(() => new Error('Booking not found'));
    }

    const cancelledBooking: Booking = {
      ...booking,
      status: BookingStatus.CANCELLED,
      cancellationReason: reason,
      updatedAt: new Date().toISOString()
    };

    return of(cancelledBooking).pipe(
      delay(300),
      tap(updated => {
        // Update in state
        this.bookingsSignal.update(bookings =>
          bookings.map(b => b.id === bookingId ? updated : b)
        );
        
        // Refund credits
        this.creditSummarySignal.update(summary => {
          if (!summary) return summary;
          return {
            ...summary,
            used: summary.used - booking.creditsCost,
            remaining: summary.remaining + booking.creditsCost,
            usagePercentage: Math.round(((summary.used - booking.creditsCost) / summary.allocated) * 100)
          };
        });
        
        this.loadingSignal.set(false);
        console.log('[BookingService] Booking cancelled:', bookingId);
      })
    );
  }

  /**
   * getBookingById - Fetch single booking
   * 
   * @param id - Booking ID
   * @returns Observable<Booking | null>
   */
  getBookingById(id: string): Observable<Booking | null> {
    const cached = this.bookingsSignal().find(b => b.id === id);
    if (cached) return of(cached);

    // TODO: API call
    return of(null);
  }

  // -------------------------------------------------
  // PUBLIC METHODS - WAITLIST
  // -------------------------------------------------

  /**
   * loadWaitlist - Fetch user's waitlist entries
   * 
   * @returns Observable<WaitlistEntry[]>
   */
  loadWaitlist(): Observable<WaitlistEntry[]> {
    // TODO: API call
    // return this.http.get<WaitlistEntry[]>('/api/waitlist');

    return of(this.getMockWaitlist()).pipe(
      delay(300),
      tap(entries => {
        this.waitlistSignal.set(entries);
        console.log('[BookingService] Loaded waitlist:', entries.length);
      })
    );
  }

  /**
   * joinWaitlist - Add to activity waitlist
   * 
   * @param activityId - Activity ID
   * @param slotId - Slot ID
   * @param childIds - Children to waitlist
   * @returns Observable<WaitlistEntry>
   */
  joinWaitlist(activityId: string, slotId: string, childIds: string[]): Observable<WaitlistEntry> {
    // TODO: API call
    // return this.http.post<WaitlistEntry>('/api/waitlist', { activityId, slotId, childIds });

    const entry: WaitlistEntry = {
      id: `wl_${Date.now()}`,
      userId: 'current_user',
      activityId,
      slotId,
      childIds,
      position: 3, // Would come from API
      status: 'waiting',
      createdAt: new Date().toISOString()
    };

    return of(entry).pipe(
      delay(300),
      tap(newEntry => {
        this.waitlistSignal.update(entries => [...entries, newEntry]);
        console.log('[BookingService] Joined waitlist:', newEntry.id);
      })
    );
  }

  /**
   * leaveWaitlist - Remove from waitlist
   * 
   * @param entryId - Waitlist entry ID
   * @returns Observable<void>
   */
  leaveWaitlist(entryId: string): Observable<void> {
    // TODO: API call
    // return this.http.delete<void>(`/api/waitlist/${entryId}`);

    return of(undefined).pipe(
      delay(200),
      tap(() => {
        this.waitlistSignal.update(entries =>
          entries.filter(e => e.id !== entryId)
        );
        console.log('[BookingService] Left waitlist:', entryId);
      })
    );
  }

  // -------------------------------------------------
  // PUBLIC METHODS - CREDITS
  // -------------------------------------------------

  /**
   * loadCreditSummary - Fetch current credit balance
   * 
   * @returns Observable<CreditSummary>
   */
  loadCreditSummary(): Observable<CreditSummary> {
    // TODO: API call
    // return this.http.get<CreditSummary>('/api/credits/summary');

    const mockSummary: CreditSummary = {
      currentPeriod: {
        year: 2024,
        month: 1,
        monthName: 'January'
      },
      allocated: 10,
      used: 3,
      remaining: 7,
      expiringIn: 16,
      usagePercentage: 30
    };

    return of(mockSummary).pipe(
      delay(200),
      tap(summary => {
        this.creditSummarySignal.set(summary);
        console.log('[BookingService] Credit summary loaded:', summary.remaining, 'remaining');
      })
    );
  }

  /**
   * getCreditHistory - Fetch credit transaction history
   * 
   * @param months - Number of months of history
   * @returns Observable<CreditTransaction[]>
   */
  getCreditHistory(months: number = 3): Observable<CreditTransaction[]> {
    // TODO: API call
    // return this.http.get<CreditTransaction[]>('/api/credits/history', { params: { months } });

    const mockHistory: CreditTransaction[] = [
      {
        id: 'tx_001',
        type: 'allocation',
        amount: 10,
        description: 'Monthly allocation - January 2024',
        timestamp: '2024-01-01T00:00:00Z'
      },
      {
        id: 'tx_002',
        type: 'usage',
        amount: -2,
        description: 'Junior Robotics Workshop',
        bookingId: 'book_001',
        timestamp: '2024-01-05T10:00:00Z'
      },
      {
        id: 'tx_003',
        type: 'usage',
        amount: -1,
        description: 'Creative Art Studio',
        bookingId: 'book_002',
        timestamp: '2024-01-08T14:00:00Z'
      }
    ];

    return of(mockHistory).pipe(delay(200));
  }

  // -------------------------------------------------
  // PUBLIC METHODS - ATTENDANCE
  // -------------------------------------------------

  /**
   * recordAttendance - Mark attendance for a booking
   * 
   * @param bookingId - Booking ID
   * @param attended - Whether child attended
   * @returns Observable<AttendanceRecord>
   */
  recordAttendance(bookingId: string, attended: boolean): Observable<AttendanceRecord> {
    // TODO: API call
    // return this.http.post<AttendanceRecord>(`/api/bookings/${bookingId}/attendance`, { attended });

    const record: AttendanceRecord = {
      id: `att_${Date.now()}`,
      bookingId,
      attended,
      recordedAt: new Date().toISOString()
    };

    return of(record).pipe(
      delay(200),
      tap(() => {
        // Update booking status
        this.bookingsSignal.update(bookings =>
          bookings.map(b => {
            if (b.id === bookingId) {
              return {
                ...b,
                status: attended ? BookingStatus.COMPLETED : BookingStatus.NO_SHOW
              };
            }
            return b;
          })
        );
        console.log('[BookingService] Attendance recorded:', bookingId, attended);
      })
    );
  }

  // -------------------------------------------------
  // PRIVATE HELPER METHODS
  // -------------------------------------------------

  /**
   * getMockBookings - Generate mock bookings
   */
  private getMockBookings(): Booking[] {
    return [
      {
        id: 'book_001',
        userId: 'user_001',
        activityId: 'act_001',
        slotId: 'slot_001',
        childIds: ['child_001'],
        status: BookingStatus.CONFIRMED,
        creditsCost: 2,
        scheduledDate: '2024-01-20T10:00:00',
        createdAt: '2024-01-10T12:00:00Z',
        updatedAt: '2024-01-10T12:00:00Z'
      },
      {
        id: 'book_002',
        userId: 'user_001',
        activityId: 'act_002',
        slotId: 'slot_005',
        childIds: ['child_001', 'child_002'],
        status: BookingStatus.CONFIRMED,
        creditsCost: 1,
        scheduledDate: '2024-01-21T14:00:00',
        createdAt: '2024-01-12T09:00:00Z',
        updatedAt: '2024-01-12T09:00:00Z'
      },
      {
        id: 'book_003',
        userId: 'user_001',
        activityId: 'act_003',
        slotId: 'slot_010',
        childIds: ['child_002'],
        status: BookingStatus.COMPLETED,
        creditsCost: 1,
        scheduledDate: '2024-01-13T09:00:00',
        createdAt: '2024-01-05T15:00:00Z',
        updatedAt: '2024-01-13T10:00:00Z'
      }
    ];
  }

  /**
   * getMockWaitlist - Generate mock waitlist entries
   */
  private getMockWaitlist(): WaitlistEntry[] {
    return [
      {
        id: 'wl_001',
        userId: 'user_001',
        activityId: 'act_005',
        slotId: 'slot_020',
        childIds: ['child_001'],
        position: 2,
        status: 'waiting',
        createdAt: '2024-01-14T10:00:00Z'
      },
      {
        id: 'wl_002',
        userId: 'user_001',
        activityId: 'act_004',
        slotId: 'slot_025',
        childIds: ['child_002'],
        position: 1,
        status: 'notified',
        createdAt: '2024-01-15T11:00:00Z'
      }
    ];
  }
}
