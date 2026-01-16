// =====================================================
// NEXUS FAMILY PASS - NOT FOUND (404) PAGE
// Displayed when user navigates to unknown route.
// Provides friendly message and navigation options.
// =====================================================

// Import Angular core
import { Component } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Router
import { RouterLink } from '@angular/router';

// Import Angular Material components
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

/**
 * NotFoundComponent
 * 
 * 404 error page displayed for unmatched routes.
 * Features:
 * - Friendly illustration/icon
 * - Clear error message
 * - Navigation options to get back on track
 */
@Component({
  selector: 'app-not-found',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <!-- Full-screen centered container -->
    <div class="not-found-container">
      <!-- Content card -->
      <div class="not-found-content">
        <!-- Large 404 display -->
        <div class="error-code">
          <span class="four">4</span>
          <mat-icon class="zero">family_restroom</mat-icon>
          <span class="four">4</span>
        </div>
        
        <!-- Error message -->
        <h1 class="error-title">Page Not Found</h1>
        <p class="error-description">
          Oops! The page you're looking for doesn't exist or has been moved.
        </p>
        
        <!-- Navigation buttons -->
        <div class="action-buttons">
          <button 
            mat-raised-button 
            color="primary" 
            routerLink="/login">
            <mat-icon>home</mat-icon>
            Go to Home
          </button>
          <button 
            mat-stroked-button 
            (click)="goBack()">
            <mat-icon>arrow_back</mat-icon>
            Go Back
          </button>
        </div>
        
        <!-- Help text -->
        <p class="help-text">
          If you believe this is an error, please contact support.
        </p>
      </div>
    </div>
  `,
  styles: [`
    /* Full-screen container */
    .not-found-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #f7fafc 0%, #edf2f7 100%);
      padding: 2rem;
    }

    /* Content card */
    .not-found-content {
      text-align: center;
      max-width: 500px;
    }

    /* Large 404 display */
    .error-code {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.5rem;
      margin-bottom: 2rem;
    }

    .four {
      font-size: 8rem;
      font-weight: 700;
      color: #2c5282;
      line-height: 1;
    }

    .zero {
      font-size: 6rem !important;
      width: 6rem !important;
      height: 6rem !important;
      color: #319795;
    }

    /* Error title */
    .error-title {
      font-size: 2rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 1rem;
    }

    /* Description */
    .error-description {
      font-size: 1.125rem;
      color: #718096;
      margin: 0 0 2rem;
    }

    /* Action buttons */
    .action-buttons {
      display: flex;
      gap: 1rem;
      justify-content: center;
      margin-bottom: 2rem;
    }

    .action-buttons button mat-icon {
      margin-right: 0.25rem;
    }

    /* Help text */
    .help-text {
      font-size: 0.875rem;
      color: #a0aec0;
      margin: 0;
    }

    /* Responsive */
    @media (max-width: 480px) {
      .four {
        font-size: 5rem;
      }

      .zero {
        font-size: 4rem !important;
        width: 4rem !important;
        height: 4rem !important;
      }

      .error-title {
        font-size: 1.5rem;
      }

      .action-buttons {
        flex-direction: column;
      }
    }
  `]
})
export class NotFoundComponent {
  /**
   * goBack - Navigate to previous page
   */
  goBack(): void {
    window.history.back();
  }
}
