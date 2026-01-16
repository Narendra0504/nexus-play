// =====================================================
// NEXUS FAMILY PASS - RESET PASSWORD COMPONENT
// Password reset page where users set a new password
// using a token from their email link. Includes
// password strength indicator and requirement checklist.
// =====================================================

// Import Angular core decorators and types
import { Component, OnInit, signal, computed } from '@angular/core';

// Import CommonModule for directives
import { CommonModule } from '@angular/common';

// Import Router modules
import { Router, ActivatedRoute, RouterLink } from '@angular/router';

// Import Reactive Forms
import { 
  ReactiveFormsModule, 
  FormBuilder, 
  FormGroup, 
  Validators,
  AbstractControl
} from '@angular/forms';

// Import Angular Material components
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

// Import AuthService
import { AuthService } from '../../../../core/services/auth.service';

/**
 * ResetPasswordComponent - Set New Password Page
 * 
 * Features:
 * - New password input with visibility toggle
 * - Confirm password input with match validation
 * - Real-time password strength indicator
 * - Requirements checklist showing which criteria are met
 * - Token validation from URL parameter
 */
@Component({
  // Component selector
  selector: 'app-reset-password',
  
  // Standalone component
  standalone: true,
  
  // Required imports
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatProgressBarModule,
    MatSnackBarModule
  ],
  
  // External template
  templateUrl: './reset-password.component.html',
  
  // External styles
  styleUrls: ['./reset-password.component.scss']
})
export class ResetPasswordComponent implements OnInit {
  // -------------------------------------------------
  // FORM AND STATE
  // -------------------------------------------------
  
  // Reactive form group for password fields
  resetPasswordForm!: FormGroup;
  
  // Reset token from URL
  private token: string = '';
  
  // Signal for loading state
  isLoading = signal<boolean>(false);
  
  // Signal for password visibility (new password)
  hidePassword = signal<boolean>(true);
  
  // Signal for confirm password visibility
  hideConfirmPassword = signal<boolean>(true);

  // -------------------------------------------------
  // PASSWORD REQUIREMENTS
  // List of requirements to display in checklist
  // -------------------------------------------------
  readonly passwordRequirements = [
    { key: 'minLength', label: 'At least 8 characters', met: false },
    { key: 'uppercase', label: 'One uppercase letter', met: false },
    { key: 'lowercase', label: 'One lowercase letter', met: false },
    { key: 'number', label: 'One number', met: false },
    { key: 'special', label: 'One special character (!@#$%^&*)', met: false }
  ];

  // -------------------------------------------------
  // COMPUTED VALUES
  // -------------------------------------------------
  
  /**
   * passwordStrength - Calculate password strength (0-100)
   * Based on how many requirements are met
   */
  passwordStrength = computed(() => {
    // Get current password value
    const password = this.resetPasswordForm?.get('newPassword')?.value || '';
    
    // Count met requirements
    let score = 0;
    
    // Check each requirement
    if (password.length >= 8) score += 20;              // Length check
    if (/[A-Z]/.test(password)) score += 20;           // Uppercase check
    if (/[a-z]/.test(password)) score += 20;           // Lowercase check
    if (/[0-9]/.test(password)) score += 20;           // Number check
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score += 20; // Special char
    
    return score;
  });

  /**
   * strengthLabel - Human-readable strength label
   */
  strengthLabel = computed(() => {
    const strength = this.passwordStrength();
    
    if (strength === 0) return '';           // No password entered
    if (strength <= 20) return 'Very Weak';  // Only 1 requirement met
    if (strength <= 40) return 'Weak';       // 2 requirements met
    if (strength <= 60) return 'Fair';       // 3 requirements met
    if (strength <= 80) return 'Good';       // 4 requirements met
    return 'Strong';                          // All requirements met
  });

  /**
   * strengthColor - Color class for strength bar
   */
  strengthColor = computed(() => {
    const strength = this.passwordStrength();
    
    if (strength <= 20) return 'warn';     // Red
    if (strength <= 60) return 'accent';   // Yellow/orange
    return 'primary';                       // Green/blue
  });

