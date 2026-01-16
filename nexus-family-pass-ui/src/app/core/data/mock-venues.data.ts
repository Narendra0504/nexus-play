// =====================================================
// NEXUS FAMILY PASS - MOCK VENUES DATA
// Comprehensive mock data for venue profiles
// including ratings, locations, and activity counts.
// =====================================================

/**
 * Venue interface for mock data
 */
export interface MockVenue {
  /** Unique venue ID */
  id: string;
  
  /** Venue name */
  name: string;
  
  /** Venue description */
  description: string;
  
  /** Primary category */
  category: string;
  
  /** Full address */
  address: string;
  
  /** City */
  city: string;
  
  /** State */
  state: string;
  
  /** ZIP code */
  zipCode: string;
  
  /** Phone number */
  phone: string;
  
  /** Email */
  email: string;
  
  /** Website URL */
  website?: string;
  
  /** Venue image URL */
  imageUrl: string;
  
  /** Average rating (1-5) */
  rating: number;
  
  /** Number of reviews */
  reviewCount: number;
  
  /** Number of activities offered */
  activityCount: number;
  
  /** Total bookings received */
  totalBookings: number;
  
  /** Venue status */
  status: 'active' | 'pending' | 'suspended';
  
  /** Application/approval date */
  approvedAt?: string;
  
  /** Verified venue badge */
  isVerified: boolean;
  
  /** Accessibility features */
  accessibilityFeatures: string[];
  
  /** Operating hours */
  operatingHours: {
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  };
}

/**
 * MOCK_VENUES - Sample venue data
 */
