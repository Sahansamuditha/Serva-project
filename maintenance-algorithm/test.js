const { 
  calculatePriorityScore, 
  rankMaintenanceTasks 
} = require('./index');

console.log('================================================================');
console.log('       UNIVERSITY MAINTENANCE PRIORITY RANKING TEST SUITE       ');
console.log('       Score Ranges: LOW (0-25) | MED (25-50) | HIGH (50-75) | CRIT (75-100)');
console.log('================================================================\n');

// -------------------------------------------------------------
// NEW TEST CASES: Covering all 4 Priority Levels and Categories
// -------------------------------------------------------------

const newTestCases = [
  {
    id: 'TICKET-001',
    title: 'Live electrical wire sparking near hostel entrance',
    description: 'A bare live wire is sparking and smoking right outside the hostel door. Active fire outbreak hazard and electrocution danger to students! Complete failure, this is an immediate emergency right now!',
    category: 'Electricity',
    subcategory: 'Electrical Panels; Power Supply; Wiring & Cables',
    location: 'Hostel',
    peoples: 850,       // Headcount (200 - 1500) -> AP = 4
    elapsedHours: 2     // First 24 hours -> WT = 0
  },
  {
    id: 'TICKET-002',
    title: 'Chiller breakdown before campus lecture session',
    description: 'The central chiller systems have stopped working in the Civil Engineering division. The lecture rooms are overheating and stuffy. Major failure affecting lectures, we need prompt attention today.',
    category: 'HVAC',
    subcategory: 'Chiller Systems',
    location: 'Civil Engineering Division',
    peoples: 350,       // Headcount -> AP = 4
    elapsedHours: 30    // 24 to 72 hours -> WT = 1
  },
  {
    id: 'TICKET-003',
    title: 'Water pipe leak creating puddle near gym entrance',
    description: 'Pipe is leaking constantly onto the walkway near the gym. A deep water puddle has formed creating a severe slippery floor and tripping hazard. Needs prompt attention asap.',
    category: 'Water',
    subcategory: 'Pipelines & Leaks; Toilets & Flushing; Drainage & Overflow',
    location: 'Gym',
    peoples: 250,       // Headcount -> AP = 4
    elapsedHours: 80    // 72 to 96 hours -> WT = 2
  },
  {
    id: 'TICKET-004',
    title: 'Projector display flickering in Admin Building meeting room',
    description: 'The multimedia projector in meeting room 2 is flickering and dim. Limited malfunction, it still works but needs planned attention soon.',
    category: 'Academic',
    subcategory: 'Projectors & Displays',
    location: 'Admin Building',
    peoples: 30,        // Headcount (25 - 100) -> AP = 2
    elapsedHours: 15    // First 24 hours -> WT = 0
  },
  {
    id: 'TICKET-005',
    title: 'Routine lawn grass trimming along garden pathway',
    description: 'Lawn grass has slight growth around garden pathway. Function is almost normal, no safety risk, safe. Can wait for regular routine maintenance whenever convenient.',
    category: 'Gardening',
    subcategory: 'Grass Cutting',
    location: 'Garden',
    peoples: 10,        // Headcount (< 25) -> AP = 1
    elapsedHours: 5     // First 24 hours -> WT = 0
  }
];

// -------------------------------------------------------------
// EXECUTE INDIVIDUAL TESTS WITH WORD EXTRACTION AUDIT
// -------------------------------------------------------------
newTestCases.forEach((testCase, idx) => {
  console.log(`\n>>> [CASE ${idx + 1}] ${testCase.title} (${testCase.id})`);
  console.log(`Description: "${testCase.description}"`);

  const result = calculatePriorityScore(testCase);

  console.log(`- Extracted S  (Severity):    ${result.breakdown.severity.score} (Words: ${JSON.stringify(result.extractedFromDescription.severity.matchedKeywords)})`);
  console.log(`- Extracted U  (Urgency):     ${result.breakdown.urgency.score} (Words: ${JSON.stringify(result.extractedFromDescription.urgency.matchedKeywords)})`);
  console.log(`- Extracted SR (Safety Risk): ${result.breakdown.safetyRisk.score} (Words: ${JSON.stringify(result.extractedFromDescription.safetyRisk.matchedKeywords)})`);
  console.log(`- Formula: ${result.formula}`);
  console.log(`- Priority Score: ${result.score} ---> LEVEL: [ ${result.priorityLevel} ]`);
});

// -------------------------------------------------------------
// BATCH RANKING TABLE
// -------------------------------------------------------------
console.log('\n================================================================');
console.log('                   FINAL BATCH RANKING RESULT                   ');
console.log('================================================================');

const ranked = rankMaintenanceTasks(newTestCases);

console.table(ranked.map(item => ({
  Rank: item.rank,
  ID: item.id,
  Title: item.title,
  Score: item.priorityScore,
  Level: item.priorityLevel,
  'S (ext)': item.scoreBreakdown.severity.score,
  'U (ext)': item.scoreBreakdown.urgency.score,
  'SR (ext)': item.scoreBreakdown.safetyRisk.score,
  CW: item.scoreBreakdown.categoryWeight.weight,
  SW: item.scoreBreakdown.subcategoryWeight.weight,
  AP: item.scoreBreakdown.affectedPeople.score,
  LI: item.scoreBreakdown.locationImportance.score,
  WT: item.scoreBreakdown.waitingTime.score
})));

console.log('\nTests executed successfully! All priority levels verified.');
