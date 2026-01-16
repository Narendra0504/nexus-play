// =====================================================
// NEXUS FAMILY PASS - NOTIFICATION SERVICE
// Service for managing user notifications, preferences,
// and real-time notification updates.
// =====================================================

// Import Angular core
import { Injectable, signal, computed } from '@angular/core';

// Import HttpClient for API calls
import { HttpClient } from '@angular/common/http';

// Import RxJS operators
import { Observable, of, delay, tap } from 'rxjs';

// Import notification models
import { 
  Notification, 
  NotificationType, 
  NotificationPreferences 
} from '../models';

/**
 * NotificationService - Notification Management
 * 
 * This service handles:
 * - Fetching and displaying notifications
 * - Marking notifications as read
 * - Managing notification preferences
 * - Real-time notification updates (future WebSocket)
 * 
 * @example
 * ```typescript
 * // Get unread count
 * const count = this.notificationService.unreadCount();
 * 
 * // Mark as read
 * this.notificationService.markAsRead(notificationId);
 * ```
 */
@Injectable({
  // Provided in root - singleton instance
  providedIn: 'root'
})
export class NotificationService {
  // -------------------------------------------------
  // PRIVATE STATE SIGNALS
  // -------------------------------------------------

  /**
   * Signal for all notifications
   */
  private notificationsSignal = signal<Notification[]>([]);

  /**
   * Signal for notification preferences
   */
  private preferencesSignal = signal<NotificationPreferences | null>(null);

  /**
   * Signal for loading state
   */
  private loadingSignal = signal<boolean>(false);

  // -------------------------------------------------
  // PUBLIC COMPUTED SIGNALS
  // -------------------------------------------------

  /**
   * Read-only notifications
   */
  readonly notifications = this.notificationsSignal.asReadonly();

  /**
   * Read-only preferences
   */
  readonly preferences = this.preferencesSignal.asReadonly();

  /**
   * Read-only loading state
   */
  readonly isLoading = this.loadingSignal.asReadonly();

  /**
   * Computed: unread notifications
   */
  readonly unreadNotifications = computed(() => 
    this.notificationsSignal().filter(n => !n.readAt)
  );

  /**
   * Computed: unread count for badge display
   */
  readonly unreadCount = computed(() => 
    this.unreadNotifications().length
  );

  /**
   * Computed: has unread notifications
   */
  readonly hasUnread = computed(() => 
    this.unreadCount() > 0
  );

  /**
   * Computed: notifications grouped by date
   */
  readonly groupedNotifications = computed(() => {
    const groups: Record<string, Notification[]> = {};
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    this.notificationsSignal().forEach(notification => {
      const date = new Date(notification.createdAt).toDateString();
      let groupKey: string;

      if (date === today) {
        groupKey = 'Today';
      } else if (date === yesterday) {
        groupKey = 'Yesterday';
      } else {
        groupKey = new Date(notification.createdAt).toLocaleDateString('en-US', {
          month: 'long',
          day: 'numeric'
        });
      }

      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(notification);
    });

    return groups;
  });

  // -------------------------------------------------
  // CONSTRUCTOR
  // -------------------------------------------------

  /**
   * Constructor - Inject dependencies
   */
  constructor(private http: HttpClient) {
    console.log('[NotificationService] Service initialized');
  }

  // -------------------------------------------------
  // PUBLIC METHODS - NOTIFICATIONS
  // -------------------------------------------------

  /**
   * loadNotifications - Fetch user's notifications
   * 
   * @param limit - Maximum notifications to fetch
   * @returns Observable<Notification[]>
   */
  loadNotifications(limit: number = 50): Observable<Notification[]> {
    this.loadingSignal.set(true);

    // TODO: API call
    // return this.http.get<Notification[]>('/api/notifications', { params: { limit } });

    return of(this.getMockNotifications()).pipe(
      delay(300),
      tap(notifications => {
        this.notificationsSignal.set(notifications);
        this.loadingSignal.set(false);
        console.log('[NotificationService] Loaded notifications:', notifications.length);
      })
    );
  }

