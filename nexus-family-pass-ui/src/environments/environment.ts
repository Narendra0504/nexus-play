// =====================================================
// NEXUS FAMILY PASS - ENVIRONMENT CONFIGURATION
// Development environment settings
// =====================================================

/**
 * Environment configuration for development
 * 
 * Contains environment-specific settings that differ
 * between development, staging, and production.
 */
export const environment = {
  // -------------------------------------------------
  // ENVIRONMENT FLAGS
  // -------------------------------------------------
  
  /**
   * Production mode flag
   * false = development mode with debug features
   */
  production: false,

  // -------------------------------------------------
  // API CONFIGURATION
  // -------------------------------------------------
  
  /**
   * Base URL for API requests
   * Development uses localhost backend
   */
  apiUrl: 'http://localhost:3000/api',

  /**
   * WebSocket URL for real-time features
   */
  wsUrl: 'ws://localhost:3000/ws',

  // -------------------------------------------------
  // FEATURE FLAGS
  // -------------------------------------------------
  
  /**
   * Enable mock data mode
   * When true, services return mock data instead of API calls
   */
  useMockData: true,

  /**
   * Enable debug logging
   */
  enableDebugLog: true,

  /**
   * Enable AI-powered features
   */
  enableAiFeatures: true,

  /**
   * Enable natural language search
   */
  enableNlSearch: true,

  // -------------------------------------------------
  // AUTHENTICATION
  // -------------------------------------------------
  
  /**
   * OAuth/SSO configuration
   */
  auth: {
    /** SSO provider URL */
    ssoUrl: 'https://sso.example.com',
    
    /** OAuth client ID */
    clientId: 'nexus-family-pass-dev',
    
    /** Token refresh interval (ms) */
    refreshInterval: 300000, // 5 minutes
    
    /** Session timeout (ms) */
    sessionTimeout: 3600000 // 1 hour
  },

  // -------------------------------------------------
  // EXTERNAL SERVICES
  // -------------------------------------------------
  
  /**
   * Google Maps API key for venue maps
   */
  googleMapsApiKey: 'YOUR_GOOGLE_MAPS_API_KEY',

  /**
   * Analytics tracking ID
   */
  analyticsId: 'UA-XXXXXXXXX-X',

  // -------------------------------------------------
  // APPLICATION SETTINGS
  // -------------------------------------------------
  
  /**
   * Default pagination size
   */
  defaultPageSize: 10,

  /**
   * Maximum file upload size (bytes)
   */
  maxUploadSize: 5242880, // 5MB

  /**
   * Supported image types for uploads
   */
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],

  /**
   * Credit expiry warning threshold (days)
   */
  creditExpiryWarningDays: 7
};
