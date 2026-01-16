// =====================================================
// NEXUS FAMILY PASS - MOCK USERS DATA
// Demo user accounts for testing and development
// Represents different user roles and scenarios
// =====================================================

// Import User model and role enum
import { User, UserRole } from '../models';

/**
 * MOCK_USERS - Array of demo user accounts
 * 
 * Contains sample users for each role type:
 * - 3 Parent accounts (with different scenarios)
 * - 1 HR Admin account
 * - 2 Venue Admin accounts
 * - 1 Platform Admin account
 * 
 * Use these credentials to test different portals
 */
export const MOCK_USERS: User[] = [
  // -------------------------------------------------
  // PARENT USERS
  // Regular parents who book activities for children
  // -------------------------------------------------
  {
    id: 'usr_parent_001',                        // Unique identifier
    email: 'sarah.johnson@example.com',          // Login email
    firstName: 'Sarah',                          // First name
    lastName: 'Johnson',                         // Last name
    role: UserRole.PARENT,                       // Parent role
    phone: '+1 (555) 123-4567',                 // Phone number
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', // Avatar
    isActive: true,                              // Account is active
    isEmailVerified: true,                       // Email verified
    mfaEnabled: false,                           // MFA not enabled
    lastLoginAt: new Date('2024-01-14T10:30:00'), // Last login
    createdAt: new Date('2023-06-15'),           // Account created
    updatedAt: new Date('2024-01-14')            // Last updated
  },
  {
    id: 'usr_parent_002',                        // Second parent user
    email: 'michael.chen@example.com',           // Login email
    firstName: 'Michael',                        // First name
    lastName: 'Chen',                            // Last name
    role: UserRole.PARENT,                       // Parent role
    phone: '+1 (555) 234-5678',                 // Phone number
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: true,                            // Has MFA enabled
    lastLoginAt: new Date('2024-01-13T14:20:00'),
    createdAt: new Date('2023-08-22'),
    updatedAt: new Date('2024-01-13')
  },
  {
    id: 'usr_parent_003',                        // Third parent user
    email: 'emily.wilson@example.com',           // Login email
    firstName: 'Emily',                          // First name
    lastName: 'Wilson',                          // Last name
    role: UserRole.PARENT,                       // Parent role
    phone: '+1 (555) 345-6789',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emily',
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: false,
    lastLoginAt: new Date('2024-01-12T09:15:00'),
    createdAt: new Date('2023-09-10'),
    updatedAt: new Date('2024-01-12')
  },

  // -------------------------------------------------
  // HR ADMIN USER
  // Corporate HR who manages employee benefit enrollment
  // -------------------------------------------------
  {
    id: 'usr_hr_001',                            // Unique identifier
    email: 'hr.admin@techcorp.com',              // Corporate email
    firstName: 'Jennifer',                       // First name
    lastName: 'Martinez',                        // Last name
    role: UserRole.HR_ADMIN,                     // HR Admin role
    phone: '+1 (555) 456-7890',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jennifer',
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: true,                            // MFA enabled for security
    lastLoginAt: new Date('2024-01-14T08:00:00'),
    createdAt: new Date('2023-05-01'),
    updatedAt: new Date('2024-01-14')
  },

  // -------------------------------------------------
  // VENUE ADMIN USERS
  // Business owners who manage activity venues
  // -------------------------------------------------
  {
    id: 'usr_venue_001',                         // First venue admin
    email: 'owner@codeninjaswest.com',           // Venue email
    firstName: 'David',                          // First name
    lastName: 'Thompson',                        // Last name
    role: UserRole.VENUE_ADMIN,                  // Venue Admin role
    phone: '+1 (555) 567-8901',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: false,
    lastLoginAt: new Date('2024-01-14T11:45:00'),
    createdAt: new Date('2023-04-20'),
    updatedAt: new Date('2024-01-14')
  },
  {
    id: 'usr_venue_002',                         // Second venue admin
    email: 'hello@artfulkids.com',               // Venue email
    firstName: 'Amanda',                         // First name
    lastName: 'Rivera',                          // Last name
    role: UserRole.VENUE_ADMIN,                  // Venue Admin role
    phone: '+1 (555) 678-9012',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Amanda',
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: false,
    lastLoginAt: new Date('2024-01-13T16:30:00'),
    createdAt: new Date('2023-07-15'),
    updatedAt: new Date('2024-01-13')
  },

  // -------------------------------------------------
  // PLATFORM ADMIN USER
  // System administrator with full platform access
  // -------------------------------------------------
  {
    id: 'usr_admin_001',                         // Unique identifier
    email: 'admin@nexusfamilypass.com',          // Platform email
    firstName: 'Robert',                         // First name
    lastName: 'Admin',                           // Last name
    role: UserRole.PLATFORM_ADMIN,               // Platform Admin role
    phone: '+1 (555) 789-0123',
    avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Robert',
    isActive: true,
    isEmailVerified: true,
    mfaEnabled: true,                            // MFA required for admins
    lastLoginAt: new Date('2024-01-14T07:30:00'),
    createdAt: new Date('2023-01-01'),           // First user created
    updatedAt: new Date('2024-01-14')
  }
];

/**
 * Demo Login Credentials Reference
 * 
 * Parent Portal:
 * - Email: sarah.johnson@example.com (any password)
 * - Email: michael.chen@example.com (any password)
 * - Email: emily.wilson@example.com (any password)
 * 
 * HR Portal:
 * - Email: hr.admin@techcorp.com (any password)
 * 
 * Venue Portal:
 * - Email: owner@codeninjaswest.com (any password)
 * - Email: hello@artfulkids.com (any password)
 * 
 * Admin Portal:
 * - Email: admin@nexusfamilypass.com (any password)
 * 
 * Note: Password is ignored in mock mode - any value works
 */