export const MOCK_VENUES: MockVenue[] = [
  // =====================================================
  // STEM VENUES
  // =====================================================
  {
    id: 'ven_001',
    name: 'Code Ninjas West',
    description: 'Premier coding and robotics center for kids. We make learning to code fun through game-based curriculum and hands-on projects.',
    category: 'STEM',
    address: '123 Tech Park Drive',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94102',
    phone: '(415) 555-0101',
    email: 'west@codeninjas.com',
    website: 'https://codeninjas.com/west',
    imageUrl: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600',
    rating: 4.8,
    reviewCount: 156,
    activityCount: 6,
    totalBookings: 2340,
    status: 'active',
    approvedAt: '2023-06-15',
    isVerified: true,
    accessibilityFeatures: ['wheelchair-accessible', 'hearing-support'],
    operatingHours: {
      monday: '3:00 PM - 8:00 PM',
      tuesday: '3:00 PM - 8:00 PM',
      wednesday: '3:00 PM - 8:00 PM',
      thursday: '3:00 PM - 8:00 PM',
      friday: '3:00 PM - 8:00 PM',
      saturday: '9:00 AM - 6:00 PM',
      sunday: '10:00 AM - 4:00 PM'
    }
  },
  {
    id: 'ven_009',
    name: 'Discovery Science Center',
    description: 'Interactive science museum offering hands-on experiments and STEM programs for curious young minds.',
    category: 'STEM',
    address: '111 Science Way',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94105',
    phone: '(415) 555-0109',
    email: 'programs@discoveryscience.org',
    imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600',
    rating: 4.7,
    reviewCount: 89,
    activityCount: 4,
    totalBookings: 1120,
    status: 'active',
    approvedAt: '2023-08-20',
    isVerified: true,
    accessibilityFeatures: ['wheelchair-accessible', 'sensory-friendly'],
    operatingHours: {
      monday: 'Closed',
      tuesday: '10:00 AM - 5:00 PM',
      wednesday: '10:00 AM - 5:00 PM',
      thursday: '10:00 AM - 5:00 PM',
      friday: '10:00 AM - 5:00 PM',
      saturday: '9:00 AM - 6:00 PM',
      sunday: '9:00 AM - 6:00 PM'
    }
  },

  // =====================================================
  // ARTS VENUES
  // =====================================================
  {
    id: 'ven_002',
    name: 'Art Studio Plus',
    description: 'Creative arts studio offering painting, pottery, and mixed media classes for all skill levels. Express yourself through art!',
    category: 'Arts & Crafts',
    address: '456 Creative Lane',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94103',
    phone: '(415) 555-0102',
    email: 'hello@artstudioplus.com',
    website: 'https://artstudioplus.com',
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
    rating: 4.6,
    reviewCount: 98,
    activityCount: 5,
    totalBookings: 1567,
    status: 'active',
    approvedAt: '2023-07-01',
    isVerified: true,
    accessibilityFeatures: ['wheelchair-accessible'],
    operatingHours: {
      monday: '10:00 AM - 6:00 PM',
      tuesday: '10:00 AM - 6:00 PM',
      wednesday: '10:00 AM - 8:00 PM',
      thursday: '10:00 AM - 8:00 PM',
      friday: '10:00 AM - 6:00 PM',
      saturday: '9:00 AM - 5:00 PM',
      sunday: '11:00 AM - 4:00 PM'
    }
  },

  // =====================================================
  // SPORTS VENUES
  // =====================================================
  {
    id: 'ven_003',
    name: 'Sports Academy',
    description: 'Comprehensive youth sports facility offering soccer, basketball, gymnastics, martial arts, and more. Building champions!',
    category: 'Sports',
    address: '789 Athletic Way',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94110',
    phone: '(415) 555-0103',
    email: 'info@sportsacademy.com',
    website: 'https://sportsacademy.com',
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
    rating: 4.5,
    reviewCount: 234,
    activityCount: 5,
    totalBookings: 3210,
    status: 'active',
    approvedAt: '2023-05-10',
    isVerified: true,
    accessibilityFeatures: ['wheelchair-accessible'],
    operatingHours: {
      monday: '6:00 AM - 9:00 PM',
      tuesday: '6:00 AM - 9:00 PM',
      wednesday: '6:00 AM - 9:00 PM',
      thursday: '6:00 AM - 9:00 PM',
      friday: '6:00 AM - 9:00 PM',
      saturday: '7:00 AM - 7:00 PM',
      sunday: '8:00 AM - 5:00 PM'
    }
  },
  {
    id: 'ven_010',
    name: 'Aquatic Center',
    description: 'State-of-the-art swimming facility with heated pools and certified instructors for all age groups.',
    category: 'Sports',
    address: '999 Pool Lane',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94112',
    phone: '(415) 555-0110',
    email: 'swim@aquaticcenter.com',
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600',
    rating: 4.9,
    reviewCount: 312,
    activityCount: 3,
    totalBookings: 4521,
    status: 'active',
    approvedAt: '2023-04-15',
    isVerified: true,
    accessibilityFeatures: ['wheelchair-accessible', 'pool-lift'],
    operatingHours: {
      monday: '6:00 AM - 10:00 PM',
      tuesday: '6:00 AM - 10:00 PM',
      wednesday: '6:00 AM - 10:00 PM',
      thursday: '6:00 AM - 10:00 PM',
      friday: '6:00 AM - 10:00 PM',
      saturday: '7:00 AM - 8:00 PM',
      sunday: '8:00 AM - 6:00 PM'
    }
  },

  // =====================================================
  // MUSIC VENUES
  // =====================================================
  {
    id: 'ven_004',
    name: 'Music Academy',
    description: 'Full-service music school offering lessons in piano, guitar, drums, voice, and ensemble programs.',
    category: 'Music',
    address: '321 Harmony Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94107',
    phone: '(415) 555-0104',
    email: 'lessons@musicacademy.com',
    website: 'https://musicacademy.com',
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    rating: 4.7,
    reviewCount: 145,
    activityCount: 4,
    totalBookings: 1890,
    status: 'active',
    approvedAt: '2023-06-20',
    isVerified: true,
    accessibilityFeatures: ['wheelchair-accessible', 'hearing-support'],
    operatingHours: {
      monday: '2:00 PM - 8:00 PM',
      tuesday: '2:00 PM - 8:00 PM',
      wednesday: '2:00 PM - 8:00 PM',
      thursday: '2:00 PM - 8:00 PM',
      friday: '2:00 PM - 7:00 PM',
      saturday: '9:00 AM - 5:00 PM',
      sunday: '10:00 AM - 3:00 PM'
    }
  },

  // =====================================================
  // NATURE VENUES
  // =====================================================
  {
    id: 'ven_005',
    name: 'Green Park Nature Center',
    description: 'Urban nature center offering outdoor education, gardening programs, and nature exploration for young environmentalists.',
    category: 'Nature',
    address: '222 Nature Trail',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94117',
    phone: '(415) 555-0105',
    email: 'explore@greenparknature.org',
    imageUrl: 'https://images.unsplash.com/photo-1500756194400-f2f1eae2ab1a?w=600',
    rating: 4.6,
    reviewCount: 67,
    activityCount: 3,
    totalBookings: 876,
    status: 'active',
    approvedAt: '2023-09-01',
    isVerified: true,
    accessibilityFeatures: [],
    operatingHours: {
      monday: 'Closed',
      tuesday: '9:00 AM - 5:00 PM',
      wednesday: '9:00 AM - 5:00 PM',
      thursday: '9:00 AM - 5:00 PM',
      friday: '9:00 AM - 5:00 PM',
      saturday: '8:00 AM - 6:00 PM',
      sunday: '8:00 AM - 6:00 PM'
    }
  },

  // =====================================================
  // COOKING VENUES
  // =====================================================
  {
    id: 'ven_006',
    name: 'Culinary Kids',
    description: 'Kid-friendly cooking school where young chefs learn real cooking skills, nutrition, and global cuisines.',
    category: 'Cooking',
    address: '555 Gourmet Plaza',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94108',
    phone: '(415) 555-0106',
    email: 'cook@culinarykids.com',
    website: 'https://culinarykids.com',
    imageUrl: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=600',
    rating: 4.8,
    reviewCount: 178,
    activityCount: 3,
    totalBookings: 2134,
    status: 'active',
    approvedAt: '2023-07-15',
    isVerified: true,
    accessibilityFeatures: ['wheelchair-accessible'],
    operatingHours: {
      monday: 'Closed',
      tuesday: '3:00 PM - 7:00 PM',
      wednesday: '3:00 PM - 7:00 PM',
      thursday: '3:00 PM - 7:00 PM',
      friday: '3:00 PM - 7:00 PM',
      saturday: '9:00 AM - 4:00 PM',
      sunday: '10:00 AM - 3:00 PM'
    }
  },

  // =====================================================
  // DANCE VENUES
  // =====================================================
  {
    id: 'ven_007',
    name: 'Dance Studio SF',
    description: 'Premier dance studio offering ballet, hip hop, contemporary, and creative movement classes for all ages.',
    category: 'Dance',
    address: '777 Rhythm Road',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94109',
    phone: '(415) 555-0107',
    email: 'dance@dancestudiosf.com',
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    rating: 4.7,
    reviewCount: 123,
    activityCount: 2,
    totalBookings: 1654,
    status: 'active',
    approvedAt: '2023-08-01',
    isVerified: true,
    accessibilityFeatures: ['hearing-support'],
    operatingHours: {
      monday: '3:00 PM - 9:00 PM',
      tuesday: '3:00 PM - 9:00 PM',
      wednesday: '3:00 PM - 9:00 PM',
      thursday: '3:00 PM - 9:00 PM',
      friday: '3:00 PM - 8:00 PM',
      saturday: '9:00 AM - 5:00 PM',
      sunday: '10:00 AM - 4:00 PM'
    }
  },

  // =====================================================
  // DRAMA VENUES
  // =====================================================
  {
    id: 'ven_008',
    name: 'Drama Academy',
    description: 'Theatre arts school fostering creativity, confidence, and performance skills through acting, improv, and stagecraft.',
    category: 'Drama',
    address: '444 Stage Street',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94114',
    phone: '(415) 555-0108',
    email: 'act@dramaacademy.com',
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600',
    rating: 4.8,
    reviewCount: 87,
    activityCount: 2,
    totalBookings: 934,
    status: 'active',
    approvedAt: '2023-09-10',
    isVerified: true,
    accessibilityFeatures: ['wheelchair-accessible', 'hearing-support'],
    operatingHours: {
      monday: 'Closed',
      tuesday: '3:00 PM - 8:00 PM',
      wednesday: '3:00 PM - 8:00 PM',
      thursday: '3:00 PM - 8:00 PM',
      friday: '3:00 PM - 8:00 PM',
      saturday: '10:00 AM - 6:00 PM',
      sunday: '12:00 PM - 5:00 PM'
    }
  },

  // =====================================================
  // PENDING VENUES
  // =====================================================
  {
    id: 'ven_100',
    name: 'New Music Studio',
    description: 'Modern music production and instrument lessons for aspiring young musicians.',
    category: 'Music',
    address: '888 Beat Boulevard',
    city: 'San Francisco',
    state: 'CA',
    zipCode: '94115',
    phone: '(415) 555-0200',
    email: 'info@newmusicstudio.com',
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    rating: 0,
    reviewCount: 0,
    activityCount: 0,
    totalBookings: 0,
    status: 'pending',
    isVerified: false,
    accessibilityFeatures: ['wheelchair-accessible'],
    operatingHours: {
      monday: '2:00 PM - 8:00 PM',
      tuesday: '2:00 PM - 8:00 PM',
      wednesday: '2:00 PM - 8:00 PM',
      thursday: '2:00 PM - 8:00 PM',
      friday: '2:00 PM - 8:00 PM',
      saturday: '10:00 AM - 6:00 PM',
      sunday: 'Closed'
    }
  }
];

/**
 * getVenueById - Find venue by ID
 */
export function getVenueById(id: string): MockVenue | undefined {
  return MOCK_VENUES.find(v => v.id === id);
}

/**
 * getVenuesByCategory - Filter venues by category
 */
export function getVenuesByCategory(category: string): MockVenue[] {
  return MOCK_VENUES.filter(v => v.category === category);
}

/**
 * getVenuesByStatus - Filter venues by status
 */
export function getVenuesByStatus(status: MockVenue['status']): MockVenue[] {
  return MOCK_VENUES.filter(v => v.status === status);
}

/**
 * getActiveVenues - Get all active venues
 */
export function getActiveVenues(): MockVenue[] {
  return MOCK_VENUES.filter(v => v.status === 'active');
}
