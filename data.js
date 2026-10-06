// ==========================================
// SPRIG DATA STORE & PERSISTENCE ENGINE
// ==========================================

const STORAGE_KEY = 'sprig_smart_campus_v1';

// Seed locations from JUET campus map reference
export const CAMPUS_LOCATIONS = [
  { id: 'acad_block', name: 'Academic Block', category: 'Academic', x: 67, y: 28, baseHealth: 5, description: 'Core lecture halls, faculty offices, and academic administrative wings.' },
  { id: 'library', name: 'Library', category: 'Academic', x: 55, y: 38, baseHealth: 2, description: 'Central campus library, digital study lounges, and silent reading halls.' },
  { id: 'cafeteria', name: 'Cafeteria', category: 'Student Life', x: 42, y: 18, baseHealth: 5, description: 'Main student dining hall, food court, and evening snack kiosks.' },
  { id: 'kabbad_khana', name: 'Kabbad Khana', category: 'Utilities', x: 62, y: 9, baseHealth: 5, description: 'Central scrap store, recycling depot, and estate management yard.' },
  { id: 'mph', name: 'MPH', category: 'Events', x: 84, y: 19, baseHealth: 5, description: 'Multipurpose Auditorium, indoor badminton courts, and cultural center.' },
  { id: 'wind_tunnel', name: 'Wind Tunnel', category: 'Engineering', x: 89, y: 46, baseHealth: 2, description: 'Mechanical & aerospace fluid dynamics research laboratory.' },
  { id: 'lake', name: 'Lake', category: 'Environment', x: 67, y: 50, baseHealth: 2, description: 'Central scenic rainwater reservoir, walking promenade, and bund.' },
  { id: 'mandir', name: 'Mandir', category: 'Spiritual', x: 41, y: 64, baseHealth: 5, description: 'Serene campus temple pavilion located on the lakeside peninsula.' },
  { id: 'cdc_bytes', name: 'CDC & BYTES', category: 'Tech & Career', x: 18, y: 75, baseHealth: 4, description: 'Career Development Centre, incubation center, and BYTES computing hub.' },
  { id: 'fountain', name: 'Fountain', category: 'Environment', x: 52, y: 85, baseHealth: 2, description: 'Lakeside promenade fountain and lower garden walkway.' },
  { id: 'delivery', name: 'Delivery', category: 'Logistics', x: 22, y: 22, baseHealth: 5, description: 'North gate parcel receiving hub and courier checkpoint.' },
  { id: 'hostel_a', name: 'Hostel A', category: 'Residential', x: 32, y: 14, baseHealth: 4, description: 'Junior student residential halls and recreation common room.' },
  { id: 'hostel_b', name: 'Hostel B', category: 'Residential', x: 20, y: 38, baseHealth: 3, description: 'Senior student residential halls and mess dining facility.' },
  { id: 'lab_block', name: 'Laboratory Block', category: 'Academic', x: 72, y: 24, baseHealth: 4, description: 'Civil, Mechanical, and Chemical engineering specialized laboratories.' },
  { id: 'sports_complex', name: 'Sports Complex', category: 'Recreation', x: 78, y: 12, baseHealth: 5, description: 'Cricket oval, football turf, tennis courts, and gymnasium.' },
  { id: 'admin_block', name: 'Administration Block', category: 'Admin', x: 48, y: 44, baseHealth: 4, description: 'Registrar, accounts, directorate, and examination office.' },
];

export const CATEGORIES = [
  { id: 'wifi', name: 'Wi-Fi / Network', icon: 'Wifi', defaultCrew: 'IT / Network' },
  { id: 'electrical', name: 'Electrical', icon: 'Zap', defaultCrew: 'Electrical Crew' },
  { id: 'plumbing', name: 'Plumbing / Water', icon: 'Droplets', defaultCrew: 'Plumbing Crew' },
  { id: 'cleanliness', name: 'Cleanliness', icon: 'Sparkles', defaultCrew: 'Housekeeping' },
  { id: 'classroom', name: 'Classroom', icon: 'School', defaultCrew: 'Civil Maintenance' },
  { id: 'lab_equipment', name: 'Laboratory Equipment', icon: 'FlaskConical', defaultCrew: 'Laboratory Equipment' },
  { id: 'furniture', name: 'Furniture', icon: 'Armchair', defaultCrew: 'Furniture & Carpentry' },
  { id: 'hostel', name: 'Hostel', icon: 'Home', defaultCrew: 'Housekeeping' },
  { id: 'security', name: 'Security', icon: 'Shield', defaultCrew: 'Security & Safety' },
  { id: 'garden', name: 'Garden / Environment', icon: 'Trees', defaultCrew: 'Gardening & Greenery' },
  { id: 'other', name: 'Other', icon: 'HelpCircle', defaultCrew: 'Civil Maintenance' }
];

export const CREWS = [
  { id: 'crew_it', name: 'IT / Network Team', department: 'IT / Network', contact: '+91 98765-43210', lead: 'Er. Rajesh Sharma', area: 'Campus-wide Optical & APs', workload: 3, maxCapacity: 8 },
  { id: 'crew_elec', name: 'Electrical Crew', department: 'Electrical', contact: '+91 98765-43211', lead: 'Shri Ramswaroop', area: 'Substations & Substations Wings', workload: 5, maxCapacity: 10 },
  { id: 'crew_plumb', name: 'Plumbing Crew', department: 'Plumbing', contact: '+91 98765-43212', lead: 'Mahesh Kumar', area: 'Water Supply & Overheads', workload: 4, maxCapacity: 8 },
  { id: 'crew_house', name: 'Housekeeping Department', department: 'Housekeeping', contact: '+91 98765-43213', lead: 'Sunita Devi', area: 'Hostels & Academic Corridors', workload: 6, maxCapacity: 12 },
  { id: 'crew_furn', name: 'Furniture & Carpentry', department: 'Furniture', contact: '+91 98765-43214', lead: 'Kailash Carpenter', area: 'Workshops & Lecture Desks', workload: 2, maxCapacity: 6 },
  { id: 'crew_civil', name: 'Civil Maintenance Team', department: 'Civil Maintenance', contact: '+91 98765-43215', lead: 'Er. P.K. Verma', area: 'Masonry, Painting & Drainage', workload: 4, maxCapacity: 8 },
  { id: 'crew_lab', name: 'Laboratory Equipment Techs', department: 'Laboratory Equipment', contact: '+91 98765-43216', lead: 'Dr. A. Mehrotra', area: 'Advanced Labs & Wind Tunnel', workload: 2, maxCapacity: 5 },
  { id: 'crew_garden', name: 'Gardening & Greenery', department: 'Gardening', contact: '+91 98765-43217', lead: 'Babu Lal', area: 'Lakeside, Lawns & Trees', workload: 1, maxCapacity: 6 },
  { id: 'crew_sec', name: 'Security & Safety Cell', department: 'Security', contact: '+91 98765-43218', lead: 'Subedar M. Singh', area: 'Gates, CCTV & Perimeters', workload: 2, maxCapacity: 10 },
];

