// NEXUS FAMILY PASS - REVIEW MODAL
import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface ReviewData {
  bookingId: string;
  activityName: string;
  venueName: string;
}

@Component({
  selector: 'app-review-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSlideToggleModule],
  template: `
    <div class="review-modal p-6 max-w-md">
      <h2 class="text-xl font-semibold text-center mb-1">Rate your experience</h2>
      <p class="text-gray-500 text-center text-sm mb-6">{{ data.activityName }} at {{ data.venueName }}</p>

      <div class="flex justify-center gap-2 mb-6">
        <button *ngFor="let star of [1,2,3,4,5]" class="star-btn" (click)="setRating(star)" (mouseenter)="hoverRating.set(star)" (mouseleave)="hoverRating.set(0)">
          <mat-icon [class.filled]="star <= (hoverRating() || rating())">
            {{ star <= (hoverRating() || rating()) ? 'star' : 'star_border' }}
          </mat-icon>
        </button>
      </div>

      <div class="space-y-4 mb-4">
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span>Would you book this activity again?</span>
          <mat-slide-toggle [(ngModel)]="wouldBookAgain"></mat-slide-toggle>
        </div>
        <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <span>Would you recommend this venue?</span>
          <mat-slide-toggle [(ngModel)]="wouldRecommend"></mat-slide-toggle>
        </div>
      </div>

      <mat-form-field appearance="outline" class="w-full">
        <mat-label>Write a review (optional)</mat-label>
        <textarea matInput [(ngModel)]="reviewText" rows="3" maxlength="500" placeholder="Share your experience..."></textarea>
        <mat-hint align="end">{{ reviewText.length }}/500</mat-hint>
      </mat-form-field>

      <p class="text-xs text-gray-500 mt-2 mb-4">Your review helps other parents and venues improve.</p>

      <mat-dialog-actions class="flex justify-end gap-2">
        <button mat-button (click)="cancel()">Cancel</button>
        <button mat-raised-button color="primary" [disabled]="rating() === 0" (click)="submit()">Submit Review</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .star-btn { background: none; border: none; cursor: pointer; padding: 0.25rem; }
    .star-btn mat-icon { font-size: 36px; width: 36px; height: 36px; color: #cbd5e0; transition: color 0.15s; }
    .star-btn mat-icon.filled { color: #f6ad55; }
  `]
})
export class ReviewModalComponent {
  rating = signal<number>(0);
  hoverRating = signal<number>(0);
  wouldBookAgain: boolean = true;
  wouldRecommend: boolean = true;
  reviewText: string = '';

  constructor(
    public dialogRef: MatDialogRef<ReviewModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ReviewData
  ) {}

  setRating(value: number): void { this.rating.set(value); }
  cancel(): void { this.dialogRef.close(); }
  
  submit(): void {
    this.dialogRef.close({
      rating: this.rating(),
      wouldBookAgain: this.wouldBookAgain,
      wouldRecommend: this.wouldRecommend,
      reviewText: this.reviewText
    });
  }
}
