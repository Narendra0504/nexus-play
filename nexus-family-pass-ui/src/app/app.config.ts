// =====================================================
// NEXUS FAMILY PASS - APPLICATION CONFIGURATION
// Defines all providers, interceptors, and configuration
// for the Angular application. This is the central
// configuration file for dependency injection.
// =====================================================

// Import Angular core configuration types
import { ApplicationConfig, importProvidersFrom } from '@angular/core';

// Import router configuration function and pre-loading strategy
import { 
  provideRouter,           // Provides routing functionality
  withPreloading,          // Enables route preloading
  PreloadAllModules,       // Strategy to preload all lazy modules
  withComponentInputBinding // Enables route params as component inputs
} from '@angular/router';

// Import HTTP client providers for API calls
import { 
  provideHttpClient,       // Provides HttpClient service
  withInterceptors,        // Enables functional interceptors
  withFetch               // Uses Fetch API instead of XHR
} from '@angular/common/http';

// Import animation providers for Angular Material
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';

// Import the application routes configuration
import { routes } from './app.routes';

// Import custom HTTP interceptors
import { authInterceptor } from './core/interceptors/auth.interceptor';
import { errorInterceptor } from './core/interceptors/error.interceptor';
import { loadingInterceptor } from './core/interceptors/loading.interceptor';

// Import Angular Material date adapter for date pickers
import { MAT_DATE_LOCALE, provideNativeDateAdapter } from '@angular/material/core';

// Import snackbar configuration
import { MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

// -----------------------------------------------------
// APPLICATION CONFIGURATION OBJECT
// This object is passed to bootstrapApplication()
// and defines all application-wide providers
// -----------------------------------------------------
export const appConfig: ApplicationConfig = {
  providers: [
    // -------------------------------------------------
    // ROUTING CONFIGURATION
    // Sets up the Angular Router with our route definitions
    // -------------------------------------------------
    provideRouter(
      routes,                          // Our application routes
      withPreloading(PreloadAllModules), // Preload all lazy-loaded modules in background
      withComponentInputBinding()       // Allow route params to bind to @Input() properties
    ),

    // -------------------------------------------------
    // HTTP CLIENT CONFIGURATION
    // Sets up HttpClient with interceptors for auth,
    // error handling, and loading states
    // -------------------------------------------------
    provideHttpClient(
      withFetch(),                     // Use modern Fetch API for HTTP requests
      withInterceptors([
        authInterceptor,               // Adds JWT token to outgoing requests
        errorInterceptor,              // Handles HTTP errors globally
        loadingInterceptor             // Shows/hides loading indicator
      ])
    ),

    // -------------------------------------------------
    // ANIMATION CONFIGURATION
    // Required for Angular Material components to animate
    // Uses async loading for better initial load performance
    // -------------------------------------------------
    provideAnimationsAsync(),

    // -------------------------------------------------
    // DATE CONFIGURATION
    // Provides native JavaScript Date adapter for
    // Material date pickers with US locale
    // -------------------------------------------------
    provideNativeDateAdapter(),        // Use native Date objects
    {
      provide: MAT_DATE_LOCALE,        // Set date locale
      useValue: 'en-US'                // US date format (MM/DD/YYYY)
    },

    // -------------------------------------------------
    // SNACKBAR (TOAST) DEFAULT CONFIGURATION
    // Sets default options for all snackbar notifications
    // -------------------------------------------------
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {
        duration: 4000,                // Auto-dismiss after 4 seconds
        horizontalPosition: 'right',   // Show on right side
        verticalPosition: 'top',       // Show at top of screen
      }
    },
  ]
};