  /**
   * markAsRead - Mark single notification as read
   * 
   * @param notificationId - ID of notification to mark
   * @returns Observable<void>
   */
  markAsRead(notificationId: string): Observable<void> {
    // TODO: API call
    // return this.http.post<void>(`/api/notifications/${notificationId}/read`, {});

    return of(undefined).pipe(
      tap(() => {
        this.notificationsSignal.update(notifications =>
          notifications.map(n => {
            if (n.id === notificationId) {
              return { ...n, readAt: new Date().toISOString() };
            }
            return n;
          })
        );
        console.log('[NotificationService] Marked as read:', notificationId);
      })
    );
  }

  /**
   * markAllAsRead - Mark all notifications as read
   * 
   * @returns Observable<void>
   */
  markAllAsRead(): Observable<void> {
    // TODO: API call
    // return this.http.post<void>('/api/notifications/read-all', {});

    return of(undefined).pipe(
      tap(() => {
        const now = new Date().toISOString();
        this.notificationsSignal.update(notifications =>
          notifications.map(n => ({ ...n, readAt: n.readAt ?? now }))
        );
        console.log('[NotificationService] Marked all as read');
      })
    );
  }

  /**
   * deleteNotification - Remove a notification
   * 
   * @param notificationId - ID to delete
   * @returns Observable<void>
   */
  deleteNotification(notificationId: string): Observable<void> {
    // TODO: API call
    // return this.http.delete<void>(`/api/notifications/${notificationId}`);

    return of(undefined).pipe(
      tap(() => {
        this.notificationsSignal.update(notifications =>
          notifications.filter(n => n.id !== notificationId)
        );
        console.log('[NotificationService] Deleted notification:', notificationId);
      })
    );
  }

  /**
   * clearAll - Clear all notifications
   * 
   * @returns Observable<void>
   */
  clearAll(): Observable<void> {
    // TODO: API call
    // return this.http.delete<void>('/api/notifications');

    return of(undefined).pipe(
      tap(() => {
        this.notificationsSignal.set([]);
        console.log('[NotificationService] Cleared all notifications');
      })
    );
  }

  // -------------------------------------------------
  // PUBLIC METHODS - PREFERENCES
  // -------------------------------------------------

  /**
   * loadPreferences - Fetch notification preferences
   * 
   * @returns Observable<NotificationPreferences>
   */
  loadPreferences(): Observable<NotificationPreferences> {
    // TODO: API call
    // return this.http.get<NotificationPreferences>('/api/notifications/preferences');

    const mockPrefs: NotificationPreferences = {
      email: true,
      push: true,
      sms: false,
      bookingConfirmed: { email: true, push: true, sms: false },
      bookingReminder: { email: true, push: true, sms: false },
      bookingCancelled: { email: true, push: true, sms: false },
      waitlistAvailable: { email: true, push: true, sms: true },
      suggestionsReady: { email: true, push: false, sms: false },
      creditsExpiring: { email: true, push: true, sms: false }
    };

    return of(mockPrefs).pipe(
      delay(200),
      tap(prefs => {
        this.preferencesSignal.set(prefs);
        console.log('[NotificationService] Preferences loaded');
      })
    );
  }

  /**
   * updatePreferences - Save notification preferences
   * 
   * @param preferences - Updated preferences
   * @returns Observable<NotificationPreferences>
   */
  updatePreferences(preferences: NotificationPreferences): Observable<NotificationPreferences> {
    // TODO: API call
    // return this.http.put<NotificationPreferences>('/api/notifications/preferences', preferences);

    return of(preferences).pipe(
      delay(300),
      tap(prefs => {
        this.preferencesSignal.set(prefs);
        console.log('[NotificationService] Preferences updated');
      })
    );
  }

  // -------------------------------------------------
  // PUBLIC METHODS - REAL-TIME (FUTURE)
  // -------------------------------------------------

  /**
   * subscribeToRealtime - Connect to real-time notifications
   * 
   * Would connect to WebSocket for push notifications.
   * Currently a placeholder for future implementation.
   */
  subscribeToRealtime(): void {
    // TODO: WebSocket connection
    console.log('[NotificationService] Real-time subscription (placeholder)');
  }

  /**
   * unsubscribeFromRealtime - Disconnect from real-time
   */
  unsubscribeFromRealtime(): void {
    // TODO: Close WebSocket
    console.log('[NotificationService] Real-time unsubscribed');
  }

