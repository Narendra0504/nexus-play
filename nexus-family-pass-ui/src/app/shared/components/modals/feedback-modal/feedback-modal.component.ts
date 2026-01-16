// NEXUS FAMILY PASS - FEEDBACK MODAL
import { Component, Inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export interface FeedbackData {
  bookingId: string;
  activityName: string;
  childName: string;
}

@Component({
  selector: 'app-feedback-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatChipsModule, MatFormFieldModule, MatInputModule],
  template: `
    <div class="feedback-modal p-6 max-w-md">
      <h2 class="text-xl font-semibold text-center mb-2">How was {{ data.activityName }}?</h2>
      <p class="text-gray-500 text-center text-sm mb-6">Quick feedback for {{ data.childName }}'s experience</p>

      <div class="flex justify-center gap-8 mb-6">
        <button class="thumb-btn" [class.selected]="sentiment() === 'positive'" (click)="setSentiment('positive')">
          <mat-icon class="text-5xl">thumb_up</mat-icon>
          <span>Great!</span>
        </button>
        <button class="thumb-btn" [class.selected]="sentiment() === 'negative'" (click)="setSentiment('negative')">
          <mat-icon class="text-5xl">thumb_down</mat-icon>
          <span>Not great</span>
        </button>
      </div>

      <div *ngIf="sentiment()" class="mb-4">
        <p class="text-sm text-gray-600 mb-2">
          {{ sentiment() === 'positive' ? 'What did they enjoy?' : 'What could be better?' }}
        </p>
        <mat-chip-listbox multiple [(ngModel)]="selectedTags">
          <mat-chip-option *ngFor="let tag of getTags()" [value]="tag">{{ tag }}</mat-chip-option>
        </mat-chip-listbox>
      </div>

      <mat-form-field *ngIf="sentiment()" appearance="outline" class="w-full">
        <mat-label>Additional comments (optional)</mat-label>
        <textarea matInput [(ngModel)]="comment" rows="2"></textarea>
      </mat-form-field>

      <mat-dialog-actions class="flex justify-end gap-2 mt-4">
        <button mat-button (click)="skip()">Skip</button>
        <button mat-raised-button color="primary" [disabled]="!sentiment()" (click)="submit()">Submit</button>
      </mat-dialog-actions>
    </div>
  `,
  styles: [`
    .thumb-btn { display: flex; flex-direction: column; align-items: center; padding: 1rem; border-radius: 12px; border: 2px solid #e2e8f0; cursor: pointer; transition: all 0.2s; background: white; }
    .thumb-btn:hover { border-color: #cbd5e0; }
    .thumb-btn.selected { border-color: #2c5282; background: #ebf8ff; }
    .thumb-btn mat-icon { width: 48px; height: 48px; font-size: 48px; }
  `]
})
export class FeedbackModalComponent {
  sentiment = signal<'positive' | 'negative' | null>(null);
  selectedTags: string[] = [];
  comment: string = '';
  
  private positiveTags = ['Fun', 'Educational', 'Social', 'Creative', 'Well-organized', 'Great instructor'];
  private negativeTags = ['Organization', 'Content', 'Instructor', 'Facility', 'Too difficult', 'Too easy'];

  constructor(
    public dialogRef: MatDialogRef<FeedbackModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: FeedbackData
  ) {}

  setSentiment(value: 'positive' | 'negative'): void {
    this.sentiment.set(value);
    this.selectedTags = [];
  }

  getTags(): string[] {
    return this.sentiment() === 'positive' ? this.positiveTags : this.negativeTags;
  }

  skip(): void { this.dialogRef.close({ skipped: true }); }
  
  submit(): void {
    this.dialogRef.close({
      sentiment: this.sentiment(),
      tags: this.selectedTags,
      comment: this.comment
    });
  }
}