export const BADGES_CATALOG = [
  { id: 'first_contrib', name: 'First Contribution', icon: 'Sprout', description: 'Submitted your first verified campus issue or deed.', pointsRequired: 20 },
  { id: 'campus_detective', name: 'Campus Detective', icon: 'Search', description: 'Provided high quality photographic evidence and accurate room logs.', pointsRequired: 80 },
  { id: 'community_helper', name: 'Community Helper', icon: 'Users', description: 'Supported 5 community reported issues to elevate campus priority.', pointsRequired: 140 },
  { id: 'water_guardian', name: 'Water Guardian', icon: 'Droplet', description: 'Reported or resolved critical plumbing wastage near lake or hostels.', pointsRequired: 200 },
  { id: 'energy_guardian', name: 'Energy Guardian', icon: 'Zap', description: 'Helped eliminate electrical leaks, leaving fans or lights unneeded.', pointsRequired: 260 },
  { id: 'clean_campus', name: 'Clean Campus Champion', icon: 'Sparkles', description: 'Engaged in waste segregation and cleanliness reporting.', pointsRequired: 320 },
  { id: 'issue_spotter', name: 'Issue Spotter', icon: 'MapPin', description: 'Accurately located issues across 5 different campus zones.', pointsRequired: 400 },
  { id: 'recurring_hunter', name: 'Recurring Issue Hunter', icon: 'Repeat', description: 'Identified an underlying pattern that prevented recurring failures.', pointsRequired: 460 },
  { id: 'campus_champion', name: 'Campus Champion', icon: 'Trophy', description: 'Crossed top 3 rank in campus-wide quality contributions.', pointsRequired: 550 },
  { id: 'flourishing_sprig', name: 'Flourishing Sprig', icon: 'Trees', description: 'Nurtured your personal Sprig to Stage 5 with pure verified impact.', pointsRequired: 650 },
];

export const INITIAL_STUDENT = {
  enrollment: '251B186',
  sprigPoints: 185, // Stage 3: Young Plant
  contributionScore: 92,
  streakDays: 6,
  plantStage: 3, // 1: Seed, 2: Sprout, 3: Young Plant, 4: Growing Sprig, 5: Flourishing Sprig
  waterCountToday: 2,
  badgesUnlocked: ['first_contrib', 'campus_detective', 'community_helper', 'water_guardian'],
  annualRank: 1,
  academicYear: '2026–27',
  isWinnerOfYear: true
};

export const INITIAL_LEADERBOARD = [
  { rank: 1, enrollment: '251B186', points: 640, score: 98, verifiedDeeds: 14, verifications: 19, recurringFound: 3, badge: 'Campus Champion' },
  { rank: 2, enrollment: '251A204', points: 510, score: 89, verifiedDeeds: 10, verifications: 15, recurringFound: 2, badge: 'Recurring Issue Hunter' },
  { rank: 3, enrollment: '251C119', points: 435, score: 84, verifiedDeeds: 8, verifications: 12, recurringFound: 1, badge: 'Clean Campus Champion' },
  { rank: 4, enrollment: '241B088', points: 380, score: 79, verifiedDeeds: 7, verifications: 11, recurringFound: 1, badge: 'Energy Guardian' },
  { rank: 5, enrollment: '241D302', points: 320, score: 73, verifiedDeeds: 6, verifications: 8, recurringFound: 0, badge: 'Water Guardian' },
  { rank: 6, enrollment: '251F044', points: 290, score: 70, verifiedDeeds: 5, verifications: 7, recurringFound: 0, badge: 'Community Helper' },
  { rank: 7, enrollment: '231A150', points: 245, score: 66, verifiedDeeds: 4, verifications: 6, recurringFound: 0, badge: 'Campus Detective' },
];

export const INITIAL_GOOD_DEEDS = [
  {
    id: 'GD-501',
    title: 'Closed leaking main valve near Hostel B lawn',
    description: 'Noticed continuous potable water overflow from garden bypass pipe. Manually isolated the secondary valve preventing major wastage before reporting.',
    location: 'Hostel B',
    enrollment: '251B186',
    timestamp: '2026-10-05T09:30:00Z',
    status: 'Verified',
    pointsAwarded: 30,
    impactCategory: 'Water Conservation',
    imageUrl: 'assets/juet_campus_clean.jpg'
  },
  {
    id: 'GD-502',
    title: 'Switched off 6 AC units left running in empty MPH seminar hall',
    description: 'After the evening IEEE talk concluded, air conditioning and stage lights were left active in hall B. Turned off master switch at panel.',
    location: 'MPH',
    enrollment: '251A204',
    timestamp: '2026-10-04T18:15:00Z',
    status: 'Verified',
    pointsAwarded: 30,
    impactCategory: 'Energy Conservation',
    imageUrl: ''
  },
  {
    id: 'GD-503',
    title: 'Marked slippery oil spill warning near Wind Tunnel entrance',
    description: 'Hydraulic test oil had leaked onto the main walkway slope. Placed safety cone and notified housekeeping crew immediately.',
    location: 'Wind Tunnel',
    enrollment: '251C119',
    timestamp: '2026-10-03T11:45:00Z',
    status: 'Verified',
    pointsAwarded: 30,
    impactCategory: 'Safety & Hazard Prevention',
    imageUrl: ''
  },
  {
    id: 'GD-504',
    title: 'Cleaned discarded plastic cups around Lake scenic bund',
    description: 'Collected plastic debris along 50 meters of the water edge promenade and placed them into the segregation bins.',
    location: 'Lake',
    enrollment: '251B186',
    timestamp: '2026-10-02T16:20:00Z',
    status: 'Verified',
    pointsAwarded: 30,
    impactCategory: 'Environmental Protection',
    imageUrl: ''
  }
];

