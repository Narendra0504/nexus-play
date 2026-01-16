// =====================================================
// NEXUS FAMILY PASS - FORGOT PASSWORD COMPONENT
// Password recovery page where users can request a
// password reset link sent to their email address
// =====================================================

// Import Angular core decorators
import { Component, OnInit, signal } from '@angular/core';

// Import CommonModule for directives
import { CommonModule } from '@angular/common';

// Import Router modules for navigation
import { Router, RouterLink } from '@angular/router';

// Import Reactive Forms
import { 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators 
} from '@angular/forms';

// Import Angular Material components
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Import AuthService for password reset
import { AuthService } from '../../../../core/services/auth.service';

/**
 * ForgotPasswordComponent - Password Recovery Page
 * 
 * This component allows users to:
 * - Enter their email address
 * - Request a password reset link
 * - See success confirmation message
 * - Navigate back to login
 */
@Component({
  // Component selector for routing
  selector: 'app-forgot-password',
  
  // Standalone component flag
  standalone: true,
  
  // Required module imports
  imports: [
    CommonModule,              // *ngIf, *ngFor directives
    RouterLink,                // Router navigation
    ReactiveFormsModule,       // Reactive forms
    MatCardModule,             // Material card
    MatInputModule,            // Material input
    MatFormFieldModule,        // Material form field
    MatButtonModule,           // Material buttons
    MatIconModule,             // Material icons
    MatProgressSpinnerModule   // Loading spinner
  ],
  
  // Inline template for simplicity
  template: `
    <!-- 
      Main container with gradient background
      Same styling as login page for consistency
    -->
    <div class="forgot-password-container min-h-screen flex items-center justify-center p-4">
      
      <!-- Card wrapper with max width constraint -->
      <mat-card class="forgot-password-card w-full max-w-md">
        <mat-card-content class="p-6 sm:p-8">
          
          <!-- 
            Back to login link
            Positioned at top left of card
            Uses mat-icon-button for icon-only style
          -->
          <a 
            routerLink="/login" 
            class="back-link inline-flex items-center text-neutral-500 
                   hover:text-primary-500 mb-6 transition-colors">
            <!-- Back arrow icon -->
            <mat-icon class="mr-1">arrow_back</mat-icon>
            <!-- Link text -->
            <span class="text-sm">Back to login</span>
          </a>
          
          <!-- 
            Success state display
            Shows after successful email submission
            Contains success icon and message
          -->
          <div *ngIf="isSubmitted()" class="success-state text-center py-8">
            
            <!-- Green checkmark icon in circle -->
            <div class="success-icon mx-auto mb-4 w-16 h-16 rounded-full 
                        bg-success-500/10 flex items-center justify-center">
              <mat-icon class="text-success-500 text-3xl">check_circle</mat-icon>
            </div>
            
            <!-- Success heading -->
            <h2 class="text-xl font-semibold text-neutral-800 mb-2">
              Check your email
            </h2>
            
            <!-- Success description -->
            <p class="text-neutral-500 mb-6">
              We've sent password reset instructions to<br>
              <strong class="text-neutral-700">{{ submittedEmail() }}</strong>
            </p>
            
            <!-- Additional help text -->
            <p class="text-sm text-neutral-400">
              Didn't receive the email? Check your spam folder or
              <button 
                (click)="resetForm()" 
                class="text-primary-500 hover:underline">
                try again
              </button>
            </p>
          </div>
          
          <!-- 
            Form state display
            Shows the email input form
            Hidden after successful submission
          -->
          <div *ngIf="!isSubmitted()">
            
            <!-- Page title and description -->
            <div class="text-center mb-6">
              <!-- Icon in colored circle -->
              <div class="mx-auto mb-4 w-16 h-16 rounded-full bg-primary-500/10 
                          flex items-center justify-center">
                <mat-icon class="text-primary-500 text-3xl">lock_reset</mat-icon>
              </div>
              
              <!-- Heading -->
              <h1 class="text-2xl font-semibold text-neutral-800 mb-2">
                Reset your password
              </h1>
              
              <!-- Description text -->
              <p class="text-neutral-500">
                Enter your email and we'll send you instructions to reset your password
              </p>
            </div>
            
            <!-- 
              Forgot password form
              Single email field with validation
            -->
            <form [formGroup]="forgotPasswordForm" (ngSubmit)="onSubmit()">
              
              <!-- Email input field -->
              <mat-form-field appearance="outline" class="w-full mb-4">
                <mat-label>Email address</mat-label>
                <input 
                  matInput 
                  type="email" 
                  formControlName="email"
                  placeholder="you@company.com"
                  autocomplete="email">
                <!-- Email icon prefix -->
                <mat-icon matPrefix class="text-neutral-400 mr-2">email</mat-icon>
                <!-- Validation error -->
                <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('required')">
                  Email is required
                </mat-error>
                <mat-error *ngIf="forgotPasswordForm.get('email')?.hasError('email')">
                  Please enter a valid email address
                </mat-error>
              </mat-form-field>
              
              <!-- Submit button -->
              <button 
                mat-raised-button 
                color="primary"
                type="submit"
                class="w-full h-12"
                [disabled]="isLoading() || forgotPasswordForm.invalid">
                
                <!-- Conditional content based on loading state -->
                <ng-container *ngIf="!isLoading(); else loadingSpinner">
                  Send Reset Link
                </ng-container>
                
                <!-- Loading spinner template -->
                <ng-template #loadingSpinner>
                  <mat-spinner diameter="24" class="mx-auto"></mat-spinner>
                </ng-template>
              </button>
            </form>
          </div>
          
        </mat-card-content>
      </mat-card>
    </div>
  `,
  
  // Component styles
  styles: [`
    /* Container with gradient background matching login page */
    .forgot-password-container {
      background: linear-gradient(
        135deg,
        var(--color-primary) 0%,
        var(--color-primary-dark) 50%,
        var(--color-accent-dark) 100%
      );
    }
    
    /* Card styling */
    .forgot-password-card {
      border-radius: var(--radius-xl) !important;
      box-shadow: var(--shadow-xl) !important;
      max-width: 420px;
      animation: fadeIn 0.3s ease-out;
    }
    
    /* Fade in animation */
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    /* Back link styling */
    .back-link {
      text-decoration: none;
      
      mat-icon {
        font-size: 18px;
        width: 18px;
        height: 18px;
      }
    }
    
    /* Success icon container */
    .success-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
    }
    
    /* Button styling */
    button[mat-raised-button] {
      height: 48px !important;
      font-size: 16px !important;
      font-weight: 500 !important;
      border-radius: var(--radius-md) !important;
    }
  `]
})
export class ForgotPasswordComponent implements OnInit {
  // -------------------------------------------------
  // FORM GROUP
  // Reactive form for email input
  // -------------------------------------------------
  forgotPasswordForm!: FormGroup;
  
