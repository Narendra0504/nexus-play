// =====================================================
// NEXUS FAMILY PASS - PARENT SETTINGS COMPONENT
// Settings page for parent users to manage their
// profile, notification preferences, and account settings
// =====================================================

// Import Angular core decorators and types
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule for *ngIf, *ngFor directives
import { CommonModule } from '@angular/common';

// Import Reactive Forms for settings form
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';               // Card container
import { MatTabsModule } from '@angular/material/tabs';               // Tab navigation
import { MatFormFieldModule } from '@angular/material/form-field';    // Form fields
import { MatInputModule } from '@angular/material/input';             // Input elements
import { MatButtonModule } from '@angular/material/button';           // Buttons
import { MatIconModule } from '@angular/material/icon';               // Icons
import { MatSlideToggleModule } from '@angular/material/slide-toggle'; // Toggles
import { MatSelectModule } from '@angular/material/select';           // Dropdowns
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar'; // Toast
import { MatDividerModule } from '@angular/material/divider';         // Dividers

// Import AuthService for user data
import { AuthService } from '../../../../core/services/auth.service';

// Import notification preference types
import { NotificationType } from '../../../../core/models';

/**
 * SettingsComponent - Parent User Settings Page
 * 
 * This component provides settings management including:
 * - Profile information editing (name, email, phone)
 * - Notification preferences for each notification type
 * - Password change functionality
 * - Account management options
 * 
 * Settings are organized into tabs for easy navigation.
 */
