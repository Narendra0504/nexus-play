// =====================================================
// NEXUS FAMILY PASS - MAIN ENTRY POINT
// This file bootstraps the Angular application
// It's the first TypeScript file that executes
// =====================================================

// Import the function that bootstraps a standalone Angular application
import { bootstrapApplication } from '@angular/platform-browser';

// Import the root component that serves as the application shell
import { AppComponent } from './app/app.component';

// Import the application configuration (providers, routes, etc.)
import { appConfig } from './app/app.config';

// -----------------------------------------------------
// APPLICATION BOOTSTRAP
// This is where Angular starts - it mounts the root
// component to the DOM and initializes all providers
// -----------------------------------------------------
bootstrapApplication(AppComponent, appConfig)  // Bootstrap with root component and config
  .catch((err) => console.error(err));         // Log any bootstrap errors to console