  // -------------------------------------------------
  // SIGNALS FOR REACTIVE STATE
  // -------------------------------------------------
  
  // Loading state during API call
  isLoading = signal<boolean>(false);
  
  // Whether form has been successfully submitted
  isSubmitted = signal<boolean>(false);
  
  // Email that was submitted (for display in success message)
  submittedEmail = signal<string>('');

  /**
   * Constructor - Inject dependencies
   * @param fb - FormBuilder for reactive forms
   * @param authService - Auth service for password reset
   * @param router - Router for navigation
   */
  constructor(
    private fb: FormBuilder,           // Form builder service
    private authService: AuthService,  // Auth service
    private router: Router             // Router service
  ) {}

  /**
   * ngOnInit - Initialize component
   * Creates the reactive form with validators
   */
  ngOnInit(): void {
    // Initialize form with email field and validators
    this.forgotPasswordForm = this.fb.group({
      // Email field - required and must be valid email format
      email: ['', [
        Validators.required,  // Field is required
        Validators.email      // Must be valid email format
      ]]
    });
  }

  /**
   * onSubmit - Handle form submission
   * Calls auth service to send password reset email
   */
  onSubmit(): void {
    // Check if form is valid before submitting
    if (this.forgotPasswordForm.invalid) {
      // Mark all fields as touched to show validation errors
      this.forgotPasswordForm.markAllAsTouched();
      return; // Exit early if invalid
    }
    
    // Set loading state to true
    this.isLoading.set(true);
    
    // Get email value from form
    const email = this.forgotPasswordForm.get('email')?.value;
    
    // Store email for success message display
    this.submittedEmail.set(email);
    
    // Call auth service to request password reset
    this.authService.forgotPassword({ email }).subscribe({
      // Success handler
      next: () => {
        // Set loading to false
        this.isLoading.set(false);
        
        // Show success state
        this.isSubmitted.set(true);
        
        // Log success
        console.log('[Forgot Password] Reset email sent to:', email);
      },
      // Error handler
      error: (err) => {
        // Set loading to false
        this.isLoading.set(false);
        
        // Log error (error toast shown by interceptor)
        console.error('[Forgot Password] Error:', err.message);
      }
    });
  }

  /**
   * resetForm - Reset to initial form state
   * Called when user wants to try a different email
   */
  resetForm(): void {
    // Reset submitted state to show form again
    this.isSubmitted.set(false);
    
    // Clear the form
    this.forgotPasswordForm.reset();
    
    // Clear stored email
    this.submittedEmail.set('');
  }
}