  /**
   * Constructor - Inject dependencies
   */
  constructor(
    private fb: FormBuilder,           // Form builder
    private authService: AuthService,  // Auth service
    private router: Router,            // Router for navigation
    private route: ActivatedRoute,     // Activated route for params
    private snackBar: MatSnackBar      // Snackbar for notifications
  ) {}

  /**
   * ngOnInit - Initialize component
   */
  ngOnInit(): void {
    // Extract token from URL parameter
    this.token = this.route.snapshot.paramMap.get('token') || '';
    
    // Validate token exists
    if (!this.token) {
      // Show error and redirect if no token
      this.snackBar.open('Invalid reset link', 'Close', {
        duration: 5000,
        panelClass: ['snackbar-error']
      });
      
      // Redirect to forgot password page
      this.router.navigate(['/forgot-password']);
      return;
    }
    
    // Initialize the form
    this.initializeForm();
  }

  /**
   * initializeForm - Create reactive form with validators
   */
  private initializeForm(): void {
    // Create form group
    this.resetPasswordForm = this.fb.group({
      // New password field with pattern validation
      newPassword: ['', [
        Validators.required,           // Required field
        Validators.minLength(8),       // Minimum 8 characters
        this.passwordStrengthValidator // Custom strength validator
      ]],
      
      // Confirm password field
      confirmPassword: ['', [
        Validators.required            // Required field
      ]]
    }, {
      // Form-level validator for password match
      validators: this.passwordMatchValidator
    });
    
    // Subscribe to password changes to update requirements
    this.resetPasswordForm.get('newPassword')?.valueChanges.subscribe(
      (value) => this.updateRequirements(value)
    );
  }

  /**
   * passwordStrengthValidator - Custom validator for password strength
   */
  private passwordStrengthValidator(control: AbstractControl) {
    const password = control.value || '';
    
    // Check all requirements
    const hasMinLength = password.length >= 8;
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    // Valid if all requirements met
    const isValid = hasMinLength && hasUppercase && hasLowercase && 
                    hasNumber && hasSpecial;
    
    // Return null if valid, error object if invalid
    return isValid ? null : { passwordStrength: true };
  }

  /**
   * passwordMatchValidator - Form-level validator for matching passwords
   */
  private passwordMatchValidator(form: FormGroup) {
    // Get both password values
    const newPassword = form.get('newPassword')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    
    // Check if they match
    if (newPassword !== confirmPassword) {
      // Set error on confirm field
      form.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    return null; // Valid - passwords match
  }

  /**
   * updateRequirements - Update requirements checklist
   */
  private updateRequirements(password: string): void {
    // Update each requirement's met status
    this.passwordRequirements[0].met = password.length >= 8;           // Length
    this.passwordRequirements[1].met = /[A-Z]/.test(password);        // Uppercase
    this.passwordRequirements[2].met = /[a-z]/.test(password);        // Lowercase
    this.passwordRequirements[3].met = /[0-9]/.test(password);        // Number
    this.passwordRequirements[4].met = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Special
  }

  /**
   * togglePasswordVisibility - Toggle new password visibility
   */
  togglePasswordVisibility(): void {
    this.hidePassword.update(hide => !hide);
  }

  /**
   * toggleConfirmPasswordVisibility - Toggle confirm password visibility
   */
  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword.update(hide => !hide);
  }

  /**
   * onSubmit - Handle form submission
   */
  onSubmit(): void {
    // Validate form
    if (this.resetPasswordForm.invalid) {
      this.resetPasswordForm.markAllAsTouched();
      return;
    }
    
    // Set loading state
    this.isLoading.set(true);
    
    // Get form values
    const formValue = this.resetPasswordForm.value;
    
    // Call auth service
    this.authService.resetPassword({
      token: this.token,
      newPassword: formValue.newPassword,
      confirmPassword: formValue.confirmPassword
    }).subscribe({
      // Success handler
      next: () => {
        this.isLoading.set(false);
        
        // Show success message
        this.snackBar.open(
          'Password updated successfully! Please log in with your new password.',
          'Close',
          { duration: 5000, panelClass: ['snackbar-success'] }
        );
        
        // Redirect to login
        this.router.navigate(['/login']);
      },
      // Error handler
      error: (err) => {
        this.isLoading.set(false);
        console.error('[Reset Password] Error:', err.message);
      }
    });
  }
}