// Seed 32 realistic complaints across JUET campus
export const INITIAL_COMPLAINTS = [
  // CMP-1001 to CMP-1023 pre-seeded
  {
    id: 'CMP-1001',
    enrollment: '251A204',
    title: 'Library 2nd Floor AP-3 intermittent disconnects',
    description: 'During peak evening study hours, the AP-3 access point drops DHCP leases every 8 minutes. Students lose connection during research portal access.',
    category: 'Wi-Fi / Network',
    severity: 'High',
    location: 'Library',
    floor: '2nd Floor',
    room: 'Digital Reading Room',
    exactLocation: 'Near East Stacks AP-3',
    status: 'In Progress',
    impactScore: 84,
    affectedStudents: 14,
    supportCount: 9,
    assignedCrew: 'IT / Network Team',
    createdAt: '2026-10-04T10:15:00Z',
    deadline: '2026-10-06T16:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-04T10:15:00Z', note: 'Issue logged with network diagnostic capture.' },
      { status: 'REVIEWED', time: '2026-10-04T11:00:00Z', note: 'Priority confirmed by Network Admin.' },
      { status: 'ASSIGNED', time: '2026-10-04T11:30:00Z', note: 'Assigned to IT / Network Team (Er. Rajesh Sharma).' },
      { status: 'IN PROGRESS', time: '2026-10-05T09:00:00Z', note: 'Firmware rollback on Cisco Catalyst switch scheduled.' }
    ],
    isRecurring: true,
    recurrenceCount: 6,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1002',
    enrollment: '251B186',
    title: 'Water valve seal leakage near Hostel B main riser',
    description: 'High pressure joint weeping clean municipal water into the basement drainage culvert. Water loss estimate ~40L/hr.',
    category: 'Plumbing / Water',
    severity: 'High',
    location: 'Hostel B',
    floor: 'Ground Floor',
    room: 'Block B Pump Room',
    exactLocation: 'External riser line beside mess porch',
    status: 'Fixed',
    impactScore: 78,
    affectedStudents: 22,
    supportCount: 12,
    assignedCrew: 'Plumbing Crew',
    createdAt: '2026-10-03T14:20:00Z',
    deadline: '2026-10-04T18:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-03T14:20:00Z', note: 'Photo evidence of pipeline erosion attached.' },
      { status: 'REVIEWED', time: '2026-10-03T15:00:00Z', note: 'High severity confirmed.' },
      { status: 'ASSIGNED', time: '2026-10-03T15:30:00Z', note: 'Assigned to Mahesh Kumar (Plumbing).' },
      { status: 'IN PROGRESS', time: '2026-10-04T10:00:00Z', note: 'Replacing 2-inch CPVC junction flange.' },
      { status: 'FIXED', time: '2026-10-05T16:00:00Z', note: 'Flange replaced and pressure tested at 4.2 bar.' }
    ],
    isRecurring: true,
    recurrenceCount: 4,
    resolutionFeedback: null // Student verification pending!
  },
  {
    id: 'CMP-1003',
    enrollment: '251C119',
    title: 'Wind Tunnel exhaust dampener vibration failure',
    description: 'Excessive acoustic resonance in test chamber section 4 during low-speed aerodynamic sweeps above 25m/s.',
    category: 'Laboratory Equipment',
    severity: 'Critical',
    location: 'Wind Tunnel',
    floor: 'Ground Floor',
    room: 'Aero Lab 101',
    exactLocation: 'Subsonic chamber intake diffuser',
    status: 'In Progress',
    impactScore: 92,
    affectedStudents: 18,
    supportCount: 6,
    assignedCrew: 'Laboratory Equipment Techs',
    createdAt: '2026-10-05T08:00:00Z',
    deadline: '2026-10-06T12:00:00Z',
    slaBreached: true,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T08:00:00Z', note: 'High vibration sensor readout logged.' },
      { status: 'REVIEWED', time: '2026-10-05T08:30:00Z', note: 'Flagged as Critical lab priority.' },
      { status: 'ASSIGNED', time: '2026-10-05T09:00:00Z', note: 'Assigned to Dr. A. Mehrotra.' },
      { status: 'IN PROGRESS', time: '2026-10-05T10:30:00Z', note: 'Mounting bolts re-torqued; acoustic dampener inspection ongoing.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1004',
    enrollment: '241B088',
    title: 'Promenade Fountain nozzle blockage and stagnant water',
    description: 'Submersible aeration pump clogged with silt, leading to algae accumulation on the stone tier.',
    category: 'Garden / Environment',
    severity: 'Medium',
    location: 'Fountain',
    floor: 'Ground',
    room: 'Outdoor',
    exactLocation: 'Lower tiers of central basin',
    status: 'Assigned',
    impactScore: 62,
    affectedStudents: 35,
    supportCount: 15,
    assignedCrew: 'Gardening & Greenery',
    createdAt: '2026-10-05T11:00:00Z',
    deadline: '2026-10-07T11:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T11:00:00Z', note: 'Reported by morning running club.' },
      { status: 'REVIEWED', time: '2026-10-05T12:00:00Z', note: 'Approved for landscaping overhaul.' },
      { status: 'ASSIGNED', time: '2026-10-05T14:00:00Z', note: 'Assigned to Babu Lal.' }
    ],
    isRecurring: true,
    recurrenceCount: 3,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1005',
    enrollment: '251F044',
    title: 'CDC & BYTES Lab 3 projector optical distortion',
    description: 'Severe yellow discoloration on left half of the display screen during placement mock tests and code demos.',
    category: 'Classroom',
    severity: 'Medium',
    location: 'CDC & BYTES',
    floor: '1st Floor',
    room: 'Lab 3 (BYTES)',
    exactLocation: 'Ceiling mount Epson EB-X49',
    status: 'Closed',
    impactScore: 55,
    affectedStudents: 40,
    supportCount: 18,
    assignedCrew: 'IT / Network Team',
    createdAt: '2026-09-28T10:00:00Z',
    deadline: '2026-09-30T10:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-09-28T10:00:00Z', note: 'Logged with test slide screenshot.' },
      { status: 'REVIEWED', time: '2026-09-28T11:00:00Z', note: 'Approved by academic cell.' },
      { status: 'ASSIGNED', time: '2026-09-28T11:30:00Z', note: 'Assigned to IT team.' },
      { status: 'IN PROGRESS', time: '2026-09-29T14:00:00Z', note: 'Replaced optical polarising glass panel.' },
      { status: 'FIXED', time: '2026-09-30T09:30:00Z', note: 'Projector recalibrated.' },
      { status: 'STUDENT VERIFIED', time: '2026-09-30T11:00:00Z', note: 'Student confirmed crisp white balance.' },
      { status: 'CLOSED', time: '2026-09-30T11:05:00Z', note: 'Resolution verified and archived.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: { verified: true, note: 'Tested during morning placement session. Crystal clear!' }
  },
  {
    id: 'CMP-1006',
    enrollment: '251B186',
    title: 'Academic Block A - Room 204 ceiling fan rhythmic grinding sound',
    description: 'Bearings worn out on fan 3 above row 4. Loud noise disturbs professor during lectures.',
    category: 'Electrical',
    severity: 'Medium',
    location: 'Academic Block',
    floor: '2nd Floor',
    room: 'LT-204',
    exactLocation: 'Third fan from front podium',
    status: 'In Progress',
    impactScore: 68,
    affectedStudents: 60,
    supportCount: 24,
    assignedCrew: 'Electrical Crew',
    createdAt: '2026-10-04T12:00:00Z',
    deadline: '2026-10-06T12:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-04T12:00:00Z', note: 'Audio recording submitted.' },
      { status: 'REVIEWED', time: '2026-10-04T13:00:00Z', note: 'Classroom priority assigned.' },
      { status: 'ASSIGNED', time: '2026-10-04T14:30:00Z', note: 'Assigned to Shri Ramswaroop.' },
      { status: 'IN PROGRESS', time: '2026-10-05T15:00:00Z', note: 'Replacement capacitor and ball bearing kit ordered from store.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1007',
    enrollment: '231A150',
    title: 'Lake embankment pathway solar lamp solar cell cracked',
    description: 'Solar luminary pole #14 facing temple walkway has shattered cover glass; not activating after 6:30 PM.',
    category: 'Electrical',
    severity: 'High',
    location: 'Lake',
    floor: 'Ground',
    room: 'Outdoor Promenade',
    exactLocation: 'Lamp pole 14 south bend',
    status: 'Submitted',
    impactScore: 72,
    affectedStudents: 50,
    supportCount: 16,
    assignedCrew: null,
    createdAt: '2026-10-06T08:15:00Z',
    deadline: null,
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-06T08:15:00Z', note: 'Student reported dark spot along night walking track.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1008',
    enrollment: '251A204',
    title: 'MPH Badminton Court 2 halogen floodlight driver flickering',
    description: 'Stroboscopic flickering during evening tournament practice creates severe visibility hazard.',
    category: 'Electrical',
    severity: 'High',
    location: 'MPH',
    floor: 'Ground Floor',
    room: 'Indoor Sports Arena',
    exactLocation: 'Overhead truss cluster B',
    status: 'Reviewed',
    impactScore: 76,
    affectedStudents: 28,
    supportCount: 11,
    assignedCrew: null,
    createdAt: '2026-10-05T19:00:00Z',
    deadline: '2026-10-06T23:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T19:00:00Z', note: 'Video attachment showing 50Hz optical flicker.' },
      { status: 'REVIEWED', time: '2026-10-06T08:00:00Z', note: 'Sports officer flagged for driver ballast replacement.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1009',
    enrollment: '241D302',
    title: 'Cafeteria hand wash sink drainage backing up',
    description: 'Waste food blockage in the primary grease trap under wash station 2.',
    category: 'Plumbing / Water',
    severity: 'Medium',
    location: 'Cafeteria',
    floor: 'Ground Floor',
    room: 'Dining Hall wash bay',
    exactLocation: 'Left side wash area sink #2',
    status: 'Assigned',
    impactScore: 66,
    affectedStudents: 80,
    supportCount: 30,
    assignedCrew: 'Housekeeping',
    createdAt: '2026-10-06T07:45:00Z',
    deadline: '2026-10-07T07:45:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-06T07:45:00Z', note: 'Mess committee notice.' },
      { status: 'REVIEWED', time: '2026-10-06T08:30:00Z', note: 'Reviewed by Estate office.' },
      { status: 'ASSIGNED', time: '2026-10-06T09:15:00Z', note: 'Assigned to Housekeeping for drain augering.' }
    ],
    isRecurring: true,
    recurrenceCount: 2,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1010',
    enrollment: '251B186',
    title: 'Library silent zone air conditioning thermostat malfunction',
    description: 'Temperature stuck at 16°C causing condensation on windows and uncomfortable study conditions.',
    category: 'Electrical',
    severity: 'Low',
    location: 'Library',
    floor: '1st Floor',
    room: 'Periodicals Reading Wing',
    exactLocation: 'West wall master controller',
    status: 'In Progress',
    impactScore: 48,
    affectedStudents: 45,
    supportCount: 8,
    assignedCrew: 'Electrical Crew',
    createdAt: '2026-10-05T13:00:00Z',
    deadline: '2026-10-07T13:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T13:00:00Z', note: 'Issue submitted.' },
      { status: 'REVIEWED', time: '2026-10-05T14:00:00Z', note: 'Reviewed.' },
      { status: 'ASSIGNED', time: '2026-10-05T16:00:00Z', note: 'Assigned to Electrical Crew.' },
      { status: 'IN PROGRESS', time: '2026-10-06T10:00:00Z', note: 'Sensor recalibration in progress.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1011',
    enrollment: '251C119',
    title: 'Hostel A 3rd floor washroom geyser pilot light extinguished',
    description: 'Hot water unavailable in wing C showers due to failed thermocouple safety circuit.',
    category: 'Electrical',
    severity: 'High',
    location: 'Hostel A',
    floor: '3rd Floor',
    room: 'Washroom Wing C',
    exactLocation: '50L Venus geyser unit 2',
    status: 'Submitted',
    impactScore: 75,
    affectedStudents: 32,
    supportCount: 19,
    assignedCrew: null,
    createdAt: '2026-10-06T06:30:00Z',
    deadline: null,
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-06T06:30:00Z', note: 'Hostel warden notified.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1012',
    enrollment: '251A204',
    title: 'Kabbad Khana perimeter fence rusted mesh opening',
    description: 'Section of chain-link fence loose on the eastern boundary near campus wood depot.',
    category: 'Security',
    severity: 'Medium',
    location: 'Kabbad Khana',
    floor: 'Ground',
    room: 'Perimeter',
    exactLocation: 'East gate perimeter fence post 8',
    status: 'Assigned',
    impactScore: 58,
    affectedStudents: 10,
    supportCount: 4,
    assignedCrew: 'Civil Maintenance Team',
    createdAt: '2026-10-04T16:00:00Z',
    deadline: '2026-10-07T16:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-04T16:00:00Z', note: 'Security concern reported.' },
      { status: 'REVIEWED', time: '2026-10-05T09:00:00Z', note: 'Reviewed by Chief Warden.' },
      { status: 'ASSIGNED', time: '2026-10-05T10:00:00Z', note: 'Assigned to Er. P.K. Verma.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1013',
    enrollment: '241B088',
    title: 'Mandir lakeside railing loose marble baluster',
    description: 'Two decorative balusters wobbly on the stepped ghat walkway leading down toward the water.',
    category: 'Civil Maintenance',
    severity: 'High',
    location: 'Mandir',
    floor: 'Ground',
    room: 'Lakeside Ghat',
    exactLocation: 'Step tier 4 lakeside walkway',
    status: 'In Progress',
    impactScore: 70,
    affectedStudents: 25,
    supportCount: 7,
    assignedCrew: 'Civil Maintenance Team',
    createdAt: '2026-10-04T18:00:00Z',
    deadline: '2026-10-06T18:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-04T18:00:00Z', note: 'Visitor safety issue reported.' },
      { status: 'REVIEWED', time: '2026-10-05T08:30:00Z', note: 'Approved for urgent stone masonry repair.' },
      { status: 'ASSIGNED', time: '2026-10-05T09:30:00Z', note: 'Assigned to Civil team.' },
      { status: 'IN PROGRESS', time: '2026-10-05T14:00:00Z', note: 'White cement epoxy bonding underway.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1014',
    enrollment: '251B186',
    title: 'Laboratory Block - Chemical waste exhaust duct backdraft',
    description: 'Fume hood 2 in Organic Chemistry Lab venting poorly when neighboring intake dampers are open.',
    category: 'Laboratory Equipment',
    severity: 'Critical',
    location: 'Laboratory Block',
    floor: '2nd Floor',
    room: 'Lab 208',
    exactLocation: 'Fume hood exhaust line 2B',
    status: 'Assigned',
    impactScore: 94,
    affectedStudents: 30,
    supportCount: 14,
    assignedCrew: 'Laboratory Equipment Techs',
    createdAt: '2026-10-05T14:00:00Z',
    deadline: '2026-10-06T14:00:00Z',
    slaBreached: true,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T14:00:00Z', note: 'Lab attendant recorded fumes.' },
      { status: 'REVIEWED', time: '2026-10-05T14:30:00Z', note: 'Safety protocol initiated.' },
      { status: 'ASSIGNED', time: '2026-10-05T15:00:00Z', note: 'Assigned to Dr. A. Mehrotra.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1015',
    enrollment: '251F044',
    title: 'Sports Complex gymnasium treadmill belt slip',
    description: 'NordicTrack treadmill #3 belt jerks during incline intervals above 8 km/h.',
    category: 'Furniture',
    severity: 'Low',
    location: 'Sports Complex',
    floor: '1st Floor',
    room: 'Fitness Center',
    exactLocation: 'Cardio bay unit 3',
    status: 'Fixed',
    impactScore: 42,
    affectedStudents: 20,
    supportCount: 5,
    assignedCrew: 'Furniture & Carpentry',
    createdAt: '2026-10-02T17:00:00Z',
    deadline: '2026-10-05T17:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-02T17:00:00Z', note: 'Reported by sports rep.' },
      { status: 'ASSIGNED', time: '2026-10-03T10:00:00Z', note: 'Assigned.' },
      { status: 'FIXED', time: '2026-10-04T15:00:00Z', note: 'Drive belt tightened and silicon lubricated.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1016',
    enrollment: '251A204',
    title: 'Administration Block accounts counter microphone muffled',
    description: 'Intercom acoustic baffle damaged; students and cash counter officer unable to hear transactions through glass.',
    category: 'Electrical',
    severity: 'Low',
    location: 'Administration Block',
    floor: 'Ground Floor',
    room: 'Accounts Section Counter 2',
    exactLocation: 'Window 2 intercom pod',
    status: 'Submitted',
    impactScore: 36,
    affectedStudents: 45,
    supportCount: 8,
    assignedCrew: null,
    createdAt: '2026-10-06T09:00:00Z',
    deadline: null,
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-06T09:00:00Z', note: 'Student reported difficulty in fee payment queue.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1017',
    enrollment: '251C119',
    title: 'Delivery parcel gate speed breaker missing warning paint',
    description: 'Reflective yellow stripes worn off on delivery truck ingress ramp, causing sudden braking.',
    category: 'Civil Maintenance',
    severity: 'Low',
    location: 'Delivery',
    floor: 'Ground',
    room: 'Gate Ingress',
    exactLocation: 'North gate barrier 20m inwards',
    status: 'Closed',
    impactScore: 40,
    affectedStudents: 15,
    supportCount: 6,
    assignedCrew: 'Civil Maintenance Team',
    createdAt: '2026-09-25T11:00:00Z',
    deadline: '2026-09-28T11:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-09-25T11:00:00Z', note: 'Logged.' },
      { status: 'FIXED', time: '2026-09-27T16:00:00Z', note: 'Reflective paint re-applied.' },
      { status: 'STUDENT VERIFIED', time: '2026-09-28T09:00:00Z', note: 'Verified.' },
      { status: 'CLOSED', time: '2026-09-28T09:05:00Z', note: 'Closed.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: { verified: true, note: 'Bright reflective paint applied cleanly.' }
  },
  {
    id: 'CMP-1018',
    enrollment: '241D302',
    title: 'Academic Block B - Restroom sensor flush running continuously',
    description: 'Solenoid valve stuck open on urinal #2 on 1st floor gents washroom.',
    category: 'Plumbing / Water',
    severity: 'High',
    location: 'Academic Block',
    floor: '1st Floor',
    room: 'Washroom B-102',
    exactLocation: 'Urinal bay unit 2',
    status: 'Fixed',
    impactScore: 74,
    affectedStudents: 50,
    supportCount: 17,
    assignedCrew: 'Plumbing Crew',
    createdAt: '2026-10-04T09:00:00Z',
    deadline: '2026-10-05T09:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-04T09:00:00Z', note: 'Continuous flush water waste reported.' },
      { status: 'ASSIGNED', time: '2026-10-04T10:00:00Z', note: 'Plumbing assigned.' },
      { status: 'FIXED', time: '2026-10-05T08:30:00Z', note: 'Solenoid diaphragm cleaned and recalibrated.' }
    ],
    isRecurring: true,
    recurrenceCount: 3,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1019',
    enrollment: '251B186',
    title: 'Hostel B common room water cooler compressor humming but warm',
    description: 'Refrigerant line leak detected on BlueStar 120L storage cooler; drinking water warm.',
    category: 'Electrical',
    severity: 'High',
    location: 'Hostel B',
    floor: 'Ground Floor',
    room: 'Common Room corridor',
    exactLocation: 'Beside indoor TT table',
    status: 'In Progress',
    impactScore: 82,
    affectedStudents: 95,
    supportCount: 38,
    assignedCrew: 'Electrical Crew',
    createdAt: '2026-10-05T12:00:00Z',
    deadline: '2026-10-06T12:00:00Z',
    slaBreached: true,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T12:00:00Z', note: 'Logged by hostel residents.' },
      { status: 'ASSIGNED', time: '2026-10-05T14:00:00Z', note: 'Assigned to Electrical Crew.' },
      { status: 'IN PROGRESS', time: '2026-10-06T09:00:00Z', note: 'Gas charging and copper braising in progress.' }
    ],
    isRecurring: true,
    recurrenceCount: 4,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1020',
    enrollment: '251A204',
    title: 'Wind Tunnel power factor correction capacitor bank tripping',
    description: 'Harmonic distortion during high voltage compressor startup trips circuit breaker 4.',
    category: 'Electrical',
    severity: 'Critical',
    location: 'Wind Tunnel',
    floor: 'Ground Floor',
    room: 'Electrical Sub-panel WT',
    exactLocation: 'Main LT Panel breaker 4',
    status: 'In Progress',
    impactScore: 95,
    affectedStudents: 22,
    supportCount: 8,
    assignedCrew: 'Electrical Crew',
    createdAt: '2026-10-05T15:00:00Z',
    deadline: '2026-10-06T11:00:00Z',
    slaBreached: true,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T15:00:00Z', note: 'Breaker tripped twice during research runs.' },
      { status: 'ASSIGNED', time: '2026-10-05T15:30:00Z', note: 'Assigned to Shri Ramswaroop.' },
      { status: 'IN PROGRESS', time: '2026-10-06T08:00:00Z', note: 'Testing capacitive reactance and thermal overload.' }
    ],
    isRecurring: true,
    recurrenceCount: 3,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1021',
    enrollment: '241B088',
    title: 'Lake overflow weir trash rack clogged with dry foliage',
    description: 'Autumn leaves blocking the downstream culvert grates near the road bridge.',
    category: 'Garden / Environment',
    severity: 'High',
    location: 'Lake',
    floor: 'Ground',
    room: 'Weir outlet',
    exactLocation: 'South-east bridge weir spillway',
    status: 'Reviewed',
    impactScore: 76,
    affectedStudents: 15,
    supportCount: 6,
    assignedCrew: null,
    createdAt: '2026-10-06T07:00:00Z',
    deadline: '2026-10-07T07:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-06T07:00:00Z', note: 'Reported.' },
      { status: 'REVIEWED', time: '2026-10-06T08:30:00Z', note: 'Approved for grounds crew clearance.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1022',
    enrollment: '251F044',
    title: 'Cafeteria upper terrace glass door latch stuck',
    description: 'Emergency exit push bar jammed on outdoor dining terrace.',
    category: 'Security',
    severity: 'Medium',
    location: 'Cafeteria',
    floor: '1st Floor',
    room: 'Terrace Dining Deck',
    exactLocation: 'South glass door emergency bar',
    status: 'Assigned',
    impactScore: 64,
    affectedStudents: 40,
    supportCount: 10,
    assignedCrew: 'Furniture & Carpentry',
    createdAt: '2026-10-05T17:30:00Z',
    deadline: '2026-10-06T17:30:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T17:30:00Z', note: 'Reported.' },
      { status: 'ASSIGNED', time: '2026-10-06T09:00:00Z', note: 'Assigned to Kailash Carpenter.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1023',
    enrollment: '251C119',
    title: 'Academic Block B - Lecture Hall 105 microphone battery dead',
    description: 'Wireless collar mic batteries depleted prior to scheduled Thermodynamics lecture.',
    category: 'Classroom',
    severity: 'Low',
    location: 'Academic Block',
    floor: '1st Floor',
    room: 'LH-105',
    exactLocation: 'Professor podium AV rack',
    status: 'Closed',
    impactScore: 32,
    affectedStudents: 75,
    supportCount: 12,
    assignedCrew: 'IT / Network Team',
    createdAt: '2026-10-01T08:45:00Z',
    deadline: '2026-10-01T10:45:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-01T08:45:00Z', note: 'Reported.' },
      { status: 'FIXED', time: '2026-10-01T09:15:00Z', note: 'Replaced with fresh 9V rechargeable pack.' },
      { status: 'STUDENT VERIFIED', time: '2026-10-01T10:00:00Z', note: 'Sound test passed.' },
      { status: 'CLOSED', time: '2026-10-01T10:05:00Z', note: 'Closed.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: { verified: true, note: 'Mic working loud and clear!' }
  },
  {
    id: 'CMP-1024',
    enrollment: '251B186',
    title: 'Library 2nd Floor AP-2 high latency during evening hours',
    description: 'Ping times exceed 450ms when more than 20 students join the campus VPN network simultaneously.',
    category: 'Wi-Fi / Network',
    severity: 'High',
    location: 'Library',
    floor: '2nd Floor',
    room: 'Reading Hall East',
    exactLocation: 'Access Point AP-2 ceiling pod',
    status: 'Submitted',
    impactScore: 82,
    affectedStudents: 26,
    supportCount: 8,
    assignedCrew: 'IT / Network Team',
    createdAt: '2026-10-06T09:30:00Z',
    deadline: '2026-10-07T09:30:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-06T09:30:00Z', note: 'Reported with speedtest latency log.' }
    ],
    isRecurring: true,
    recurrenceCount: 5,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1025',
    enrollment: '251A204',
    title: 'Hostel A water cooler second filter cartridge overdue for replacement',
    description: 'TDS meter reads 380ppm on the 2nd floor drinking water dispenser.',
    category: 'Plumbing / Water',
    severity: 'High',
    location: 'Hostel A',
    floor: '2nd Floor',
    room: 'Corridor Water Station',
    exactLocation: 'Beside Staircase 2',
    status: 'In Progress',
    impactScore: 79,
    affectedStudents: 45,
    supportCount: 16,
    assignedCrew: 'Plumbing Crew',
    createdAt: '2026-10-05T16:00:00Z',
    deadline: '2026-10-06T16:00:00Z',
    slaBreached: true,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T16:00:00Z', note: 'Reported.' },
      { status: 'ASSIGNED', time: '2026-10-05T17:00:00Z', note: 'Assigned to Plumbing Crew.' },
      { status: 'IN PROGRESS', time: '2026-10-06T10:00:00Z', note: 'Replacement activated carbon block staged.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1026',
    enrollment: '251C119',
    title: 'Sports Complex basketball court floodlight pole 3 fuse blown',
    description: 'East half of outdoor court in shadow during inter-batch tournament matches.',
    category: 'Electrical',
    severity: 'Medium',
    location: 'Sports Complex',
    floor: 'Ground',
    room: 'Outdoor Courts',
    exactLocation: 'Pole 3 eastern perimeter',
    status: 'Assigned',
    impactScore: 60,
    affectedStudents: 32,
    supportCount: 9,
    assignedCrew: 'Electrical Crew',
    createdAt: '2026-10-05T20:00:00Z',
    deadline: '2026-10-07T20:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T20:00:00Z', note: 'Sports secretary reported.' },
      { status: 'ASSIGNED', time: '2026-10-06T08:00:00Z', note: 'Assigned.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1027',
    enrollment: '241B088',
    title: 'CDC & BYTES server room backup air conditioner error code E4',
    description: 'Secondary split AC unit tripping on high pressure thermal cut-off.',
    category: 'Electrical',
    severity: 'Critical',
    location: 'CDC & BYTES',
    floor: 'Ground Floor',
    room: 'Server Facility',
    exactLocation: 'Rack 4 duct vent',
    status: 'In Progress',
    impactScore: 96,
    affectedStudents: 85,
    supportCount: 5,
    assignedCrew: 'Electrical Crew',
    createdAt: '2026-10-06T05:00:00Z',
    deadline: '2026-10-06T09:00:00Z',
    slaBreached: true,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-06T05:00:00Z', note: 'Automated SNMP alert from server rack.' },
      { status: 'ASSIGNED', time: '2026-10-06T05:30:00Z', note: 'Emergency dispatch.' },
      { status: 'IN PROGRESS', time: '2026-10-06T06:00:00Z', note: 'Condenser fan motor replacement.' }
    ],
    isRecurring: true,
    recurrenceCount: 2,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1028',
    enrollment: '251F044',
    title: 'Cafeteria recycling waste bin lid hinge sheared',
    description: 'Dry waste compartment lid separated from pedal mechanism near south entrance.',
    category: 'Furniture',
    severity: 'Low',
    location: 'Cafeteria',
    floor: 'Ground Floor',
    room: 'South Entrance Foyer',
    exactLocation: 'Segregation Bin 2',
    status: 'Closed',
    impactScore: 30,
    affectedStudents: 50,
    supportCount: 4,
    assignedCrew: 'Furniture & Carpentry',
    createdAt: '2026-10-02T12:00:00Z',
    deadline: '2026-10-05T12:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-02T12:00:00Z', note: 'Reported.' },
      { status: 'FIXED', time: '2026-10-03T14:00:00Z', note: 'New steel hinge rivet fastened.' },
      { status: 'STUDENT VERIFIED', time: '2026-10-04T09:00:00Z', note: 'Verified by student.' },
      { status: 'CLOSED', time: '2026-10-04T09:05:00Z', note: 'Closed.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: { verified: true, note: 'Lid opens smoothly now.' }
  },
  {
    id: 'CMP-1029',
    enrollment: '231A150',
    title: 'Mandir lakeside stone bench cracked support slab',
    description: 'Granite seating slab near meditation tree wobbly after heavy rain soil shifting.',
    category: 'Civil Maintenance',
    severity: 'Medium',
    location: 'Mandir',
    floor: 'Ground',
    room: 'Garden Lawn',
    exactLocation: 'Bench #3 lakeside lawn',
    status: 'Reviewed',
    impactScore: 52,
    affectedStudents: 20,
    supportCount: 6,
    assignedCrew: null,
    createdAt: '2026-10-06T08:00:00Z',
    deadline: '2026-10-08T08:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-06T08:00:00Z', note: 'Reported.' },
      { status: 'REVIEWED', time: '2026-10-06T08:45:00Z', note: 'Approved.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1030',
    enrollment: '251B186',
    title: 'Kabbad Khana scrap sorting bay rain protection tarp torn',
    description: 'High winds damaged the protective corrugated sheeting covering cardboard recycling bay.',
    category: 'Civil Maintenance',
    severity: 'Medium',
    location: 'Kabbad Khana',
    floor: 'Ground',
    room: 'Sorting Shed',
    exactLocation: 'Bay 2 cardboard store',
    status: 'Assigned',
    impactScore: 56,
    affectedStudents: 10,
    supportCount: 3,
    assignedCrew: 'Civil Maintenance Team',
    createdAt: '2026-10-05T14:30:00Z',
    deadline: '2026-10-07T14:30:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-05T14:30:00Z', note: 'Reported.' },
      { status: 'ASSIGNED', time: '2026-10-06T09:00:00Z', note: 'Assigned.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1031',
    enrollment: '251A204',
    title: 'MPH stage automated curtain winch remote cable frayed',
    description: 'Main auditorium motorized backdrop winch cord showing wear on the guide pulley.',
    category: 'Electrical',
    severity: 'High',
    location: 'MPH',
    floor: 'Ground Floor',
    room: 'Main Auditorium Stage',
    exactLocation: 'Stage left winch panel',
    status: 'In Progress',
    impactScore: 78,
    affectedStudents: 60,
    supportCount: 11,
    assignedCrew: 'Electrical Crew',
    createdAt: '2026-10-04T17:00:00Z',
    deadline: '2026-10-06T17:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-04T17:00:00Z', note: 'Cultural team reported.' },
      { status: 'ASSIGNED', time: '2026-10-05T09:00:00Z', note: 'Assigned.' },
      { status: 'IN PROGRESS', time: '2026-10-06T11:00:00Z', note: 'Steel wire rope replacement in progress.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1032',
    enrollment: '241D302',
    title: 'Wind Tunnel intake air filter differential pressure warning',
    description: 'Air velocity decreased by 8% due to dust storm particulate accumulation on primary screen.',
    category: 'Laboratory Equipment',
    severity: 'High',
    location: 'Wind Tunnel',
    floor: 'Ground Floor',
    room: 'Intake Bay',
    exactLocation: 'Screen grid #1',
    status: 'Reviewed',
    impactScore: 85,
    affectedStudents: 22,
    supportCount: 7,
    assignedCrew: null,
    createdAt: '2026-10-06T08:30:00Z',
    deadline: '2026-10-07T08:30:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-06T08:30:00Z', note: 'Logged by lab assistant.' },
      { status: 'REVIEWED', time: '2026-10-06T09:00:00Z', note: 'Approved for filter pressure washing.' }
    ],
    isRecurring: true,
    recurrenceCount: 2,
    resolutionFeedback: null
  },
  {
    id: 'CMP-1033',
    enrollment: '251C119',
    title: 'Delivery gate biometric scanner screen moisture fogging',
    description: 'Courier authentication pad difficult to read during early morning hours due to dew ingress.',
    category: 'Security',
    severity: 'Medium',
    location: 'Delivery',
    floor: 'Ground',
    room: 'Security Checkpoint',
    exactLocation: 'North gate pedestrian turnstile',
    status: 'Fixed',
    impactScore: 50,
    affectedStudents: 30,
    supportCount: 6,
    assignedCrew: 'Security & Safety Cell',
    createdAt: '2026-10-03T07:00:00Z',
    deadline: '2026-10-05T07:00:00Z',
    slaBreached: false,
    timeline: [
      { status: 'SUBMITTED', time: '2026-10-03T07:00:00Z', note: 'Reported.' },
      { status: 'ASSIGNED', time: '2026-10-03T09:00:00Z', note: 'Assigned.' },
      { status: 'FIXED', time: '2026-10-05T15:00:00Z', note: 'IP66 weather-seal gasket installed.' }
    ],
    isRecurring: false,
    recurrenceCount: 1,
    resolutionFeedback: null
  }
];

