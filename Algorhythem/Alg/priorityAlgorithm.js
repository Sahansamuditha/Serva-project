/**
 * University Maintenance Monitoring and Management Platform
 * Maintenance Task Priority Ranking Algorithm
 * 
 * Provides automated priority score calculation, emergency override handling,
 * priority level classification, recommended actions, and request ranking.
 */

const maintenanceConfig = require('./maintenanceConfig');

/**
 * Retrieves the weight for a main maintenance category.
 * 
 * @param {string} category - Category name
 * @returns {number} Category Weight (CW)
 * @throws {Error} If category is invalid or missing
 */
function getCategoryWeight(category) {
  if (!category || typeof category !== 'string') {
    throw new Error('Category must be a non-empty string.');
  }

  const categoryData = maintenanceConfig[category];
  if (!categoryData) {
    const validCategories = Object.keys(maintenanceConfig).join(', ');
    throw new Error(`Invalid category: "${category}". Allowed categories are: ${validCategories}.`);
  }

  return categoryData.weight;
}

/**
 * Retrieves the weight for a subcategory within a given main category.
 * 
 * @param {string} category - Category name
 * @param {string} subcategory - Subcategory name
 * @returns {number} Subcategory Weight (SW)
 * @throws {Error} If category or subcategory is invalid or mismatched
 */
function getSubcategoryWeight(category, subcategory) {
  if (!subcategory || typeof subcategory !== 'string') {
    throw new Error('Subcategory must be a non-empty string.');
  }

  // Ensures category is valid before checking subcategory
  getCategoryWeight(category);

  const subcategoryMap = maintenanceConfig[category].subcategories;
  if (subcategoryMap[subcategory] === undefined) {
    const validSubcategories = Object.keys(subcategoryMap).join(', ');
    throw new Error(
      `Invalid subcategory: "${subcategory}" does not belong to category "${category}". Allowed subcategories for "${category}" are: ${validSubcategories}.`
    );
  }

  return subcategoryMap[subcategory];
}

/**
 * Validates all priority factors and structure of a maintenance request object.
 * 
 * @param {Object} request - Maintenance request object
 * @throws {Error} If any validation rule is violated
 */
function validateRequest(request) {
  if (!request || typeof request !== 'object' || Array.isArray(request)) {
    throw new Error('Invalid input: Maintenance request must be a valid object.');
  }

  // 1 & 2. Validate category and subcategory
  getCategoryWeight(request.category);
  getSubcategoryWeight(request.category, request.subcategory);

  // Helper validation for bounded integer/numeric fields
  const validateBoundedNumber = (fieldName, value, min, max) => {
    if (typeof value !== 'number' || isNaN(value) || !Number.isInteger(value)) {
      throw new Error(`Invalid ${fieldName}: Must be an integer between ${min} and ${max}. Got: ${value}`);
    }
    if (value < min || value > max) {
      throw new Error(`Invalid ${fieldName}: ${value} is out of bounds. Must be between ${min} and ${max}.`);
    }
  };

  // 5. Validate all numerical factors
  validateBoundedNumber('Severity', request.severity, 1, 5);
  validateBoundedNumber('Urgency', request.urgency, 1, 5);
  validateBoundedNumber('Safety Risk', request.safetyRisk, 0, 5);
  validateBoundedNumber('Affected People', request.affectedPeople, 1, 5);
  validateBoundedNumber('Location Importance', request.locationImportance, 1, 5);

  // Validate Waiting Time if provided explicitly
  if (request.waitingTime !== undefined && request.waitingTime !== null) {
    validateBoundedNumber('Waiting Time', request.waitingTime, 0, 10);
  }
}

/**
 * Calculates the waiting time score (0 to 10) based on creation timestamp or elapsed days.
 * Configurable so universities can adjust waiting time aging rules.
 * 
 * @param {Date|string|number} createdAt - Creation timestamp or date string
 * @param {Object} [options] - Optional calculation options
 * @param {number} [options.daysPerPoint=1] - Days needed to gain 1 point of waiting time score
 * @param {number} [options.maxWaitingTime=10] - Maximum cap for waiting time score
 * @param {Date} [options.currentDate=new Date()] - Reference comparison date
 * @returns {number} Waiting time score (integer between 0 and 10)
 */
