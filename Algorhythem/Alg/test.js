/**
 * Test Suite for University Maintenance Priority Ranking Algorithm
 * 
 * Verifies calculation accuracy, emergency overrides, priority level classifications,
 * error handling & validation, tie-breaking rules, and batch request ranking.
 */

const {
  calculatePriority,
  rankMaintenanceRequests,
  calculateWaitingTime
} = require('./priorityAlgorithm');

let totalTests = 0;
let passedTests = 0;

function assert(condition, testName, message = '') {
  totalTests++;
  if (condition) {
    console.log(`✅ [PASS] ${testName}`);
    passedTests++;
  } else {
    console.error(`❌ [FAIL] ${testName}`);
    if (message) console.error(`   Details: ${message}`);
  }
}

function assertThrows(fn, testName, expectedSnippet = '') {
  totalTests++;
  try {
    fn();
    console.error(`❌ [FAIL] ${testName} - Expected error but function executed without throwing.`);
  } catch (err) {
    if (expectedSnippet && !err.message.includes(expectedSnippet)) {
      console.error(`❌ [FAIL] ${testName} - Expected message containing "${expectedSnippet}", got "${err.message}"`);
    } else {
      console.log(`✅ [PASS] ${testName} (Caught expected error: "${err.message}")`);
      passedTests++;
    }
  }
}

console.log('================================================================');
console.log(' UNIVERSITY MAINTENANCE PRIORITY RANKING ALGORITHM TEST SUITE');
console.log('================================================================\n');

// -----------------------------------------------------------------------------
// Test 1 — Critical Electrical Issue
// -----------------------------------------------------------------------------
const request1 = {
  id: "MR001",
  category: "Electricity",
  subcategory: "Electrical Panels",
  severity: 5,
  urgency: 5,
  safetyRisk: 5,
  affectedPeople: 4,
  locationImportance: 5,
  waitingTime: 0
};

const result1 = calculatePriority(request1);
console.log("Test 1 Result Object:", JSON.stringify(result1, null, 2));

assert(result1.priorityLevel === "CRITICAL", "Test 1 — Priority Level is CRITICAL");
assert(result1.emergencyOverride === true, "Test 1 — Emergency Override is true");
assert(result1.action === "Immediate Dispatch", "Test 1 — Action is Immediate Dispatch");
assert(result1.priorityScore === 83, "Test 1 — Priority Score is exactly 83", `Got ${result1.priorityScore}`);
assert(result1.categoryWeight === 10, "Test 1 — Category Weight is 10");
assert(result1.subcategoryWeight === 5, "Test 1 — Subcategory Weight is 5");

console.log('\n----------------------------------------------------------------\n');

// -----------------------------------------------------------------------------
// Test 2 — Normal Electrical Issue
// -----------------------------------------------------------------------------
const request2 = {
  id: "MR002",
  category: "Electricity",
  subcategory: "Lighting & Fixtures",
  severity: 2,
  urgency: 2,
  safetyRisk: 0,
  affectedPeople: 2,
  locationImportance: 3,
  waitingTime: 2
};

const result2 = calculatePriority(request2);
console.log("Test 2 Result Object:", JSON.stringify(result2, null, 2));

// Score calculation: 10 + 2 + (3*2) + (3*2) + (4*0) + (2*2) + (2*3) + 2 = 12 + 6 + 6 + 0 + 4 + 6 + 2 = 36
assert(result2.priorityScore === 36, "Test 2 — Priority Score is 36", `Got ${result2.priorityScore}`);
assert(result2.emergencyOverride === false, "Test 2 — Emergency Override is false");
assert(result2.priorityLevel === "MEDIUM", "Test 2 — Priority Level is MEDIUM");
assert(result2.action === "Scheduled Maintenance", "Test 2 — Action is Scheduled Maintenance");

console.log('\n----------------------------------------------------------------\n');

// -----------------------------------------------------------------------------
// Test 3 — High Water Issue
// -----------------------------------------------------------------------------
const request3 = {
  id: "MR003",
  category: "Water",
  subcategory: "Water Pumps",
  severity: 4,
  urgency: 4,
  safetyRisk: 3,
  affectedPeople: 4,
  locationImportance: 4,
  waitingTime: 3
};

const result3 = calculatePriority(request3);
console.log("Test 3 Result Object:", JSON.stringify(result3, null, 2));

// Score calculation: 9 (CW) + 5 (SW) + 3*4 + 3*4 + 4*3 + 2*4 + 2*4 + 3 = 14 + 12 + 12 + 12 + 8 + 8 + 3 = 69
assert(result3.priorityScore === 69, "Test 3 — Priority Score is 69", `Got ${result3.priorityScore}`);
assert(result3.priorityLevel === "HIGH", "Test 3 — Priority Level is HIGH");
assert(result3.action === "Same-Day Action", "Test 3 — Action is Same-Day Action");
assert(result3.emergencyOverride === false, "Test 3 — Emergency Override is false");

console.log('\n----------------------------------------------------------------\n');

// -----------------------------------------------------------------------------
// Test 4 — Invalid Subcategory
// -----------------------------------------------------------------------------
const request4 = {
  id: "MR004",
  category: "Electricity",
  subcategory: "Water Pumps", // Invalid subcategory for Electricity!
  severity: 3,
  urgency: 3,
  safetyRisk: 1,
  affectedPeople: 2,
  locationImportance: 3,
  waitingTime: 0
};

