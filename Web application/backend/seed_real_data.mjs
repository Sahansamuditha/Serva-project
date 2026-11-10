import mysql from 'mysql2/promise';

(async () => {
  const pool = mysql.createPool({
    host: process.env.DB_HOST || 'serva_mysql',
    user: process.env.DB_USER || 'serva_user',
    password: process.env.DB_PASSWORD || 'serva_secret',
    database: process.env.DB_NAME || 'serva_db'
  });

  try {
    const pwHash = '$2a$10$CIUiXYs0tld/y0W0zOAA7eCqSrmxmiY69CFpZfr5F4kZEU8d8cPtO'; // password123

    // Real ITUM Users
    const users = [
      { email: 'admin@itum.mrt.ac.lk', username: 'admin', fName: 'System', lName: 'Administrator', role: 'Admin', desig: 'System Administrator', dept: 'ITUM Central Administration', phone: '+94 77 123 4567', status: 'active' },
      { email: 'anura.perera@itum.mrt.ac.lk', username: 'anura.p', fName: 'Dr. Anura', lName: 'Perera', role: 'Director', desig: 'Director / Head of Institute', dept: 'ITUM Executive Directorate', phone: '+94 77 111 2233', status: 'active' },
      { email: 'officer@itum.mrt.ac.lk', username: 'amal.p', fName: 'Amal', lName: 'Perera', role: 'Maintenance Officer', desig: 'Chief Maintenance Officer', dept: 'Estates & Facilities Maintenance', phone: '+94 77 222 3344', status: 'active' },
      { email: 'sarah.jenkins@itum.mrt.ac.lk', username: 'sarah.j', fName: 'Eng. Sarah', lName: 'Jenkins', role: 'Supervisor', desig: 'Senior Electrical Engineer', dept: 'Electrical & Power Systems', phone: '+94 77 123 4501', status: 'active' },
      { email: 'marcus.johnson@itum.mrt.ac.lk', username: 'marcus.j', fName: 'Marcus', lName: 'Johnson', role: 'Supervisor', desig: 'Plumbing & Drainage Supervisor', dept: 'Water & Utilities Division', phone: '+94 77 123 4502', status: 'active' },
      { email: 'kamal.w@itum.mrt.ac.lk', username: 'kamal.w', fName: 'Kamal', lName: 'Wickramasinghe', role: 'Supervisor', desig: 'HVAC Operations Lead', dept: 'Mechanical & Climate Control', phone: '+94 77 123 4503', status: 'active' },
      { email: 'kasun.p@itum.mrt.ac.lk', username: 'kasun.p', fName: 'Dr. Kasun', lName: 'Perera', role: 'Requester', desig: 'Senior Lecturer', dept: 'Division of Information Technology', phone: '+94 77 333 4455', status: 'active' },
      { email: 'dilani.s@itum.mrt.ac.lk', username: 'dilani.s', fName: 'Ms. Dilani', lName: 'Silva', role: 'Requester', desig: 'Technical Officer / Lab In-Charge', dept: 'Division of Chemical & Materials', phone: '+94 77 444 5566', status: 'active' }
    ];

    for (const u of users) {
      await pool.query(
        `INSERT INTO users (email, username, password_hash, first_name, last_name, role, designation, department, phone, status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE 
           first_name = VALUES(first_name),
           last_name = VALUES(last_name),
           role = VALUES(role),
           designation = VALUES(designation),
           department = VALUES(department),
           phone = VALUES(phone),
           status = VALUES(status)`,
        [u.email, u.username, pwHash, u.fName, u.lName, u.role, u.desig, u.dept, u.phone, u.status]
      );
    }
    console.log('Users seeded/updated successfully.');

    // Real Teams
    const teams = [
      { name: 'Electrical & Power Systems Crew', lead: 'Eng. Sarah Jenkins', category: 'Electricity', contact: '+94 77 123 4501', members: 4, status: 'Active' },
      { name: 'Plumbing & Water Infrastructure Crew', lead: 'Marcus Johnson', category: 'Water', contact: '+94 77 123 4502', members: 3, status: 'Active' },
      { name: 'HVAC & Refrigeration Services', lead: 'Kamal Wickramasinghe', category: 'HVAC', contact: '+94 77 123 4503', members: 3, status: 'Active' },
      { name: 'Civil, Carpentry & Structural Maintenance', lead: 'Nimal Gunawardena', category: 'Civil & Structural', contact: '+94 77 123 4504', members: 4, status: 'Active' }
    ];

    await pool.query('DELETE FROM teams');
    for (const t of teams) {
      await pool.query(
        'INSERT INTO teams (name, `lead`, category, contact, members_count, status) VALUES (?, ?, ?, ?, ?, ?)',
        [t.name, t.lead, t.category, t.contact, t.members, t.status]
      );
    }
    console.log('Teams seeded successfully.');

    // Real Labourers
    const labourers = [
      { name: 'Eng. Sarah Jenkins', trade: 'Electrical Engineer & Supervisor', category: 'Electricity', phone: '+94 77 123 4501', rating: 4.9, status: 'Available' },
      { name: 'Marcus Johnson', trade: 'Plumbing Supervisor', category: 'Water', phone: '+94 77 123 4502', rating: 4.8, status: 'Available' },
      { name: 'Kamal Wickramasinghe', trade: 'HVAC Specialist', category: 'HVAC', phone: '+94 77 123 4503', rating: 4.9, status: 'Available' },
      { name: 'Nimal Gunawardena', trade: 'Lead Carpenter & Mason', category: 'Civil & Structural', phone: '+94 77 123 4504', rating: 4.7, status: 'Available' },
      { name: 'Sunil Jayalath', trade: 'Electrician', category: 'Electricity', phone: '+94 77 234 5671', rating: 4.8, status: 'Available' },
      { name: 'Priyantha Kumara', trade: 'Plumber & Pipe Fitter', category: 'Water', phone: '+94 77 234 5672', rating: 4.6, status: 'Available' },
      { name: 'Nuwan Bandara', trade: 'AC Technician', category: 'HVAC', phone: '+94 77 234 5673', rating: 4.8, status: 'Available' },
      { name: 'Jagath Samarasinghe', trade: 'Electrical Technician', category: 'Electricity', phone: '+94 77 234 5674', rating: 4.7, status: 'Available' },
      { name: 'Chandana Fernando', trade: 'Welder & Structural Technician', category: 'Civil & Structural', phone: '+94 77 234 5675', rating: 4.8, status: 'Available' },
      { name: 'Rohan Weerasinghe', trade: 'Generator & Power Specialist', category: 'Electricity', phone: '+94 77 234 5676', rating: 4.9, status: 'Available' },
      { name: 'Chaminda Silva', trade: 'Facilities Handyman', category: 'Civil & Structural', phone: '+94 77 234 5677', rating: 4.6, status: 'Available' },
      { name: 'Dinesh Perera', trade: 'Drainage & Sanitary Technician', category: 'Water', phone: '+94 77 234 5678', rating: 4.7, status: 'Available' }
    ];

    await pool.query('DELETE FROM labourers');
    for (const l of labourers) {
      await pool.query(
        'INSERT INTO labourers (name, trade, category, phone, rating, status) VALUES (?, ?, ?, ?, ?, ?)',
        [l.name, l.trade, l.category, l.phone, l.rating, l.status]
      );
    }
    console.log('Labourers seeded successfully.');

    const [[userCnt]] = await pool.query('SELECT COUNT(*) as cnt FROM users');
    const [[teamCnt]] = await pool.query('SELECT COUNT(*) as cnt FROM teams');
    const [[labCnt]] = await pool.query('SELECT COUNT(*) as cnt FROM labourers');
    console.log(`Summary: Users = ${userCnt.cnt}, Teams = ${teamCnt.cnt}, Labourers = ${labCnt.cnt}`);

  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await pool.end();
  }
})();
