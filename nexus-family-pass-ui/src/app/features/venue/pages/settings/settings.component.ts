// =====================================================
// NEXUS FAMILY PASS - VENUE SETTINGS COMPONENT
// Settings page for venue administrators to manage
// venue profile, hours, and notification preferences
// =====================================================

// Import Angular core
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Forms
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Import Angular Material modules
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';

/**
 * VenueSettingsComponent - Venue Settings Page
 * 
 * Allows venue administrators to:
 * - Update venue profile information
 * - Set operating hours
 * - Configure notification preferences
 * - Manage team access
 */
@Component({
  // Component selector
  selector: 'app-venue-settings',
  
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
    MatSelectModule,
    MatSnackBarModule,
    MatDividerModule
  ],
  
  // Inline template
  template: `
    <!-- Venue Settings container -->
    <div class="settings-container p-6 max-w-4xl">
      
      <!-- Page header -->
      <div class="page-header mb-6">
        <h1 class="text-2xl font-display font-bold text-neutral-800">Settings</h1>
        <p class="text-neutral-500">Manage your venue settings and preferences</p>
      </div>

      <!-- Settings tabs -->
      <mat-tab-group animationDuration="200ms">
        
        <!-- Venue Profile Tab -->
        <mat-tab label="Profile">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Venue Information</mat-card-title>
                <mat-card-subtitle>Update your venue details visible to parents</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <form [formGroup]="venueForm" (ngSubmit)="saveVenueProfile()" class="space-y-4">
                  
                  <!-- Venue name -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Venue Name</mat-label>
                    <input matInput formControlName="name">
                  </mat-form-field>
                  
                  <!-- Description -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Description</mat-label>
                    <textarea matInput formControlName="description" rows="3"></textarea>
                    <mat-hint>Brief description shown to parents</mat-hint>
                  </mat-form-field>
                  
                  <!-- Address -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Street Address</mat-label>
                    <input matInput formControlName="address">
                  </mat-form-field>
                  
                  <!-- City, State, Zip row -->
                  <div class="grid grid-cols-3 gap-4">
                    <mat-form-field appearance="outline">
                      <mat-label>City</mat-label>
                      <input matInput formControlName="city">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>State</mat-label>
                      <input matInput formControlName="state">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>ZIP Code</mat-label>
                      <input matInput formControlName="zip">
                    </mat-form-field>
                  </div>
                  
                  <!-- Contact info -->
                  <div class="grid grid-cols-2 gap-4">
                    <mat-form-field appearance="outline">
                      <mat-label>Phone</mat-label>
                      <input matInput formControlName="phone" type="tel">
                    </mat-form-field>
                    
                    <mat-form-field appearance="outline">
                      <mat-label>Email</mat-label>
                      <input matInput formControlName="email" type="email">
                    </mat-form-field>
                  </div>
                  
                  <!-- Website -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Website</mat-label>
                    <input matInput formControlName="website" type="url">
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
        
        <!-- Hours Tab -->
        <mat-tab label="Hours">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Operating Hours</mat-card-title>
                <mat-card-subtitle>Set your venue's operating schedule</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <div class="space-y-4">
                  <div *ngFor="let day of operatingHours()" 
                       class="flex items-center gap-4 py-3 border-b border-neutral-100">
                    
                    <!-- Day name -->
                    <div class="w-24 font-medium">{{ day.name }}</div>
                    
                    <!-- Toggle open/closed -->
                    <mat-slide-toggle [(ngModel)]="day.isOpen" color="primary">
                    </mat-slide-toggle>
                    
                    <!-- Hours inputs (shown when open) -->
                    @if (day.isOpen) {
                      <mat-form-field appearance="outline" class="w-28">
                        <mat-label>Open</mat-label>
                        <input matInput type="time" [(ngModel)]="day.openTime">
                      </mat-form-field>
                      
                      <span class="text-neutral-400">to</span>
                      
                      <mat-form-field appearance="outline" class="w-28">
                        <mat-label>Close</mat-label>
                        <input matInput type="time" [(ngModel)]="day.closeTime">
                      </mat-form-field>
                    } @else {
                      <span class="text-neutral-400">Closed</span>
                    }
                  </div>
                </div>
                
                <div class="flex justify-end pt-6">
                  <button mat-raised-button color="primary" (click)="saveHours()">
                    Save Hours
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <!-- Notifications Tab -->
        <mat-tab label="Notifications">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Notification Preferences</mat-card-title>
                <mat-card-subtitle>Configure how you receive updates</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <div class="space-y-4">
                  
                  <!-- New bookings -->
                  <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">New Bookings</h4>
                      <p class="text-sm text-neutral-500">Get notified when someone books</p>
                    </div>
                    <mat-slide-toggle [(ngModel)]="notifications().newBooking" color="primary">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- Cancellations -->
                  <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">Cancellations</h4>
                      <p class="text-sm text-neutral-500">Get notified when bookings are cancelled</p>
                    </div>
                    <mat-slide-toggle [(ngModel)]="notifications().cancellation" color="primary">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- Reviews -->
                  <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">New Reviews</h4>
                      <p class="text-sm text-neutral-500">Get notified when parents leave reviews</p>
                    </div>
                    <mat-slide-toggle [(ngModel)]="notifications().newReview" color="primary">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- Daily summary -->
                  <div class="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">Daily Summary</h4>
                      <p class="text-sm text-neutral-500">Receive a daily booking summary</p>
                    </div>
                    <mat-slide-toggle [(ngModel)]="notifications().dailySummary" color="primary">
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
      </mat-tab-group>
    </div>
  `,
  
  // Inline styles
  styles: [``]
})
export class VenueSettingsComponent implements OnInit {
  // Form group for venue profile
  venueForm!: FormGroup;
  
