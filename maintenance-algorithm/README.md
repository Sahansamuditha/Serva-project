# Maintenance Task Priority Ranking Algorithm
> **University Maintenance Monitoring and Management Platform**

Pure JavaScript algorithmic engine for prioritizing and ranking university maintenance requests.

---

## 📐 Priority Score Formula

$$\mathbf{PS = CW + SW + 3S + 3U + 4SR + 2AP + 2LI + WT}$$

| Symbol | Factor | Range | Multiplier | Description |
| :--- | :--- | :--- | :---: | :--- |
| **CW** | Category Weight | $3 - 10$ | $\times 1$ | Electricity (10), Water (9), Civil & Structural (8), HVAC (7), Academic (5), Cleaning (4), Gardening (3) |
| **SW** | Subcategory Weight | $1 - 5$ | $\times 1$ | 28 subcategories mapped across all 7 main categories |
| **S** | Severity | $1 - 5$ | $\times 3$ | **Calculated from words in requester description** |
| **U** | Urgency | $1 - 5$ | $\times 3$ | **Calculated from words in requester description** |
| **SR** | Safety Risk | $0 - 5$ | $\times 4$ | **Calculated from words in requester description** |
| **AP** | Affected People | $1 - 5$ | $\times 2$ | Headcount score: $<25$ (1), $25-99$ (2), $100-199$ (3), $200-1499$ (4), $\ge 1500$ (5) |
| **LI** | Location Importance | $1.5 - 10$ | $\times 2$ | 18 campus locations (Hostel: 10, Admin: 6, Garden: 1.5) |
| **WT** | Waiting Time | $0 - 5$ | $\times 1$ | Elapsed hours: $<24\text{h}$ (0), $24-72\text{h}$ (1), $72-96\text{h}$ (2), $96-120\text{h}$ (3), $120-168\text{h}$ (4), $>168\text{h}$ (5) |

---

## 🚦 Priority Levels

| Priority Level | Score Range | General Interpretation |
| :--- | :---: | :--- |
| **CRITICAL** | $75 - 100$ | Immediate response; emergency override can also force this level. |
| **HIGH** | $50 - 75$ | Prompt action, often same-day depending on local policy. |
| **MEDIUM** | $25 - 50$ | Schedule and monitor after higher-priority requests. |
| **LOW** | $0 - 25$ | Routine maintenance when resources are available. |

---

## 🔍 Automated Text-Based Scoring (S, U, SR)

The algorithm scans the text inside the requester's `description` (or problem statement) using a tiered keyword extraction engine:

### 1. Severity Keywords (S: 1 – 5)
* **Level 5 (Critical)**: `complete failure`, `severe damage`, `completely broken`, `total breakdown`, `burst`, `collapsed`, `structural collapse`, `destroyed`, `exploded`, `unusable`, `completely stopped working`, `submerged`, `burnt out`
* **Level 4 (Serious)**: `major failure`, `substantially affected`, `cannot use`, `out of order`, `stopped working`, `heavy leak`, `flooded`, `blackout`, `no power`, `failed`
* **Level 3 (Moderate)**: `noticeable malfunction`, `affecting normal use`, `not functioning properly`, `stuck`, `jammed`, `clogged`, `blocked`, `leaking`, `abnormal noise`, `loud noise`, `faulty`, `overheating`
* **Level 2 (Minor)**: `limited malfunction`, `still works`, `partially working`, `slow`, `flickering`, `dripping`, `minor leak`, `loose`, `rattling`, `cosmetic damage`
* **Level 1 (Very minor)**: `small defect`, `almost normal`, `minor scratch`, `paint peeling`, `loose screw`, `tiny`, `slight` *(Default)*

### 2. Urgency Keywords (U: 1 – 5)
* **Level 5 (Immediate)**: `emergency`, `immediate response`, `escalation`, `crisis`, `critical urgency`, `right now`, `immediately`, `stop immediately`, `danger`, `cannot wait`, `top priority`, `code red`
* **Level 4 (High)**: `prompt attention`, `same day`, `today`, `promptly`, `as soon as possible`, `asap`, `urgently`, `urgent`, `needed quickly`, `time sensitive`
* **Level 3 (Moderate)**: `planned attention`, `reasonable time`, `soon`, `this week`, `within a few days`, `attention needed`, `schedule soon`
* **Level 2 (Low)**: `routine maintenance`, `can be handled during routine`, `within next 2 weeks`, `when convenient`, `non-urgent`
* **Level 1 (Very low)**: `can wait`, `no immediate operational impact`, `whenever convenient`, `no rush` *(Default)*

### 3. Safety Risk Keywords (SR: 0 – 5)
* **Level 5 (Critical)**: `immediate danger to people`, `major building safety`, `life threatening`, `electrocution`, `live wire`, `explosion`, `fire breaking out`, `structural collapse danger`, `toxic chemical spill`, `trapped in elevator`
* **Level 4 (High)**: `serious risk`, `electric shock`, `sparks`, `sparking`, `fire hazard`, `smoke`, `burning smell`, `gas leak`, `gas smell`, `falling debris`, `deep flood near sockets`, `toxic fumes`
* **Level 3 (Moderate)**: `meaningful risk`, `sharp edge`, `broken glass`, `loose railing`, `trip hazard`, `tripping hazard`, `slippery floor`, `deep water puddle`, `exposed screw`, `wobbly stair`
* **Level 2 (Low)**: `limited risk`, `needs attention`, `caution needed`, `minor slip`, `hot surface`, `splinter`, `uneven tile`
* **Level 1 (Very low)**: `negligible`, `minimal risk`, `minor bump`, `slight odor`
* **Level 0 (None)**: `no safety risk`, `no hazard`, `safe`, `no danger` *(Default)*

---

## 🚀 Quick Execution

Run the tests directly via Node.js:
```bash
node test.js
```

---

## 💻 Code Example

```javascript
const { calculatePriorityScore, rankMaintenanceTasks } = require('./index');

// Example: Requester submits an issue description
const request = {
  id: 'REQ-101',
  title: 'Sparks and smoke from distribution box',
  description: 'There is a severe burning smell and visible sparks from the distribution board in the hallway. It is an emergency right now! Sparks could cause an electric shock or fire outbreak. The power is completely stopped working.',
  category: 'Electricity',
  subcategory: 'Electrical Panels; Power Supply; Wiring & Cables',
  location: 'Electrical and Electronic Engineering Division',
  peoples: 250,      // Headcount -> AP = 4
  elapsedHours: 1    // First 24 hours -> WT = 0
};

// S, U, and SR are automatically extracted from the description words:
// S  = 5 ("completely stopped working")
// U  = 5 ("emergency", "right now")
// SR = 4 ("electric shock", "sparks", "burning smell")
const result = calculatePriorityScore(request);

console.log('Score:', result.score);           // 88
console.log('Level:', result.priorityLevel);   // "CRITICAL"
console.log('Formula:', result.formula);       // 10 + 5 + (3×5) + (3×5) + (4×4) + (2×4) + (2×9.5) + 0 = 88
console.log('Extracted Keywords:', result.extractedFromDescription);
```

---

## 📄 Technical Guide PDF
The updated specification PDF document is available at:
`Maintenance_Task_Priority_Ranking_Algorithm_Technical_Guide.pdf`
