// =====================================================
// NEXUS FAMILY PASS - WAITLIST COMPONENT
// Shows all waitlist entries with position and status
// =====================================================

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

@Component({
  selector: 'app-waitlist',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ],
  template: `
    <div class="waitlist-page">
      <header class="page-header">
        <h1>My Waitlist</h1>
        <p class="subtitle">You'll be notified when spots become available</p>
      </header>

      @if (waitlistItems().length > 0) {
        <div class="waitlist-list">
          @for (item of waitlistItems(); track item.id) {
            <mat-card class="waitlist-card">
              <div class="position-badge">
                <span class="position-number">#{{ item.position }}</span>
                <span class="position-label">in line</span>
              </div>
              
              <div class="waitlist-info">
                <h3>{{ item.activityName }}</h3>
                <p class="venue">{{ item.venueName }}</p>
                <div class="meta-row">
                  <span><mat-icon>event</mat-icon> {{ item.date }}</span>
                  <span><mat-icon>schedule</mat-icon> {{ item.time }}</span>
                  <span><mat-icon>child_care</mat-icon> {{ item.childName }}</span>
                </div>
              </div>
              
              <div class="waitlist-actions">
                <span class="status" [ngClass]="item.status">
                  @if (item.status === 'waiting') {
                    <mat-icon>hourglass_empty</mat-icon> Waiting
                  } @else if (item.status === 'notified') {
                    <mat-icon>notifications_active</mat-icon> Spot Available!
                  }
                </span>
                
                @if (item.status === 'notified') {
                  <button mat-raised-button color="primary" (click)="confirmSpot(item)">
                    Confirm Spot
                  </button>
                  <p class="expires">Expires in {{ item.expiresIn }}</p>
                } @else {
                  <button mat-stroked-button color="warn" (click)="leaveWaitlist(item)">
                    Leave Waitlist
                  </button>
                }
              </div>
            </mat-card>
          }
        </div>
      } @else {
        <div class="empty-state">
          <mat-icon>schedule</mat-icon>
          <h2>No waitlist entries</h2>
          <p>Join a waitlist when an activity you want is full</p>
          <button mat-raised-button color="primary" routerLink="/parent/activities">
            Browse Activities
          </button>
        </div>
      }
    </div>
  `,
  styles: [`
    .waitlist-page { max-width: 800px; margin: 0 auto; }
    
    .page-header { margin-bottom: 1.5rem; }
    .page-header h1 { font-size: 1.75rem; font-weight: 600; margin: 0 0 0.25rem; }
    .subtitle { color: #718096; margin: 0; }

    .waitlist-list { display: flex; flex-direction: column; gap: 1rem; }

    .waitlist-card {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 1.25rem;
      border-radius: 12px;
    }

    .position-badge {
      display: flex;
      flex-direction: column;
      align-items: center;
      background: linear-gradient(135deg, #2c5282, #319795);
      color: white;
      padding: 1rem;
      border-radius: 12px;
      min-width: 70px;
    }

    .position-number { font-size: 1.5rem; font-weight: 700; }
    .position-label { font-size: 0.625rem; text-transform: uppercase; opacity: 0.9; }

    .waitlist-info { flex: 1; }
    .waitlist-info h3 { font-size: 1.125rem; font-weight: 600; margin: 0 0 0.25rem; }
    .waitlist-info .venue { color: #718096; font-size: 0.875rem; margin: 0 0 0.5rem; }

    .meta-row {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .meta-row span {
      display: flex;
      align-items: center;
      gap: 0.25rem;
      font-size: 0.875rem;
      color: #718096;
    }

    .meta-row mat-icon { font-size: 16px; width: 16px; height: 16px; }

    .waitlist-actions {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.5rem;
    }

    .status {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 999px;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .status.waiting {
      background-color: rgba(237, 137, 54, 0.1);
      color: #ed8936;
    }

    .status.notified {
      background-color: rgba(56, 161, 105, 0.1);
      color: #38a169;
    }

    .expires { font-size: 0.75rem; color: #e53e3e; margin: 0; }

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

    .empty-state h2 { font-size: 1.25rem; margin: 0 0 0.5rem; }
    .empty-state p { color: #718096; margin: 0 0 1.5rem; }
  `]
})
export class WaitlistComponent implements OnInit {
  waitlistItems = signal<any[]>([]);

  constructor(private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.loadWaitlist();
  }

  confirmSpot(item: any): void {
    this.snackBar.open('Spot confirmed! Booking created.', 'View Booking', { duration: 4000 });
  }

  leaveWaitlist(item: any): void {
    this.waitlistItems.update(items => items.filter(i => i.id !== item.id));
    this.snackBar.open('Removed from waitlist', 'Close', { duration: 3000 });
  }

  private loadWaitlist(): void {
    this.waitlistItems.set([
      {
        id: 'wait_001',
        activityName: 'Music Discovery Class',
        venueName: 'Harmony Music School',
        date: 'Sun, Jan 21',
        time: '2:00 PM',
        childName: 'Emma',
        position: 2,
        status: 'waiting'
      },
      {
        id: 'wait_002',
        activityName: 'Advanced Robotics',
        venueName: 'Code Ninjas West',
        date: 'Sat, Jan 27',
        time: '10:00 AM',
        childName: 'Emma',
        position: 1,
        status: 'notified',
        expiresIn: '3 hours'
      }
    ]);
  }
}
