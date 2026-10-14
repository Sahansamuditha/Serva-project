import { WorkHistoryLog, WorkSlip, JobDetailAudit } from '../types';

const DB_HISTORY_KEY = 'itum_serva_db_work_history_v2';
const DB_SLIPS_KEY = 'itum_serva_db_work_slips_v2';
const DB_AUDITS_KEY = 'itum_serva_db_job_audits_v2';

// 7 COMPLETELY DISTINCT Work Slips
export const workSlipsDataset: Record<string, WorkSlip> = {
  '#REQ-8285': {
    id: 'SLIP-EL-8285',
    reqCode: '#REQ-8285',
    dbRecordId: 'REC-DB-8285-E-AUDIT',
    timestamp: '2026-08-21 16:15:22 IST',
    dateLabel: 'Aug 21, 2026',
    periodCategory: 'yesterday',
    jobTitle: 'Fluorescent Ballast Unit Replacement & Luminaire Rewiring',
    division: 'Electrical Division',
    location: 'Main Auditorium, Stage Area (Zone B)',
    subLocation: 'High-Bay Ceiling Grid #12 • Left Stage Wing',
    technicianName: 'S. M. Karunaratne',
    technicianEmpId: 'EMP-T8402',
    requesterName: 'Mr. T. Bandara',
    requesterDept: 'Facilities & Campus Events Management',
    requesterContact: '+94 77 149 0016',
    priority: 'MEDIUM',
    status: 'Signed Off',
    timeStarted: '02:45 PM',
    timeFinished: '04:15 PM',
    durationSpent: '1h 30m spent',
    summaryOfWork:
      'Diagnosed failing electromagnetic ballast causing severe 50Hz audible hum and arc flickering. Replaced with electronic high-frequency unit (OEM-BL40W) and renewed heat-resistant cabling.',
    partsUsed: [
      { partNumber: 'OEM-BL40W', name: 'Electronic Ballast Unit 2x36W', quantity: 1, costLkr: 3450 },
      { partNumber: 'WH-HEAT-05', name: 'High-Temp Luminaire Wire Harness (1.5m)', quantity: 2, costLkr: 850 },
      { partNumber: 'T8-PHIL-36', name: 'T8 36W Neutral White Tube Lamp', quantity: 2, costLkr: 1400 },
    ],
    verifierName: 'Dr. Wickramasinghe',
    verifierRole: 'Head of Facilities & Maintenance Engineering',
    digitalSignatureHash: 'SHA256: 7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    isoComplianceCert: 'ISO-9001:2015 / SLS 1500 Facility Safety Certified',
    photoThumbnails: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAm84UGWK9BoQ1beXiCNHf4gcXpMfp6DWzoIVKvJQKIQeNllURyL_usxq9rDcrxdaqILWGtuwphTz69n3xCo8ek7nAKYlfQbqOVUqJC7Elcrcewx0GA6dmHj75fbMS0X2dPQvcK6kboRDq6X0lQYsZU_dKjg7OEHWz4m6cggssJ5FGtN9bEAC0fSvVd-fV7QOoEwF26LCzf0m19Q5SWey0p5j1dg7o2oZJam_THQ7oPvst0lKRQEgVA'
    ],
    dbSyncStatus: 'synced',
  },

  '#REQ-8279': {
    id: 'SLIP-PL-8279',
    reqCode: '#REQ-8279',
    dbRecordId: 'REC-DB-8279-P-HYGIENE',
    timestamp: '2026-08-21 11:45:10 IST',
    dateLabel: 'Aug 21, 2026',
    periodCategory: 'yesterday',
    jobTitle: 'Restroom Concealed Flush Valve Diaphragm Overhaul',
    division: 'Plumbing Division',
    location: 'Faculty of Engineering, Ground Floor West',
    subLocation: 'Staff Restroom Wing B • Cubicle #3',
    technicianName: 'K. P. Senanayake',
    technicianEmpId: 'EMP-T8419',
    requesterName: 'Prof. S. Wickramasinghe',
    requesterDept: 'Chemical & Process Engineering',
    requesterContact: '+94 77 149 0016',
    priority: 'HIGH',
    status: 'Completed',
    timeStarted: '11:00 AM',
    timeFinished: '11:45 AM',
    durationSpent: '45m spent',
    summaryOfWork:
      'Continuous water bleed into pedestal due to mineral scale and perished rubber seal. Overhauled internal barrel, installed heavy-duty diaphragm kit, and calibrated flow metering screw.',
    partsUsed: [
      { partNumber: 'SLOAN-D50', name: 'Standard Flushometer Diaphragm Kit', quantity: 1, costLkr: 4200 },
      { partNumber: 'O-RING-PTFE', name: 'PTFE Barrel Seal Gasket', quantity: 2, costLkr: 600 },
      { partNumber: 'VAC-BRK-15', name: 'Atmospheric Vacuum Breaker Insert', quantity: 1, costLkr: 1850 },
    ],
    verifierName: 'Eng. D. Jayasuriya',
    verifierRole: 'Senior Operations Desk Dispatcher',
    digitalSignatureHash: 'SHA256: 3b92dc18148a1d65dfc2d4b1fa3d677284addd200126d90697f83b1657ff1fc5',
    isoComplianceCert: 'ISO-9001:2015 Campus Hygiene & Water Conservation Standards',
    photoThumbnails: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuBVLVsU8RQgn97JUTj4h6RmlrsCcRWlMT7Hk9VFswn_vFCXmIoFUOIPb6pyLUiXakoIcibSaW2Sfs0oR8BgiGi2HvWHV4dUkHkABuV6WY1wbELQKu5TCk7a8SRSvuuQ-hf3qEhcFid9KXhuKVw0MFeIRKrj4h2Iv8v5aF-jp9jaoN3oWzCl9q3L3Vo72htlCNZtqGJC7puuafszKHzVcZ2IgkDa0BPEsl0kkWWEOogj5IXtrSeYtA4OTQ'
    ],
    dbSyncStatus: 'synced',
  },

  '#REQ-8260': {
    id: 'SLIP-HV-8260',
    reqCode: '#REQ-8260',
    dbRecordId: 'REC-DB-8260-H-SERVER',
    timestamp: '2026-08-19 14:30:45 IST',
    dateLabel: 'Aug 19, 2026',
    periodCategory: 'this_month',
    jobTitle: 'Server Room Precision Air Conditioner Refrigerant Refill',
    division: 'HVAC Systems',
    location: 'IT Center Room 102 (Server Matrix)',
    subLocation: 'Precision AC Unit PAC-02 • Rack Row 3',
    technicianName: 'D. B. Weerasinghe',
    technicianEmpId: 'EMP-T8390',
    requesterName: 'Mr. N. Senaratne',
    requesterDept: 'Information Technology Division',
    requesterContact: '+94 77 149 0016',
    priority: 'CRITICAL',
    status: 'Signed Off',
    timeStarted: '12:15 PM',
    timeFinished: '02:30 PM',
    durationSpent: '2h 15m spent',
    summaryOfWork:
      'Ambient temperature rose above critical 24°C threshold. Leak isolated at suction service port Schrader core. Evacuated system down to 400 microns and charged 2.5kg of DuPont Suva R-410A.',
    partsUsed: [
      { partNumber: 'REF-R410A-KG', name: 'DuPont Suva R-410A Refrigerant (2.5kg)', quantity: 1, costLkr: 8900 },
      { partNumber: 'VALVE-CORE-AC', name: 'High-Pressure Schrader Core Assembly', quantity: 2, costLkr: 1100 },
      { partNumber: 'FLTR-DRIER-38', name: 'Liquid Line Molecular Sieve Filter Drier', quantity: 1, costLkr: 3600 },
    ],
    verifierName: 'Dr. Wickramasinghe',
    verifierRole: 'Head of Facilities & Maintenance Engineering',
    digitalSignatureHash: 'SHA256: 4b1fa3d677284addd200126d90697f83b1657ff1fc53b92dc18148a1d65dfc2d',
    isoComplianceCert: 'ISO-14001 Refrigerant Management & ISO-9001 Audit',
    photoThumbnails: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDTuWZvUv6g8lB2LMhRnk_EcyDMlMZooBC-faL3B_wTilcd-jXEMGdDkZ6RnBWW0YD-i3GjZkD_uTCl-JtGwEn4xOaRTEFz2DhTRl7BlltpD2GAjPgkia57L_Zd8RZ8-Y6NeYDsbkBGWwY1TiUJTkpROMVPYakrr2oJAvgNMWHciYtDq5dRj10mB_r3okwf519RKDqZPL0ae7fbhDudWwZGU11_NVuK5nQofm0Af5-moPqJIx4JgYHJqw'
    ],
    dbSyncStatus: 'synced',
  },

  '#REQ-8254': {
    id: 'SLIP-EL-8254',
    reqCode: '#REQ-8254',
    dbRecordId: 'REC-DB-8254-E-SAFETY',
    timestamp: '2026-08-18 10:10:00 IST',
    dateLabel: 'Aug 18, 2026',
    periodCategory: 'this_month',
    jobTitle: 'Overhead Projector Power Socket & Distribution Rack Repair',
    division: 'Electrical Division',
    location: 'Civil Eng Building, Lecture Hall A',
    subLocation: 'Podium Power Box #2 & Projector Drop',
    technicianName: 'S. M. Karunaratne',
    technicianEmpId: 'EMP-T8402',
    requesterName: 'Dr. K. Liyanage',
    requesterDept: 'Faculty of Electrical Engineering',
    requesterContact: '+94 77 149 0016',
    priority: 'MEDIUM',
    status: 'Completed',
    timeStarted: '09:35 AM',
    timeFinished: '10:10 AM',
    durationSpent: '35m spent',
    summaryOfWork:
      'Burned terminal screw caused arcing and power drop on lecture podium. Installed industrial-grade Clipsal 13A switched outlet, trimmed back scorched wire, and tested insulation resistance.',
    partsUsed: [
      { partNumber: 'CLIP-13A-TWIN', name: 'Clipsal 13A Double Switched Socket', quantity: 1, costLkr: 2150 },
      { partNumber: 'BOX-SURF-2G', name: 'PVC Surface Pattress Mounting Box', quantity: 1, costLkr: 450 },
      { partNumber: 'TERM-STRIP-30', name: 'High-Current Ceramic Terminal Block', quantity: 1, costLkr: 750 },
    ],
    verifierName: 'Eng. D. Jayasuriya',
    verifierRole: 'Operations Desk Dispatcher',
    digitalSignatureHash: 'SHA256: 18148a1d65dfc2d4b1fa3d677284addd200126d90697f83b1657ff1fc53b92dc',
    isoComplianceCert: 'IET Wiring Regulations (BS 7671) & ISO-9001 Certified',
    photoThumbnails: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuAm84UGWK9BoQ1beXiCNHf4gcXpMfp6DWzoIVKvJQKIQeNllURyL_usxq9rDcrxdaqILWGtuwphTz69n3xCo8ek7nAKYlfQbqOVUqJC7Elcrcewx0GA6dmHj75fbMS0X2dPQvcK6kboRDq6X0lQYsZU_dKjg7OEHWz4m6cggssJ5FGtN9bEAC0fSvVd-fV7QOoEwF26LCzf0m19Q5SWey0p5j1dg7o2oZJam_THQ7oPvst0lKRQEgVA'
    ],
    dbSyncStatus: 'synced',
  },

  '#REQ-8241': {
    id: 'SLIP-PL-8241',
    reqCode: '#REQ-8241',
    dbRecordId: 'REC-DB-8241-P-LABCHEM',
    timestamp: '2026-08-15 15:40:00 IST',
    dateLabel: 'Aug 15, 2026',
    periodCategory: 'this_month',
    jobTitle: 'Chemical Waste Sink Trap Replacement & Acid Neutralization',
    division: 'Plumbing Division',
    location: 'Chemistry Lab, Floor 1, Sink Line 4',
    subLocation: 'Acid Sink Line Station #4B',
    technicianName: 'K. P. Senanayake',
    technicianEmpId: 'EMP-T8419',
    requesterName: 'Prof. S. Wickramasinghe',
    requesterDept: 'Chemical & Process Eng.',
    requesterContact: '+94 77 149 0016',
    priority: 'HIGH',
    status: 'Completed',
    timeStarted: '02:00 PM',
    timeFinished: '03:40 PM',
    durationSpent: '1h 40m spent',
    summaryOfWork:
      'Solvent attack resulted in stress crack on chemical discharge trap. Fitted heavy-duty Vulcathene polypropylene waste trap and renewed mechanical compression couplings. Verified zero seepage under static test.',
    partsUsed: [
      { partNumber: 'VULC-TRAP-15', name: 'Vulcathene Chemical P-Trap 38mm', quantity: 1, costLkr: 6800 },
      { partNumber: 'VULC-SEAL-KIT', name: 'Mechanical Joint Seal Gasket Set', quantity: 1, costLkr: 1250 },
      { partNumber: 'CHEM-DILUT-50', name: 'Polypropylene Dilution Catchpot', quantity: 1, costLkr: 4500 },
    ],
    verifierName: 'Dr. Wickramasinghe',
    verifierRole: 'Head of Facilities & Maintenance Engineering',
    digitalSignatureHash: 'SHA256: d200126d90697f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284add',
    isoComplianceCert: 'Laboratory Safety Regulations & ISO-14001 Environmental Standard',
    photoThumbnails: [],
    dbSyncStatus: 'synced',
  },

  '#REQ-8228': {
    id: 'SLIP-HV-8228',
    reqCode: '#REQ-8228',
    dbRecordId: 'REC-DB-8228-H-LIBRARY',
    timestamp: '2026-08-12 11:20:00 IST',
    dateLabel: 'Aug 12, 2026',
    periodCategory: 'this_month',
    jobTitle: 'Library 3rd Floor Split AC Blower Motor Servicing',
    division: 'HVAC Systems',
    location: 'Main Library, Study Hall 3C',
    subLocation: 'Ceiling Cassette Unit C-09',
    technicianName: 'T. M. Liyanage',
    technicianEmpId: 'EMP-T8405',
    requesterName: 'Mrs. Oshini Hewage',
    requesterDept: 'General Administration',
    requesterContact: '+94 77 149 0016',
    priority: 'MEDIUM',
    status: 'Signed Off',
    timeStarted: '09:50 AM',
    timeFinished: '11:20 AM',
    durationSpent: '1h 30m spent',
    summaryOfWork:
      'Excessive bearing friction humming in silent study carrel zone. Extracted cross-flow fan drum, cleared accumulated dust fleece, lubricated sleeve bushings with high-viscosity synthetic fluid.',
    partsUsed: [
      { partNumber: 'LUB-SYN-HVAC', name: 'Synthetic Bearing Oil Lubricant', quantity: 1, costLkr: 950 },
      { partNumber: 'AIR-FILT-C3', name: 'Primary Washable Air Filter Screen', quantity: 2, costLkr: 1800 },
      { partNumber: 'VIB-ISOL-M6', name: 'Neoprene Vibration Damper Mounts', quantity: 4, costLkr: 1200 },
    ],
    verifierName: 'Eng. D. Jayasuriya',
    verifierRole: 'Operations Desk Dispatcher',
    digitalSignatureHash: 'SHA256: 677284addd200126d90697f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d',
    isoComplianceCert: 'Acoustic & HVAC Quality Standard ISO 9001',
    photoThumbnails: [
      'https://lh3.googleusercontent.com/aida-public/AB6AXuDTuWZvUv6g8lB2LMhRnk_EcyDMlMZooBC-faL3B_wTilcd-jXEMGdDkZ6RnBWW0YD-i3GjZkD_uTCl-JtGwEn4xOaRTEFz2DhTRl7BlltpD2GAjPgkia57L_Zd8RZ8-Y6NeYDsbkBGWwY1TiUJTkpROMVPYakrr2oJAvgNMWHciYtDq5dRj10mB_r3okwf519RKDqZPL0ae7fbhDudWwZGU11_NVuK5nQofm0Af5-moPqJIx4JgYHJqw'
    ],
    dbSyncStatus: 'synced',
  },

  '#REQ-8210': {
    id: 'SLIP-GN-8210',
    reqCode: '#REQ-8210',
    dbRecordId: 'REC-DB-8210-G-WORKSHOP',
    timestamp: '2026-08-05 16:50:00 IST',
    dateLabel: 'Aug 05, 2026',
    periodCategory: 'earlier',
    jobTitle: 'Main Workshop Hydraulic Lift Safety Latch Realignment',
    division: 'General Maintenance',
    location: 'Mechanical Engineering Workshop',
    subLocation: 'Vehicle Bay 2 • Heavy Lift Column A',
    technicianName: 'S. M. Karunaratne',
    technicianEmpId: 'EMP-T8402',
    requesterName: 'Mr. T. Bandara',
    requesterDept: 'Mechanical Workshops Registry',
    requesterContact: '+94 77 149 0016',
    priority: 'HIGH',
    status: 'Signed Off',
    timeStarted: '03:10 PM',
    timeFinished: '04:50 PM',
    durationSpent: '1h 40m spent',
    summaryOfWork:
      'Column A safety ratchet pawl was falling out of synchronization during vehicle ascent. Adjusted dual balancing cable tensioners, replaced deformed shear pin, and lubricated locking slide.',
    partsUsed: [
      { partNumber: 'GREASE-MOLY-500', name: 'Moly EP Heavy Duty Grease 500g', quantity: 1, costLkr: 1600 },
      { partNumber: 'PIN-SHEAR-12', name: 'Grade 8.8 Safety Latch Shear Pin', quantity: 2, costLkr: 800 },
      { partNumber: 'CABLE-CLAMP-10', name: 'Heavy Duty Wire Rope Thimble Clamps', quantity: 2, costLkr: 950 },
    ],
    verifierName: 'Dr. Wickramasinghe',
    verifierRole: 'Head of Facilities & Maintenance Engineering',
    digitalSignatureHash: 'SHA256: 97f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d906',
    isoComplianceCert: 'Occupational Health & Machinery Safety Standard OHSAS 18001',
    photoThumbnails: [],
    dbSyncStatus: 'synced',
  },
};

