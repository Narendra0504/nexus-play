// =====================================================
// NEXUS FAMILY PASS - SKELETON LOADER COMPONENT
// Reusable skeleton loading placeholder component
// for displaying loading states with animated placeholders.
// Supports various shapes and sizes.
// =====================================================

// Import Angular core
import { Component, Input } from '@angular/core';

// Import CommonModule
import { CommonModule } from '@angular/common';

/**
 * SkeletonLoaderComponent
 * 
 * Animated skeleton placeholder for loading states.
 * Provides a better UX than spinners by showing the
 * expected layout shape while data loads.
 * 
 * Features:
 * - Multiple shape types (text, circle, rectangle, card)
 * - Configurable dimensions
 * - Animation built-in
 * - Composable for complex layouts
 * 
 * @example
 * ```html
 * <!-- Text skeleton -->
 * <app-skeleton-loader type="text" width="200px"></app-skeleton-loader>
 * 
 * <!-- Avatar skeleton -->
 * <app-skeleton-loader type="circle" width="48px" height="48px"></app-skeleton-loader>
 * 
 * <!-- Card skeleton -->
 * <app-skeleton-loader type="card"></app-skeleton-loader>
 * ```
 */
@Component({
  selector: 'app-skeleton-loader',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- 
      Skeleton container
      Type determines the shape/layout
    -->
    <ng-container [ngSwitch]="type">
      
      <!-- ============================================ -->
      <!-- TEXT SKELETON                                -->
      <!-- Single line of text placeholder              -->
      <!-- ============================================ -->
      <div 
        *ngSwitchCase="'text'"
        class="skeleton skeleton-text"
        [style.width]="width"
        [style.height]="height || '16px'"
        [style.border-radius]="borderRadius || '4px'">
      </div>

      <!-- ============================================ -->
      <!-- CIRCLE SKELETON                              -->
      <!-- Avatar or icon placeholder                   -->
      <!-- ============================================ -->
      <div 
        *ngSwitchCase="'circle'"
        class="skeleton skeleton-circle"
        [style.width]="width || '48px'"
        [style.height]="height || '48px'">
      </div>

      <!-- ============================================ -->
      <!-- RECTANGLE SKELETON                           -->
      <!-- Image or block placeholder                   -->
      <!-- ============================================ -->
      <div 
        *ngSwitchCase="'rectangle'"
        class="skeleton skeleton-rectangle"
        [style.width]="width || '100%'"
        [style.height]="height || '120px'"
        [style.border-radius]="borderRadius || '8px'">
      </div>

      <!-- ============================================ -->
      <!-- CARD SKELETON                                -->
      <!-- Full card with image and text lines          -->
      <!-- ============================================ -->
      <div 
        *ngSwitchCase="'card'"
        class="skeleton-card"
        [style.width]="width || '100%'">
        <!-- Card image placeholder -->
        <div class="skeleton skeleton-card-image"></div>
        <!-- Card content -->
        <div class="skeleton-card-content">
          <!-- Title line -->
          <div class="skeleton skeleton-text" style="width: 70%; height: 20px;"></div>
          <!-- Description line 1 -->
          <div class="skeleton skeleton-text" style="width: 100%; height: 14px;"></div>
          <!-- Description line 2 -->
          <div class="skeleton skeleton-text" style="width: 85%; height: 14px;"></div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- LIST ITEM SKELETON                           -->
      <!-- List row with avatar and text                -->
      <!-- ============================================ -->
      <div 
        *ngSwitchCase="'list-item'"
        class="skeleton-list-item"
        [style.width]="width || '100%'">
        <!-- Avatar -->
        <div class="skeleton skeleton-circle" style="width: 40px; height: 40px;"></div>
        <!-- Text content -->
        <div class="skeleton-list-content">
          <div class="skeleton skeleton-text" style="width: 60%; height: 16px;"></div>
          <div class="skeleton skeleton-text" style="width: 40%; height: 12px;"></div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- TABLE ROW SKELETON                           -->
      <!-- Table row with multiple cells                -->
      <!-- ============================================ -->
      <div 
        *ngSwitchCase="'table-row'"
        class="skeleton-table-row"
        [style.width]="width || '100%'">
        <div class="skeleton skeleton-text" style="width: 15%; height: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 25%; height: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 20%; height: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 15%; height: 16px;"></div>
        <div class="skeleton skeleton-text" style="width: 10%; height: 16px;"></div>
      </div>

      <!-- ============================================ -->
      <!-- ACTIVITY CARD SKELETON                       -->
      <!-- Activity card specific layout                -->
      <!-- ============================================ -->
      <div 
        *ngSwitchCase="'activity-card'"
        class="skeleton-activity-card"
        [style.width]="width || '100%'">
        <!-- Image -->
        <div class="skeleton skeleton-activity-image"></div>
        <!-- Content -->
        <div class="skeleton-activity-content">
          <!-- Category badge -->
          <div class="skeleton skeleton-text" style="width: 60px; height: 20px; border-radius: 10px;"></div>
          <!-- Title -->
          <div class="skeleton skeleton-text" style="width: 80%; height: 18px;"></div>
          <!-- Venue -->
          <div class="skeleton skeleton-text" style="width: 50%; height: 14px;"></div>
          <!-- Footer row -->
          <div class="skeleton-activity-footer">
            <div class="skeleton skeleton-text" style="width: 80px; height: 14px;"></div>
            <div class="skeleton skeleton-text" style="width: 60px; height: 24px; border-radius: 4px;"></div>
          </div>
        </div>
      </div>

      <!-- ============================================ -->
      <!-- DEFAULT - RECTANGLE                          -->
      <!-- ============================================ -->
      <div 
        *ngSwitchDefault
        class="skeleton skeleton-rectangle"
        [style.width]="width || '100%'"
        [style.height]="height || '20px'"
        [style.border-radius]="borderRadius || '4px'">
      </div>
    </ng-container>
  `,
  styles: [`
    /* Base skeleton styling with animation */
    .skeleton {
      background: linear-gradient(
        90deg,
        #e2e8f0 25%,
        #edf2f7 50%,
        #e2e8f0 75%
      );
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    /* Shimmer animation */
    @keyframes shimmer {
      0% {
        background-position: 200% 0;
      }
      100% {
        background-position: -200% 0;
      }
    }

    /* Text skeleton - inline text line */
    .skeleton-text {
      display: block;
      margin-bottom: 0.5rem;
    }

    .skeleton-text:last-child {
      margin-bottom: 0;
    }

    /* Circle skeleton - avatars, icons */
    .skeleton-circle {
      border-radius: 50%;
      flex-shrink: 0;
    }

    /* Rectangle skeleton - images, blocks */
    .skeleton-rectangle {
      display: block;
    }

    /* Card skeleton - full card layout */
    .skeleton-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }

    .skeleton-card-image {
      width: 100%;
      height: 140px;
    }

    .skeleton-card-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    /* List item skeleton */
    .skeleton-list-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 0;
    }

    .skeleton-list-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 0.375rem;
    }

    /* Table row skeleton */
    .skeleton-table-row {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem 0;
      border-bottom: 1px solid #e2e8f0;
    }

    /* Activity card skeleton */
    .skeleton-activity-card {
      border: 1px solid #e2e8f0;
      border-radius: 12px;
      overflow: hidden;
    }

    .skeleton-activity-image {
      width: 100%;
      height: 160px;
    }

    .skeleton-activity-content {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .skeleton-activity-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: 0.5rem;
    }
  `]
})
export class SkeletonLoaderComponent {
  // -------------------------------------------------
  // INPUTS
  // -------------------------------------------------
  
  /**
   * Type of skeleton to render
   * Options: 'text', 'circle', 'rectangle', 'card', 
   *          'list-item', 'table-row', 'activity-card'
   * @default 'text'
   */
  @Input() type: 'text' | 'circle' | 'rectangle' | 'card' | 'list-item' | 'table-row' | 'activity-card' = 'text';
  
  /**
   * Width of the skeleton
   * Accepts any CSS width value
   */
  @Input() width?: string;
  
  /**
   * Height of the skeleton
   * Accepts any CSS height value
   */
  @Input() height?: string;
  
  /**
   * Border radius of the skeleton
   * Accepts any CSS border-radius value
   */
  @Input() borderRadius?: string;
}
