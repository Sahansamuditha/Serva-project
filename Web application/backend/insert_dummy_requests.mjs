import mysql from 'mysql2/promise';
import { calculatePriorityScore } from './priorityAlgorithm.js';

const dummyRequests = [
  // 1. CRITICAL
  {
    title: 'Live electrical wire sparking near student hostel doorway',
    description: 'A bare live electrical wire is sparking with smoke near the main entrance doorway. Severe electrocution danger and active fire outbreak risk to students. Complete failure, this is an immediate emergency right now!',
    category: 'Electricity',
    sub_category: 'Electrical Panels; Power Supply; Wiring & Cables',
    location: 'Hostel - Block C Entrance',
    status: 'Pending',
    requester_name: 'Dr. Rohan Gunawardena',
    requester_email: 'rohan.g@itum.mrt.ac.lk',
    requester_phone: '+94 77 123 4567',
    requester_dept: 'Division of Electrical & Electronic Engineering',
    peoples: 850,
    images: ['https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=600&q=80']
  },
  {
    title: 'Steam pressure valve burst and flooding in mechanical lab',
    description: 'High pressure steam pipe burst inside the thermal fluid lab. Boiling water flooding across equipment area creating severe burn risk and collapse danger. Total failure, immediate emergency evacuation right now!',
    category: 'HVAC',
    sub_category: 'Chiller Systems',
    location: 'Mechanical Engineering Division - Heat Engines Lab',
    status: 'In Progress',
    requester_name: 'Eng. Samantha Wickramasinghe',
    requester_email: 'samantha.w@itum.mrt.ac.lk',
    requester_phone: '+94 71 890 1234',
    requester_dept: 'Division of Mechanical Engineering Technology',
    peoples: 350,
    images: ['https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=600&q=80']
  },

  // 2. HIGH
  {
    title: 'Water pipe rupture flooding corridor near indoor gym',
    description: 'Main water supply pipe leaking constantly onto the main walkway. A deep water puddle has formed creating a severe slippery floor and tripping hazard for athletes. Needs prompt attention today asap.',
    category: 'Water',
    sub_category: 'Pipelines & Leaks; Toilets & Flushing; Drainage & Overflow',
    location: 'Gym - Ground Floor Corridor',
    status: 'Pending',
    requester_name: 'Kavindu Perera (Sports Council)',
    requester_email: 'kavindu.p@itum.mrt.ac.lk',
    requester_phone: '+94 76 234 5678',
    requester_dept: 'Physical Education & Sports Unit',
    peoples: 250,
    images: ['https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80']
  },
  {
    title: 'Hazardous acid bottle spillage in Polymer Research Lab',
    description: 'Concentrated reagent bottle dropped near workbench. Strong chemical fumes spreading with severe skin burn and slip hazard. Prompt attention urgently needed.',
    category: 'Cleaning',
    sub_category: 'Hazardous Spill',
    location: 'Chemical Engineering and Polymer Technology Division - Lab 1',
    status: 'Scheduled',
    requester_name: 'Dr. Nimali Senanayake',
    requester_email: 'nimali.s@itum.mrt.ac.lk',
    requester_phone: '+94 77 345 6789',
    requester_dept: 'Division of Polymer Technology',
    peoples: 120,
    images: ['https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?auto=format&fit=crop&w=600&q=80']
  },
  {
    title: 'Loose ceiling plaster chunks falling near Staircase B',
    description: 'Multiple chunks of concrete ceiling plaster cracked and detached, falling down the stairwell. Major defect with falling debris hazard, urgent prompt attention today.',
    category: 'Civil & Structural',
    sub_category: 'Structural Damage; Ceilings & Roofs; Elevator',
    location: 'Civil Engineering Division - Stairway B',
    status: 'In Progress',
    requester_name: 'Eng. Priyantha Bandara',
    requester_email: 'priyantha.b@itum.mrt.ac.lk',
    requester_phone: '+94 70 456 7890',
    requester_dept: 'Division of Civil Engineering Technology',
    peoples: 300,
    images: ['https://images.unsplash.com/photo-1541888946425-d0fbb186c5f8?auto=format&fit=crop&w=600&q=80']
  },

  // 3. MEDIUM
  {
    title: 'Multimedia projector flickering in Admin Building meeting room',
    description: 'The overhead multimedia projector in conference room 2 is flickering and dim. Limited malfunction, it still works but needs planned attention soon this week.',
    category: 'Academic',
    sub_category: 'Projectors & Displays',
    location: 'Admin Building - Conference Room 2',
    status: 'Scheduled',
    requester_name: 'Mrs. Chandani Alwis',
    requester_email: 'chandani.a@itum.mrt.ac.lk',
    requester_phone: '+94 11 265 0301',
    requester_dept: 'General Administration Unit',
    peoples: 35,
    images: ['https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?auto=format&fit=crop&w=600&q=80']
  },
  {
    title: 'Ceiling fan regulator knob broken in Lecture Hall 4',
    description: 'Ceiling fan is spinning at maximum speed only because speed regulator dial is loose and jammed. Noticeable malfunction, schedule repair when convenient.',
    category: 'Electricity',
    sub_category: 'Ceiling Fans',
    location: 'Main Block (Complex B) - Lecture Hall 4',
    status: 'Pending',
    requester_name: 'Mr. Asanka Fernando',
    requester_email: 'asanka.f@itum.mrt.ac.lk',
    requester_phone: '+94 77 987 6543',
    requester_dept: 'Division of Interdisciplinary Studies',
    peoples: 80,
    images: ['https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=80']
  },
  {
    title: 'Door lock cylinder sticking in Textile Design Lab',
    description: 'Key cylinder is hard to turn and latch is slightly misaligned. Still functioning but needs planned lubrication and adjustment.',
    category: 'Civil & Structural',
    sub_category: 'Walls & Plaster; Flooring & Tiles; Doors & Windows',
    location: 'Textile and Clothing Technology Division - Design Lab',
    status: 'Completed',
    requester_name: 'Ms. Dilini Jayasuriya',
    requester_email: 'dilini.j@itum.mrt.ac.lk',
    requester_phone: '+94 72 345 6781',
    requester_dept: 'Division of Textile & Clothing Technology',
    peoples: 45,
    images: ['https://images.unsplash.com/photo-1584992236310-6edddc08acff?auto=format&fit=crop&w=600&q=80']
  },

  // 4. LOW
  {
    title: 'Routine lawn grass trimming along garden pathway',
    description: 'Lawn grass has slight growth around garden pathway near the pavilion. Function is almost normal, no safety risk, safe. Can wait for regular routine maintenance whenever convenient.',
    category: 'Gardening',
    sub_category: 'Grass Cutting',
    location: 'Garden - Pavilion Pathway',
    status: 'Pending',
    requester_name: 'Mr. Sunimal Dissanayake',
    requester_email: 'sunimal.d@itum.mrt.ac.lk',
    requester_phone: '+94 75 111 2233',
    requester_dept: 'Landscape & Grounds Unit',
    peoples: 15,
    images: ['https://images.unsplash.com/photo-1558904541-efa8c4a08931?auto=format&fit=crop&w=600&q=80']
  },
  {
    title: 'Minor cosmetic paint peeling on outer corridor wall',
    description: 'Small superficial paint peel and faint smudge on outer pillar near security checkpoint. Small defect, safe, no rush, can wait for routine touch up whenever convenient.',
    category: 'Cleaning',
    sub_category: 'General Cleaning',
    location: 'Guard Room - Outer Pillar',
    status: 'Pending',
    requester_name: 'Officer Upali Rathnayake',
    requester_email: 'upali.r@itum.mrt.ac.lk',
    requester_phone: '+94 71 555 4433',
    requester_dept: 'Campus Security Unit',
    peoples: 8,
    images: ['https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=600&q=80']
  }
];

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'serva_mysql',
    user: process.env.DB_USER || 'serva_user',
    password: process.env.DB_PASSWORD || 'serva_secure_2026',
    database: process.env.DB_NAME || 'serva_db'
  });

  console.log('Inserting dummy requests with Priority Algorithm calculations...\n');

  for (const item of dummyRequests) {
    const id = `REQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const algoRes = calculatePriorityScore({
      title: item.title,
      description: item.description,
      category: item.category,
      sub_category: item.sub_category,
      location: item.location,
      peoples: item.peoples,
      created_at: new Date()
    });

    await conn.query(
      `INSERT INTO requests 
      (id, title, description, category, sub_category, location, priority, status, requester_name, requester_email, requester_phone, requester_dept, images, priority_score, priority_formula)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        item.title,
        item.description,
        item.category,
        item.sub_category,
        item.location,
        algoRes.priorityLevel,
        item.status,
        item.requester_name,
        item.requester_email,
        item.requester_phone,
        item.requester_dept,
        JSON.stringify(item.images),
        algoRes.score,
        algoRes.formula
      ]
    );

    console.log(`[+] Created ${id}: "${item.title.substring(0, 40)}..."`);
    console.log(`    Priority: [ ${algoRes.priorityLevel} ] | Score: ${algoRes.score}`);
    console.log(`    Formula:  ${algoRes.formula}\n`);
  }

  const [summary] = await conn.query('SELECT priority, COUNT(*) as count FROM requests GROUP BY priority');
  console.log('Total Requests Breakdown by Priority:', summary);

  await conn.end();
}

main().catch(console.error);
