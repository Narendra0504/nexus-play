// =====================================================
// NEXUS FAMILY PASS - PRODUCTION ENVIRONMENT
// Production environment settings
// =====================================================

/**
 * Environment configuration for production
 * 
 * Production-specific settings with optimizations
 * and real API endpoints.
 */
export const environment = {
  // -------------------------------------------------
  // ENVIRONMENT FLAGS
  // -------------------------------------------------
  
  /**
   * Production mode flag
   * true = production mode with optimizations
   */
  production: true,

  // -------------------------------------------------
  // API CONFIGURATION
  // -------------------------------------------------
  
  /**
   * Base URL for API requests
   * Production API endpoint
   */
  apiUrl: 'https://api.nexusfamilypass.com/api',

  /**
   * WebSocket URL for real-time features
   */
  wsUrl: 'wss://api.nexusfamilypass.com/ws',

  // -------------------------------------------------
  // FEATURE FLAGS
  // -------------------------------------------------
  
  /**
   * Disable mock data in production
   */
  useMockData: false,

  /**
   * Disable debug logging in production
   */
  enableDebugLog: false,

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
    ssoUrl: 'https://sso.nexusfamilypass.com',
    
    /** OAuth client ID */
    clientId: 'nexus-family-pass-prod',
    
    /** Token refresh interval (ms) */
    refreshInterval: 300000,
    
    /** Session timeout (ms) */
    sessionTimeout: 3600000
  },

  // -------------------------------------------------
  // EXTERNAL SERVICES
  // -------------------------------------------------
  
  /**
   * Google Maps API key (production key)
   */
  googleMapsApiKey: 'PRODUCTION_GOOGLE_MAPS_API_KEY',

  /**
   * Analytics tracking ID
   */
  analyticsId: 'UA-PRODUCTION-ID',

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
  maxUploadSize: 5242880,

  /**
   * Supported image types for uploads
   */
  supportedImageTypes: ['image/jpeg', 'image/png', 'image/webp'],

  /**
   * Credit expiry warning threshold (days)
   */
  creditExpiryWarningDays: 7
};
