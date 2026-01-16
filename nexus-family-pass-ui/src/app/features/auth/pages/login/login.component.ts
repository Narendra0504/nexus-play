// =====================================================
// NEXUS FAMILY PASS - LOGIN COMPONENT
// Authentication page with tabbed login for different user types
// =====================================================

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

// Angular Material
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AuthService } from '../../../../core/services/auth.service';
import { LoginRequest } from '../../../../core/models';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    MatCardModule,
    MatTabsModule,
    MatInputModule,
    MatFormFieldModule,
    MatButtonModule,
    MatCheckboxModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  selectedTabIndex = signal<number>(0);
  hidePassword = signal<boolean>(true);
  
  readonly tabLabels = ['Parent', 'Corporate', 'Venue'];
  readonly loginTypes: ('parent' | 'corporate' | 'venue')[] = ['parent', 'corporate', 'venue'];

  get isLoading(): boolean {
    return this.authService.isLoading();
  }
  
  get error(): string | null {
    return this.authService.error();
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.initializeForm();
  }

  onTabChange(index: number): void {
    this.selectedTabIndex.set(index);
    this.authService.clearError();
  }

  togglePasswordVisibility(): void {
    this.hidePassword.update(hide => !hide);
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    
    const formValue = this.loginForm.value;
    const loginRequest: LoginRequest = {
      email: formValue.email,
      password: formValue.password,
      rememberMe: formValue.rememberMe,
      loginType: this.loginTypes[this.selectedTabIndex()]
    };
    
    this.authService.login(loginRequest).subscribe({
      next: () => console.log('[Login] Success'),
      error: (err) => console.error('[Login] Failed:', err.message)
    });
  }

  onSsoLogin(): void {
    alert('SSO login is not implemented in demo mode');
  }

  getEmailError(): string {
    const email = this.loginForm.get('email');
    if (email?.hasError('required')) return 'Email is required';
    if (email?.hasError('email')) return 'Please enter a valid email';
    return '';
  }

  getPasswordError(): string {
    const password = this.loginForm.get('password');
    if (password?.hasError('required')) return 'Password is required';
    if (password?.hasError('minlength')) return 'Password must be at least 8 characters';
    return '';
  }

  private initializeForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      rememberMe: [false]
    });
  }
}