// 7 COMPLETELY DISTINCT Technical Job Audits for "View Details"
export const jobAuditsDataset: Record<string, JobDetailAudit> = {
  '#REQ-8285': {
    reqCode: '#REQ-8285',
    title: 'Fluorescent Ballast Unit Replacement & Luminaire Rewiring',
    division: 'Electrical Division',
    tradeCategory: 'Electrical',
    severity: 'MEDIUM',
    location: 'Main Auditorium, Stage Area (Zone B)',
    reportedIssue: 'Noticeable 50Hz electrical buzzing and strobing lights above auditorium stage.',
    rootCauseAnalysis: 'Internal insulation degradation of inductive ballast coil causing electromagnetic resonance and excessive winding heat (68°C).',
    assignedTechnician: 'S. M. Karunaratne',
    technicianRole: 'Senior Electrical Technician',
    timeSpent: '1h 30m',
    slaTargetHours: '3.0h',
    measurements: [
      { parameter: 'Supply Mains Voltage', reading: '231.8 V', nominalRange: '230 V ±6%', status: 'OPTIMAL' },
      { parameter: 'Earth Loop Impedance', reading: '0.24 Ω', nominalRange: '< 0.50 Ω', status: 'OPTIMAL' },
      { parameter: 'Ballast Operating Temp', reading: '38.2 °C', nominalRange: '< 55 °C', status: 'PASS' },
      { parameter: 'Audible Noise Level', reading: '28 dBA', nominalRange: '< 35 dBA', status: 'OPTIMAL' },
    ],
    timeline: [
      { step: 'Order Dispatched', time: '02:40 PM', note: 'Technician mobilized with spare electronic ballast and harness.', done: true },
      { step: 'Circuit Isolation (LOTO)', time: '02:55 PM', note: 'Breaker DB-AUD-14 padlocked and tag verified at 0V.', done: true },
      { step: 'Component Swap', time: '03:30 PM', note: 'Replaced inductive unit with electronic high-frequency driver.', done: true },
      { step: 'Continuity & Lux Testing', time: '04:05 PM', note: 'Luminance measured 420 Lux on stage. Zero flicker.', done: true },
      { step: 'Work Sign-off', time: '04:15 PM', note: 'Signed off with Facilities Manager Mr. T. Bandara.', done: true },
    ],
    safetyChecklist: [
      { check: 'LOTO Lockout / Tagout applied to distribution board', passed: true },
      { check: 'Step ladder stability and safety tether deployed', passed: true },
      { check: 'Old ballast disposed in hazardous electrical waste bin', passed: true },
      { check: 'Post-repair insulation resistance tested (>100 MΩ)', passed: true },
    ],
    requesterFeedback: {
      rating: 5,
      comment: 'Audio interference on stage microphones completely disappeared. Quick and neat work!',
      submittedBy: 'Mr. T. Bandara (Auditorium Manager)',
    },
    dbAuditHash: 'DB-AUD-E8285-LKO9',
  },

  '#REQ-8279': {
    reqCode: '#REQ-8279',
    title: 'Restroom Concealed Flush Valve Diaphragm Overhaul',
    division: 'Plumbing Division',
    tradeCategory: 'Plumbing',
    severity: 'HIGH',
    location: 'Faculty of Engineering, Ground Floor West',
    reportedIssue: 'Urinal flush valve refuses to shut off completely, wasting continuous water into sewer.',
    rootCauseAnalysis: 'Bypass orifice in rubber diaphragm clogged by hard-water calcium deposit, preventing equalization chamber from re-seating.',
    assignedTechnician: 'K. P. Senanayake',
    technicianRole: 'Certified Master Plumber',
    timeSpent: '45m',
    slaTargetHours: '2.0h',
    measurements: [
      { parameter: 'Static Line Pressure', reading: '3.2 Bar', nominalRange: '2.5 - 4.0 Bar', status: 'OPTIMAL' },
      { parameter: 'Flush Volume per Cycle', reading: '5.9 Liters', nominalRange: '6.0 ± 0.5 L', status: 'OPTIMAL' },
      { parameter: 'Cycle Duration', reading: '4.8 Seconds', nominalRange: '4 - 6 Sec', status: 'OPTIMAL' },
      { parameter: 'Residual Leak Rate', reading: '0.00 L/hr', nominalRange: '0.00 L/hr', status: 'PASS' },
    ],
    timeline: [
      { step: 'Emergency Dispatch', time: '11:00 AM', note: 'Prioritized due to clean water conservation protocols.', done: true },
      { step: 'Isolation Valve Closed', time: '11:10 AM', note: 'Angle stop shut off cleanly with screwdriver key.', done: true },
      { step: 'Barrel De-scaling & Kit Replaced', time: '11:28 AM', note: 'Installed OEM diaphragm and synthetic O-ring.', done: true },
      { step: 'Dynamic Pressure Testing', time: '11:40 AM', note: 'Ran 5 consecutive test flushes without lag or water hammer.', done: true },
    ],
    safetyChecklist: [
      { check: 'Water supply isolated prior to cover disassembly', passed: true },
      { check: 'Antiseptic wipe applied to exterior chrome surfaces', passed: true },
      { check: 'Floor water residue vacuumed and dried to prevent slip risk', passed: true },
      { check: 'Water meter conservation log logged with central dispatch', passed: true },
    ],
    requesterFeedback: {
      rating: 5,
      comment: 'Arrived within 15 minutes of request. Stopped the water waste immediately.',
      submittedBy: 'Prof. S. Wickramasinghe',
    },
    dbAuditHash: 'DB-AUD-P8279-HYG4',
  },

  '#REQ-8260': {
    reqCode: '#REQ-8260',
    title: 'Server Room Precision Air Conditioner Refrigerant Refill',
    division: 'HVAC Systems',
    tradeCategory: 'HVAC',
    severity: 'CRITICAL',
    location: 'IT Center Room 102 (Server Matrix)',
    reportedIssue: 'Server rack thermal alert: Ambient room temperature reached 24.8°C (Threshold 22°C).',
    rootCauseAnalysis: 'Gradual slow micro-leak at suction Schrader service port valve core over 14 months, reducing suction pressure to 78 PSI.',
    assignedTechnician: 'D. B. Weerasinghe',
    technicianRole: 'Senior HVAC & Refrigeration Engineer',
    timeSpent: '2h 15m',
    slaTargetHours: '2.5h',
    measurements: [
      { parameter: 'Suction Line Pressure', reading: '124 PSI', nominalRange: '118 - 128 PSI', status: 'OPTIMAL' },
      { parameter: 'Discharge High Pressure', reading: '345 PSI', nominalRange: '330 - 365 PSI', status: 'OPTIMAL' },
      { parameter: 'Subcooling Temp', reading: '6.4 °C', nominalRange: '5.0 - 8.0 °C', status: 'OPTIMAL' },
      { parameter: 'Supply Air Temp', reading: '16.8 °C', nominalRange: '16.0 - 18.0 °C', status: 'PASS' },
    ],
    timeline: [
      { step: 'Tier-1 Critical Dispatch', time: '12:15 PM', note: 'Dual-technician response with nitrogen detector and recovery station.', done: true },
      { step: 'Halide Sniffer Leak Detection', time: '12:45 PM', note: 'Electronic sniffer confirmed micro-leak on service valve cap.', done: true },
      { step: 'Core Tool Replacement', time: '01:20 PM', note: 'Swapped Schrader core under zero-loss isolation.', done: true },
      { step: 'Precision Gas Charging', time: '02:00 PM', note: 'Charged exactly 2.50kg R410A using digital scales.', done: true },
      { step: 'Thermal Stabilization', time: '02:30 PM', note: 'Server ambient normalized to 19.4°C.', done: true },
    ],
    safetyChecklist: [
      { check: 'Certified R410A high pressure gauges & hoses used', passed: true },
      { check: 'Zero atmospheric venting (EPA compliance maintained)', passed: true },
      { check: 'Electrical phase balance tested under compressor load', passed: true },
      { check: 'Condensate drainage trap cleared of biofilm', passed: true },
    ],
    requesterFeedback: {
      rating: 5,
      comment: 'Saved our core virtualization servers from thermal throttling. Super professional diagnosis.',
      submittedBy: 'Mr. N. Senaratne (Systems Admin)',
    },
    dbAuditHash: 'DB-AUD-H8260-SRV2',
  },

  '#REQ-8254': {
    reqCode: '#REQ-8254',
    title: 'Overhead Projector Power Socket & Distribution Rack Repair',
    division: 'Electrical Division',
    tradeCategory: 'Electrical',
    severity: 'MEDIUM',
    location: 'Civil Eng Building, Lecture Hall A',
    reportedIssue: 'Projector intermittent shutdown whenever lecturer touched desktop HDMI power box.',
    rootCauseAnalysis: 'Loose neutral screw clamp generated excessive I²R heating, carbonizing the receptacle terminal plastics.',
    assignedTechnician: 'S. M. Karunaratne',
    technicianRole: 'Senior Electrical Technician',
    timeSpent: '35m',
    slaTargetHours: '3.0h',
    measurements: [
      { parameter: 'Phase-Neutral Voltage', reading: '230.4 V', nominalRange: '230 V ±6%', status: 'OPTIMAL' },
      { parameter: 'Insulation Resistance', reading: '> 200 MΩ', nominalRange: '> 2.0 MΩ', status: 'OPTIMAL' },
      { parameter: 'RCD Tripping Time', reading: '28 ms', nominalRange: '< 40 ms at 30mA', status: 'PASS' },
      { parameter: 'Terminal Contact Resistance', reading: '0.02 Ω', nominalRange: '< 0.05 Ω', status: 'OPTIMAL' },
    ],
    timeline: [
      { step: 'Classroom Dispatch', time: '09:35 AM', note: 'Arrived between lecture breaks.', done: true },
      { step: 'Sub-board Isolation', time: '09:42 AM', note: 'Isolated circuit breaker C16 in Hall A cabinet.', done: true },
      { step: 'Terminal Rewiring', time: '09:58 AM', note: 'Cut burnt copper ends, stripped clean lead, fitted new Clipsal box.', done: true },
      { step: 'Projector Full Load Test', time: '10:10 AM', note: 'Projector 400W lamp ran 10 minutes without thermal rise.', done: true },
    ],
    safetyChecklist: [
      { check: 'Multi-meter zero verification before opening faceplate', passed: true },
      { check: 'Proper terminal torque applied to prevent cold-flow loose screws', passed: true },
      { check: 'RCD safety trip push-button verified', passed: true },
    ],
    requesterFeedback: {
      rating: 5,
      comment: 'Repaired right before my 10:30 AM lecture. Thank you for the quick turnaround.',
      submittedBy: 'Dr. K. Liyanage',
    },
    dbAuditHash: 'DB-AUD-E8254-LEC1',
  },

  '#REQ-8241': {
    reqCode: '#REQ-8241',
    title: 'Chemical Waste Sink Trap Replacement & Acid Neutralization',
    division: 'Plumbing Division',
    tradeCategory: 'Plumbing',
    severity: 'HIGH',
    location: 'Chemistry Lab, Floor 1, Sink Line 4',
    reportedIssue: 'Acidic chemical odor and moist drip observed beneath workstation sink drain.',
    rootCauseAnalysis: 'Organic solvent and dilute acid thermal cycling caused fatigue hairline fracture along injection molded weld line of P-trap.',
    assignedTechnician: 'K. P. Senanayake',
    technicianRole: 'Certified Master Plumber',
    timeSpent: '1h 40m',
    slaTargetHours: '3.0h',
    measurements: [
      { parameter: 'Waste Effluent pH', reading: '7.2 pH', nominalRange: '6.5 - 8.5 pH', status: 'OPTIMAL' },
      { parameter: 'Drain Flow Capacity', reading: '45 L/min', nominalRange: '> 35 L/min', status: 'OPTIMAL' },
      { parameter: 'Joint Hydrostatic Seal', reading: 'Zero Leak', nominalRange: 'Zero Leak at 500mm Head', status: 'PASS' },
    ],
    timeline: [
      { step: 'Hazard Assessment', time: '02:00 PM', note: 'Lab fume extraction checked. Acid-resistant neoprene gloves worn.', done: true },
      { step: 'Old Trap Neutralization', time: '02:25 PM', note: 'Flushed sodium bicarbonate buffer through basin before disconnect.', done: true },
      { step: 'Vulcathene Trap Assembly', time: '03:10 PM', note: 'Installed mechanical joint chemical trap with thermal expansion margin.', done: true },
      { step: 'Litmus Test & Handover', time: '03:40 PM', note: 'Discharge confirmed safe and leak-free.', done: true },
    ],
    safetyChecklist: [
      { check: 'Full chemical splash PPE worn during trap dismantling', passed: true },
      { check: 'Contaminated waste collected into certified laboratory chemical carboy', passed: true },
      { check: 'Work area washed down with neutralizer and wiped dry', passed: true },
    ],
    requesterFeedback: {
      rating: 5,
      comment: 'Very thorough and safety-conscious handling of chemical sink plumbing.',
      submittedBy: 'Prof. S. Wickramasinghe (Chemistry HOD)',
    },
    dbAuditHash: 'DB-AUD-P8241-LAB3',
  },

  '#REQ-8228': {
    reqCode: '#REQ-8228',
    title: 'Library 3rd Floor Split AC Blower Motor Servicing',
    division: 'HVAC Systems',
    tradeCategory: 'HVAC',
    severity: 'MEDIUM',
    location: 'Main Library, Study Hall 3C',
    reportedIssue: 'Rattling fan noise distracting students in quiet study zone.',
    rootCauseAnalysis: 'Unbalanced dust cake buildup on curved fan blades coupled with dehydrated porous bronze sleeve bearing.',
    assignedTechnician: 'T. M. Liyanage',
    technicianRole: 'HVAC Maintenance Technician',
    timeSpent: '1h 30m',
    slaTargetHours: '3.0h',
    measurements: [
      { parameter: 'Acoustic Sound Pressure', reading: '33.5 dBA', nominalRange: '< 38.0 dBA', status: 'OPTIMAL' },
      { parameter: 'Blower RPM Speed', reading: '1,120 RPM', nominalRange: '1,100 - 1,200 RPM', status: 'OPTIMAL' },
      { parameter: 'Air Flow Velocity', reading: '4.8 m/s', nominalRange: '> 4.0 m/s', status: 'OPTIMAL' },
      { parameter: 'Motor Current Draw', reading: '0.42 A', nominalRange: '< 0.55 A', status: 'PASS' },
    ],
    timeline: [
      { step: 'Quiet Entry to Library', time: '09:50 AM', note: 'Coordinated with librarian Mrs. Hewage to cordon off carrel 3C.', done: true },
      { step: 'Casing Removal & Ultrasonic Wash', time: '10:20 AM', note: 'Removed blower drum, washed lint accumulation with coil cleaner.', done: true },
      { step: 'Bearing Vacuum Oil Impregnation', time: '10:55 AM', note: 'Lubricated sleeve bearing with synthetic ISO VG 68 lubricant.', done: true },
      { step: 'Sound Meter Verification', time: '11:20 AM', note: 'Tested sound down to 33.5 dBA. Quiet operation restored.', done: true },
    ],
    safetyChecklist: [
      { check: 'Isolation switch tagged before touching rotating fan squirrel cage', passed: true },
      { check: 'Drop cloth laid beneath ceiling unit to protect library carpeting', passed: true },
      { check: 'Antimicrobial sanitizing mist applied to evaporator coil fins', passed: true },
    ],
    requesterFeedback: {
      rating: 5,
      comment: 'Remarkably quiet now. Appreciate doing the repair cleanly in the library.',
      submittedBy: 'Mrs. Oshini Hewage (Head Librarian)',
    },
    dbAuditHash: 'DB-AUD-H8228-LIB9',
  },

  '#REQ-8210': {
    reqCode: '#REQ-8210',
    title: 'Main Workshop Hydraulic Lift Safety Latch Realignment',
    division: 'General Maintenance',
    tradeCategory: 'General',
    severity: 'HIGH',
    location: 'Mechanical Engineering Workshop',
    reportedIssue: 'Two-post vehicle lift safety lock clicks asynchronously with 40mm lag on left arm.',
    rootCauseAnalysis: 'Dual equalizing steel cable stretch on Column A loosened turnbuckle tension, creating delayed engagement.',
    assignedTechnician: 'S. M. Karunaratne',
    technicianRole: 'Senior Mechanical Laborer',
    timeSpent: '1h 40m',
    slaTargetHours: '3.0h',
    measurements: [
      { parameter: 'Pawl Synchronization Error', reading: '1.2 mm', nominalRange: '< 5.0 mm', status: 'OPTIMAL' },
      { parameter: 'Equalizer Cable Tension', reading: '1,450 N', nominalRange: '1,400 - 1,600 N', status: 'OPTIMAL' },
      { parameter: 'Hydraulic System Pressure', reading: '190 Bar', nominalRange: '180 - 210 Bar', status: 'PASS' },
      { parameter: 'Proof Test Load', reading: '1,500 kg', nominalRange: '1,500 kg Passed', status: 'OPTIMAL' },
    ],
    timeline: [
      { step: 'Workshop Safety Lockdown', time: '03:10 PM', note: 'Bay 2 red barrier tapes placed. Power key isolated.', done: true },
      { step: 'Turnbuckle Cable Tensioning', time: '03:45 PM', note: 'Tightened equalizing cable locknuts to 1,450 N spec.', done: true },
      { step: 'Shear Pin Replacement & Greasing', time: '04:15 PM', note: 'Replaced Column A shear pin and packed Moly EP grease into pawl.', done: true },
      { step: 'Full Height Test & Signoff', time: '04:50 PM', note: 'Simultaneous mechanical lock engagement verified at all 12 notches.', done: true },
    ],
    safetyChecklist: [
      { check: 'Hydraulic lowering valve mechanically locked during technician access', passed: true },
      { check: 'Wire ropes inspected for broken strands (0 broken strands found)', passed: true },
      { check: 'Anchor bolt torque verified to 120 Nm against concrete slab', passed: true },
    ],
    requesterFeedback: {
      rating: 5,
      comment: 'Crucial machinery safety fix. Tested with faculty utility vehicle smoothly.',
      submittedBy: 'Mr. T. Bandara (Workshop Superintendent)',
    },
    dbAuditHash: 'DB-AUD-G8210-MEC5',
  },
};

