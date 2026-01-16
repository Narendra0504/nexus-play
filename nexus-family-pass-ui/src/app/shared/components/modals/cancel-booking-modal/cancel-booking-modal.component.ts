// NEXUS FAMILY PASS - CANCEL BOOKING MODAL
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

export interface CancelBookingData {
  bookingId: string;
  activityName: string;
  venueName: string;
  date: string;
  time: string;
  childNames: string[];
  creditsUsed: number;
  hoursUntilActivity: number;
}

@Component({
  selector: 'app-cancel-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatSelectModule, MatFormFieldModule],
  template: `
    <div class="cancel-modal p-6 max-w-md">
      <div class="text-center mb-4">
        <div class="w-16 h-16 mx-auto mb-3 bg-yellow-100 rounded-full flex items-center justify-center">
          <mat-icon class="text-yellow-600 text-4xl">warning</mat-icon>
        </div>
        <h2 class="text-xl font-semibold">Cancel this booking?</h2>
      </div>

      <mat-dialog-content>
        <div class="bg-gray-50 rounded-lg p-4 mb-4 text-sm">
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="text-gray-500">Activity:</span>
            <span class="font-medium">{{ data.activityName }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="text-gray-500">Venue:</span>
            <span>{{ data.venueName }}</span>
          </div>
          <div class="flex justify-between py-2 border-b border-gray-200">
            <span class="text-gray-500">When:</span>
            <span>{{ data.date }} at {{ data.time }}</span>
          </div>
          <div class="flex justify-between py-2">
            <span class="text-gray-500">For:</span>
            <span>{{ data.childNames.join(', ') }}</span>
          </div>
        </div>

        <div class="rounded-lg p-4 mb-4" 
             [class.bg-green-50]="willGetRefund()" 
             [class.bg-red-50]="!willGetRefund()">
          <div class="flex gap-3">
            <mat-icon [class.text-green-600]="willGetRefund()" [class.text-red-600]="!willGetRefund()">
              {{ willGetRefund() ? 'check_circle' : 'error' }}
            </mat-icon>
            <div>
              <strong class="block">{{ willGetRefund() ? 'Full credit refund' : 'Credits will be forfeited' }}</strong>
              <p class="text-sm text-gray-600 mt-1">
                {{ willGetRefund() 
                   ? data.creditsUsed + ' credit(s) will be returned.' 
                   : 'Cancellations within 48 hours do not receive refunds.' }}
              </p>
            </div>
          </div>
        </div>

        <mat-form-field appearance="outline" class="w-full">
          <mat-label>Reason (optional)</mat-label>
          <mat-select [(ngModel)]="selectedReason">
            <mat-option value="">-- Select --</mat-option>
            <mat-option value="schedule_conflict">Schedule conflict</mat-option>
            <mat-option value="child_sick">Child is sick</mat-option>
            <mat-option value="found_better">Found better option</mat-option>
            <mat-option value="other">Other</mat-option>
          </mat-select>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions class="flex justify-end gap-2">
        <button mat-raised-button color="primary" (click)="keepBooking()">Keep Booking</button>
        <button mat-button color="warn" (click)="confirmCancellation()">Cancel Booking</button>
      </mat-dialog-actions>
    </div>
  `
})
export class CancelBookingModalComponent {
  selectedReason: string = '';

  constructor(
    public dialogRef: MatDialogRef<CancelBookingModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CancelBookingData
  ) {}

  willGetRefund(): boolean {
    return this.data.hoursUntilActivity > 48;
  }

  keepBooking(): void {
    this.dialogRef.close({ confirmed: false });
  }

  confirmCancellation(): void {
    this.dialogRef.close({
      confirmed: true,
      reason: this.selectedReason,
      refundCredits: this.willGetRefund() ? this.data.creditsUsed : 0
    });
  }
}