function calculateWaitingTime(createdAt, options = {}) {
  if (createdAt === undefined || createdAt === null) {
    return 0;
  }

  // If a direct numeric waiting time score is passed, cap and return it
  if (typeof createdAt === 'number' && !isNaN(createdAt)) {
    const maxScore = options.maxWaitingTime !== undefined ? options.maxWaitingTime : 10;
    return Math.min(Math.max(0, Math.floor(createdAt)), maxScore);
  }

  const daysPerPoint = options.daysPerPoint || 1;
  const maxWaitingTime = options.maxWaitingTime !== undefined ? options.maxWaitingTime : 10;
  const currentDate = options.currentDate ? new Date(options.currentDate) : new Date();
  const createdDate = new Date(createdAt);

  if (isNaN(createdDate.getTime())) {
    throw new Error(`Invalid createdAt timestamp: "${createdAt}".`);
  }

  const diffInMs = currentDate.getTime() - createdDate.getTime();
  if (diffInMs < 0) return 0; // Future date safety check

  const diffInDays = diffInMs / (1000 * 60 * 60 * 24);
  const calculatedWT = Math.floor(diffInDays / daysPerPoint);

  return Math.min(Math.max(0, calculatedWT), maxWaitingTime);
}

/**
 * Maps priority score or emergency override state to Priority Level classification label.
 * 
 * Tier Mapping:
 * - Emergency Override OR 76-95 -> CRITICAL
 * - 56-75 -> HIGH
 * - 31-55 -> MEDIUM
 * - 0-30 -> LOW
 * 
 * @param {number} score - Calculated priority score (0-95)
 * @param {boolean} [emergencyOverride=false] - Whether emergency rule was triggered
 * @returns {string} Priority level label ("CRITICAL", "HIGH", "MEDIUM", "LOW")
 */
function determinePriorityLevel(score, emergencyOverride = false) {
  if (emergencyOverride) {
    return 'CRITICAL';
  }
  if (score >= 76) return 'CRITICAL';
  if (score >= 56) return 'HIGH';
  if (score >= 31) return 'MEDIUM';
  return 'LOW';
}

/**
 * Maps Priority Level label to recommended operational response action.
 * 
 * @param {string} priorityLevel - Priority level ("CRITICAL", "HIGH", "MEDIUM", "LOW")
 * @returns {string} Operational response action label
 */
function determineAction(priorityLevel) {
  switch (priorityLevel) {
    case 'CRITICAL':
      return 'Immediate Dispatch';
    case 'HIGH':
      return 'Same-Day Action';
    case 'MEDIUM':
      return 'Scheduled Maintenance';
    case 'LOW':
      return 'Routine Queue';
    default:
      return 'Routine Queue';
  }
}

/**
 * Calculates priority score, determines priority level, action, emergency overrides,
 * and generates a explanatory reason for a single maintenance request.
 * 
 * Priority Score Formula:
 * PS = CW + SW + (3 * S) + (3 * U) + (4 * SR) + (2 * AP) + (2 * LI) + WT
 * 
 * @param {Object} request - Maintenance request input object
 * @returns {Object} Full priority calculation result object
 */
function calculatePriority(request) {
  // Step 1 - 5: Validate request, category, subcategory, and numeric factors
  validateRequest(request);

  // Step 3 & 4: Automatically retrieve weights from centralized config (user weights ignored)
  const categoryWeight = getCategoryWeight(request.category);
  const subcategoryWeight = getSubcategoryWeight(request.category, request.subcategory);

  // Calculate or extract Waiting Time
  let waitingTime = 0;
  if (request.waitingTime !== undefined && request.waitingTime !== null) {
    waitingTime = request.waitingTime;
  } else if (request.createdAt) {
    waitingTime = calculateWaitingTime(request.createdAt);
  }

  const severity = request.severity;
  const urgency = request.urgency;
  const safetyRisk = request.safetyRisk;
  const affectedPeople = request.affectedPeople;
  const locationImportance = request.locationImportance;

  // Step 6: Calculate Priority Score using exact formula
  const priorityScore =
    categoryWeight +
    subcategoryWeight +
    (3 * severity) +
    (3 * urgency) +
    (4 * safetyRisk) +
    (2 * affectedPeople) +
    (2 * locationImportance) +
    waitingTime;

  // Step 7: Apply Emergency Override Rule
  // Emergency Condition 1: Safety Risk === 5
  // Emergency Condition 2: Severity === 5 AND Urgency === 5
  const isEmergencySR5 = safetyRisk === 5;
  const isEmergencyS5U5 = severity === 5 && urgency === 5;
  const emergencyOverride = isEmergencySR5 || isEmergencyS5U5;

  // Step 8 & 9: Determine Priority Level & Recommended Action
  const priorityLevel = determinePriorityLevel(priorityScore, emergencyOverride);
  const action = determineAction(priorityLevel);

  // Step 14: Generate Human-Readable Reason
  let reason = '';
  if (emergencyOverride) {
    if (isEmergencySR5 && isEmergencyS5U5) {
      reason = 'Critical because Safety Risk is 5, and Severity and Urgency are both 5.';
    } else if (isEmergencySR5) {
      reason = 'Critical because Safety Risk is 5.';
    } else {
      reason = 'Critical because Severity is 5 and Urgency is 5.';
    }
  } else {
    reason = 'Priority calculated using category importance, subcategory importance, severity, urgency, safety risk, affected people, location importance, and waiting time.';
  }

  // Step 10: Return complete result object
  return {
    id: request.id,
    category: request.category,
    subcategory: request.subcategory,
    categoryWeight,
    subcategoryWeight,
    severity,
    urgency,
    safetyRisk,
    affectedPeople,
    locationImportance,
    waitingTime,
    priorityScore,
    priorityLevel,
    action,
    emergencyOverride,
    reason
  };
}

