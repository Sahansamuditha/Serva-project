// Campus Buildings & Zones Configuration

export const CAMPUS_ZONES = {
  'Zone A': [
    'Admin building',
    'Guard room',
    'Shopping complex',
    'Quarters',
    'TAG',
    'Civil canteen'
  ],
  'Zone B': [
    'Mechanical Engineer',
    'Maritime Engineer',
    'Polymer & Chemical Engineer',
    'Electrical , Electronic & Telecommunication Engineer',
    'Textile & Clothing Engineer',
    'Civil Engineer'
  ],
  'Zone C': [
    'Hostel',
    'Medical center',
    'Canteen 1',
    'Canteen 2',
    'Gym & Indoor'
  ]
};

export const BUILDING_TO_ZONE = {
  // Zone A
  'Admin building': 'Zone A',
  'Guard room': 'Zone A',
  'Shopping complex': 'Zone A',
  'Quarters': 'Zone A',
  'TAG': 'Zone A',
  'Civil canteen': 'Zone A',

  // Zone B
  'Mechanical Engineer': 'Zone B',
  'Maritime Engineer': 'Zone B',
  'Polymer & Chemical Engineer': 'Zone B',
  'Electrical , Electronic & Telecommunication Engineer': 'Zone B',
  'Textile & Clothing Engineer': 'Zone B',
  'Civil Engineer': 'Zone B',

  // Zone C
  'Hostel': 'Zone C',
  'Medical center': 'Zone C',
  'Canteen 1': 'Zone C',
  'Canteen 2': 'Zone C',
  'Gym & Indoor': 'Zone C'
};

export function getZoneFromLocation(locStr) {
  if (!locStr) return '';
  const match = locStr.match(/\b(Zone\s+[A-C])\b/i);
  if (match) return match[1];
  for (const [bld, zn] of Object.entries(BUILDING_TO_ZONE)) {
    if (locStr.toLowerCase().includes(bld.toLowerCase())) {
      return zn;
    }
  }
  return '';
}