  // -------------------------------------------------
  // PUBLIC METHODS - UTILITY
  // -------------------------------------------------

  /**
   * getNotificationIcon - Get icon for notification type
   * 
   * @param type - Notification type
   * @returns Material icon name
   */
  getNotificationIcon(type: NotificationType): string {
    const iconMap: Record<NotificationType, string> = {
      [NotificationType.BOOKING_CONFIRMED]: 'check_circle',
      [NotificationType.BOOKING_REMINDER]: 'alarm',
      [NotificationType.BOOKING_CANCELLED]: 'cancel',
      [NotificationType.WAITLIST_AVAILABLE]: 'notification_important',
      [NotificationType.SUGGESTIONS_READY]: 'auto_awesome',
      [NotificationType.CREDITS_EXPIRING]: 'warning',
      [NotificationType.REVIEW_REQUESTED]: 'rate_review',
      [NotificationType.SYSTEM]: 'info'
    };
    return iconMap[type] ?? 'notifications';
  }

  /**
   * getNotificationColor - Get color class for notification type
   * 
   * @param type - Notification type
   * @returns CSS color class
   */
  getNotificationColor(type: NotificationType): string {
    const colorMap: Record<NotificationType, string> = {
      [NotificationType.BOOKING_CONFIRMED]: 'text-success-600',
      [NotificationType.BOOKING_REMINDER]: 'text-primary-600',
      [NotificationType.BOOKING_CANCELLED]: 'text-danger-500',
      [NotificationType.WAITLIST_AVAILABLE]: 'text-accent-600',
      [NotificationType.SUGGESTIONS_READY]: 'text-accent-600',
      [NotificationType.CREDITS_EXPIRING]: 'text-warning-600',
      [NotificationType.REVIEW_REQUESTED]: 'text-primary-600',
      [NotificationType.SYSTEM]: 'text-neutral-600'
    };
    return colorMap[type] ?? 'text-neutral-600';
  }

  // -------------------------------------------------
  // PRIVATE HELPER METHODS
  // -------------------------------------------------

  /**
   * getMockNotifications - Generate mock notifications
   */
  private getMockNotifications(): Notification[] {
    return [
      {
        id: 'notif_001',
        userId: 'user_001',
        type: NotificationType.BOOKING_CONFIRMED,
        title: 'Booking Confirmed',
        message: 'Your booking for Junior Robotics Workshop on Jan 20 is confirmed!',
        data: { bookingId: 'book_001', activityName: 'Junior Robotics Workshop' },
        createdAt: new Date(Date.now() - 3600000).toISOString(), // 1 hour ago
        readAt: undefined
      },
      {
        id: 'notif_002',
        userId: 'user_001',
        type: NotificationType.SUGGESTIONS_READY,
        title: 'New Suggestions Available',
        message: 'We found 5 new activities perfect for Emma and Jake!',
        data: { suggestionCount: 5 },
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
        readAt: undefined
      },
      {
        id: 'notif_003',
        userId: 'user_001',
        type: NotificationType.WAITLIST_AVAILABLE,
        title: 'Spot Available!',
        message: 'A spot opened up for Coding for Kids. Book now before it fills!',
        data: { activityId: 'act_005', waitlistId: 'wl_001' },
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        readAt: new Date(Date.now() - 86400000).toISOString()
      },
      {
        id: 'notif_004',
        userId: 'user_001',
        type: NotificationType.CREDITS_EXPIRING,
        title: 'Credits Expiring Soon',
        message: 'You have 7 credits expiring in 16 days. Book activities now!',
        data: { credits: 7, daysLeft: 16 },
        createdAt: new Date(Date.now() - 259200000).toISOString(), // 3 days ago
        readAt: new Date(Date.now() - 172800000).toISOString()
      },
      {
        id: 'notif_005',
        userId: 'user_001',
        type: NotificationType.BOOKING_REMINDER,
        title: 'Upcoming Activity Tomorrow',
        message: 'Reminder: Creative Art Studio for Emma tomorrow at 2:00 PM',
        data: { bookingId: 'book_002' },
        createdAt: new Date(Date.now() - 7200000).toISOString(), // 2 hours ago
        readAt: undefined
      }
    ];
  }
}
