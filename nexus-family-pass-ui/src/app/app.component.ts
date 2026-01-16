// =====================================================
// NEXUS FAMILY PASS - ROOT APPLICATION COMPONENT
// This is the root component that wraps the entire
// application. It contains the router outlet where
// all other components are rendered.
// =====================================================

// Import Angular core decorators and types
import { Component } from '@angular/core';

// Import RouterOutlet for rendering child routes
import { RouterOutlet } from '@angular/router';

// Import CommonModule for common Angular directives
import { CommonModule } from '@angular/common';

/**
 * AppComponent - Root Application Component
 * 
 * This component serves as the application shell. It is the first
 * component that Angular renders and contains the router-outlet
 * where all other page components are dynamically loaded.
 * 
 * The component is intentionally minimal - layout logic is delegated
 * to specific layout components (ParentLayout, HrLayout, etc.) that
 * are loaded based on the current route.
 */
@Component({
  // CSS selector - matches <app-root> in index.html
  selector: 'app-root',
  
  // This is a standalone component (Angular 17+ pattern)
  standalone: true,
  
  // Import required modules for this component
  imports: [
    CommonModule,     // Provides *ngIf, *ngFor, and other common directives
    RouterOutlet      // Provides <router-outlet> for child route rendering
  ],
  
  // Inline template - kept minimal as this is just a shell
  template: `
    <!-- 
      Skip to main content link for accessibility
      Allows keyboard users to skip navigation and go directly to content
    -->
    <a class="skip-link" href="#main-content">
      Skip to main content
    </a>
    
    <!-- 
      Router Outlet - Dynamic content area
      Angular Router renders the matched component here based on the URL
      Each route (login, parent dashboard, etc.) renders inside this outlet
    -->
    <router-outlet></router-outlet>
  `,
  
  // Component-specific styles
  styles: [`
    /* 
     * Host element styling
     * :host targets the component's root element (<app-root>)
     */
    :host {
      display: block;           /* Make host a block element */
      min-height: 100vh;        /* Ensure full viewport height */
    }
  `]
})
export class AppComponent {
  // Application title - can be used in templates or for logging
  title = 'Nexus Family Pass';
  
  /**
   * Constructor
   * Currently empty as no dependencies are needed
   * Services would be injected here if required
   */
  constructor() {
    // Log application initialization for debugging
    console.log('[App] Nexus Family Pass initialized');
  }
}
