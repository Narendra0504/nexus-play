// =====================================================
// NEXUS FAMILY PASS - NOTIFICATIONS COMPONENT
// Notification center with all user notifications
// =====================================================

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatBadgeModule
  ],
  template: `
    <div class="notifications-page">
      <header class="page-header">
        <h1>Notifications</h1>
        <button mat-button color="primary" (click)="markAllRead()" [disabled]="unreadCount() === 0">
          Mark All Read
        </button>
      </header>

      @if (notifications().length > 0) {
        <div class="notifications-list">
          @for (notification of notifications(); track notification.id) {
            <mat-card 
              class="notification-card" 
              [class.unread]="!notification.isRead"
              (click)="markAsRead(notification)">
              
              <div class="notification-icon" [ngClass]="notification.type">
                <mat-icon>{{ getIcon(notification.type) }}</mat-icon>
              </div>
              
              <div class="notification-content">
                <h3>{{ notification.title }}</h3>
                <p>{{ notification.body }}</p>
                <span class="timestamp">{{ notification.time }}</span>
              </div>
              
              @if (!notification.isRead) {
                <div class="unread-indicator"></div>
              }
            </mat-card>
          }
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>notifications_none</mat-icon>
          <h2>No notifications</h2>
          <p>You're all caught up!</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .notifications-page { max-width: 700px; margin: 0 auto; }
    
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }

    .page-header h1 { font-size: 1.75rem; font-weight: 600; margin: 0; }

    .notifications-list { display: flex; flex-direction: column; gap: 0.75rem; }

    .notification-card {
      display: flex;
      align-items: flex-start;
      gap: 1rem;
      padding: 1rem;
      border-radius: 12px;
      cursor: pointer;
      transition: background-color 0.2s;
      position: relative;
    }

    .notification-card:hover { background-color: #f7fafc; }
    .notification-card.unread { background-color: rgba(44, 82, 130, 0.05); }

    .notification-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .notification-icon.booking_confirmed { background-color: rgba(56, 161, 105, 0.1); color: #38a169; }
    .notification-icon.booking_reminder { background-color: rgba(49, 151, 149, 0.1); color: #319795; }
    .notification-icon.waitlist_available { background-color: rgba(237, 137, 54, 0.1); color: #ed8936; }
    .notification-icon.suggestions_ready { background-color: rgba(159, 122, 234, 0.1); color: #9f7aea; }
    .notification-icon.credits_expiring { background-color: rgba(229, 62, 62, 0.1); color: #e53e3e; }
    .notification-icon.system { background-color: rgba(44, 82, 130, 0.1); color: #2c5282; }

    .notification-content { flex: 1; }
    .notification-content h3 { font-size: 1rem; font-weight: 600; margin: 0 0 0.25rem; }
    .notification-content p { color: #4a5568; margin: 0 0 0.5rem; font-size: 0.875rem; }
    .timestamp { font-size: 0.75rem; color: #a0aec0; }

    .unread-indicator {
      position: absolute;
      top: 1rem;
      right: 1rem;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #2c5282;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 4rem;
      text-align: center;
    }

    .empty-state mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
      color: #cbd5e0;
      margin-bottom: 1rem;
    }

    .empty-state h2 { margin: 0 0 0.5rem; }
    .empty-state p { color: #718096; margin: 0; }
  `]
})
export class NotificationsComponent implements OnInit {
  notifications = signal<any[]>([]);
  unreadCount = signal<number>(0);

  ngOnInit(): void {
    this.loadNotifications();
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'booking_confirmed': 'check_circle',
      'booking_reminder': 'event',
      'waitlist_available': 'hourglass_top',
      'suggestions_ready': 'auto_awesome',
      'credits_expiring': 'warning',
      'system': 'info'
    };
    return icons[type] || 'notifications';
  }

  markAsRead(notification: any): void {
    notification.isRead = true;
    this.updateUnreadCount();
  }

  markAllRead(): void {
    this.notifications.update(items => items.map(n => ({ ...n, isRead: true })));
    this.unreadCount.set(0);
  }

  private updateUnreadCount(): void {
    this.unreadCount.set(this.notifications().filter(n => !n.isRead).length);
  }

  private loadNotifications(): void {
    this.notifications.set([
      {
        id: 'notif_001',
        type: 'booking_confirmed',
        title: 'Booking Confirmed!',
        body: 'Junior Coding Class on Sat, Jan 18 at 10:00 AM has been confirmed.',
        time: '2 hours ago',
        isRead: false
      },
      {
        id: 'notif_002',
        type: 'waitlist_available',
        title: 'Spot Available!',
        body: 'A spot opened up for Music Discovery Class. Confirm within 4 hours.',
        time: '3 hours ago',
        isRead: false
      },
      {
        id: 'notif_003',
        type: 'suggestions_ready',
        title: 'New Suggestions Ready',
        body: 'We\'ve picked 3 new activities for your children this month!',
        time: '1 day ago',
        isRead: false
      },
      {
        id: 'notif_004',
        type: 'credits_expiring',
        title: 'Credits Expiring Soon',
        body: 'You have 7 credits expiring in 16 days. Book activities now!',
        time: '2 days ago',
        isRead: true
      },
      {
        id: 'notif_005',
        type: 'booking_reminder',
        title: 'Activity Tomorrow',
        body: 'Reminder: Creative Art Studio for Emma is tomorrow at 2:00 PM.',
        time: '3 days ago',
        isRead: true
      }
    ]);
    this.updateUnreadCount();
  }
}
