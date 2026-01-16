// =====================================================
// NEXUS FAMILY PASS - HR SETTINGS COMPONENT
// Settings page for HR administrators
// Manage company preferences and notifications
// =====================================================

// Import Angular core
import { Component, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Forms module
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

/**
 * HrSettingsComponent - HR Admin Settings Page
 * 
 * Provides HR administrators with:
 * - Company profile settings
 * - Notification preferences
 * - Team management settings
 */
@Component({
  // Component selector
  selector: 'app-hr-settings',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  
  // Inline template
  template: `
    <!-- HR Settings page container -->
    <div class="settings-container p-6 max-w-4xl">
      
      <!-- Page header -->
      <div class="page-header mb-6">
        <h1 class="text-2xl font-display font-bold text-neutral-800">Settings</h1>
        <p class="text-neutral-500">Manage your HR portal preferences</p>
      </div>

      <!-- Settings tabs -->
      <mat-tab-group animationDuration="200ms">
        
        <!-- Company Settings Tab -->
        <mat-tab label="Company">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Company Information</mat-card-title>
                <mat-card-subtitle>Update company details</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <form [formGroup]="companyForm" (ngSubmit)="saveCompanySettings()" class="space-y-4">
                  
                  <!-- Company name -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Company Name</mat-label>
                    <input matInput formControlName="companyName">
                  </mat-form-field>
                  
                  <!-- Billing email -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Billing Email</mat-label>
                    <input matInput formControlName="billingEmail" type="email">
                  </mat-form-field>
                  
                  <!-- HR contact email -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>HR Contact Email</mat-label>
                    <input matInput formControlName="hrContactEmail" type="email">
                    <mat-hint>Primary contact for Nexus communications</mat-hint>
                  </mat-form-field>
                  
                  <div class="flex justify-end pt-4">
                    <button mat-raised-button color="primary" type="submit">
                      Save Changes
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <!-- Notifications Tab -->
        <mat-tab label="Notifications">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Email Notifications</mat-card-title>
                <mat-card-subtitle>Configure which reports you receive</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <div class="space-y-4">
                  
                  <!-- Weekly summary toggle -->
                  <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">Weekly Usage Summary</h4>
                      <p class="text-sm text-neutral-500">Receive a summary every Monday</p>
                    </div>
                    <mat-slide-toggle color="primary" [(ngModel)]="notifications().weeklySummary">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- Monthly report toggle -->
                  <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">Monthly Report</h4>
                      <p class="text-sm text-neutral-500">Detailed monthly analytics</p>
                    </div>
                    <mat-slide-toggle color="primary" [(ngModel)]="notifications().monthlyReport">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- Low engagement alerts -->
                  <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">Low Engagement Alerts</h4>
                      <p class="text-sm text-neutral-500">Alert when usage drops significantly</p>
                    </div>
                    <mat-slide-toggle color="primary" [(ngModel)]="notifications().lowEngagement">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- New employee notifications -->
                  <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">New Employee Notifications</h4>
                      <p class="text-sm text-neutral-500">When employees join the program</p>
                    </div>
                    <mat-slide-toggle color="primary" [(ngModel)]="notifications().newEmployee">
                    </mat-slide-toggle>
                  </div>
                </div>
                
                <div class="flex justify-end pt-6">
                  <button mat-raised-button color="primary" (click)="saveNotifications()">
                    Save Preferences
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <!-- Team Tab -->
        <mat-tab label="Team">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>HR Team Access</mat-card-title>
                <mat-card-subtitle>Manage who can access this portal</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <p class="text-neutral-500 mb-4">
                  Contact your account manager to add or remove HR administrators.
                </p>
                
                <div class="space-y-3">
                  <div *ngFor="let member of teamMembers()" 
                       class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div class="flex items-center gap-3">
                      <div class="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                        <span class="text-primary-600 font-medium">{{ member.initials }}</span>
                      </div>
                      <div>
                        <div class="font-medium text-neutral-800">{{ member.name }}</div>
                        <div class="text-sm text-neutral-500">{{ member.email }}</div>
                      </div>
                    </div>
                    <div class="text-sm text-neutral-500">{{ member.role }}</div>
                  </div>
                </div>
                
                <button mat-stroked-button color="primary" class="mt-4">
                  <mat-icon>email</mat-icon>
                  Request Team Changes
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  
  // Inline styles
  styles: [`
    .bg-primary-100 { background-color: rgba(44, 82, 130, 0.1); }
    .text-primary-600 { color: #2c5282; }
  `]
})
export class HrSettingsComponent {
  // Form group
  companyForm: FormGroup;

  // Notification settings
  notifications = signal({
    weeklySummary: true,
    monthlyReport: true,
    lowEngagement: true,
    newEmployee: false
  });

  // Team members
  teamMembers = signal([
    { name: 'Jennifer Martinez', email: 'jennifer.martinez@techcorp.com', initials: 'JM', role: 'Primary Admin' },
    { name: 'Tom Wilson', email: 'tom.wilson@techcorp.com', initials: 'TW', role: 'Admin' }
  ]);

  /**
   * Constructor
   */
  constructor(private fb: FormBuilder, private snackBar: MatSnackBar) {
    // Initialize form
    this.companyForm = this.fb.group({
      companyName: ['TechCorp Inc.'],
      billingEmail: ['billing@techcorp.com'],
      hrContactEmail: ['hr@techcorp.com']
    });
  }

  /**
   * saveCompanySettings - Save company form
   */
  saveCompanySettings(): void {
    console.log('[HR Settings] Saving company settings:', this.companyForm.value);
    this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
  }

  /**
   * saveNotifications - Save notification preferences
   */
  saveNotifications(): void {
    console.log('[HR Settings] Saving notifications:', this.notifications());
    this.snackBar.open('Preferences saved successfully', 'Close', { duration: 3000 });
  }
}
