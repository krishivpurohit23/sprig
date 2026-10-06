// ==========================================
// SPRIG RULE-BASED INTELLIGENCE ENGINE
// ==========================================

import { CATEGORIES, CREWS, CAMPUS_LOCATIONS } from './data.js';

// Keyword rules for NLP analysis
const KEYWORD_RULES = [
  {
    category: 'Wi-Fi / Network',
    crew: 'IT / Network Team',
    keywords: ['wifi', 'wi-fi', 'internet', 'network', 'router', 'ap', 'disconnect', 'slow net', 'lan', 'ethernet', 'cable', 'ping', 'dns', 'signal'],
    priority: 'High'
  },
  {
    category: 'Electrical',
    crew: 'Electrical Crew',
    keywords: ['fan', 'light', 'tube', 'switch', 'socket', 'bulb', 'wire', 'spark', 'shock', 'tripped', 'breaker', 'ac', 'cooler', 'geyser', 'power', 'fuse', 'voltage', 'flicker'],
    priority: 'High'
  },
  {
    category: 'Plumbing / Water',
    crew: 'Plumbing Crew',
    keywords: ['water', 'tap', 'leak', 'pipe', 'valve', 'sewage', 'drain', 'overflow', 'flush', 'sink', 'toilet', 'drinking water', 'geyser leak', 'basin'],
    priority: 'High'
  },
  {
    category: 'Cleanliness',
    crew: 'Housekeeping Department',
    keywords: ['dirty', 'dust', 'trash', 'garbage', 'clean', 'sweep', 'mop', 'stench', 'smell', 'litter', 'waste', 'spill', 'washroom dirty'],
    priority: 'Medium'
  },
  {
    category: 'Classroom',
    crew: 'Civil Maintenance Team',
    keywords: ['projector', 'podium', 'board', 'marker', 'chalk', 'screen', 'speaker', 'mic', 'microphone', 'desk', 'bench', 'classroom', 'lecture', 'hall', 'lt-'],
    priority: 'Medium'
  },
  {
    category: 'Laboratory Equipment',
    crew: 'Laboratory Equipment Techs',
    keywords: ['wind tunnel', 'oscilloscope', 'machine', 'apparatus', 'fume hood', 'chemical', 'resonance', 'vibration', 'compressor', 'sensor', 'specimen', 'tensile'],
    priority: 'Critical'
  },
  {
    category: 'Furniture',
    crew: 'Furniture & Carpentry',
    keywords: ['chair', 'table', 'broken leg', 'hinge', 'door handle', 'cupboard', 'almirah', 'bed', 'mattress', 'curtain', 'lock', 'desk'],
    priority: 'Low'
  },
  {
    category: 'Security',
    crew: 'Security & Safety Cell',
    keywords: ['cctv', 'camera', 'guard', 'gate', 'lock broken', 'theft', 'hazard', 'fire extinguisher', 'fence', 'intrusion', 'dark area'],
    priority: 'High'
  },
  {
    category: 'Garden / Environment',
    crew: 'Gardening & Greenery',
    keywords: ['tree', 'branch', 'grass', 'lawn', 'fountain', 'lake', 'leaves', 'plant', 'weeds', 'algae', 'horticulture', 'sprinkler'],
    priority: 'Medium'
  }
];

/**
 * Real-time Sprig Intelligence analyzer
 * Analyzes title, description, location to suggest:
 * - Category
 * - Severity / Priority
 * - Responsible Crew
 * - Estimated Impact Score
 * - Recurrence Alert
 */
export function analyzeIssueText(title = '', description = '', location = '') {
  const text = `${title} ${description} ${location}`.toLowerCase();
  
  let bestMatch = null;
  let maxScore = 0;

  for (const rule of KEYWORD_RULES) {
    let score = 0;
    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        score += kw.length > 5 ? 3 : 2;
      }
    }
    if (score > maxScore) {
      maxScore = score;
      bestMatch = rule;
    }
  }

  // Fallbacks if no match
  const suggestedCategory = bestMatch ? bestMatch.category : 'Cleanliness';
  const suggestedCrew = bestMatch ? bestMatch.crew : 'Civil Maintenance Team';
  
  // Severity deduction
  let suggestedSeverity = 'Medium';
  if (text.includes('critical') || text.includes('danger') || text.includes('fire') || text.includes('shock') || text.includes('explosion') || text.includes('fume')) {
    suggestedSeverity = 'Critical';
  } else if (text.includes('urgent') || text.includes('leak') || text.includes('not working') || text.includes('exam') || text.includes('disconnect') || text.includes('dark')) {
    suggestedSeverity = 'High';
  } else if (bestMatch) {
    suggestedSeverity = bestMatch.priority;
  }

  // Potential recurrence prediction
  const isPotentialRecurrence = text.includes('again') || text.includes('still') || text.includes('repeatedly') || text.includes('always') || text.includes('keeps') || text.includes('third time');

  return {
    category: suggestedCategory,
    severity: suggestedSeverity,
    crew: suggestedCrew,
    isPotentialRecurrence,
    confidence: Math.min(96, Math.max(68, maxScore * 14 + 50)),
    reasoning: `Detected indicators for [${suggestedCategory}] matching keywords in description. Assigned recommended response team: [${suggestedCrew}].`
  };
}