assertThrows(
  () => calculatePriority(request4),
  "Test 4 — Invalid Subcategory Exception",
  'does not belong to category "Electricity"'
);

console.log('\n----------------------------------------------------------------\n');

// -----------------------------------------------------------------------------
// Test 5 — Invalid Severity
// -----------------------------------------------------------------------------
const request5 = {
  id: "MR005",
  category: "Electricity",
  subcategory: "Electrical Panels",
  severity: 6, // Invalid severity (> 5)
  urgency: 5,
  safetyRisk: 5,
  affectedPeople: 4,
  locationImportance: 5,
  waitingTime: 0
};

assertThrows(
  () => calculatePriority(request5),
  "Test 5 — Invalid Severity Exception (> 5)",
  "Invalid Severity"
);

console.log('\n----------------------------------------------------------------\n');

// -----------------------------------------------------------------------------
// Test 6 — Additional Scenario: Emergency Override via Severity 5 & Urgency 5
// -----------------------------------------------------------------------------
const request6 = {
  id: "MR006",
  category: "Academic",
  subcategory: "Laboratory Equipment",
  severity: 5,
  urgency: 5,
  safetyRisk: 2, // SR is not 5, but S=5 and U=5 triggers emergency override
  affectedPeople: 5,
  locationImportance: 5,
  waitingTime: 1
};

const result6 = calculatePriority(request6);
assert(result6.emergencyOverride === true, "Test 6 — Emergency Override triggered by S=5 and U=5");
assert(result6.priorityLevel === "CRITICAL", "Test 6 — Priority Level is CRITICAL");
assert(result6.reason.includes("Severity is 5 and Urgency is 5"), "Test 6 — Reason mentions Severity and Urgency condition");

console.log('\n----------------------------------------------------------------\n');

// -----------------------------------------------------------------------------
// Test 7 — Additional Scenario: Waiting Time Calculation Helper
// -----------------------------------------------------------------------------
const threeDaysAgo = new Date(Date.now() - (3 * 24 * 60 * 60 * 1000)).toISOString();
const wtScore = calculateWaitingTime(threeDaysAgo);
assert(wtScore === 3, "Test 7 — Calculate Waiting Time score for 3 days ago", `Got ${wtScore}`);

const twelveDaysAgo = new Date(Date.now() - (12 * 24 * 60 * 60 * 1000)).toISOString();
const wtScoreMax = calculateWaitingTime(twelveDaysAgo);
assert(wtScoreMax === 10, "Test 7 — Calculate Waiting Time capped at maximum 10", `Got ${wtScoreMax}`);

console.log('\n----------------------------------------------------------------\n');

// -----------------------------------------------------------------------------
// Test 8 — Ranking Multiple Requests with Emergency Override & Tie-Breaking
// -----------------------------------------------------------------------------
const batchRequests = [
  {
    id: "MR_LOW",
    category: "Gardening",
    subcategory: "General Landscaping",
    severity: 1,
    urgency: 1,
    safetyRisk: 0,
    affectedPeople: 1,
    locationImportance: 1,
    waitingTime: 0
  },
  {
    id: "MR_MED",
    category: "Civil & Structural",
    subcategory: "Doors & Windows",
    severity: 3,
    urgency: 3,
    safetyRisk: 1,
    affectedPeople: 2,
    locationImportance: 2,
    waitingTime: 1
  },
  {
    id: "MR_EMERGENCY",
    category: "Electricity",
    subcategory: "Electrical Panels",
    severity: 5,
    urgency: 5,
    safetyRisk: 5,
    affectedPeople: 4,
    locationImportance: 5,
    waitingTime: 0
  },
  {
    id: "MR_HIGH",
    category: "Water",
    subcategory: "Water Pumps",
    severity: 4,
    urgency: 4,
    safetyRisk: 3,
    affectedPeople: 4,
    locationImportance: 4,
    waitingTime: 3
  }
];

const ranked = rankMaintenanceRequests(batchRequests);
console.log("Ranked Requests Summary:");
ranked.forEach((r, idx) => {
  console.log(` ${idx + 1}. ${r.id} | Score: ${r.priorityScore} | Level: ${r.priorityLevel} | Action: ${r.action} | Emergency: ${r.emergencyOverride}`);
});

assert(ranked[0].id === "MR_EMERGENCY", "Test 8 — 1st ranked request is MR_EMERGENCY");
assert(ranked[1].id === "MR_HIGH", "Test 8 — 2nd ranked request is MR_HIGH");
assert(ranked[2].id === "MR_MED", "Test 8 — 3rd ranked request is MR_MED");
assert(ranked[3].id === "MR_LOW", "Test 8 — 4th ranked request is MR_LOW");

console.log('\n================================================================');
console.log(` TEST SUMMARY: ${passedTests} / ${totalTests} TESTS PASSED`);
console.log('================================================================\n');

if (passedTests === totalTests) {
  console.log("🎉 All unit tests passed successfully!");
} else {
  console.error("⚠️ Some tests failed. Please review errors above.");
  process.exit(1);
}