// 7 History Logs corresponding to the records
export const historyLogsDataset: WorkHistoryLog[] = [
  {
    id: 'HIST-801',
    reqCode: '#REQ-8285',
    title: 'Fluorescent Ballast Unit Replacement',
    division: 'Electrical Division',
    tradeCategory: 'Electrical',
    dateLabel: 'Aug 21, 2026',
    periodCategory: 'yesterday',
    resolvedAt: 'Resolved at 04:15 PM',
    durationSpent: '1h 30m spent',
    location: 'Main Auditorium, Stage Area (Zone B)',
    status: 'Completed',
    verifierName: 'Dr. Wickramasinghe',
    verifierTitle: 'Head of Department • Digital Signature Authenticated',
    photosCount: 2,
    photoThumbnails: workSlipsDataset['#REQ-8285'].photoThumbnails,
    workSlip: workSlipsDataset['#REQ-8285'],
    detailAudit: jobAuditsDataset['#REQ-8285'],
  },
  {
    id: 'HIST-802',
    reqCode: '#REQ-8279',
    title: 'Restroom Flush Valve Repair',
    division: 'Plumbing Division',
    tradeCategory: 'Plumbing',
    dateLabel: 'Aug 21, 2026',
    periodCategory: 'yesterday',
    resolvedAt: 'Resolved at 11:45 AM',
    durationSpent: '45m spent',
    location: 'Faculty of Engineering, Ground Floor West',
    status: 'Completed',
    verifierName: 'Eng. D. Jayasuriya',
    verifierTitle: 'Senior Operations Desk Dispatcher',
    remarksSnippet: 'Standard Diaphragm Kit Replaced',
    photosCount: 1,
    photoThumbnails: workSlipsDataset['#REQ-8279'].photoThumbnails,
    workSlip: workSlipsDataset['#REQ-8279'],
    detailAudit: jobAuditsDataset['#REQ-8279'],
  },
  {
    id: 'HIST-803',
    reqCode: '#REQ-8260',
    title: 'Server Room Air Conditioner Gas Refill',
    division: 'HVAC Systems',
    tradeCategory: 'HVAC',
    dateLabel: 'Aug 19, 2026',
    periodCategory: 'this_month',
    resolvedAt: 'Resolved at 02:30 PM',
    durationSpent: '2h 15m spent',
    location: 'IT Center Room 102 (Server Matrix)',
    status: 'Signed Off',
    verifierName: 'Dr. Wickramasinghe',
    verifierTitle: 'Head of Facilities & Maintenance Engineering',
    remarksSnippet: 'R-410A Refill 2.5kg',
    photosCount: 1,
    photoThumbnails: workSlipsDataset['#REQ-8260'].photoThumbnails,
    workSlip: workSlipsDataset['#REQ-8260'],
    detailAudit: jobAuditsDataset['#REQ-8260'],
  },
  {
    id: 'HIST-804',
    reqCode: '#REQ-8254',
    title: 'Overhead Projector Power Socket Fixture',
    division: 'Electrical Division',
    tradeCategory: 'Electrical',
    dateLabel: 'Aug 18, 2026',
    periodCategory: 'this_month',
    resolvedAt: 'Resolved at 10:10 AM',
    durationSpent: '35m spent',
    location: 'Civil Eng Building, Lecture Hall A',
    status: 'Completed',
    verifierName: 'Eng. D. Jayasuriya',
    verifierTitle: 'Operations Desk Dispatcher',
    remarksSnippet: 'Replaced burnt terminal block',
    photosCount: 1,
    photoThumbnails: workSlipsDataset['#REQ-8254'].photoThumbnails,
    workSlip: workSlipsDataset['#REQ-8254'],
    detailAudit: jobAuditsDataset['#REQ-8254'],
  },
  {
    id: 'HIST-805',
    reqCode: '#REQ-8241',
    title: 'Chemical Waste Sink Trap Replacement',
    division: 'Plumbing Division',
    tradeCategory: 'Plumbing',
    dateLabel: 'Aug 15, 2026',
    periodCategory: 'this_month',
    resolvedAt: 'Resolved at 03:40 PM',
    durationSpent: '1h 40m spent',
    location: 'Chemistry Lab, Floor 1, Sink Line 4',
    status: 'Completed',
    verifierName: 'Dr. Wickramasinghe',
    verifierTitle: 'Head of Department • Digital Signature Authenticated',
    remarksSnippet: 'Vulcathene Acid Trap Renewed',
    photosCount: 0,
    workSlip: workSlipsDataset['#REQ-8241'],
    detailAudit: jobAuditsDataset['#REQ-8241'],
  },
  {
    id: 'HIST-806',
    reqCode: '#REQ-8228',
    title: 'Library 3rd Floor Split AC Blower Motor Servicing',
    division: 'HVAC Systems',
    tradeCategory: 'HVAC',
    dateLabel: 'Aug 12, 2026',
    periodCategory: 'this_month',
    resolvedAt: 'Resolved at 11:20 AM',
    durationSpent: '1h 30m spent',
    location: 'Main Library, Study Hall 3C',
    status: 'Signed Off',
    verifierName: 'Eng. D. Jayasuriya',
    verifierTitle: 'Operations Desk Dispatcher',
    remarksSnippet: 'Synthetic oil bearing lubrication',
    photosCount: 1,
    photoThumbnails: workSlipsDataset['#REQ-8228'].photoThumbnails,
    workSlip: workSlipsDataset['#REQ-8228'],
    detailAudit: jobAuditsDataset['#REQ-8228'],
  },
  {
    id: 'HIST-807',
    reqCode: '#REQ-8210',
    title: 'Main Workshop Hydraulic Lift Safety Latch',
    division: 'General Maintenance',
    tradeCategory: 'General',
    dateLabel: 'Aug 05, 2026',
    periodCategory: 'earlier',
    resolvedAt: 'Resolved at 04:50 PM',
    durationSpent: '1h 40m spent',
    location: 'Mechanical Engineering Workshop',
    status: 'Signed Off',
    verifierName: 'Dr. Wickramasinghe',
    verifierTitle: 'Head of Department • Digital Signature Authenticated',
    remarksSnippet: 'Dual cables synchronized & tensioned',
    photosCount: 0,
    workSlip: workSlipsDataset['#REQ-8210'],
    detailAudit: jobAuditsDataset['#REQ-8210'],
  },
];

