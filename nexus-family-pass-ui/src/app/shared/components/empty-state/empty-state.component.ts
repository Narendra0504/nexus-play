// =====================================================
// NEXUS FAMILY PASS - EMPTY STATE COMPONENT
// Reusable empty state component for displaying
// friendly messages when no data is available.
// Supports custom icons, messages, and action buttons.
// =====================================================

// Import Angular core
import { Component, Input, Output, EventEmitter } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

// Import Angular Material components
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

/**
 * EmptyStateComponent
 * 
 * Reusable component for displaying empty states throughout the app.
 * Used when lists have no items, searches return no results, etc.
 * 
 * Features:
 * - Customizable icon
 * - Title and description text
 * - Optional action button
 * - Different size variants
 * - Illustration support (placeholder)
 * 
 * @example
 * ```html
 * <app-empty-state
 *   icon="event"
 *   title="No bookings yet"
 *   description="Start exploring activities to make your first booking"
 *   actionText="Browse Activities"
 *   (actionClicked)="navigateToActivities()">
 * </app-empty-state>
 * ```
 */
@Component({
  selector: 'app-empty-state',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule
  ],
  template: `
    <!-- 
      Empty state container
      Size class determines overall sizing
    -->
    <div class="empty-state" [ngClass]="size">
      
      <!-- ============================================ -->
      <!-- ICON/ILLUSTRATION                           -->
      <!-- ============================================ -->
      <div class="empty-icon" [ngClass]="iconColor">
        <!-- 
          Custom icon if provided
          Falls back to default 'inbox' icon
        -->
        <mat-icon>{{ icon || 'inbox' }}</mat-icon>
      </div>

      <!-- ============================================ -->
      <!-- TEXT CONTENT                                 -->
      <!-- ============================================ -->
      <div class="empty-content">
        <!-- Title - primary message -->
        <h3 class="empty-title">{{ title }}</h3>
        
        <!-- Description - secondary message -->
        <p class="empty-description" *ngIf="description">
          {{ description }}
        </p>
      </div>

      <!-- ============================================ -->
      <!-- ACTION BUTTON (optional)                     -->
      <!-- ============================================ -->
      <button 
        *ngIf="actionText"
        mat-raised-button 
        [color]="actionColor"
        (click)="onActionClick()"
        class="empty-action">
        <mat-icon *ngIf="actionIcon">{{ actionIcon }}</mat-icon>
        {{ actionText }}
      </button>

      <!-- ============================================ -->
      <!-- SECONDARY ACTION (optional)                  -->
      <!-- ============================================ -->
      <button 
        *ngIf="secondaryActionText"
        mat-button 
        (click)="onSecondaryActionClick()"
        class="empty-secondary-action">
        {{ secondaryActionText }}
      </button>
    </div>
  `,
  styles: [`
    /* Empty state container */
    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2rem;
    }

    /* Size variants */
    .empty-state.small {
      padding: 1rem;
    }

    .empty-state.small .empty-icon {
      width: 48px;
      height: 48px;
    }

    .empty-state.small .empty-icon mat-icon {
      font-size: 24px;
      width: 24px;
      height: 24px;
    }

    .empty-state.small .empty-title {
      font-size: 1rem;
    }

    .empty-state.small .empty-description {
      font-size: 0.75rem;
    }

    .empty-state.large {
      padding: 4rem 2rem;
    }

    .empty-state.large .empty-icon {
      width: 120px;
      height: 120px;
    }

    .empty-state.large .empty-icon mat-icon {
      font-size: 64px;
      width: 64px;
      height: 64px;
    }

    .empty-state.large .empty-title {
      font-size: 1.5rem;
    }

    /* Icon container */
    .empty-icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
      background: #f7fafc;
    }

    .empty-icon mat-icon {
      font-size: 40px;
      width: 40px;
      height: 40px;
      color: #a0aec0;
    }

    /* Icon color variants */
    .empty-icon.primary {
      background: #ebf8ff;
    }

    .empty-icon.primary mat-icon {
      color: #2c5282;
    }

    .empty-icon.accent {
      background: #e6fffa;
    }

    .empty-icon.accent mat-icon {
      color: #319795;
    }

    .empty-icon.warn {
      background: #fef3c7;
    }

    .empty-icon.warn mat-icon {
      color: #d69e2e;
    }

    /* Content */
    .empty-content {
      margin-bottom: 1.5rem;
    }

    .empty-title {
      font-size: 1.125rem;
      font-weight: 600;
      color: #2d3748;
      margin: 0 0 0.5rem;
    }

    .empty-description {
      font-size: 0.875rem;
      color: #718096;
      margin: 0;
      max-width: 300px;
    }

    /* Action button */
    .empty-action {
      margin-bottom: 0.5rem;
    }

    .empty-action mat-icon {
      margin-right: 0.25rem;
    }

    /* Secondary action */
    .empty-secondary-action {
      color: #718096;
      font-size: 0.875rem;
    }
  `]
})
export class EmptyStateComponent {
  // -------------------------------------------------
  // INPUTS
  // -------------------------------------------------
  
  /**
   * Material icon name to display
   * @default 'inbox'
   */
  @Input() icon: string = 'inbox';
  
  /**
   * Icon color variant
   * Options: 'default', 'primary', 'accent', 'warn'
   */
  @Input() iconColor: string = 'default';
  
  /**
   * Main title/message to display
   */
  @Input() title: string = 'No data available';
  
  /**
   * Secondary description text
   */
  @Input() description?: string;
  
  /**
   * Primary action button text
   * If provided, shows the action button
   */
  @Input() actionText?: string;
  
  /**
   * Icon for the action button
   */
  @Input() actionIcon?: string;
  
  /**
   * Action button color
   * @default 'primary'
   */
  @Input() actionColor: 'primary' | 'accent' | 'warn' = 'primary';
  
  /**
   * Secondary action button text
   */
  @Input() secondaryActionText?: string;
  
  /**
   * Size variant
   * Options: 'small', 'medium', 'large'
   * @default 'medium'
   */
  @Input() size: 'small' | 'medium' | 'large' = 'medium';

  // -------------------------------------------------
  // OUTPUTS
  // -------------------------------------------------
  
  /**
   * Emitted when primary action button is clicked
   */
  @Output() actionClicked = new EventEmitter<void>();
  
  /**
   * Emitted when secondary action button is clicked
   */
  @Output() secondaryActionClicked = new EventEmitter<void>();

  // -------------------------------------------------
  // METHODS
  // -------------------------------------------------
  
  /**
   * Handle primary action click
   */
  onActionClick(): void {
    this.actionClicked.emit();
  }
  
  /**
   * Handle secondary action click
   */
  onSecondaryActionClick(): void {
    this.secondaryActionClicked.emit();
  }
}
