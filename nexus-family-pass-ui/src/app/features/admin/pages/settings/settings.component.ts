// =====================================================
// NEXUS FAMILY PASS - ADMIN SETTINGS COMPONENT
// System settings page for administrators
// Platform configuration, defaults, and maintenance
// =====================================================

// Import Angular core
import { Component, signal } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Forms
import { ReactiveFormsModule, FormBuilder, FormGroup } from '@angular/forms';
import { FormsModule } from '@angular/forms';

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
 * AdminSettingsComponent - System Settings Page
 * 
 * Allows system administrators to:
 * - Configure platform defaults
 * - Manage feature flags
 * - Set maintenance mode
 * - Configure notifications
 */
@Component({
  // Component selector
  selector: 'app-admin-settings',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
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
    <!-- Admin Settings container -->
    <div class="settings-container p-6 max-w-4xl">
      
      <!-- Page header -->
      <div class="page-header mb-6">
        <h1 class="text-2xl font-display font-bold text-neutral-800">System Settings</h1>
        <p class="text-neutral-500">Configure platform-wide settings</p>
      </div>

      <!-- Settings tabs -->
      <mat-tab-group animationDuration="200ms">
        
        <!-- General Settings Tab -->
        <mat-tab label="General">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Platform Configuration</mat-card-title>
                <mat-card-subtitle>General platform settings</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <form [formGroup]="generalForm" class="space-y-4">
                  
                  <!-- Platform name -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Platform Name</mat-label>
                    <input matInput formControlName="platformName">
                  </mat-form-field>
                  
                  <!-- Support email -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Support Email</mat-label>
                    <input matInput formControlName="supportEmail" type="email">
                  </mat-form-field>
                  
                  <!-- Default credits per employee -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Default Credits per Employee</mat-label>
                    <input matInput formControlName="defaultCredits" type="number">
                    <mat-hint>Default monthly credit allocation for new companies</mat-hint>
                  </mat-form-field>
                  
                  <!-- Timezone -->
                  <mat-form-field appearance="outline" class="w-full">
                    <mat-label>Default Timezone</mat-label>
                    <mat-select formControlName="timezone">
                      <mat-option value="America/Los_Angeles">Pacific Time (PT)</mat-option>
                      <mat-option value="America/Denver">Mountain Time (MT)</mat-option>
                      <mat-option value="America/Chicago">Central Time (CT)</mat-option>
                      <mat-option value="America/New_York">Eastern Time (ET)</mat-option>
                    </mat-select>
                  </mat-form-field>
                </form>
                
                <div class="flex justify-end pt-4">
                  <button mat-raised-button color="primary" (click)="saveGeneralSettings()">
                    Save Changes
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <!-- Feature Flags Tab -->
        <mat-tab label="Features">
          <div class="tab-content p-6">
            <mat-card>
              <mat-card-header>
                <mat-card-title>Feature Flags</mat-card-title>
                <mat-card-subtitle>Enable or disable platform features</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <div class="space-y-4">
                  
                  <!-- AI Curation -->
                  <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">AI-Powered Curation</h4>
                      <p class="text-sm text-neutral-500">Personalized activity recommendations</p>
                    </div>
                    <mat-slide-toggle [(ngModel)]="features().aiCuration" color="primary">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- Waitlist -->
                  <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">Waitlist System</h4>
                      <p class="text-sm text-neutral-500">Allow users to join waitlists for full activities</p>
                    </div>
                    <mat-slide-toggle [(ngModel)]="features().waitlist" color="primary">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- NL Search -->
                  <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">Natural Language Search</h4>
                      <p class="text-sm text-neutral-500">Search activities using natural language</p>
                    </div>
                    <mat-slide-toggle [(ngModel)]="features().nlSearch" color="primary">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- Reviews -->
                  <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">Parent Reviews</h4>
                      <p class="text-sm text-neutral-500">Allow parents to leave reviews</p>
                    </div>
                    <mat-slide-toggle [(ngModel)]="features().reviews" color="primary">
                    </mat-slide-toggle>
                  </div>
                  
                  <!-- SSO -->
                  <div class="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                    <div>
                      <h4 class="font-medium text-neutral-800">SSO Integration</h4>
                      <p class="text-sm text-neutral-500">Corporate single sign-on</p>
                    </div>
                    <mat-slide-toggle [(ngModel)]="features().sso" color="primary">
                    </mat-slide-toggle>
                  </div>
                </div>
                
                <div class="flex justify-end pt-6">
                  <button mat-raised-button color="primary" (click)="saveFeatures()">
                    Save Features
                  </button>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
        
        <!-- Maintenance Tab -->
        <mat-tab label="Maintenance">
          <div class="tab-content p-6">
            <!-- Maintenance Mode Card -->
            <mat-card class="mb-6">
              <mat-card-header>
                <mat-card-title>Maintenance Mode</mat-card-title>
                <mat-card-subtitle>Temporarily disable platform access</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <div class="flex items-center justify-between p-4 rounded-lg"
                     [class]="maintenanceMode() ? 'bg-danger-50' : 'bg-neutral-50'">
                  <div>
                    <h4 class="font-medium text-neutral-800">
                      Maintenance Mode is {{ maintenanceMode() ? 'ON' : 'OFF' }}
                    </h4>
                    <p class="text-sm text-neutral-500">
                      {{ maintenanceMode() ? 'Users cannot access the platform' : 'Platform is operating normally' }}
                    </p>
                  </div>
                  <mat-slide-toggle [(ngModel)]="maintenanceMode" color="warn">
                  </mat-slide-toggle>
                </div>
                
                @if (maintenanceMode()) {
                  <mat-form-field appearance="outline" class="w-full mt-4">
                    <mat-label>Maintenance Message</mat-label>
                    <textarea matInput [(ngModel)]="maintenanceMessage" rows="3"
                              placeholder="Message shown to users during maintenance"></textarea>
                  </mat-form-field>
                }
              </mat-card-content>
            </mat-card>
            
            <!-- System Actions Card -->
            <mat-card>
              <mat-card-header>
                <mat-card-title>System Actions</mat-card-title>
                <mat-card-subtitle>Administrative actions</mat-card-subtitle>
              </mat-card-header>
              
              <mat-card-content class="pt-4">
                <div class="space-y-4">
                  
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium text-neutral-800">Clear Cache</h4>
                      <p class="text-sm text-neutral-500">Clear all cached data</p>
                    </div>
                    <button mat-stroked-button (click)="clearCache()">
                      <mat-icon>cached</mat-icon>
                      Clear Cache
                    </button>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium text-neutral-800">Reindex Search</h4>
                      <p class="text-sm text-neutral-500">Rebuild search indexes</p>
                    </div>
                    <button mat-stroked-button (click)="reindexSearch()">
                      <mat-icon>search</mat-icon>
                      Reindex
                    </button>
                  </div>
                  
                  <mat-divider></mat-divider>
                  
                  <div class="flex items-center justify-between">
                    <div>
                      <h4 class="font-medium text-neutral-800">Send Test Email</h4>
                      <p class="text-sm text-neutral-500">Verify email service</p>
                    </div>
                    <button mat-stroked-button (click)="sendTestEmail()">
                      <mat-icon>email</mat-icon>
                      Send Test
                    </button>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </mat-tab>
      </mat-tab-group>
    </div>
  `,
  
  // Inline styles
  styles: [`
    .bg-danger-50 { background-color: rgba(229, 62, 62, 0.05); }
  `]
})
export class AdminSettingsComponent {
  // General settings form
  generalForm: FormGroup;
  
  // Feature flags
  features = signal({
    aiCuration: true,
    waitlist: true,
    nlSearch: true,
    reviews: true,
    sso: true
  });
  
  // Maintenance mode
  maintenanceMode = signal<boolean>(false);
  maintenanceMessage = '';

  /**
   * Constructor
   */
  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) {
    // Initialize general form
    this.generalForm = this.fb.group({
      platformName: ['Nexus Family Pass'],
      supportEmail: ['support@nexusfamilypass.com'],
      defaultCredits: [10],
      timezone: ['America/Los_Angeles']
    });
  }

  /**
   * saveGeneralSettings - Save general settings
   */
  saveGeneralSettings(): void {
    console.log('[Admin Settings] Saving general:', this.generalForm.value);
    this.snackBar.open('Settings saved successfully', 'Close', { duration: 3000 });
  }

  /**
   * saveFeatures - Save feature flags
   */
  saveFeatures(): void {
    console.log('[Admin Settings] Saving features:', this.features());
    this.snackBar.open('Features updated successfully', 'Close', { duration: 3000 });
  }

  /**
   * clearCache - Clear system cache
   */
  clearCache(): void {
    console.log('[Admin Settings] Clearing cache...');
    this.snackBar.open('Cache cleared successfully', 'Close', { duration: 3000 });
  }

  /**
   * reindexSearch - Rebuild search indexes
   */
  reindexSearch(): void {
    console.log('[Admin Settings] Reindexing search...');
    this.snackBar.open('Search reindex started', 'Close', { duration: 3000 });
  }

  /**
   * sendTestEmail - Send test email
   */
  sendTestEmail(): void {
    console.log('[Admin Settings] Sending test email...');
    this.snackBar.open('Test email sent', 'Close', { duration: 3000 });
  }
}