@Component({
  // Component selector
  selector: 'app-parent-settings',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,              // Common directives
    FormsModule,               // Template forms for ngModel
    ReactiveFormsModule,       // Reactive forms
    MatCardModule,             // Material card
    MatTabsModule,             // Material tabs
    MatFormFieldModule,        // Material form field
    MatInputModule,            // Material input
    MatButtonModule,           // Material button
    MatIconModule,             // Material icons
    MatSlideToggleModule,      // Material toggle switch
    MatSelectModule,           // Material select
    MatSnackBarModule,         // Material snackbar
    MatDividerModule           // Material divider
  ],
  
  // Inline template with detailed comments
  template: `
    <!-- Settings page container -->
    <div class="settings-container p-6">
      
      <!-- Page header -->
      <div class="page-header mb-6">
        <h1 class="text-2xl font-display font-bold text-neutral-800">Settings</h1>
        <p class="text-neutral-500">Manage your account and preferences</p>
      </div>

      <!-- Tab group for different settings sections -->
      <mat-tab-group animationDuration="200ms" class="settings-tabs">
        
        <!-- ================================================ -->
        <!-- TAB 1: Profile Settings                          -->
        <!-- ================================================ -->
        <mat-tab label="Profile">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Personal Information</mat-card-title>
                <mat-card-subtitle>Update your profile details</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <!-- Profile form -->
                <form [formGroup]="profileForm" (ngSubmit)="saveProfile()" class="space-y-4">
                  
                  <!-- Avatar section -->
                  <div class="flex items-center gap-4 mb-6">
                    <!-- Current avatar display -->
                    <div class="w-20 h-20 rounded-full bg-primary-100 flex items-center justify-center">
                      <mat-icon class="text-primary-600 scale-150">person</mat-icon>
                    </div>
                    
                    <!-- Upload button -->
                    <button mat-stroked-button type="button">
                      <mat-icon>upload</mat-icon>
                      Change Photo
                    </button>
                  </div>
                  
                  <!-- Name fields row -->
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <!-- First name field -->
                    <mat-form-field appearance="outline">
                      <mat-label>First Name</mat-label>
                      <input matInput formControlName="firstName" placeholder="Your first name">
                      <mat-error *ngIf="profileForm.get('firstName')?.hasError('required')">
                        First name is required
                      </mat-error>
                    </mat-form-field>
                    
                    <!-- Last name field -->
                    <mat-form-field appearance="outline">
                      <mat-label>Last Name</mat-label>
                      <input matInput formControlName="lastName" placeholder="Your last name">
                      <mat-error *ngIf="profileForm.get('lastName')?.hasError('required')">
                        Last name is required
                      </mat-error>
                    </mat-form-field>
                  </div>
                  
                  <!-- Email field (read-only) -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Email Address</mat-label>
                    <input matInput formControlName="email" type="email" readonly>
                    <mat-icon matSuffix class="text-neutral-400">lock</mat-icon>
                    <mat-hint>Contact support to change your email</mat-hint>
                  </mat-form-field>
                  
                  <!-- Phone field -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Phone Number</mat-label>
                    <input matInput formControlName="phone" type="tel" placeholder="+1 (555) 123-4567">
                    <mat-icon matPrefix class="text-neutral-400">phone</mat-icon>
                  </mat-form-field>
                  
                  <!-- Submit button -->
                  <div class="flex justify-end pt-4">
                    <button mat-raised-button color="primary" type="submit" 
                            [disabled]="profileForm.invalid || !profileForm.dirty">
                      Save Changes
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ================================================ -->
        <!-- TAB 2: Notification Preferences                  -->
        <!-- ================================================ -->
        <mat-tab label="Notifications">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Notification Preferences</mat-card-title>
                <mat-card-subtitle>Choose how you want to be notified</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <!-- Notification type toggles -->
                <div class="space-y-6">
                  
                  <!-- Booking confirmations -->
                  <div class="notification-item">
                    <div class="notification-info">
                      <h4 class="font-medium text-neutral-800">Booking Confirmations</h4>
                      <p class="text-sm text-neutral-500">Get notified when your bookings are confirmed</p>
                    </div>
                    <div class="notification-channels flex gap-4">
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().bookingConfirmed.email">
                        Email
                      </mat-slide-toggle>
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().bookingConfirmed.push">
                        Push
                      </mat-slide-toggle>
                    </div>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <!-- Booking reminders -->
                  <div class="notification-item">
                    <div class="notification-info">
                      <h4 class="font-medium text-neutral-800">Booking Reminders</h4>
                      <p class="text-sm text-neutral-500">Reminders 24 hours before activities</p>
                    </div>
                    <div class="notification-channels flex gap-4">
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().bookingReminder.email">
                        Email
                      </mat-slide-toggle>
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().bookingReminder.push">
                        Push
                      </mat-slide-toggle>
                    </div>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <!-- Waitlist updates -->
                  <div class="notification-item">
                    <div class="notification-info">
                      <h4 class="font-medium text-neutral-800">Waitlist Updates</h4>
                      <p class="text-sm text-neutral-500">Get notified when a spot becomes available</p>
                    </div>
                    <div class="notification-channels flex gap-4">
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().waitlistAvailable.email">
                        Email
                      </mat-slide-toggle>
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().waitlistAvailable.push">
                        Push
                      </mat-slide-toggle>
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().waitlistAvailable.sms">
                        SMS
                      </mat-slide-toggle>
                    </div>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <!-- Monthly suggestions -->
                  <div class="notification-item">
                    <div class="notification-info">
                      <h4 class="font-medium text-neutral-800">Monthly Suggestions</h4>
                      <p class="text-sm text-neutral-500">New curated activities for your children</p>
                    </div>
                    <div class="notification-channels flex gap-4">
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().suggestionsReady.email">
                        Email
                      </mat-slide-toggle>
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().suggestionsReady.push">
                        Push
                      </mat-slide-toggle>
                    </div>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <!-- Credit expiry warnings -->
                  <div class="notification-item">
                    <div class="notification-info">
                      <h4 class="font-medium text-neutral-800">Credit Expiry Warnings</h4>
                      <p class="text-sm text-neutral-500">Reminders when credits are about to expire</p>
                    </div>
                    <div class="notification-channels flex gap-4">
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().creditsExpiring.email">
                        Email
                      </mat-slide-toggle>
                      <mat-slide-toggle color="primary" [(ngModel)]="notificationPrefs().creditsExpiring.push">
                        Push
                      </mat-slide-toggle>
                    </div>
                  </div>
                </div>
                
                <!-- Save button -->
                <div class="flex justify-end pt-6">
                  <button mat-raised-button color="primary" (click)="saveNotificationPrefs()">
                    Save Preferences
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ================================================ -->
        <!-- TAB 3: Security Settings                         -->
        <!-- ================================================ -->
        <mat-tab label="Security">
          <div class="tab-content p-6">
            <!-- Change Password Card -->
            <mat-card class="mb-6">
              <mat-card-header>
                <mat-card-title>Change Password</mat-card-title>
                <mat-card-subtitle>Update your account password</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <form [formGroup]="passwordForm" (ngSubmit)="changePassword()" class="space-y-4 max-w-md">
                  
                  <!-- Current password -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Current Password</mat-label>
                    <input matInput formControlName="currentPassword" type="password">
                    <mat-error *ngIf="passwordForm.get('currentPassword')?.hasError('required')">
                      Current password is required
                    </mat-error>
                  </mat-form-field>
                  
                  <!-- New password -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>New Password</mat-label>
                    <input matInput formControlName="newPassword" type="password">
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('required')">
                      New password is required
                    </mat-error>
                    <mat-error *ngIf="passwordForm.get('newPassword')?.hasError('minlength')">
                      Password must be at least 8 characters
                    </mat-error>
                  </mat-form-field>
                  
                  <!-- Confirm new password -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Confirm New Password</mat-label>
                    <input matInput formControlName="confirmPassword" type="password">
                    <mat-error *ngIf="passwordForm.get('confirmPassword')?.hasError('required')">
                      Please confirm your password
                    </mat-error>
                  </mat-form-field>
                  
                  <!-- Password requirements hint -->
                  <div class="text-sm text-neutral-500 space-y-1">
                    <p>Password must contain:</p>
                    <ul class="list-disc list-inside">
                      <li>At least 8 characters</li>
                      <li>One uppercase letter</li>
                      <li>One number</li>
                      <li>One special character</li>
                    </ul>
                  </div>
                  
                  <!-- Submit button -->
                  <div class="flex justify-end pt-4">
                    <button mat-raised-button color="primary" type="submit"
                            [disabled]="passwordForm.invalid">
                      Update Password
                    </button>
                  </div>
                </form>
              </mat-card-content>
            </mat-card>
            
            <!-- Two-Factor Authentication Card -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>Two-Factor Authentication</mat-card-title>
                <mat-card-subtitle>Add an extra layer of security</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <div class="flex items-center justify-between">
                  <div>
                    <p class="text-neutral-600">
                      Protect your account with two-factor authentication
                    </p>
                    <p class="text-sm text-neutral-500 mt-1">
                      Status: <span [class]="mfaEnabled() ? 'text-success-500' : 'text-warning-500'">
                        {{ mfaEnabled() ? 'Enabled' : 'Disabled' }}
                      </span>
                    </p>
                  </div>
                  <button mat-stroked-button color="primary">
                    {{ mfaEnabled() ? 'Manage 2FA' : 'Enable 2FA' }}
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>

        <!-- ================================================ -->
        <!-- TAB 4: Account Management                        -->
        <!-- ================================================ -->
        <mat-tab label="Account">
          <div class="tab-content p-6">
            <!-- Data Export Card -->
            <mat-card class="mb-6">
              <mat-card-header>
                <mat-card-title>Export Your Data</mat-card-title>
                <mat-card-subtitle>Download a copy of your data</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <p class="text-neutral-600 mb-4">
                  Request a copy of all your personal data including children profiles, 
                  booking history, and preferences.
                </p>
                <button mat-stroked-button color="primary">
                  <mat-icon>download</mat-icon>
                  Request Data Export
                </button>
              </mat-card-content>
            </mat-card>
            
            <!-- Delete Account Card -->
            <mat-card class="border-danger-500/30 border">
              <mat-card-header>
                <mat-card-title class="text-danger-500">Delete Account</mat-card-title>
                <mat-card-subtitle>Permanently delete your account and data</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <p class="text-neutral-600 mb-4">
                  This action cannot be undone. All your data including children profiles, 
                  booking history, and preferences will be permanently deleted.
                </p>
                <button mat-stroked-button color="warn">
                  <mat-icon>delete_forever</mat-icon>
                  Delete My Account
                </button>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  
  // Inline styles with detailed comments
  styles: [`
    /* Settings container styling */
    .settings-container {
      max-width: 900px;                    /* Limit width for readability */
    }

    /* Tab content area */
    .tab-content {
      min-height: 400px;                   /* Minimum height for content */
    }

    /* Notification item layout */
    .notification-item {
      display: flex;                       /* Flexbox row */
      justify-content: space-between;      /* Space items apart */
      align-items: center;                 /* Center vertically */
      gap: 1rem;                           /* Gap between elements */
    }

    .notification-info {
      flex: 1;                             /* Take available space */
    }

    .notification-channels {
      flex-shrink: 0;                      /* Don't shrink */
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
      .notification-item {
        flex-direction: column;            /* Stack on mobile */
        align-items: flex-start;           /* Align left */
      }

      .notification-channels {
        margin-top: 0.5rem;                /* Add top margin */
      }
    }
  `]
})
export class SettingsComponent implements OnInit {
  // -------------------------------------------------
  // FORM GROUPS
  // Reactive forms for different settings sections
  // -------------------------------------------------
  
  // Profile information form
  profileForm!: FormGroup;
  
  // Password change form
  passwordForm!: FormGroup;

  // -------------------------------------------------
  // STATE SIGNALS
  // Reactive state for settings data
  // -------------------------------------------------
  
  // MFA enabled status
  mfaEnabled = signal<boolean>(false);
  
  // Notification preferences
  notificationPrefs = signal<any>({
    bookingConfirmed: { email: true, push: true, sms: false },
    bookingReminder: { email: true, push: true, sms: false },
    waitlistAvailable: { email: true, push: true, sms: true },
    suggestionsReady: { email: true, push: false, sms: false },
    creditsExpiring: { email: true, push: true, sms: false }
  });

  /**
   * Constructor
   * @param fb - FormBuilder for creating forms
   * @param authService - Auth service for user data
   * @param snackBar - Snackbar for toast messages
   */
  constructor(
    private fb: FormBuilder,               // Form builder service
    private authService: AuthService,      // Auth service
    private snackBar: MatSnackBar          // Snackbar service
  ) {}

  /**
   * ngOnInit - Initialize forms with user data
   */
  ngOnInit(): void {
    // Initialize profile form
    this.initProfileForm();
    
    // Initialize password form
    this.initPasswordForm();
    
    // Load user's MFA status
    this.loadSecuritySettings();
  }

  /**
   * saveProfile - Save profile form changes
   */
  saveProfile(): void {
    if (this.profileForm.invalid) return;
    
    // TODO: Call API to save profile
    console.log('[Settings] Saving profile:', this.profileForm.value);
    
    // Show success message
    this.snackBar.open('Profile updated successfully', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    
    // Mark form as pristine
    this.profileForm.markAsPristine();
  }

  /**
   * saveNotificationPrefs - Save notification preferences
   */
  saveNotificationPrefs(): void {
    // TODO: Call API to save preferences
    console.log('[Settings] Saving notification preferences:', this.notificationPrefs());
    
    // Show success message
    this.snackBar.open('Notification preferences saved', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
  }

  /**
   * changePassword - Handle password change
   */
  changePassword(): void {
    if (this.passwordForm.invalid) return;
    
    // Check passwords match
    const { newPassword, confirmPassword } = this.passwordForm.value;
    if (newPassword !== confirmPassword) {
      this.snackBar.open('Passwords do not match', 'Close', {
        duration: 3000,
        panelClass: ['snackbar-error']
      });
      return;
    }
    
    // TODO: Call API to change password
    console.log('[Settings] Changing password');
    
    // Show success message
    this.snackBar.open('Password updated successfully', 'Close', {
      duration: 3000,
      panelClass: ['snackbar-success']
    });
    
    // Reset form
    this.passwordForm.reset();
  }

  // -------------------------------------------------
  // PRIVATE METHODS
  // Form initialization helpers
  // -------------------------------------------------

  /**
   * initProfileForm - Initialize profile form with user data
   */
  private initProfileForm(): void {
    // Get current user
    const user = this.authService.currentUser();
    
    // Create form with user data
    this.profileForm = this.fb.group({
      firstName: [user?.firstName ?? '', Validators.required],
      lastName: [user?.lastName ?? '', Validators.required],
      email: [user?.email ?? '', [Validators.required, Validators.email]],
      phone: [user?.phone ?? '']
    });
  }

  /**
   * initPasswordForm - Initialize password change form
   */
  private initPasswordForm(): void {
    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  /**
   * loadSecuritySettings - Load user's security settings
   */
  private loadSecuritySettings(): void {
    // Get current user's MFA status
    const user = this.authService.currentUser();
    this.mfaEnabled.set(user?.mfaEnabled ?? false);
  }
}