/**
 * Calculates dynamically the Impact Score (0–100)
 */
export function calculateImpactScore(complaint) {
  let score = 0;

  // 1. Severity weight (max 35)
  const severityWeights = { 'Critical': 35, 'High': 26, 'Medium': 16, 'Low': 8 };
  score += severityWeights[complaint.severity] || 15;

  // 2. Affected students weight (max 25)
  const affected = complaint.affectedStudents || 10;
  score += Math.min(25, Math.round(affected * 0.35));

  // 3. Community support & confirmations (max 15)
  const support = complaint.supportCount || 1;
  score += Math.min(15, Math.round(support * 0.8));

  // 4. Recurrence penalty (max 15)
  if (complaint.isRecurring || (complaint.recurrenceCount && complaint.recurrenceCount > 1)) {
    score += Math.min(15, (complaint.recurrenceCount || 2) * 4);
  }

  // 5. High-traffic location multiplier (max 10)
  const highTraffic = ['Library', 'Academic Block', 'Cafeteria', 'Wind Tunnel', 'Laboratory Block'];
  if (highTraffic.includes(complaint.location)) {
    score += 10;
  } else {
    score += 4;
  }

  return Math.min(99, Math.max(25, score));
}

/**
 * Searches existing local complaints for potential duplicates
 */
export function findSimilarComplaints(newIssue, existingComplaints = []) {
  if (!newIssue.title && !newIssue.description) return [];

  const textToTokens = (str) => 
    (str || '').toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 2 && !['the', 'and', 'for', 'with', 'room', 'floor', 'near'].includes(w));

  const newTokens = new Set([...textToTokens(newIssue.title), ...textToTokens(newIssue.description)]);

  const results = [];

  for (const item of existingComplaints) {
    // Only check active or recent complaints
    if (item.status === 'Closed') continue;

    let matchPoints = 0;

    // Same location
    if (newIssue.location && item.location && newIssue.location.toLowerCase() === item.location.toLowerCase()) {
      matchPoints += 3;
    }

    // Same category
    if (newIssue.category && item.category && newIssue.category.toLowerCase() === item.category.toLowerCase()) {
      matchPoints += 3;
    }

    // Word token overlap
    const itemTokens = textToTokens(`${item.title} ${item.description}`);
    for (const t of itemTokens) {
      if (newTokens.has(t)) {
        matchPoints += 2;
      }
    }

    if (matchPoints >= 5) {
      results.push({
        complaint: item,
        matchScore: matchPoints,
        similarityPercentage: Math.min(96, matchPoints * 12)
      });
    }
  }

  return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);
}

/**
 * Calculates dynamic Campus Health for every location based on real active complaints
 */