class HistoryDatabaseService {
  constructor() {
    this.ensureInitialized();
  }

  private ensureInitialized(): void {
    try {
      localStorage.setItem(DB_HISTORY_KEY, JSON.stringify(historyLogsDataset));
      localStorage.setItem(DB_SLIPS_KEY, JSON.stringify(workSlipsDataset));
      localStorage.setItem(DB_AUDITS_KEY, JSON.stringify(jobAuditsDataset));
    } catch (e) {
      console.warn('LocalStorage unavailable, running with in-memory dataset', e);
    }
  }

  public getAllHistoryLogs(): WorkHistoryLog[] {
    try {
      const data = localStorage.getItem(DB_HISTORY_KEY);
      if (data) {
        return JSON.parse(data);
      }
    } catch (e) {
      console.warn('Failed to parse history logs from DB', e);
    }
    return historyLogsDataset;
  }

  public getWorkSlip(reqCodeOrId: string): WorkSlip | null {
    try {
      const data = localStorage.getItem(DB_SLIPS_KEY);
      const slips: Record<string, WorkSlip> = data ? JSON.parse(data) : workSlipsDataset;
      
      const cleanKey = reqCodeOrId.startsWith('#') ? reqCodeOrId : `#${reqCodeOrId}`;
      if (slips[cleanKey]) {
        return slips[cleanKey];
      }
      if (slips[reqCodeOrId]) {
        return slips[reqCodeOrId];
      }
      const found = Object.values(slips).find(
        (s) => s.id === reqCodeOrId || s.reqCode === reqCodeOrId || s.reqCode === cleanKey
      );
      if (found) return found;
    } catch (e) {
      console.warn('Failed to get work slip from DB', e);
    }

    return workSlipsDataset[reqCodeOrId] || null;
  }

