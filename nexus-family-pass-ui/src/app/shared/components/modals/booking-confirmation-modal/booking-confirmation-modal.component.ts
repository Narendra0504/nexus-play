// NEXUS FAMILY PASS - BOOKING CONFIRMATION MODAL
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface BookingConfirmationData {
  activityName: string;
  venueName: string;
  venueAddress: string;
  date: string;
  time: string;
  duration: number;
  childNames: string[];
  creditsUsed: number;
  creditsRemaining: number;
  bookingId: string;
}

@Component({
  selector: 'app-booking-confirmation-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="confirmation-modal p-6 text-center max-w-md">
      <div class="success-icon w-20 h-20 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
        <mat-icon class="text-green-600 text-5xl">check_circle</mat-icon>
      </div>
      <h2 class="text-xl font-semibold mb-2">Booking Confirmed!</h2>
      <p class="text-gray-500 text-sm mb-4">Booking #{{ data.bookingId }}</p>
      
      <mat-dialog-content>
        <div class="bg-gray-50 rounded-lg p-4 text-left mb-4">
          <div class="flex items-center gap-2 mb-2">
            <mat-icon class="text-blue-600">event</mat-icon>
            <span class="font-medium">{{ data.activityName }}</span>
          </div>
          <div class="flex items-start gap-2 mb-2">
            <mat-icon class="text-blue-600">location_on</mat-icon>
            <div>
              <div>{{ data.venueName }}</div>
              <div class="text-sm text-gray-500">{{ data.venueAddress }}</div>
            </div>
          </div>
          <div class="flex items-center gap-2 mb-2">
            <mat-icon class="text-blue-600">schedule</mat-icon>
            <span>{{ data.date }} at {{ data.time }}</span>
          </div>
          <div class="flex items-center gap-2">
            <mat-icon class="text-blue-600">child_care</mat-icon>
            <span>{{ data.childNames.join(', ') }}</span>
          </div>
        </div>
        
        <div class="bg-blue-50 rounded-lg p-3 flex justify-center gap-4 text-sm text-blue-800">
          <span>{{ data.creditsUsed }} credits used</span>
          <span>•</span>
          <span>{{ data.creditsRemaining }} remaining</span>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-center gap-2 mt-4">
        <button mat-stroked-button (click)="addToCalendar()">
          <mat-icon>calendar_today</mat-icon> Add to Calendar
        </button>
        <button mat-raised-button color="primary" (click)="viewBooking()">
          <mat-icon>visibility</mat-icon> View Booking
        </button>
      </mat-dialog-actions>
      
      <div class="mt-4 pt-4 border-t">
        <a class="text-blue-600 text-sm cursor-pointer hover:underline" (click)="continueBrowsing()">
          Continue Browsing Activities
        </a>
      </div>
    </div>
  `
})
export class BookingConfirmationModalComponent {
  constructor(
    public dialogRef: MatDialogRef<BookingConfirmationModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: BookingConfirmationData,
    private router: Router
  ) {}

  addToCalendar(): void {
    console.log('[BookingConfirmation] Adding to calendar');
  }

  viewBooking(): void {
    this.dialogRef.close();
    this.router.navigate(['/parent/bookings', this.data.bookingId]);
  }

  continueBrowsing(): void {
    this.dialogRef.close('continue');
  }
}