export const INITIAL_NOTIFICATIONS = [
  {
    id: 'ntf-1',
    userRole: 'student',
    enrollment: '251B186',
    title: 'Resolution Verification Required',
    message: 'Your issue CMP-1002 (Hostel B water valve) has been marked as Fixed. Please verify the resolution.',
    type: 'verification',
    complaintId: 'CMP-1002',
    timestamp: '2026-10-05T16:05:00Z',
    read: false,
    actionRequired: true
  },
  {
    id: 'ntf-2',
    userRole: 'student',
    enrollment: '251B186',
    title: 'Good Deed Verified! 🌱',
    message: 'Your Good Deed GD-501 (Closed leaking valve) was verified. +30 Sprig Points awarded!',
    type: 'reward',
    timestamp: '2026-10-05T10:00:00Z',
    read: false,
    points: 30
  },
  {
    id: 'ntf-3',
    userRole: 'student',
    enrollment: '251B186',
    title: 'Sprig Growth Milestone 🌿',
    message: 'Your personal Sprig grew to Stage 3 (Young Plant)! Keep contributing quality actions.',
    type: 'growth',
    timestamp: '2026-10-05T10:02:00Z',
    read: true
  },
  {
    id: 'ntf-4',
    userRole: 'student',
    enrollment: '251B186',
    title: 'Recurring Issue Detected near Library ⚠️',
    message: 'Library Wi-Fi has 6 recurring complaints. Priority elevated to campus level.',
    type: 'warning',
    timestamp: '2026-10-04T12:00:00Z',
    read: true
  },
  {
    id: 'ntf-5',
    userRole: 'faculty',
    title: 'SLA Breach Warning ⚠️',
    message: 'CMP-1003 (Wind Tunnel exhaust dampener) has breached the critical 2-hour SLA window.',
    type: 'sla_breach',
    complaintId: 'CMP-1003',
    timestamp: '2026-10-06T12:05:00Z',
    read: false
  },
  {
    id: 'ntf-6',
    userRole: 'faculty',
    title: 'High-Impact Issue Reported',
    message: 'New critical report CMP-1014 (Laboratory Block chemical exhaust) impact score 94.',
    type: 'urgent',
    complaintId: 'CMP-1014',
    timestamp: '2026-10-05T14:05:00Z',
    read: false
  },
  {
    id: 'ntf-7',
    userRole: 'faculty',
    title: 'Recurring Infrastructure Pattern',
    message: 'Library Wi-Fi infrastructure exhibits recurring drops (8 reports in 7 days). Preventive inspection advised.',
    type: 'recurring',
    timestamp: '2026-10-05T09:00:00Z',
    read: true
  }
];

// Helper to initialize and retrieve localStorage state
let memoryStore = null;

export function getStore() {
  if (typeof localStorage !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        return JSON.parse(raw);
      }
    } catch (e) {
      console.error('Failed reading localStorage', e);
    }
  } else if (memoryStore) {
    return memoryStore;
  }

  // Fallback initial state
  const initial = {
    complaints: INITIAL_COMPLAINTS,
    goodDeeds: INITIAL_GOOD_DEEDS,
    student: INITIAL_STUDENT,
    leaderboard: INITIAL_LEADERBOARD,
    crews: CREWS,
    notifications: INITIAL_NOTIFICATIONS,
    session: null // { role: 'student' | 'faculty', id: string }
  };
  saveStore(initial);
  return initial;
}

export function saveStore(store) {
  memoryStore = store;
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    } catch (e) {
      console.error('Failed saving to localStorage', e);
    }
  }
}

export function resetStore() {
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (e) {
      console.error('Failed removing from localStorage', e);
    }
  }
  memoryStore = null;
  return getStore();
}