  public getJobDetailAudit(reqCodeOrId: string): JobDetailAudit | null {
    try {
      const data = localStorage.getItem(DB_AUDITS_KEY);
      const audits: Record<string, JobDetailAudit> = data ? JSON.parse(data) : jobAuditsDataset;
      
      const cleanKey = reqCodeOrId.startsWith('#') ? reqCodeOrId : `#${reqCodeOrId}`;
      if (audits[cleanKey]) {
        return audits[cleanKey];
      }
      if (audits[reqCodeOrId]) {
        return audits[reqCodeOrId];
      }
      const found = Object.values(audits).find(
        (a) => a.reqCode === reqCodeOrId || a.reqCode === cleanKey
      );
      if (found) return found;
    } catch (e) {
      console.warn('Failed to get job audit from DB', e);
    }

    return jobAuditsDataset[reqCodeOrId] || null;
  }

  public filterLogs(options: {
    trade?: string;
    period?: string;
    searchQuery?: string;
  }): WorkHistoryLog[] {
    const all = this.getAllHistoryLogs();
    const { trade = 'all', period = 'all', searchQuery = '' } = options;

    return all.filter((item) => {
      // 1. Trade filter
      if (trade && trade !== 'all') {
        const itemTrade = (item.tradeCategory || '').toLowerCase();
        const selectedTrade = trade.toLowerCase();
        if (!itemTrade.includes(selectedTrade) && !item.division.toLowerCase().includes(selectedTrade)) {
          return false;
        }
      }

      // 2. Period filter
      if (period && period !== 'all') {
        if (period === 'yesterday') {
          if (item.periodCategory !== 'yesterday' && !item.dateLabel?.toLowerCase().includes('aug 21')) {
            return false;
          }
        } else if (period === 'this_month') {
          if (item.periodCategory !== 'yesterday' && item.periodCategory !== 'this_month') {
            return false;
          }
        } else if (period === 'earlier') {
          if (item.periodCategory !== 'earlier') {
            return false;
          }
        }
      }

      // 3. Search query
      if (searchQuery && searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchTitle = item.title.toLowerCase().includes(q);
        const matchReq = item.reqCode.toLowerCase().includes(q);
        const matchLoc = item.location.toLowerCase().includes(q);
        const matchDiv = item.division.toLowerCase().includes(q);
        const matchVerifier = (item.verifierName || '').toLowerCase().includes(q);
        if (!matchTitle && !matchReq && !matchLoc && !matchDiv && !matchVerifier) {
          return false;
        }
      }

      return true;
    });
  }

  public resetDatabase(): WorkHistoryLog[] {
    try {
      localStorage.setItem(DB_HISTORY_KEY, JSON.stringify(historyLogsDataset));
      localStorage.setItem(DB_SLIPS_KEY, JSON.stringify(workSlipsDataset));
      localStorage.setItem(DB_AUDITS_KEY, JSON.stringify(jobAuditsDataset));
    } catch (e) {
      console.warn('Failed to reset DB', e);
    }
    return historyLogsDataset;
  }

  public getDatabaseStats() {
    const all = this.getAllHistoryLogs();
    return {
      totalRecords: all.length,
      storageEngine: 'ITUM Central DB (Live Synchronized)',
      lastSynced: 'Just now (Live)',
      status: 'Active Online',
    };
  }
}

export const historyDatabase = new HistoryDatabaseService();
