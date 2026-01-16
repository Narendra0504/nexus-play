// =====================================================
// NEXUS FAMILY PASS - MOCK ACTIVITIES DATA
// =====================================================
// Comprehensive mock data for 30 sample activities
// across various categories for demo purposes.
// Matches PRD requirement: "25-30 sample activities 
// across categories"
// =====================================================

import { Activity } from '../models';

/**
 * MOCK_ACTIVITIES - Sample activity data
 * 
 * Contains 30 realistic activities across categories:
 * - STEM (6 activities)
 * - Arts & Crafts (5 activities)
 * - Sports (5 activities)
 * - Music (4 activities)
 * - Nature (3 activities)
 * - Cooking (3 activities)
 * - Dance (2 activities)
 * - Drama (2 activities)
 * 
 * Each activity includes full details for UI display
 * including venue scores, availability, and pricing.
 */
export const MOCK_ACTIVITIES: Activity[] = [
  // =====================================================
  // STEM ACTIVITIES (6)
  // =====================================================
  {
    id: 'act_001',
    venueId: 'ven_001',
    name: 'Junior Robotics Workshop',
    description: 'Hands-on robotics for kids! Learn to build and program simple robots using age-appropriate tools. Children will explore basic engineering concepts while having fun with motors, sensors, and creativity.',
    shortDescription: 'Build and program robots with hands-on fun',
    category: 'STEM',
    minAge: 6,
    maxAge: 10,
    duration: 90,
    creditCost: 2,
    imageUrl: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=600',
    tags: ['indoor', 'educational', 'hands-on', 'technology'],
    status: 'active',
    rating: 4.8,
    reviewCount: 45,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Basic programming concepts', 'Problem solving', 'Teamwork', 'Motor and sensor basics'],
    whatToBring: ['Comfortable clothes', 'Water bottle'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_002',
    venueId: 'ven_001',
    name: 'Coding for Kids - Scratch',
    description: 'Introduction to programming through games and interactive projects. Using visual programming tools like Scratch, children learn logical thinking, sequencing, and basic coding concepts in a fun environment.',
    shortDescription: 'Learn programming through games',
    category: 'STEM',
    minAge: 8,
    maxAge: 12,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
    tags: ['indoor', 'educational', 'technology', 'creative'],
    status: 'active',
    rating: 4.9,
    reviewCount: 52,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Logical thinking', 'Sequencing', 'Basic algorithms', 'Game design basics'],
    whatToBring: ['Nothing required'],
    accessibilityFeatures: ['wheelchair-accessible', 'hearing-support']
  },
  {
    id: 'act_003',
    venueId: 'ven_001',
    name: 'Science Explorers Lab',
    description: 'Exciting hands-on science experiments covering chemistry, physics, and biology. Kids become real scientists with lab coats and safety goggles, conducting age-appropriate experiments that spark curiosity.',
    shortDescription: 'Hands-on science experiments',
    category: 'STEM',
    minAge: 5,
    maxAge: 9,
    duration: 75,
    creditCost: 2,
    imageUrl: 'https://images.unsplash.com/photo-1567306226416-28f0efdc88ce?w=600',
    tags: ['indoor', 'educational', 'hands-on', 'messy'],
    status: 'active',
    rating: 4.7,
    reviewCount: 38,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Scientific method', 'Chemical reactions', 'Physics principles', 'Observation skills'],
    whatToBring: ['Clothes that can get messy'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_004',
    venueId: 'ven_001',
    name: 'Video Game Design Workshop',
    description: 'Create your own video games! Learn game design principles, storytelling, and basic programming to build playable games. Perfect for young aspiring game developers.',
    shortDescription: 'Design and create video games',
    category: 'STEM',
    minAge: 10,
    maxAge: 14,
    duration: 120,
    creditCost: 2,
    imageUrl: 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=600',
    tags: ['indoor', 'educational', 'technology', 'creative'],
    status: 'active',
    rating: 4.9,
    reviewCount: 28,
    parentRequired: false,
    skillLevel: 'intermediate',
    whatToLearn: ['Game design principles', 'Storytelling', 'Basic programming', 'Creative problem solving'],
    whatToBring: ['USB drive to save projects'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_005',
    venueId: 'ven_001',
    name: '3D Printing Adventure',
    description: 'Learn to design and print 3D objects! Kids use simple CAD software to create designs, then watch them come to life on a 3D printer. Take home your creation!',
    shortDescription: 'Design and print 3D objects',
    category: 'STEM',
    minAge: 8,
    maxAge: 14,
    duration: 90,
    creditCost: 2,
    imageUrl: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?w=600',
    tags: ['indoor', 'educational', 'technology', 'creative'],
    status: 'active',
    rating: 4.6,
    reviewCount: 22,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['3D design basics', 'CAD software', 'Manufacturing concepts', 'Spatial reasoning'],
    whatToBring: ['Nothing required'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_006',
    venueId: 'ven_001',
    name: 'Math Wizards Club',
    description: 'Make math fun with puzzles, games, and challenges! Build number sense and problem-solving skills through engaging activities that make mathematics exciting.',
    shortDescription: 'Fun math puzzles and games',
    category: 'STEM',
    minAge: 6,
    maxAge: 10,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=600',
    tags: ['indoor', 'educational', 'competitive'],
    status: 'active',
    rating: 4.5,
    reviewCount: 19,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Number sense', 'Problem solving', 'Logical thinking', 'Pattern recognition'],
    whatToBring: ['Nothing required'],
    accessibilityFeatures: ['wheelchair-accessible', 'sensory-friendly']
  },

  // =====================================================
  // ARTS & CRAFTS ACTIVITIES (5)
  // =====================================================
  {
    id: 'act_007',
    venueId: 'ven_002',
    name: 'Creative Art Studio',
    description: 'Express creativity through painting, drawing, and mixed media. Each session explores different techniques and materials, from watercolors to collage. All skill levels welcome!',
    shortDescription: 'Painting and creative arts',
    category: 'Arts & Crafts',
    minAge: 4,
    maxAge: 12,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600',
    tags: ['indoor', 'creative', 'messy', 'calm'],
    status: 'active',
    rating: 4.6,
    reviewCount: 32,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Color theory', 'Brush techniques', 'Creative expression', 'Art history basics'],
    whatToBring: ['Smock or old clothes'],
    accessibilityFeatures: ['wheelchair-accessible', 'sensory-friendly']
  },
  {
    id: 'act_008',
    venueId: 'ven_002',
    name: 'Pottery & Clay Studio',
    description: 'Get your hands dirty with clay! Learn hand-building techniques, try the pottery wheel, and create functional and decorative pieces. All creations are fired and glazed.',
    shortDescription: 'Hand-building and pottery wheel',
    category: 'Arts & Crafts',
    minAge: 6,
    maxAge: 14,
    duration: 90,
    creditCost: 2,
    imageUrl: 'https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=600',
    tags: ['indoor', 'creative', 'messy', 'calm'],
    status: 'active',
    rating: 4.8,
    reviewCount: 41,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Clay techniques', 'Wheel throwing basics', 'Glazing', '3D form creation'],
    whatToBring: ['Clothes that can get dirty', 'Hair tie for long hair'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_009',
    venueId: 'ven_002',
    name: 'Jewelry Making Workshop',
    description: 'Design and create your own jewelry! Learn beading, wire wrapping, and charm making. Each child takes home their unique creations.',
    shortDescription: 'Create unique jewelry pieces',
    category: 'Arts & Crafts',
    minAge: 7,
    maxAge: 13,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=600',
    tags: ['indoor', 'creative', 'calm', 'solo-friendly'],
    status: 'active',
    rating: 4.5,
    reviewCount: 24,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Beading techniques', 'Wire work', 'Design principles', 'Fine motor skills'],
    whatToBring: ['Nothing required'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_010',
    venueId: 'ven_002',
    name: 'Comic Book Creators',
    description: 'Create your own comic book! Learn character design, storytelling through panels, and illustration techniques. By the end, you\'ll have your own comic to take home.',
    shortDescription: 'Design and draw comic books',
    category: 'Arts & Crafts',
    minAge: 8,
    maxAge: 14,
    duration: 90,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1588497859490-85d1c17db96d?w=600',
    tags: ['indoor', 'creative', 'calm', 'solo-friendly'],
    status: 'active',
    rating: 4.7,
    reviewCount: 18,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Character design', 'Visual storytelling', 'Panel layout', 'Illustration techniques'],
    whatToBring: ['Pencil case if you have favorite drawing tools'],
    accessibilityFeatures: ['wheelchair-accessible', 'sensory-friendly']
  },
  {
    id: 'act_011',
    venueId: 'ven_002',
    name: 'Textile Arts & Sewing',
    description: 'Learn basic sewing and textile arts! From hand sewing to simple machine projects, create pouches, stuffed animals, and more.',
    shortDescription: 'Sewing and fabric crafts',
    category: 'Arts & Crafts',
    minAge: 8,
    maxAge: 14,
    duration: 75,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600',
    tags: ['indoor', 'creative', 'calm', 'educational'],
    status: 'active',
    rating: 4.4,
    reviewCount: 15,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Hand sewing', 'Machine basics', 'Pattern reading', 'Fabric selection'],
    whatToBring: ['Nothing required'],
    accessibilityFeatures: ['wheelchair-accessible']
  },

  // =====================================================
  // SPORTS ACTIVITIES (5)
  // =====================================================
  {
    id: 'act_012',
    venueId: 'ven_003',
    name: 'Soccer Skills Camp',
    description: 'Learn soccer fundamentals in a fun, supportive environment. Dribbling, passing, shooting, and teamwork skills are taught through games and drills.',
    shortDescription: 'Soccer fundamentals and games',
    category: 'Sports',
    minAge: 5,
    maxAge: 10,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600',
    tags: ['outdoor', 'active', 'team', 'competitive'],
    status: 'active',
    rating: 4.5,
    reviewCount: 28,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Dribbling', 'Passing', 'Shooting', 'Teamwork'],
    whatToBring: ['Soccer cleats or sneakers', 'Shin guards', 'Water bottle'],
    accessibilityFeatures: []
  },
  {
    id: 'act_013',
    venueId: 'ven_003',
    name: 'Swimming Lessons',
    description: 'Learn to swim or improve your skills! Small group lessons with certified instructors. All levels from beginner to advanced available.',
    shortDescription: 'Swimming for all levels',
    category: 'Sports',
    minAge: 4,
    maxAge: 12,
    duration: 45,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?w=600',
    tags: ['indoor', 'active', 'individual', 'physical'],
    status: 'active',
    rating: 4.9,
    reviewCount: 67,
    parentRequired: true,
    skillLevel: 'beginner',
    whatToLearn: ['Water safety', 'Stroke techniques', 'Breathing', 'Floating'],
    whatToBring: ['Swimsuit', 'Towel', 'Goggles optional'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_014',
    venueId: 'ven_003',
    name: 'Gymnastics Fundamentals',
    description: 'Build strength, flexibility, and coordination through gymnastics! Learn rolls, cartwheels, balance beam basics, and more in a safe, padded environment.',
    shortDescription: 'Tumbling and gymnastics basics',
    category: 'Sports',
    minAge: 4,
    maxAge: 10,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1566241832378-917a0f30db2f?w=600',
    tags: ['indoor', 'active', 'individual', 'physical'],
    status: 'active',
    rating: 4.7,
    reviewCount: 43,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Rolls and tumbling', 'Balance', 'Flexibility', 'Coordination'],
    whatToBring: ['Leotard or tight-fitting clothes', 'Hair tied back'],
    accessibilityFeatures: []
  },
  {
    id: 'act_015',
    venueId: 'ven_003',
    name: 'Basketball Basics',
    description: 'Learn basketball fundamentals including dribbling, shooting, passing, and basic plays. Focus on fun and skill development rather than competition.',
    shortDescription: 'Basketball skills and games',
    category: 'Sports',
    minAge: 6,
    maxAge: 12,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600',
    tags: ['indoor', 'active', 'team', 'competitive'],
    status: 'active',
    rating: 4.6,
    reviewCount: 31,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Dribbling', 'Shooting form', 'Passing', 'Team play'],
    whatToBring: ['Basketball shoes or sneakers', 'Water bottle'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_016',
    venueId: 'ven_003',
    name: 'Martial Arts for Kids',
    description: 'Introduction to martial arts focusing on discipline, respect, and self-defense basics. Build confidence and physical fitness in a structured environment.',
    shortDescription: 'Self-defense and discipline',
    category: 'Sports',
    minAge: 5,
    maxAge: 12,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600',
    tags: ['indoor', 'active', 'individual', 'physical'],
    status: 'active',
    rating: 4.8,
    reviewCount: 39,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Basic stances', 'Self-defense', 'Discipline', 'Respect'],
    whatToBring: ['Comfortable clothes (uniform provided if needed)'],
    accessibilityFeatures: []
  },

  // =====================================================
  // MUSIC ACTIVITIES (4)
  // =====================================================
  {
    id: 'act_017',
    venueId: 'ven_004',
    name: 'Piano for Beginners',
    description: 'Introduction to piano with focus on fun and fundamentals. Learn to read basic music, play simple songs, and develop proper technique.',
    shortDescription: 'Learn piano basics',
    category: 'Music',
    minAge: 5,
    maxAge: 12,
    duration: 45,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1552422535-c45813c61732?w=600',
    tags: ['indoor', 'individual', 'calm', 'educational'],
    status: 'active',
    rating: 4.7,
    reviewCount: 19,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Music reading', 'Finger placement', 'Simple songs', 'Rhythm'],
    whatToBring: ['Nothing required'],
    accessibilityFeatures: ['wheelchair-accessible', 'hearing-support']
  },
  {
    id: 'act_018',
    venueId: 'ven_004',
    name: 'Kids Rock Band',
    description: 'Form a rock band with other kids! Learn guitar, drums, bass, or vocals and perform together. No experience needed - we\'ll teach you!',
    shortDescription: 'Play in a rock band',
    category: 'Music',
    minAge: 8,
    maxAge: 14,
    duration: 90,
    creditCost: 2,
    imageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=600',
    tags: ['indoor', 'team', 'social', 'loud'],
    status: 'active',
    rating: 4.9,
    reviewCount: 26,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Instrument basics', 'Playing together', 'Performance skills', 'Music theory'],
    whatToBring: ['Nothing required - instruments provided'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_019',
    venueId: 'ven_004',
    name: 'Music & Movement',
    description: 'For younger children - explore music through movement, rhythm games, and simple instruments. Develops coordination and musical awareness.',
    shortDescription: 'Music exploration for little ones',
    category: 'Music',
    minAge: 3,
    maxAge: 6,
    duration: 45,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
    tags: ['indoor', 'active', 'social', 'sensory-friendly'],
    status: 'active',
    rating: 4.8,
    reviewCount: 35,
    parentRequired: true,
    skillLevel: 'beginner',
    whatToLearn: ['Rhythm', 'Movement', 'Listening skills', 'Instrument exploration'],
    whatToBring: ['Comfortable clothes for movement'],
    accessibilityFeatures: ['wheelchair-accessible', 'sensory-friendly']
  },
  {
    id: 'act_020',
    venueId: 'ven_004',
    name: 'Ukulele Club',
    description: 'Learn to play the ukulele! This fun, portable instrument is perfect for beginners. Learn chords, strumming, and play popular songs.',
    shortDescription: 'Learn ukulele basics',
    category: 'Music',
    minAge: 6,
    maxAge: 12,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=600',
    tags: ['indoor', 'individual', 'calm', 'educational'],
    status: 'active',
    rating: 4.6,
    reviewCount: 17,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Chord formation', 'Strumming patterns', 'Reading tabs', 'Popular songs'],
    whatToBring: ['Nothing required - ukuleles provided'],
    accessibilityFeatures: ['wheelchair-accessible']
  },

  // =====================================================
  // NATURE ACTIVITIES (3)
  // =====================================================
  {
    id: 'act_021',
    venueId: 'ven_005',
    name: 'Nature Explorers',
    description: 'Discover the wonders of nature! Hike trails, identify plants and animals, and learn outdoor skills. Each session focuses on a different nature theme.',
    shortDescription: 'Outdoor nature exploration',
    category: 'Nature',
    minAge: 5,
    maxAge: 12,
    duration: 90,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1500756194400-f2f1eae2ab1a?w=600',
    tags: ['outdoor', 'educational', 'active', 'calm'],
    status: 'active',
    rating: 4.7,
    reviewCount: 29,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Plant identification', 'Animal tracking', 'Outdoor skills', 'Environmental awareness'],
    whatToBring: ['Sturdy shoes', 'Weather-appropriate clothing', 'Water bottle', 'Bug spray'],
    accessibilityFeatures: []
  },
  {
    id: 'act_022',
    venueId: 'ven_005',
    name: 'Junior Gardeners',
    description: 'Get your hands dirty in the garden! Learn about plants, soil, and growing food. Each child maintains their own small plot or container garden.',
    shortDescription: 'Learn gardening basics',
    category: 'Nature',
    minAge: 4,
    maxAge: 10,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=600',
    tags: ['outdoor', 'educational', 'calm', 'messy'],
    status: 'active',
    rating: 4.5,
    reviewCount: 21,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Planting', 'Plant care', 'Soil science', 'Food systems'],
    whatToBring: ['Clothes that can get dirty', 'Sun hat', 'Sunscreen'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_023',
    venueId: 'ven_005',
    name: 'Bug Safari',
    description: 'Explore the world of insects! Use magnifying glasses and bug catchers to find and study insects in their natural habitat. Learn to identify common species.',
    shortDescription: 'Insect exploration and study',
    category: 'Nature',
    minAge: 4,
    maxAge: 9,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1470058869958-2a77ade41c02?w=600',
    tags: ['outdoor', 'educational', 'active', 'hands-on'],
    status: 'active',
    rating: 4.6,
    reviewCount: 18,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Insect identification', 'Observation skills', 'Ecosystems', 'Scientific method'],
    whatToBring: ['Closed-toe shoes', 'Long pants recommended'],
    accessibilityFeatures: []
  },

  // =====================================================
  // COOKING ACTIVITIES (3)
  // =====================================================
  {
    id: 'act_024',
    venueId: 'ven_006',
    name: 'Junior Chefs',
    description: 'Learn to cook real recipes! From measuring ingredients to kitchen safety, kids develop cooking skills while making delicious dishes to taste and share.',
    shortDescription: 'Cooking classes for kids',
    category: 'Cooking',
    minAge: 6,
    maxAge: 12,
    duration: 90,
    creditCost: 2,
    imageUrl: 'https://images.unsplash.com/photo-1507048331197-7d4ac70811cf?w=600',
    tags: ['indoor', 'educational', 'hands-on', 'messy'],
    status: 'active',
    rating: 4.8,
    reviewCount: 44,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Kitchen safety', 'Measuring', 'Basic techniques', 'Following recipes'],
    whatToBring: ['Apron (provided if needed)', 'Hair tie for long hair'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_025',
    venueId: 'ven_006',
    name: 'Baking Bonanza',
    description: 'Bake delicious treats! Learn the science of baking while making cookies, cupcakes, bread, and more. Take home your creations!',
    shortDescription: 'Baking cakes, cookies, and more',
    category: 'Cooking',
    minAge: 5,
    maxAge: 12,
    duration: 90,
    creditCost: 2,
    imageUrl: 'https://images.unsplash.com/photo-1483695028939-5bb13f8648b0?w=600',
    tags: ['indoor', 'educational', 'hands-on', 'messy'],
    status: 'active',
    rating: 4.9,
    reviewCount: 51,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Baking science', 'Measuring', 'Decorating', 'Kitchen math'],
    whatToBring: ['Apron', 'Container to take treats home'],
    accessibilityFeatures: ['wheelchair-accessible']
  },
  {
    id: 'act_026',
    venueId: 'ven_006',
    name: 'Global Cuisines Kids',
    description: 'Travel the world through food! Each session explores a different country\'s cuisine, culture, and cooking traditions.',
    shortDescription: 'Cook dishes from around the world',
    category: 'Cooking',
    minAge: 8,
    maxAge: 14,
    duration: 90,
    creditCost: 2,
    imageUrl: 'https://images.unsplash.com/photo-1466637574441-749b8f19452f?w=600',
    tags: ['indoor', 'educational', 'hands-on', 'cultural'],
    status: 'active',
    rating: 4.7,
    reviewCount: 23,
    parentRequired: false,
    skillLevel: 'intermediate',
    whatToLearn: ['International recipes', 'Cultural appreciation', 'Advanced techniques', 'Flavor profiles'],
    whatToBring: ['Apron', 'Adventurous appetite!'],
    accessibilityFeatures: ['wheelchair-accessible']
  },

  // =====================================================
  // DANCE ACTIVITIES (2)
  // =====================================================
  {
    id: 'act_027',
    venueId: 'ven_007',
    name: 'Hip Hop Dance Kids',
    description: 'Learn hip hop moves and choreography! Build coordination, rhythm, and confidence while dancing to age-appropriate music.',
    shortDescription: 'Hip hop dance and choreography',
    category: 'Dance',
    minAge: 6,
    maxAge: 14,
    duration: 60,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
    tags: ['indoor', 'active', 'social', 'physical'],
    status: 'active',
    rating: 4.8,
    reviewCount: 37,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Hip hop moves', 'Choreography', 'Rhythm', 'Performance skills'],
    whatToBring: ['Comfortable clothes', 'Sneakers', 'Water bottle'],
    accessibilityFeatures: ['hearing-support']
  },
  {
    id: 'act_028',
    venueId: 'ven_007',
    name: 'Creative Movement & Ballet',
    description: 'Introduction to ballet through creative movement. Learn basic positions, simple combinations, and express yourself through dance.',
    shortDescription: 'Ballet basics and creative dance',
    category: 'Dance',
    minAge: 3,
    maxAge: 8,
    duration: 45,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1518834107812-67b0b7c58434?w=600',
    tags: ['indoor', 'active', 'calm', 'creative'],
    status: 'active',
    rating: 4.7,
    reviewCount: 42,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Ballet positions', 'Grace', 'Coordination', 'Musical interpretation'],
    whatToBring: ['Leotard or comfortable clothes', 'Ballet slippers (provided if needed)'],
    accessibilityFeatures: ['sensory-friendly']
  },

  // =====================================================
  // DRAMA ACTIVITIES (2)
  // =====================================================
  {
    id: 'act_029',
    venueId: 'ven_008',
    name: 'Kids Acting Studio',
    description: 'Explore the world of acting! Learn improvisation, character development, and scene work. Build confidence and public speaking skills.',
    shortDescription: 'Acting and improv for kids',
    category: 'Drama',
    minAge: 7,
    maxAge: 14,
    duration: 75,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1503095396549-807759245b35?w=600',
    tags: ['indoor', 'creative', 'social', 'performance'],
    status: 'active',
    rating: 4.8,
    reviewCount: 28,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Improvisation', 'Character building', 'Stage presence', 'Collaboration'],
    whatToBring: ['Comfortable clothes for movement'],
    accessibilityFeatures: ['hearing-support']
  },
  {
    id: 'act_030',
    venueId: 'ven_008',
    name: 'Puppet Theater Workshop',
    description: 'Create puppets and perform! Make your own puppets, develop characters, write simple scripts, and put on a show for parents.',
    shortDescription: 'Puppet making and performance',
    category: 'Drama',
    minAge: 5,
    maxAge: 10,
    duration: 90,
    creditCost: 1,
    imageUrl: 'https://images.unsplash.com/photo-1582213782179-e0d53f98f2ca?w=600',
    tags: ['indoor', 'creative', 'hands-on', 'performance'],
    status: 'active',
    rating: 4.6,
    reviewCount: 19,
    parentRequired: false,
    skillLevel: 'beginner',
    whatToLearn: ['Puppet making', 'Storytelling', 'Voice work', 'Performance'],
    whatToBring: ['Nothing required'],
    accessibilityFeatures: ['wheelchair-accessible', 'sensory-friendly']
  }
];

/**
 * Helper function to get activity by ID
 * @param id - Activity ID to search for
 * @returns Activity object or undefined
 */
export function getActivityById(id: string): Activity | undefined {
  return MOCK_ACTIVITIES.find(activity => activity.id === id);
}

/**
 * Helper function to get activities by category
 * @param category - Category to filter by
 * @returns Array of matching activities
 */
export function getActivitiesByCategory(category: string): Activity[] {
  return MOCK_ACTIVITIES.filter(activity => activity.category === category);
}

/**
 * Helper function to get activities by venue
 * @param venueId - Venue ID to filter by
 * @returns Array of activities at that venue
 */
export function getActivitiesByVenue(venueId: string): Activity[] {
  return MOCK_ACTIVITIES.filter(activity => activity.venueId === venueId);
}

/**
 * Helper function to get activities suitable for a specific age
 * @param age - Child's age
 * @returns Array of age-appropriate activities
 */
export function getActivitiesByAge(age: number): Activity[] {
  return MOCK_ACTIVITIES.filter(
    activity => age >= activity.minAge && age <= activity.maxAge
  );
}

/**
 * Helper function to get all unique categories
 * @returns Array of category names
 */
export function getAllCategories(): string[] {
  const categories = new Set(MOCK_ACTIVITIES.map(a => a.category));
  return Array.from(categories);
}
