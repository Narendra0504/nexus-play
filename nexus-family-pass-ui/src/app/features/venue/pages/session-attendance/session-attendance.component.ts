// NEXUS FAMILY PASS - SESSION ATTENDANCE COMPONENT
import { Component, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

interface Attendee {
  id: string;
  childName: string;
  childAge: number;
  parentName: string;
  parentPhone: string;
  parentEmail: string;
  status: 'pending' | 'present' | 'no-show';
  notes?: string;
}

@Component({
  selector: 'app-session-attendance',
  standalone: true,
  imports: [CommonModule, MatCardModule, MatButtonModule, MatIconModule, MatTableModule, MatChipsModule, MatTooltipModule, MatSnackBarModule],
  template: `
    <div class="attendance-container p-6">
      <button mat-button class="mb-4" (click)="goBack()">
        <mat-icon>arrow_back</mat-icon> Back to Bookings
      </button>

      <mat-card class="session-header mb-6">
        <mat-card-content class="flex justify-between items-center">
          <div>
            <h1 class="text-xl font-semibold">{{ sessionInfo.activityName }}</h1>
            <p class="text-gray-600">{{ sessionInfo.date }} at {{ sessionInfo.time }}</p>
          </div>
          <div class="text-right">
            <div class="text-2xl font-bold">{{ attendees().length }} / {{ sessionInfo.capacity }}</div>
            <div class="text-sm text-gray-500">Booked</div>
          </div>
        </mat-card-content>
      </mat-card>

      <div class="stats-row flex gap-4 mb-6">
        <mat-card class="stat-card flex-1 text-center p-4">
          <div class="text-2xl font-bold text-green-600">{{ presentCount() }}</div>
          <div class="text-sm text-gray-500">Present</div>
        </mat-card>
        <mat-card class="stat-card flex-1 text-center p-4">
          <div class="text-2xl font-bold text-red-600">{{ noShowCount() }}</div>
          <div class="text-sm text-gray-500">No-Show</div>
        </mat-card>
        <mat-card class="stat-card flex-1 text-center p-4">
          <div class="text-2xl font-bold text-yellow-600">{{ pendingCount() }}</div>
          <div class="text-sm text-gray-500">Pending</div>
        </mat-card>
      </div>

      <mat-card>
        <mat-card-header class="flex justify-between items-center p-4">
          <mat-card-title>Attendees</mat-card-title>
          <button mat-stroked-button (click)="markAllPresent()" [disabled]="pendingCount() === 0">
            <mat-icon>check_circle</mat-icon> Mark All Present
          </button>
        </mat-card-header>
        <mat-card-content>
          <table mat-table [dataSource]="attendees()" class="w-full">
            <ng-container matColumnDef="child">
              <th mat-header-cell *matHeaderCellDef>Child</th>
              <td mat-cell *matCellDef="let a">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-semibold text-blue-600">
                    {{ a.childName.charAt(0) }}
                  </div>
                  <div>
                    <div class="font-medium">{{ a.childName }}</div>
                    <div class="text-sm text-gray-500">Age {{ a.childAge }}</div>
                  </div>
                </div>
              </td>
            </ng-container>

            <ng-container matColumnDef="parent">
              <th mat-header-cell *matHeaderCellDef>Parent Contact</th>
              <td mat-cell *matCellDef="let a">
                <div>{{ a.parentName }}</div>
                <div class="text-sm text-gray-500">{{ a.parentPhone }}</div>
              </td>
            </ng-container>

            <ng-container matColumnDef="notes">
              <th mat-header-cell *matHeaderCellDef>Notes</th>
              <td mat-cell *matCellDef="let a">
                <div *ngIf="a.notes" class="flex items-center gap-1 text-yellow-600" [matTooltip]="a.notes">
                  <mat-icon>warning</mat-icon>
                  <span class="text-sm">{{ a.notes }}</span>
                </div>
                <span *ngIf="!a.notes" class="text-gray-400">—</span>
              </td>
            </ng-container>

            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <mat-chip [ngClass]="'status-' + a.status">{{ a.status | titlecase }}</mat-chip>
              </td>
            </ng-container>

            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef>Actions</th>
              <td mat-cell *matCellDef="let a">
                <button mat-icon-button color="primary" (click)="markPresent(a)" *ngIf="a.status !== 'present'" matTooltip="Mark Present">
                  <mat-icon>check_circle</mat-icon>
                </button>
                <button mat-icon-button color="warn" (click)="markNoShow(a)" *ngIf="a.status !== 'no-show'" matTooltip="Mark No-Show">
                  <mat-icon>cancel</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>
        </mat-card-content>
      </mat-card>

      <div class="mt-6 text-center">
        <button mat-raised-button color="primary" [disabled]="pendingCount() > 0" (click)="completeSession()">
          <mat-icon>task_alt</mat-icon> Mark Session Complete
        </button>
        <p *ngIf="pendingCount() > 0" class="text-sm text-gray-500 mt-2">Mark all attendees before completing the session</p>
      </div>
    </div>
  `,
  styles: [`
    .attendance-container { max-width: 1000px; margin: 0 auto; }
    .session-header { background: linear-gradient(135deg, #2c5282 0%, #319795 100%); color: white; }
    .session-header mat-card-content { padding: 1.5rem !important; }
    .session-header h1, .session-header p, .session-header div { color: white; }
    .status-present { background: #c6f6d5 !important; color: #22543d !important; }
    .status-no-show { background: #fed7d7 !important; color: #742a2a !important; }
    .status-pending { background: #fefcbf !important; color: #744210 !important; }
  `]
})
export class SessionAttendanceComponent implements OnInit {
  sessionInfo = { activityName: 'Junior Robotics Workshop', date: 'Jan 20, 2024', time: '10:00 AM', capacity: 15 };
  attendees = signal<Attendee[]>([]);
  displayedColumns = ['child', 'parent', 'notes', 'status', 'actions'];

  presentCount = computed(() => this.attendees().filter(a => a.status === 'present').length);
  noShowCount = computed(() => this.attendees().filter(a => a.status === 'no-show').length);
  pendingCount = computed(() => this.attendees().filter(a => a.status === 'pending').length);

  constructor(private route: ActivatedRoute, private router: Router, private snackBar: MatSnackBar) {}

  ngOnInit(): void {
    this.attendees.set([
      { id: '1', childName: 'Emma Smith', childAge: 8, parentName: 'Sarah Smith', parentPhone: '(555) 123-4567', parentEmail: 'sarah@email.com', status: 'pending' },
      { id: '2', childName: 'Jake Wilson', childAge: 9, parentName: 'Mike Wilson', parentPhone: '(555) 234-5678', parentEmail: 'mike@email.com', status: 'present' },
      { id: '3', childName: 'Lily Chen', childAge: 7, parentName: 'David Chen', parentPhone: '(555) 345-6789', parentEmail: 'david@email.com', status: 'pending', notes: 'Peanut allergy' },
      { id: '4', childName: 'Max Brown', childAge: 10, parentName: 'Amy Brown', parentPhone: '(555) 456-7890', parentEmail: 'amy@email.com', status: 'pending', notes: 'Needs wheelchair access' },
    ]);
  }

  goBack(): void { this.router.navigate(['/venue/bookings']); }
  
  markPresent(attendee: Attendee): void {
    this.attendees.update(list => list.map(a => a.id === attendee.id ? { ...a, status: 'present' } : a));
  }

  markNoShow(attendee: Attendee): void {
    this.attendees.update(list => list.map(a => a.id === attendee.id ? { ...a, status: 'no-show' } : a));
  }

  markAllPresent(): void {
    this.attendees.update(list => list.map(a => a.status === 'pending' ? { ...a, status: 'present' } : a));
    this.snackBar.open('All attendees marked present', 'OK', { duration: 2000 });
  }

  completeSession(): void {
    this.snackBar.open('Session marked complete!', 'OK', { duration: 3000 });
    this.router.navigate(['/venue/bookings']);
  }
}
