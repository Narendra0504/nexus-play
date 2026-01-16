// NEXUS FAMILY PASS - WAITLIST SPOT AVAILABLE MODAL
import { Component, Inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface WaitlistSpotData {
  waitlistId: string;
  activityId: string;
  activityName: string;
  venueName: string;
  date: string;
  time: string;
  childName: string;
  creditsRequired: number;
  creditsAvailable: number;
  expiresAt: Date;
}

@Component({
  selector: 'app-waitlist-spot-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="waitlist-modal p-6 text-center max-w-md">
      <div class="w-20 h-20 mx-auto mb-4 bg-purple-500 rounded-full flex items-center justify-center animate-bounce">
        <mat-icon class="text-white text-5xl">celebration</mat-icon>
      </div>
      <h2 class="text-xl font-bold mb-1">A spot opened up!</h2>
      <p class="text-gray-500 text-sm mb-4">Great news - you can now book {{ data.activityName }}!</p>

      <div class="bg-yellow-50 rounded-lg p-3 flex items-center justify-center gap-2 mb-4">
        <mat-icon class="text-yellow-600">timer</mat-icon>
        <div class="text-left">
          <div class="text-xs text-yellow-700">Confirm within:</div>
          <div class="font-bold text-yellow-800" [class.text-red-600]="isUrgent()">
            {{ formattedTimeRemaining() }}
          </div>
        </div>
      </div>

      <mat-dialog-content>
        <div class="bg-gray-50 rounded-lg p-4 text-left mb-4">
          <div class="flex items-center gap-2 py-2 border-b">
            <mat-icon class="text-blue-600">event</mat-icon>
            <span>{{ data.activityName }}</span>
          </div>
          <div class="flex items-center gap-2 py-2 border-b">
            <mat-icon class="text-blue-600">location_on</mat-icon>
            <span>{{ data.venueName }}</span>
          </div>
          <div class="flex items-center gap-2 py-2 border-b">
            <mat-icon class="text-blue-600">schedule</mat-icon>
            <span>{{ data.date }} at {{ data.time }}</span>
          </div>
          <div class="flex items-center gap-2 py-2">
            <mat-icon class="text-blue-600">child_care</mat-icon>
            <span>{{ data.childName }}</span>
          </div>
        </div>

        <div class="rounded-lg p-3 mb-4" 
             [class.bg-blue-50]="hasEnoughCredits()" 
             [class.bg-red-50]="!hasEnoughCredits()">
          <div class="flex items-center justify-center gap-2">
            <mat-icon>toll</mat-icon>
            <span>{{ data.creditsRequired }} credits required</span>
          </div>
          <div *ngIf="!hasEnoughCredits()" class="text-red-600 text-sm mt-1">
            You only have {{ data.creditsAvailable }} available
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="flex flex-col gap-2">
        <button mat-raised-button color="primary" class="w-full" 
                [disabled]="!hasEnoughCredits() || isExpired()"
                (click)="confirmBooking()">
          <mat-icon>check</mat-icon> Confirm Booking
        </button>
        <button mat-stroked-button class="w-full" (click)="passOnSpot()">
          Pass (Give to next person)
        </button>
      </mat-dialog-actions>
      
      <p class="text-xs text-gray-500 mt-4">
        If you pass or don't confirm in time, the spot goes to the next person.
      </p>
    </div>
  `
})
export class WaitlistSpotAvailableModalComponent implements OnInit, OnDestroy {
  private remainingSeconds = signal<number>(0);
  private timerInterval: any;

  constructor(
    public dialogRef: MatDialogRef<WaitlistSpotAvailableModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: WaitlistSpotData
  ) {}

  ngOnInit(): void {
    this.updateRemainingTime();
    this.timerInterval = setInterval(() => {
      this.updateRemainingTime();
      if (this.isExpired()) this.dialogRef.close({ expired: true });
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.timerInterval) clearInterval(this.timerInterval);
  }

  private updateRemainingTime(): void {
    const remaining = Math.max(0, Math.floor((new Date(this.data.expiresAt).getTime() - Date.now()) / 1000));
    this.remainingSeconds.set(remaining);
  }

  formattedTimeRemaining(): string {
    const secs = this.remainingSeconds();
    if (secs <= 0) return 'Expired';
    const h = Math.floor(secs / 3600);
    const m = Math.floor((secs % 3600) / 60);
    const s = secs % 60;
    return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  isUrgent(): boolean { return this.remainingSeconds() < 1800; }
  isExpired(): boolean { return this.remainingSeconds() <= 0; }
  hasEnoughCredits(): boolean { return this.data.creditsAvailable >= this.data.creditsRequired; }

  confirmBooking(): void {
    this.dialogRef.close({ confirmed: true, waitlistId: this.data.waitlistId });
  }

  passOnSpot(): void {
    this.dialogRef.close({ confirmed: false, passed: true });
  }
}
