// =====================================================
// NEXUS FAMILY PASS - LOADING SPINNER COMPONENT
// Global loading overlay component that displays
// during async operations based on LoadingService state.
// =====================================================

// Import Angular core
import { Component, Input } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Angular Material
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// Import LoadingService
import { LoadingService } from '../../../core/services/loading.service';

/**
 * LoadingSpinnerComponent - Global Loading Overlay
 * 
 * Displays a centered loading spinner overlay.
 * Can be used in two modes:
 * 1. Global mode - Connected to LoadingService
 * 2. Local mode - Controlled via isLoading input
 * 
 * @example
 * ```html
 * <!-- Global loading (uses LoadingService) -->
 * <app-loading-spinner></app-loading-spinner>
 * 
 * <!-- Local loading (controlled by parent) -->
 * <app-loading-spinner [isLoading]="myLoadingState" [overlay]="false">
 * </app-loading-spinner>
 * ```
 */
@Component({
  // Component selector
  selector: 'app-loading-spinner',
  
  // Standalone component
  standalone: true,
  
  // Import required modules
  imports: [
    CommonModule,
    MatProgressSpinnerModule
  ],
  
  // Inline template
  template: `
    <!-- Loading overlay (when overlay mode is enabled) -->
    <div class="loading-container" 
         *ngIf="shouldShow()"
         [class.overlay]="overlay"
         [class.inline]="!overlay">
      
      <!-- Backdrop for overlay mode -->
      <div class="backdrop" *ngIf="overlay"></div>
      
      <!-- Spinner content -->
      <div class="spinner-content">
        <!-- Material spinner -->
        <mat-spinner [diameter]="diameter" [color]="color"></mat-spinner>
        
        <!-- Optional message -->
        <p class="loading-message" *ngIf="message">{{ message }}</p>
      </div>
    </div>
  `,
  
  // Inline styles
  styles: [`
    /* Container base */
    .loading-container {
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Overlay mode - Full screen */
    .loading-container.overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 9999;
    }

    /* Inline mode - Within parent */
    .loading-container.inline {
      padding: 2rem;
    }

    /* Semi-transparent backdrop */
    .backdrop {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: rgba(255, 255, 255, 0.8);
    }

    /* Spinner content wrapper */
    .spinner-content {
      position: relative;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }

    /* Loading message text */
    .loading-message {
      color: #4a5568;
      font-size: 0.875rem;
      margin: 0;
    }
  `]
})
export class LoadingSpinnerComponent {
  // -------------------------------------------------
  // INPUTS
  // -------------------------------------------------

  /**
   * Manual control of loading state
   * If provided, overrides LoadingService
   */
  @Input() isLoading: boolean | null = null;

  /**
   * Whether to show as full-screen overlay
   * Default: true
   */
  @Input() overlay: boolean = true;

  /**
   * Spinner diameter in pixels
   * Default: 48
   */
  @Input() diameter: number = 48;

  /**
   * Spinner color theme
   * Default: 'primary'
   */
  @Input() color: 'primary' | 'accent' | 'warn' = 'primary';

  /**
   * Optional message to display below spinner
   */
  @Input() message?: string;

  // -------------------------------------------------
  // CONSTRUCTOR
  // -------------------------------------------------

  /**
   * Constructor - Inject LoadingService
   */
  constructor(private loadingService: LoadingService) {}

  // -------------------------------------------------
  // METHODS
  // -------------------------------------------------

  /**
   * shouldShow - Determine if spinner should be visible
   * 
   * Checks manual input first, then falls back to service.
   * 
   * @returns boolean - Whether to show the spinner
   */
  shouldShow(): boolean {
    // If isLoading input is provided, use it
    if (this.isLoading !== null) {
      return this.isLoading;
    }
    
    // Otherwise, use LoadingService state
    return this.loadingService.isLoading();
  }
}