export function computeLocationHealthScores(locations, complaints) {
  const healthMap = {};

  for (const loc of locations) {
    const locComplaints = complaints.filter(c => c.location === loc.name);
    let health = 5.0; // Start at 5/5

    for (const c of locComplaints) {
      if (c.status === 'Closed') {
        // Closed issues do not reduce health; they validate health!
        continue;
      }
      
      let deduction = 0;
      if (c.severity === 'Critical') deduction = 1.8;
      else if (c.severity === 'High') deduction = 1.1;
      else if (c.severity === 'Medium') deduction = 0.5;
      else deduction = 0.2;

      // Status mitigation: In Progress / Fixed issues recover half the penalty
      if (c.status === 'Fixed') {
        deduction *= 0.2;
      } else if (c.status === 'In Progress') {
        deduction *= 0.6;
      }

      // Recurrence adds weight
      if (c.isRecurring) {
        deduction += 0.4;
      }

      health -= deduction;
    }

    // Clamp health between 1 and 5
    const finalScore = Math.max(1, Math.min(5, Math.round(health)));
    
    healthMap[loc.id] = {
      score: finalScore,
      rating: finalScore >= 4 ? 'Healthy' : finalScore === 3 ? 'Moderate' : finalScore === 2 ? 'Needs Attention' : 'Critical',
      color: finalScore >= 4 ? '#10B981' : finalScore === 3 ? '#F59E0B' : finalScore === 2 ? '#F97316' : '#EF4444',
      totalComplaints: locComplaints.length,
      openComplaints: locComplaints.filter(c => c.status !== 'Closed').length,
      fixedComplaints: locComplaints.filter(c => c.status === 'Fixed' || c.status === 'Closed').length,
      recurringDetected: locComplaints.some(c => c.isRecurring && c.status !== 'Closed')
    };
  }

  return healthMap;
}

/**
 * Recurring Issue Radar
 * Aggregates patterns across locations and categories
 */
export function detectRecurringIssues(complaints) {
  const groups = {};

  for (const c of complaints) {
    const key = `${c.location}__${c.category}`;
    if (!groups[key]) {
      groups[key] = {
        location: c.location,
        category: c.category,
        complaints: [],
        totalCount: 0,
        fixedCount: 0,
        openCount: 0
      };
    }
    groups[key].complaints.push(c);
    groups[key].totalCount++;
    if (c.status === 'Closed' || c.status === 'Fixed') {
      groups[key].fixedCount++;
    } else {
      groups[key].openCount++;
    }
  }

  const recurringList = [];

  for (const key in groups) {
    const g = groups[key];
    if (g.totalCount >= 2 || g.complaints.some(c => c.isRecurring)) {
      let recommendation = '';
      if (g.category === 'Wi-Fi / Network') {
        recommendation = 'Inspect underlying optical PoE switch infrastructure and DHCP lease timeouts instead of rebooting individual access points.';
      } else if (g.category === 'Plumbing / Water') {
        recommendation = 'Check main riser pressure regulation valve and replace degraded CPVC union gaskets systematically.';
      } else if (g.category === 'Electrical') {
        recommendation = 'Execute thermal harmonic audit on sub-distribution busbars to prevent cyclic capacitor tripping.';
      } else if (g.category === 'Laboratory Equipment') {
        recommendation = 'Perform structural acoustic re-balancing and vibration damping mount replacement.';
      } else {
        recommendation = 'Conduct root-cause preventative maintenance overhaul and replace aging consumables.';
      }

      recurringList.push({
        id: `REC-${g.location.toLowerCase().replace(/\s+/g, '_')}`,
        title: `${g.location} ${g.category}`,
        location: g.location,
        category: g.category,
        reportCount: g.totalCount,
        previousFixes: g.fixedCount,
        openIssues: g.openCount,
        daysSpan: 7,
        recommendation,
        severity: g.openCount > 2 ? 'Critical' : 'High',
        affectedCount: g.complaints.reduce((acc, c) => acc + (c.affectedStudents || 10), 0)
      });
    }
  }

  return recurringList;
}

/**
 * Plant stage definitions and requirements
 */
export const PLANT_STAGES = [
  { stage: 1, name: 'SEED', minPoints: 0, maxPoints: 49, icon: '🌱', description: 'Nurtured in healthy fertile soil with your first good actions.' },
  { stage: 2, name: 'SPROUT', minPoints: 50, maxPoints: 149, icon: '🌿', description: 'Emerging with fresh twin leaves and tender vitality.' },
  { stage: 3, name: 'YOUNG PLANT', minPoints: 150, maxPoints: 299, icon: '🌿', description: 'Strong rooted stem supporting multiple healthy leafy branches.' },
  { stage: 4, name: 'GROWING SPRIG', minPoints: 300, maxPoints: 499, icon: '🌳', description: 'Thriving canopy spreading green vibrancy across your profile.' },
  { stage: 5, name: 'FLOURISHING SPRIG', minPoints: 500, maxPoints: 9999, icon: '🌸🌳', description: 'Full blossoming botanical masterwork with rare campus flora.' }
];

export function getPlantStage(points) {
  for (let i = PLANT_STAGES.length - 1; i >= 0; i--) {
    if (points >= PLANT_STAGES[i].minPoints) {
      return PLANT_STAGES[i];
    }
  }
  return PLANT_STAGES[0];
}