/**
 * Ranks multiple maintenance requests from highest priority to lowest priority.
 * Ensures CRITICAL emergency requests appear at the top and applies strict tie-breaking rules:
 * 1. Emergency Override status (true > false)
 * 2. Higher Priority Score
 * 3. Higher Safety Risk (SR)
 * 4. Higher Severity (S)
 * 5. Higher Urgency (U)
 * 6. Higher Waiting Time (WT)
 * 7. Older request first (by createdAt date or array order)
 * 
 * @param {Array<Object>} requests - Array of raw maintenance requests or calculated result objects
 * @returns {Array<Object>} Sorted array of request calculation results
 */
function rankMaintenanceRequests(requests) {
  if (!Array.isArray(requests)) {
    throw new Error('Input to rankMaintenanceRequests must be an array of maintenance requests.');
  }

  // Calculate priority for any uncalculated request while preserving original indices for tie-breaking
  const processed = requests.map((req, index) => {
    const evaluated = req.priorityScore !== undefined && req.priorityLevel !== undefined
      ? req
      : calculatePriority(req);

    return {
      evaluated,
      originalIndex: index,
      createdAtTime: req.createdAt ? new Date(req.createdAt).getTime() : 0
    };
  });

  // Sort according to priority hierarchy and tie-breaking rules
  processed.sort((a, b) => {
    const itemA = a.evaluated;
    const itemB = b.evaluated;

    // Rule 0: Emergency Override requests take precedence at the top
    if (itemA.emergencyOverride && !itemB.emergencyOverride) return -1;
    if (!itemA.emergencyOverride && itemB.emergencyOverride) return 1;

    // Primary Rule: Higher Priority Score first
    if (itemB.priorityScore !== itemA.priorityScore) {
      return itemB.priorityScore - itemA.priorityScore;
    }

    // Tie-Breaker 1: Higher Safety Risk first
    if (itemB.safetyRisk !== itemA.safetyRisk) {
      return itemB.safetyRisk - itemA.safetyRisk;
    }

    // Tie-Breaker 2: Higher Severity first
    if (itemB.severity !== itemA.severity) {
      return itemB.severity - itemA.severity;
    }

    // Tie-Breaker 3: Higher Urgency first
    if (itemB.urgency !== itemA.urgency) {
      return itemB.urgency - itemA.urgency;
    }

    // Tie-Breaker 4: Higher Waiting Time first
    if (itemB.waitingTime !== itemA.waitingTime) {
      return itemB.waitingTime - itemA.waitingTime;
    }

    // Tie-Breaker 5: Older request first (earlier createdAt date or earlier array order)
    if (a.createdAtTime && b.createdAtTime && a.createdAtTime !== b.createdAtTime) {
      return a.createdAtTime - b.createdAtTime;
    }

    return a.originalIndex - b.originalIndex;
  });

  return processed.map(item => item.evaluated);
}

module.exports = {
  getCategoryWeight,
  getSubcategoryWeight,
  validateRequest,
  calculateWaitingTime,
  determinePriorityLevel,
  determineAction,
  calculatePriority,
  rankMaintenanceRequests
};
