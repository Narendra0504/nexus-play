// NEXUS FAMILY PASS - INVITE EMPLOYEES MODAL
import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';

@Component({
  selector: 'app-invite-employees-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule, MatButtonModule, MatIconModule, MatFormFieldModule, MatInputModule, MatSelectModule, MatTabsModule],
  template: `
    <div class="invite-modal p-6" style="width: 500px;">
      <h2 class="text-xl font-semibold mb-1">Invite Employees</h2>
      <p class="text-gray-500 text-sm mb-4">Add employees to Nexus Family Pass</p>

      <mat-tab-group>
        <mat-tab label="Bulk Upload">
          <div class="py-4">
            <div class="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 cursor-pointer"
                 (click)="triggerFileUpload()" (dragover)="$event.preventDefault()" (drop)="onFileDrop($event)">
              <mat-icon class="text-gray-400 text-5xl mb-2">cloud_upload</mat-icon>
              <p class="text-gray-600">Drag & drop CSV file here</p>
              <p class="text-gray-400 text-sm">or click to browse</p>
              <input type="file" #fileInput hidden accept=".csv" (change)="onFileSelect($event)">
            </div>
            <p *ngIf="uploadedFile()" class="text-green-600 text-sm mt-2 flex items-center gap-1">
              <mat-icon>check_circle</mat-icon> {{ uploadedFile() }}
            </p>
            <a class="text-blue-600 text-sm mt-2 inline-block cursor-pointer hover:underline">
              Download CSV template
            </a>
          </div>
        </mat-tab>

        <mat-tab label="Manual Entry">
          <div class="py-4">
            <mat-form-field appearance="outline" class="w-full">
              <mat-label>Email addresses</mat-label>
              <textarea matInput [(ngModel)]="manualEmails" rows="4" placeholder="Enter emails separated by commas or new lines"></textarea>
              <mat-hint>{{ parsedEmails().length }} email(s) detected</mat-hint>
            </mat-form-field>
          </div>
        </mat-tab>
      </mat-tab-group>

      <div class="grid grid-cols-2 gap-4 mt-4">
        <mat-form-field appearance="outline">
          <mat-label>Department</mat-label>
          <mat-select [(ngModel)]="department">
            <mat-option value="">All Departments</mat-option>
            <mat-option value="engineering">Engineering</mat-option>
            <mat-option value="marketing">Marketing</mat-option>
            <mat-option value="sales">Sales</mat-option>
            <mat-option value="hr">HR</mat-option>
            <mat-option value="finance">Finance</mat-option>
            <mat-option value="operations">Operations</mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="outline">
          <mat-label>Credits per employee</mat-label>
          <input matInput type="number" [(ngModel)]="creditsPerEmployee" min="1" max="20">
        </mat-form-field>
      </div>

      <div *ngIf="getTotalEmployees() > 0" class="bg-blue-50 rounded-lg p-3 mt-4 text-sm">
        <div class="flex justify-between"><span>Employees:</span><strong>{{ getTotalEmployees() }}</strong></div>
        <div class="flex justify-between"><span>Monthly credits:</span><strong>{{ getTotalEmployees() * creditsPerEmployee }}</strong></div>
      </div>

      <mat-dialog-actions class="flex justify-end gap-2 mt-4">
        <button mat-button (click)="cancel()">Cancel</button>
        <button mat-raised-button color="primary" [disabled]="getTotalEmployees() === 0" (click)="sendInvitations()">
          Send {{ getTotalEmployees() }} Invitation(s)
        </button>
      </mat-dialog-actions>
    </div>
  `
})
export class InviteEmployeesModalComponent {
  uploadedFile = signal<string | null>(null);
  manualEmails: string = '';
  department: string = '';
  creditsPerEmployee: number = 10;

  constructor(public dialogRef: MatDialogRef<InviteEmployeesModalComponent>) {}

  parsedEmails(): string[] {
    if (!this.manualEmails.trim()) return [];
    return this.manualEmails.split(/[,\n]+/).map(e => e.trim()).filter(e => e.includes('@'));
  }

  getTotalEmployees(): number {
    return this.uploadedFile() ? 10 : this.parsedEmails().length; // Mock: CSV assumed to have 10
  }

  triggerFileUpload(): void {
    document.querySelector<HTMLInputElement>('input[type="file"]')?.click();
  }

  onFileSelect(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) this.uploadedFile.set(file.name);
  }

  onFileDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files[0];
    if (file?.name.endsWith('.csv')) this.uploadedFile.set(file.name);
  }

  cancel(): void { this.dialogRef.close(); }
  
  sendInvitations(): void {
    this.dialogRef.close({
      emails: this.parsedEmails(),
      department: this.department,
      creditsPerEmployee: this.creditsPerEmployee,
      csvFile: this.uploadedFile()
    });
  }
}
