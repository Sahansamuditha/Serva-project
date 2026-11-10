import mysql from 'mysql2/promise';

async function check() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'serva_mysql',
    port: 3306,
    user: 'serva_user',
    password: 'serva_secret',
    database: 'serva_db'
  });

  const [reqRows] = await conn.query(
    `SELECT id, status, scheduled_date FROM requests 
     WHERE id NOT IN (
       SELECT DISTINCT request_id FROM jobs 
       WHERE request_id IS NOT NULL 
         AND (status = 'Rejected' OR notes LIKE '%[REJECTED]%' OR (labourers_assigned > 0 AND status IN ('In Progress', 'Assigned', 'Pending Start', 'Completed', 'On Hold', 'Hold')))
     )`
  );
  const schedReqs = reqRows.filter(r => (r.status || '').toLowerCase().includes('schedul') || (r.status || '').toLowerCase().includes('hold'));
  console.log('Filtered Requests total:', reqRows.length);
  console.log('Scheduled Requests count:', schedReqs.length);

  const [allJobs] = await conn.query(
    'SELECT id, status, labourers_assigned, notes FROM jobs WHERE NOT (status IN ("Scheduled", "On Hold", "Hold") AND (labourers_assigned = 0 OR labourers_assigned IS NULL))'
  );
  const schedJobs = allJobs.filter(j => {
    const s = (j.status || '').toLowerCase();
    const hasLabourers = Number(j.labourers_assigned || 0) > 0;
    return s === 'rejected' || ((s.includes('schedul') || s.includes('hold')) && hasLabourers);
  });
  console.log('Valid Jobs total:', allJobs.length);
  console.log('Scheduled Jobs count (in Jobs tab):', schedJobs.length);
  console.log('TOTAL SCHEDULED (Requests scheduled + Jobs scheduled):', schedReqs.length + schedJobs.length);

  await conn.end();

  await conn.end();
}

check();