  // Operating hours
  operatingHours = signal<any[]>([]);
  
  // Notification preferences
  notifications = signal({
    newBooking: true,
    cancellation: true,
    newReview: true,
    dailySummary: false
  });

  /**
   * Constructor
   */
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {}

  /**
   * ngOnInit - Initialize forms and load data
   */
  ngOnInit(): void {
    this.initVenueForm();
    this.loadOperatingHours();
  }

  /**
   * saveVenueProfile - Save venue profile changes
   */
  saveVenueProfile(): void {
    console.log('[Venue Settings] Saving profile:', this.venueForm.value);
    this.snackBar.open('Profile updated successfully', 'Close', { duration: 3000 });
  }

  /**
   * saveHours - Save operating hours
   */
  saveHours(): void {
    console.log('[Venue Settings] Saving hours:', this.operatingHours());
    this.snackBar.open('Hours updated successfully', 'Close', { duration: 3000 });
  }

  /**
   * saveNotifications - Save notification preferences
   */
  saveNotifications(): void {
    console.log('[Venue Settings] Saving notifications:', this.notifications());
    this.snackBar.open('Preferences saved successfully', 'Close', { duration: 3000 });
  }

  /**
   * initVenueForm - Initialize venue profile form
   */
  private initVenueForm(): void {
    this.venueForm = this.fb.group({
      name: ['Code Ninjas West', Validators.required],
      description: ['We offer coding classes, robotics workshops, and game design programs for kids.'],
      address: ['1234 Tech Park Drive'],
      city: ['San Francisco'],
      state: ['CA'],
      zip: ['94102'],
      phone: ['(415) 555-0123'],
      email: ['hello@codeninjaswest.com'],
      website: ['https://codeninjaswest.com']
    });
  }

  /**
   * loadOperatingHours - Load operating hours
   */
  private loadOperatingHours(): void {
    this.operatingHours.set([
      { name: 'Monday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { name: 'Tuesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { name: 'Wednesday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { name: 'Thursday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { name: 'Friday', isOpen: true, openTime: '09:00', closeTime: '18:00' },
      { name: 'Saturday', isOpen: true, openTime: '09:00', closeTime: '17:00' },
      { name: 'Sunday', isOpen: false, openTime: '', closeTime: '' }
    ]);
  }
}
