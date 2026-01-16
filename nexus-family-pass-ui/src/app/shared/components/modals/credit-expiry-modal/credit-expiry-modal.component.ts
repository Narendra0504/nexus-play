// NEXUS FAMILY PASS - CREDIT EXPIRY WARNING MODAL
import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface CreditExpiryData {
  creditsExpiring: number;
  daysRemaining: number;
  suggestedActivities: Array<{ id: string; name: string; credits: number; spotsLeft: number; }>;
}

@Component({
  selector: 'app-credit-expiry-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="credit-expiry-modal p-6 max-w-md">
      <div class="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
        <mat-icon class="text-white text-4xl">toll</mat-icon>
      </div>
      
      <h2 class="text-xl font-semibold text-center mb-2">Credits Expiring Soon!</h2>
      <p class="text-center text-gray-600 mb-4">
        You have <strong class="text-orange-600">{{ data.creditsExpiring }} credits</strong> 
        expiring in <strong>{{ data.daysRemaining }} days</strong>.
      </p>

      <mat-dialog-content>
        <div *ngIf="data.suggestedActivities.length > 0" class="mb-4">
          <p class="text-sm font-medium text-gray-700 mb-2">Quick picks to use your credits:</p>
          <div class="space-y-2">
            <div *ngFor="let activity of data.suggestedActivities" 
                 class="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 cursor-pointer"
                 (click)="viewActivity(activity.id)">
              <div>
                <div class="font-medium text-sm">{{ activity.name }}</div>
                <div class="text-xs text-gray-500">{{ activity.spotsLeft }} spots left</div>
              </div>
              <div class="text-blue-600 font-semibold">{{ activity.credits }} cr</div>
            </div>
          </div>
        </div>
      </mat-dialog-content>

      <mat-dialog-actions class="flex flex-col gap-2">
        <button mat-raised-button color="primary" class="w-full" (click)="browseActivities()">
          <mat-icon>search</mat-icon> Browse Last-Minute Activities
        </button>
        <button mat-button class="w-full" (click)="remindLater()">Remind Me Later</button>
      </mat-dialog-actions>
      
      <p class="text-xs text-gray-500 text-center mt-4">
        Unused credits expire at the end of each billing cycle.
      </p>
    </div>
  `
})
export class CreditExpiryWarningModalComponent {
  constructor(
    public dialogRef: MatDialogRef<CreditExpiryWarningModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: CreditExpiryData,
    private router: Router
  ) {}

  viewActivity(id: string): void {
    this.dialogRef.close();
    this.router.navigate(['/parent/activities', id]);
  }

  browseActivities(): void {
    this.dialogRef.close();
    this.router.navigate(['/parent/activities'], { queryParams: { lastMinute: true } });
  }

  remindLater(): void {
    this.dialogRef.close({ remindLater: true });
  }
}
