/**
 * MAINTENANCE TASK PRIORITY RANKING ALGORITHM
 * University Maintenance Monitoring and Management Platform
 * 
 * Formula:
 * PS = CW + SW + 3S + 3U + 4SR + 2AP + 2LI + WT
 * 
 * Features:
 * - Automated NLP/Keyword extraction for Severity (S: 1-5), Urgency (U: 1-5),
 *   and Safety Risk (SR: 0-5) directly from the requester form description.
 * - Dynamic resolution of Category (CW), Subcategory (SW), Affected People (AP),
 *   Location Importance (LI), and Waiting Time (WT).
 * - Multi-criteria task ranking and tie-breaking engine.
 * - Pure algorithmic JavaScript code (No UI dependencies).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MaintenancePriorityAlgorithm = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {

  // ==========================================
  // 1. DATA DICTIONARIES & SCORING MATRICES
  // ==========================================

  // 1.1 Category Weights (CW: 3 - 10)
  const CATEGORY_WEIGHTS = {
    'Electricity': 10,
    'Water': 9,
    'Civil & Structural': 8,
    'HVAC': 7,
    'Academic': 5,
    'Cleaning': 4,
    'Gardening': 3
  };

  // 1.2 Subcategory Weights (SW: 1 - 5)
  const SUBCATEGORY_DEFINITIONS = [
    // Electricity (CW = 10)
    {
      category: 'Electricity',
      weight: 5,
      name: 'Electrical Panels; Power Supply; Wiring & Cables',
      items: ['Electrical Panels', 'Power Supply', 'Wiring & Cables', 'Wiring', 'Cables', 'Distribution Board', 'Breaker']
    },
    {
      category: 'Electricity',
      weight: 4,
      name: 'Switches & Sockets',
      items: ['Switches & Sockets', 'Switches', 'Sockets', 'Plugs', 'Wall Outlet']
    },
    {
      category: 'Electricity',
      weight: 3,
      name: 'Ceiling Fans',
      items: ['Ceiling Fans', 'Ceiling Fan', 'Fans']
    },
    {
      category: 'Electricity',
      weight: 2,
      name: 'Lighting & Fixtures',
      items: ['Lighting & Fixtures', 'Lighting', 'Fixtures', 'Lights', 'Fluorescent Tube', 'Bulb']
    },

    // Water (CW = 9)
    {
      category: 'Water',
      weight: 5,
      name: 'Water Pumps; Water Supply',
      items: ['Water Pumps', 'Water Supply', 'Pumps', 'Main Water Line', 'Overhead Tank']
    },
    {
      category: 'Water',
      weight: 4,
      name: 'Pipelines & Leaks; Toilets & Flushing; Drainage & Overflow',
      items: ['Pipelines & Leaks', 'Pipelines', 'Leaks', 'Toilets & Flushing', 'Toilets', 'Flushing', 'Drainage & Overflow', 'Drainage', 'Overflow', 'Blocked Sewer']
    },
    {
      category: 'Water',
      weight: 3,
      name: 'Taps & Valves',
      items: ['Taps & Valves', 'Taps', 'Valves', 'Faucet', 'Shower Head']
    },

    // Civil & Structural (CW = 8)
    {
      category: 'Civil & Structural',
      weight: 5,
      name: 'Structural Damage; Ceilings & Roofs; Elevator',
      items: ['Structural Damage', 'Ceilings & Roofs', 'Ceilings', 'Roofs', 'Elevator', 'Lifts', 'Beam Crack', 'Pillar Damage']
    },
    {
      category: 'Civil & Structural',
      weight: 3,
      name: 'Walls & Plaster; Flooring & Tiles; Doors & Windows',
      items: ['Walls & Plaster', 'Walls', 'Plaster', 'Flooring & Tiles', 'Flooring', 'Tiles', 'Doors & Windows', 'Doors', 'Windows', 'Glass Pane', 'Hinges']
    },
    {
      category: 'Civil & Structural',
      weight: 2,
      name: 'Furniture & Desks',
      items: ['Furniture & Desks', 'Furniture', 'Desks', 'Tables', 'Chairs', 'Benches']
    },

    // HVAC (CW = 7)
    {
      category: 'HVAC',
      weight: 5,
      name: 'Chiller Systems',
      items: ['Chiller Systems', 'Chillers', 'Central Air Conditioning', 'Central AC']
    },
    {
      category: 'HVAC',
      weight: 4,
      name: 'Air Conditioning Unit; Duct Ventilation',
      items: ['Air Conditioning Unit', 'AC Unit', 'Air Conditioning', 'Duct Ventilation', 'Ventilation', 'Split AC']
    },
    {
      category: 'HVAC',
      weight: 3,
      name: 'Exhaust Fans',
      items: ['Exhaust Fans', 'Exhaust Fan', 'Vent Fan']
    },
    {
      category: 'HVAC',
      weight: 2,
      name: 'Thermostat Control; Filter Replacement',
      items: ['Thermostat Control', 'Thermostat', 'Filter Replacement', 'AC Filters', 'Filter Cleaning']
    },

    // Academic (CW = 5)
    {
      category: 'Academic',
      weight: 5,
      name: 'Laboratory Equipment',
      items: ['Laboratory Equipment', 'Lab Equipment', 'Lab Instruments', 'Fume Hood', 'Centrifuge', 'Microscope']
    },
    {
      category: 'Academic',
      weight: 4,
      name: 'Classroom Equipment',
      items: ['Classroom Equipment', 'Podium', 'Smart Board', 'Microphone System', 'Sound System']
    },
    {
      category: 'Academic',
      weight: 3,
      name: 'Projectors & Displays',
      items: ['Projectors & Displays', 'Projectors', 'Displays', 'Projector Screens', 'TV Screen']
    },
    {
      category: 'Academic',
      weight: 2,
      name: 'Whiteboards; Academic Furniture',
      items: ['Whiteboards; Academic Furniture', 'Whiteboards', 'Academic Furniture', 'Lecture Hall Seats']
    },

    // Cleaning (CW = 4)
    {
      category: 'Cleaning',
      weight: 5,
      name: 'Hazardous Spill',
      items: ['Hazardous Spill', 'Chemical Spill', 'Biohazard', 'Acid Spill', 'Mercury Spill']
    },
    {
      category: 'Cleaning',
      weight: 4,
      name: 'Toilet & Sanitation; Waste Management',
      items: ['Toilet & Sanitation', 'Sanitation', 'Waste Management', 'Garbage Disposal', 'Bio Waste']
    },
    {
      category: 'Cleaning',
      weight: 3,
      name: 'Classroom Cleaning',
      items: ['Classroom Cleaning', 'Lab Cleaning', 'Auditorium Cleaning']
    },
    {
      category: 'Cleaning',
      weight: 2,
      name: 'Corridor Cleaning',
      items: ['Corridor Cleaning', 'Hallway Cleaning', 'Staircase Cleaning']
    },
    {
      category: 'Cleaning',
      weight: 1,
      name: 'General Cleaning',
      items: ['General Cleaning', 'Dusting', 'Trash Removal', 'Litter']
    },

    // Gardening (CW = 3)
    {
      category: 'Gardening',
      weight: 5,
      name: 'Fallen/Dangerous Tree; Dangerous Branches',
      items: ['Fallen/Dangerous Tree', 'Fallen Tree', 'Dangerous Branches', 'Hazardous Tree', 'Uprooted Tree']
    },
    {
      category: 'Gardening',
      weight: 4,
      name: 'Drainage/Vegetation Obstruction',
      items: ['Drainage/Vegetation Obstruction', 'Vegetation Obstruction', 'Blocked Drain Vegetation', 'Overgrown Roots']
    },
    {
      category: 'Gardening',
      weight: 3,
      name: 'Tree Maintenance',
      items: ['Tree Maintenance', 'Tree Trimming', 'Pruning']
    },
    {
      category: 'Gardening',
      weight: 2,
      name: 'Grass Cutting',
      items: ['Grass Cutting', 'Lawn Mowing', 'Weeding']
    },
    {
      category: 'Gardening',
      weight: 1,
      name: 'General Landscaping',
      items: ['General Landscaping', 'Landscaping', 'Watering Plants', 'Garden Beds']
    }
  ];

  // 1.3 Location Importance (LI: 1.5 - 10)
  const LOCATION_DIRECTORY = {
    'Garden': { score: 1.5, zone: 'General' },
    'Quarters': { score: 2.0, zone: 'A' },
    'Guard Room': { score: 2.5, zone: 'A' },
    'TAG': { score: 3.0, zone: 'A' },
    'Canteen 1 and 2': { score: 3.5, zone: 'C' },
    'Indoor': { score: 4.0, zone: 'C' },
    'Gym': { score: 4.5, zone: 'C' },
    'Civil Canteen': { score: 5.0, zone: 'A' },
    'Medical Center': { score: 5.5, zone: 'C' },
    'Admin Building': { score: 6.0, zone: 'A' },
    'Shopping Complex': { score: 6.5, zone: 'A' },
    'Civil Engineering Division': { score: 7.0, zone: 'B' },
    'Textile and Clothing Technology Division': { score: 7.5, zone: 'B' },
    'Maritime Engineering and Nautical Science Division': { score: 8.0, zone: 'B' },
    'Mechanical Engineering Division': { score: 8.5, zone: 'B' },
    'Chemical Engineering and Polymer Technology Division': { score: 9.0, zone: 'B' },
    'Electrical and Electronic Engineering Division': { score: 9.5, zone: 'B' },
    'Hostel': { score: 10.0, zone: 'C' }
  };

  // 1.3.1 Campus Building Aliases mapping 17 campus dropdown buildings to LOCATION_DIRECTORY
  const CAMPUS_BUILDING_ALIASES = {
    'admin building': 'Admin Building',
    'guard room': 'Guard Room',
    'shopping complex': 'Shopping Complex',
    'quarters': 'Quarters',
    'tag': 'TAG',
    'civil canteen': 'Civil Canteen',
    'mechanical engineer': 'Mechanical Engineering Division',
    'mechanical engineering': 'Mechanical Engineering Division',
    'maritime engineer': 'Maritime Engineering and Nautical Science Division',
    'maritime engineering': 'Maritime Engineering and Nautical Science Division',
    'polymer & chemical engineer': 'Chemical Engineering and Polymer Technology Division',
    'polymer and chemical engineer': 'Chemical Engineering and Polymer Technology Division',
    'chemical engineering': 'Chemical Engineering and Polymer Technology Division',
    'electrical , electronic & telecommunication engineer': 'Electrical and Electronic Engineering Division',
    'electrical, electronic & telecommunication engineer': 'Electrical and Electronic Engineering Division',
    'electrical and electronic': 'Electrical and Electronic Engineering Division',
    'textile & clothing engineer': 'Textile and Clothing Technology Division',
    'textile and clothing': 'Textile and Clothing Technology Division',
    'civil engineer': 'Civil Engineering Division',
    'civil engineering': 'Civil Engineering Division',
    'hostel': 'Hostel',
    'medical center': 'Medical Center',
    'canteen 1': 'Canteen 1 and 2',
    'canteen 2': 'Canteen 1 and 2',
    'canteen 1 and 2': 'Canteen 1 and 2',
    'gym & indoor': 'Gym',
    'gym': 'Gym',
    'indoor': 'Indoor',
    'garden': 'Garden'
  };

  // 1.4 Priority Levels & Thresholds
  const PRIORITY_THRESHOLDS = {
    CRITICAL: {
      min: 75,
      max: 100,
      label: 'CRITICAL',
      color: '#dc2626',
      interpretation: 'Immediate response; emergency override can also force this level.'
    },
    HIGH: {
      min: 50,
      max: 75,
      label: 'HIGH',
      color: '#ea580c',
      interpretation: 'Prompt action, often same-day depending on local policy.'
    },
    MEDIUM: {
      min: 25,
      max: 50,
      label: 'MEDIUM',
      color: '#ca8a04',
      interpretation: 'Schedule and monitor after higher-priority requests.'
    },
    LOW: {
      min: 0,
      max: 25,
      label: 'LOW',
      color: '#16a34a',
      interpretation: 'Routine maintenance when resources are available.'
    }
  };

  // =========================================================================
  // 2. TEXT DESCRIPTION NLP & KEYWORD SCORING ENGINE (S, U, SR)
  // =========================================================================

  /**
   * Keywords and phrases used to determine Severity (S: 1 - 5) from text descriptions.
   */
  const SEVERITY_KEYWORDS = {
    5: [
      'complete failure', 'severe damage', 'completely broken', 'total breakdown', 
      'total failure', 'burst', 'collapsed', 'structural collapse', 'shattered', 
      'destroyed', 'exploded', 'blown out', 'unusable', 'completely stopped working',
      'caved in', 'submerged', 'burnt out', 'burned out', 'crushed', 'inoperable'
    ],
    4: [
      'major failure', 'substantially affected', 'broken down', 'cannot use', 
      'unable to use', 'out of order', 'stopped working', 'heavy leak', 'major leak', 
      'flooded', 'flooding', 'overflowing', 'blackout', 'no power', 'failed', 
      'severely malfunctioning', 'deep crack', 'major defect'
    ],
    3: [
      'noticeable malfunction', 'affecting normal use', 'not functioning properly', 
      'malfunctioning', 'stuck', 'jammed', 'clogged', 'blocked', 'leaking', 'leak', 
      'abnormal noise', 'loud noise', 'vibrating', 'partially broken', 'faulty', 
      'overheating', 'tripping', 'frequent trips', 'poor drainage'
    ],
    2: [
      'limited malfunction', 'still works', 'partially working', 'intermittent', 
      'slow', 'flickering', 'dripping', 'drips', 'minor leak', 'loose', 'rattling', 
      'noisy', 'cosmetic damage', 'uneven'
    ],
    1: [
      'small defect', 'function is almost normal', 'almost normal', 'minor scratch', 
      'scratched', 'paint peeling', 'loose screw', 'loose knob', 'faint noise', 
      'tiny', 'slight', 'smudge', 'very minor'
    ]
  };

  /**
   * Keywords and phrases used to determine Urgency (U: 1 - 5) from text descriptions.
   */
  const URGENCY_KEYWORDS = {
    5: [
      'immediate response', 'escalation', 'emergency', 'crisis', 'critical urgency', 
      'immediate', 'immediately', 'right now', 'stop immediately', 'danger', 
      'cannot wait', 'without delay', 'urgent response', 'top priority', 'code red',
      'at once', 'instant'
    ],
    4: [
      'prompt attention', 'same day', 'promptly', 'as soon as possible', 'asap', 
      'today', 'high urgency', 'urgently', 'urgent', 'needed quickly', 
      'fast response', 'by end of day', 'eod', 'high priority', 'time sensitive'
    ],
    3: [
      'planned attention', 'reasonable time', 'soon', 'this week', 'within a few days', 
      'attention needed', 'moderate urgency', 'upcoming days', 'needs attention soon', 
      'schedule soon'
    ],
    2: [
      'routine maintenance', 'can be handled during routine', 'within next 2 weeks', 
      'next routine', 'when convenient', 'scheduled maintenance', 'non-urgent', 
      'low urgency', 'standard maintenance'
    ],
    1: [
      'can wait', 'no immediate operational impact', 'whenever convenient', 
      'no rush', 'whenever possible', 'at leisure', 'future reference', 
      'no hurry', 'very low urgency'
    ]
  };

  /**
   * Keywords and phrases used to determine Safety Risk (SR: 0 - 5) from text descriptions.
   */
  const SAFETY_RISK_KEYWORDS = {
    5: [
      'immediate danger to people', 'major building safety', 'immediate danger', 
      'life threatening', 'electrocution', 'live wire', 'bare wire', 'explosion', 
      'fire breaking out', 'active fire', 'structural collapse danger', 
      'ceiling collapsing', 'toxic spill', 'toxic chemical', 'trapped inside elevator', 
      'trapped in lift', 'poisonous gas', 'fatal'
    ],
    4: [
      'serious risk', 'prompt control', 'electric shock', 'sparking', 'sparks', 
      'fire hazard', 'smoke', 'burning smell', 'gas leak', 'gas smell', 
      'falling debris', 'falling glass', 'high voltage', 'exposed cables', 
      'deep flood near sockets', 'severe slip hazard', 'toxic fumes', 'combustible'
    ],
    3: [
      'meaningful risk requiring precautions', 'meaningful risk', 'sharp edge', 
      'broken glass', 'loose railing', 'trip hazard', 'tripping hazard', 
      'slippery floor', 'deep water puddle', 'exposed screw', 'loose step', 
      'unstable', 'wobbly stair', 'potential hazard'
    ],
    2: [
      'limited risk', 'needs attention', 'caution needed', 'minor slip', 
      'slippery surface', 'hot surface', 'mild burn risk', 'splinter', 
      'uneven tile', 'minor trip'
    ],
    1: [
      'negligible or minimal risk', 'negligible', 'minimal risk', 'very low risk', 
      'minor splinter', 'dust', 'slight odor', 'minor bump'
    ],
    0: [
      'no identified safety risk', 'no safety risk', 'no risk', 'no hazard', 
      'safe', 'no danger', 'zero risk'
    ]
  };

  /**
   * Cleans text and normalizes spacing/characters.
   */
  function normalizeText(text) {
    if (!text || typeof text !== 'string') return '';
    return text.toLowerCase().replace(/[\r\n\t]+/g, ' ').replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
  }

  /**
   * Scans normalized text against a tiered dictionary of keywords.
   * Returns highest level matched and list of matched keywords.
   * 
   * @param {string} text 
   * @param {Object} keywordDictionary 
   * @param {number} defaultLevel 
   * @returns {{ score: number, matchedKeywords: string[], highestLevel: number }}
   */
  function analyzeTextForTier(text, keywordDictionary, defaultLevel = 1) {
    const clean = normalizeText(text);
    if (!clean) {
      return { score: defaultLevel, matchedKeywords: [], isDefault: true };
    }

    const matches = [];
    let highestScore = null;

    // Check tiers from highest (5) down to lowest (0 or 1)
    const tiers = Object.keys(keywordDictionary).map(Number).sort((a, b) => b - a);

    for (const tier of tiers) {
      const phrases = keywordDictionary[tier];
      for (const phrase of phrases) {
        const cleanPhrase = normalizeText(phrase);
        // Word boundary safe matching
        const regex = new RegExp(`\\b${cleanPhrase.replace(/\s+/g, '\\s+')}\\b`, 'i');
        if (regex.test(clean)) {
          matches.push({ tier, phrase });
          if (highestScore === null || tier > highestScore) {
            highestScore = tier;
          }
        }
      }
    }

    if (highestScore !== null) {
      return {
        score: highestScore,
        matchedKeywords: matches.map(m => m.phrase),
        isDefault: false
      };
    }

    return {
      score: defaultLevel,
      matchedKeywords: [],
      isDefault: true
    };
  }

  /**
   * Extracts Severity score (1 - 5) from text description.
   * @param {string} text 
   * @returns {{ score: number, matchedKeywords: string[], isDefault: boolean }}
   */
  function extractSeverityFromText(text) {
    return analyzeTextForTier(text, SEVERITY_KEYWORDS, 1);
  }

  /**
   * Extracts Urgency score (1 - 5) from text description.
   * @param {string} text 
   * @returns {{ score: number, matchedKeywords: string[], isDefault: boolean }}
   */
  function extractUrgencyFromText(text) {
    return analyzeTextForTier(text, URGENCY_KEYWORDS, 1);
  }

  /**
   * Extracts Safety Risk score (0 - 5) from text description.
   * @param {string} text 
   * @returns {{ score: number, matchedKeywords: string[], isDefault: boolean }}
   */
  function extractSafetyRiskFromText(text) {
    return analyzeTextForTier(text, SAFETY_RISK_KEYWORDS, 0);
  }

  // =========================================================================
  // 3. PARAMETER RESOLVERS (CW, SW, AP, LI, WT)
  // =========================================================================

  function getCategoryWeight(category) {
    if (typeof category === 'number') {
      if (category >= 3 && category <= 10) return category;
    }
    if (typeof category === 'string') {
      if (CATEGORY_WEIGHTS[category] !== undefined) return CATEGORY_WEIGHTS[category];
      const normInput = normalizeText(category);
      for (const [key, weight] of Object.entries(CATEGORY_WEIGHTS)) {
        if (normalizeText(key) === normInput) return weight;
      }
      if (normInput.includes('electr')) return 10;
      if (normInput.includes('water') || normInput.includes('plumb')) return 9;
      if (normInput.includes('civil') || normInput.includes('struct') || normInput.includes('general')) return 8;
      if (normInput.includes('hvac') || normInput.includes('air cond') || normInput.includes('ac')) return 7;
      if (normInput.includes('acad')) return 5;
      if (normInput.includes('clean') || normInput.includes('sanit')) return 4;
      if (normInput.includes('garden') || normInput.includes('landscap')) return 3;
    }
    return 8; // Default to Civil & Structural (8)
  }

  function getSubcategoryWeight(subcategory, category) {
    if (typeof subcategory === 'number') {
      if (subcategory >= 1 && subcategory <= 5) return subcategory;
    }
    if (!subcategory || typeof subcategory !== 'string') {
      return 3;
    }

    const normInput = normalizeText(subcategory);
    const normCategory = category ? normalizeText(category) : null;
    const candidates = normCategory 
      ? SUBCATEGORY_DEFINITIONS.filter(def => normalizeText(def.category) === normCategory)
      : SUBCATEGORY_DEFINITIONS;

    // Direct match
    for (const def of candidates) {
      if (normalizeText(def.name) === normInput) return def.weight;
    }
    // Items match
    for (const def of candidates) {
      for (const item of def.items) {
        if (normalizeText(item) === normInput) return def.weight;
      }
    }
    // Substring match
    for (const def of candidates) {
      if (normalizeText(def.name).includes(normInput) || normInput.includes(normalizeText(def.name))) {
        return def.weight;
      }
      for (const item of def.items) {
        if (normalizeText(item).includes(normInput) || normInput.includes(normalizeText(item))) {
          return def.weight;
        }
      }
    }
    // If not directly matched, return average weight 3
    return 3;
  }

  function getAffectedPeopleScore(peopleCountOrScore, isRawHeadcount = false, location = '') {
    if (typeof peopleCountOrScore === 'number' && !isNaN(peopleCountOrScore) && peopleCountOrScore >= 0) {
      if (isRawHeadcount || peopleCountOrScore > 5) {
        if (peopleCountOrScore < 25) return 1;
        if (peopleCountOrScore < 100) return 2;
        if (peopleCountOrScore < 200) return 3;
        if (peopleCountOrScore < 1500) return 4;
        return 5;
      }
      if (peopleCountOrScore >= 1 && peopleCountOrScore <= 5) {
        return Math.round(peopleCountOrScore);
      }
    }

    // Infer from facility / location if headcount not explicitly provided
    const normLoc = normalizeText(location);
    if (normLoc.includes('hostel') || normLoc.includes('auditorium')) return 4;
    if (normLoc.includes('engineer') || normLoc.includes('division') || normLoc.includes('canteen') || normLoc.includes('medical') || normLoc.includes('gym')) return 3;
    if (normLoc.includes('admin') || normLoc.includes('shopping') || normLoc.includes('lab') || normLoc.includes('room')) return 2;
    if (normLoc.includes('quarter') || normLoc.includes('guard') || normLoc.includes('garden') || normLoc.includes('tag')) return 1;

    return 2;
  }

  function getLocationImportance(location) {
    if (typeof location === 'number') {
      if (location >= 1.5 && location <= 10) return location;
      throw new Error(`Invalid numeric Location Importance: ${location}. Expected between 1.5 and 10.`);
    }
    if (typeof location === 'string') {
      if (LOCATION_DIRECTORY[location]) return LOCATION_DIRECTORY[location].score;
      const normInput = normalizeText(location);

      // Direct match in directory
      for (const [key, details] of Object.entries(LOCATION_DIRECTORY)) {
        if (normalizeText(key) === normInput) return details.score;
      }

      // Check campus building aliases directly
      for (const [alias, dirKey] of Object.entries(CAMPUS_BUILDING_ALIASES)) {
        if (normalizeText(alias) === normInput) {
          return LOCATION_DIRECTORY[dirKey].score;
        }
      }

      // Check if location string contains any campus building alias
      const sortedAliases = Object.entries(CAMPUS_BUILDING_ALIASES).sort((a, b) => b[0].length - a[0].length);
      for (const [alias, dirKey] of sortedAliases) {
        if (normInput.includes(normalizeText(alias))) {
          return LOCATION_DIRECTORY[dirKey].score;
        }
      }

      // Substring match in directory keys
      for (const [key, details] of Object.entries(LOCATION_DIRECTORY)) {
        if (normalizeText(key).includes(normInput) || normInput.includes(normalizeText(key))) {
          return details.score;
        }
      }

      // Fallback zone matching if zone is in the text
      if (normInput.includes('zone b')) return 8.0;
      if (normInput.includes('zone c')) return 6.0;
      if (normInput.includes('zone a')) return 4.0;
      return 6.0;
    }
    return 6.0;
  }

  function calculateWaitingTimeScoreFromHours(elapsedHours) {
    if (elapsedHours < 24) return 0;
    if (elapsedHours < 72) return 1;
    if (elapsedHours < 96) return 2;
    if (elapsedHours < 120) return 3;
    if (elapsedHours <= 168) return 4;
    return 5;
  }

  function getWaitingTimeScore(waitingInput, currentDate = new Date()) {
    if (waitingInput === undefined || waitingInput === null) return 0;
    if (waitingInput instanceof Date || (typeof waitingInput === 'string' && isNaN(Number(waitingInput)))) {
      const reportDate = new Date(waitingInput);
      const now = new Date(currentDate);
      const diffMs = now.getTime() - reportDate.getTime();
      if (diffMs < 0) return 0;
      const elapsedHours = diffMs / (1000 * 60 * 60);
      return calculateWaitingTimeScoreFromHours(elapsedHours);
    }

    const num = Number(waitingInput);
    if (isNaN(num) || num < 0) return 0;
    if (Number.isInteger(num) && num >= 0 && num <= 5) {
      return num;
    }
    return calculateWaitingTimeScoreFromHours(num);
  }

  function getPriorityLevel(score, emergencyOverride = false) {
    if (emergencyOverride) {
      return {
        level: 'Critical',
        levelUpper: 'CRITICAL',
        color: PRIORITY_THRESHOLDS.CRITICAL.color,
        interpretation: PRIORITY_THRESHOLDS.CRITICAL.interpretation,
        isOverride: true
      };
    }
    if (score >= PRIORITY_THRESHOLDS.CRITICAL.min) {
      return {
        level: 'Critical',
        levelUpper: 'CRITICAL',
        color: PRIORITY_THRESHOLDS.CRITICAL.color,
        interpretation: PRIORITY_THRESHOLDS.CRITICAL.interpretation,
        isOverride: false
      };
    }
    if (score >= PRIORITY_THRESHOLDS.HIGH.min) {
      return {
        level: 'High',
        levelUpper: 'HIGH',
        color: PRIORITY_THRESHOLDS.HIGH.color,
        interpretation: PRIORITY_THRESHOLDS.HIGH.interpretation,
        isOverride: false
      };
    }
    if (score >= PRIORITY_THRESHOLDS.MEDIUM.min) {
      return {
        level: 'Medium',
        levelUpper: 'MEDIUM',
        color: PRIORITY_THRESHOLDS.MEDIUM.color,
        interpretation: PRIORITY_THRESHOLDS.MEDIUM.interpretation,
        isOverride: false
      };
    }
    return {
      level: 'Low',
      levelUpper: 'LOW',
      color: PRIORITY_THRESHOLDS.LOW.color,
      interpretation: PRIORITY_THRESHOLDS.LOW.interpretation,
      isOverride: false
    };
  }

  // =========================================================================
  // 4. CORE PRIORITY SCORE ALGORITHM
  // =========================================================================

  /**
   * Calculates the Priority Score (PS) for a maintenance request.
   * 
   * Formula:
   * PS = CW + SW + 3*S + 3*U + 4*SR + 2*AP + 2*LI + WT
   * 
   * S (Severity), U (Urgency), and SR (Safety Risk) can be passed explicitly,
   * OR automatically calculated from the words inside the requester form `description`.
   * 
   * @param {Object} task Requester form data
   * @returns {Object} Comprehensive calculation result
   */
  function calculatePriorityScore(task) {
    if (!task || typeof task !== 'object') {
      throw new Error('Task input must be an object.');
    }

    const description = task.description || task.details || task.issueDescription || task.title || '';

    // 1. Resolve Category Weight (CW: 3 - 10)
    const categoryParam = task.cw !== undefined ? task.cw : (task.categoryWeight !== undefined ? task.categoryWeight : task.category);
    const cw = getCategoryWeight(categoryParam);

    // 2. Resolve Subcategory Weight (SW: 1 - 5)
    const subcategoryParam = task.sw !== undefined ? task.sw : (task.subcategoryWeight !== undefined ? task.subcategoryWeight : (task.subcategory || task.sub_category || task.subCategory || task.subCategory1));
    const sw = getSubcategoryWeight(subcategoryParam, typeof categoryParam === 'string' ? categoryParam : undefined);

    // 3. Resolve Severity (S: 1 - 5) - Manual or Description Keyword Extraction
    let s;
    let severityAnalysis = null;
    if (task.s !== undefined || task.severity !== undefined) {
      s = Number(task.s !== undefined ? task.s : task.severity);
      if (s < 1 || s > 5) s = 1;
    } else {
      severityAnalysis = extractSeverityFromText(description);
      s = severityAnalysis.score;
    }

    // 4. Resolve Urgency (U: 1 - 5) - Manual or Description Keyword Extraction
    let u;
    let urgencyAnalysis = null;
    if (task.u !== undefined || task.urgency !== undefined) {
      u = Number(task.u !== undefined ? task.u : task.urgency);
      if (u < 1 || u > 5) u = 1;
    } else {
      urgencyAnalysis = extractUrgencyFromText(description);
      u = urgencyAnalysis.score;
    }

    // 5. Resolve Safety Risk (SR: 0 - 5) - Manual or Description Keyword Extraction
    let sr;
    let safetyRiskAnalysis = null;
    if (task.sr !== undefined || task.safetyRisk !== undefined) {
      sr = Number(task.sr !== undefined ? task.sr : task.safetyRisk);
      if (sr < 0 || sr > 5) sr = 0;
    } else {
      safetyRiskAnalysis = extractSafetyRiskFromText(description);
      sr = safetyRiskAnalysis.score;
    }

    // 6. Resolve Location Importance (LI: 1.5 - 10)
    const locationParam = task.building || task.locationImportance || task.li || task.location || 'Main Campus';
    const li = getLocationImportance(locationParam);

    // 7. Resolve Affected People (AP: 1 - 5)
    let ap;
    const rawAp = task.peoples ?? task.affectedPeople ?? task.headcount ?? task.affectedPeopleCount ?? task.ap;
    if (rawAp !== undefined && rawAp !== null) {
      ap = getAffectedPeopleScore(Number(rawAp), true, locationParam);
    } else {
      ap = getAffectedPeopleScore(undefined, false, locationParam);
    }

    // 8. Resolve Waiting Time (WT: 0 - 5)
    let wt = 0;
    if (task.elapsedHours !== undefined && task.elapsedHours !== null) {
      wt = calculateWaitingTimeScoreFromHours(Number(task.elapsedHours));
    } else if (task.created_at || task.createdAt || task.reportedAt || task.submittedDate) {
      wt = getWaitingTimeScore(task.created_at || task.createdAt || task.reportedAt || task.submittedDate);
    } else if (task.wt !== undefined && task.wt !== null) {
      wt = getWaitingTimeScore(task.wt);
    } else if (task.waitingTime !== undefined && task.waitingTime !== null) {
      wt = getWaitingTimeScore(task.waitingTime);
    } else {
      wt = 0;
    }

    // Multipliers according to the formula:
    // PS = CW + SW + 3S + 3U + 4SR + 2AP + 2LI + WT
    const cwComponent = cw;
    const swComponent = sw;
    const sComponent = 3 * s;
    const uComponent = 3 * u;
    const srComponent = 4 * sr;
    const apComponent = 2 * ap;
    const liComponent = 2 * li;
    const wtComponent = wt;

    const totalScore = Number((cwComponent + swComponent + sComponent + uComponent + srComponent + apComponent + liComponent + wtComponent).toFixed(2));
    const emergencyOverride = Boolean(task.emergencyOverride || task.isEmergency || task.is_emergency);
    const priorityInfo = getPriorityLevel(totalScore, emergencyOverride);

    return {
      score: totalScore,
      priorityLevel: priorityInfo.level,
      priorityLevelUpper: priorityInfo.levelUpper,
      color: priorityInfo.color,
      priorityColor: priorityInfo.color,
      interpretation: priorityInfo.interpretation,
      isEmergencyOverride: priorityInfo.isOverride,
      extractedFromDescription: {
        severity: severityAnalysis ? { score: s, matchedKeywords: severityAnalysis.matchedKeywords, isDefault: severityAnalysis.isDefault } : null,
        urgency: urgencyAnalysis ? { score: u, matchedKeywords: urgencyAnalysis.matchedKeywords, isDefault: urgencyAnalysis.isDefault } : null,
        safetyRisk: safetyRiskAnalysis ? { score: sr, matchedKeywords: safetyRiskAnalysis.matchedKeywords, isDefault: safetyRiskAnalysis.isDefault } : null
      },
      breakdown: {
        categoryWeight: { factor: 'CW', input: categoryParam, weight: cw, formulaMultiplier: 1, total: cwComponent },
        subcategoryWeight: { factor: 'SW', input: subcategoryParam, weight: sw, formulaMultiplier: 1, total: swComponent },
        severity: { factor: 'S', score: s, formulaMultiplier: 3, total: sComponent },
        urgency: { factor: 'U', score: u, formulaMultiplier: 3, total: uComponent },
        safetyRisk: { factor: 'SR', score: sr, formulaMultiplier: 4, total: srComponent },
        affectedPeople: { factor: 'AP', score: ap, formulaMultiplier: 2, total: apComponent },
        locationImportance: { factor: 'LI', input: locationParam, score: li, formulaMultiplier: 2, total: liComponent },
        waitingTime: { factor: 'WT', score: wt, formulaMultiplier: 1, total: wtComponent }
      },
      formula: `${cwComponent} + ${swComponent} + (3×${s}) + (3×${u}) + (4×${sr}) + (2×${ap}) + (2×${li}) + ${wtComponent} = ${totalScore}`
    };
  }

  // =========================================================================
  // 5. BATCH TASK RANKING ENGINE
  // =========================================================================

  /**
   * Ranks an array of maintenance requests by priority score with multi-tier tie-breaking.
   * 
   * @param {Array<Object>} tasks 
   * @returns {Array<Object>}
   */
  function rankMaintenanceTasks(tasks) {
    if (!Array.isArray(tasks)) throw new Error('rankMaintenanceTasks expects an array of tasks.');

    const evaluatedTasks = tasks.map((task, index) => {
      const evaluation = calculatePriorityScore(task);
      return {
        id: task.id || `REQ-${String(index + 1).padStart(3, '0')}`,
        title: task.title || 'Untitled Request',
        description: task.description || '',
        ...task,
        priorityScore: evaluation.score,
        priorityLevel: evaluation.priorityLevel,
        priorityColor: evaluation.color,
        priorityInterpretation: evaluation.interpretation,
        isEmergencyOverride: evaluation.isEmergencyOverride,
        extractedFromDescription: evaluation.extractedFromDescription,
        scoreBreakdown: evaluation.breakdown,
        formulaSummary: evaluation.formula
      };
    });

    evaluatedTasks.sort((a, b) => {
      // 1. Emergency overrides always rank first
      if (a.isEmergencyOverride && !b.isEmergencyOverride) return -1;
      if (!a.isEmergencyOverride && b.isEmergencyOverride) return 1;

      // 2. Compare priority scores descending
      if (b.priorityScore !== a.priorityScore) return b.priorityScore - a.priorityScore;

      // 3. Tie-breaker 1: Safety Risk
      if (b.scoreBreakdown.safetyRisk.score !== a.scoreBreakdown.safetyRisk.score) {
        return b.scoreBreakdown.safetyRisk.score - a.scoreBreakdown.safetyRisk.score;
      }

      // 4. Tie-breaker 2: Urgency
      if (b.scoreBreakdown.urgency.score !== a.scoreBreakdown.urgency.score) {
        return b.scoreBreakdown.urgency.score - a.scoreBreakdown.urgency.score;
      }

      // 5. Tie-breaker 3: Waiting Time
      return b.scoreBreakdown.waitingTime.score - a.scoreBreakdown.waitingTime.score;
    });

    return evaluatedTasks.map((task, index) => ({
      rank: index + 1,
      ...task
    }));
  }

  return {
    CATEGORY_WEIGHTS,
    SUBCATEGORY_DEFINITIONS,
    LOCATION_DIRECTORY,
    PRIORITY_THRESHOLDS,
    SEVERITY_KEYWORDS,
    URGENCY_KEYWORDS,
    SAFETY_RISK_KEYWORDS,
    extractSeverityFromText,
    extractUrgencyFromText,
    extractSafetyRiskFromText,
    getCategoryWeight,
    getSubcategoryWeight,
    getAffectedPeopleScore,
    getLocationImportance,
    getWaitingTimeScore,
    calculateWaitingTimeScoreFromHours,
    getPriorityLevel,
    calculatePriorityScore,
    rankMaintenanceTasks
  };
}));
