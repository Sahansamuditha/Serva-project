import mysql from 'mysql2/promise';

async function test() {
  const conn = await mysql.createConnection({
    host: '127.0.0.1',
    port: 3306,
    user: 'serva_user',
    password: 'serva_secret',
    database: 'serva_db'
  });
  const [reqs] = await conn.query("SELECT id, title, requester_name, status, scheduled_date, completion_date FROM requests WHERE requester_name LIKE '%sahan%'");
  console.table(reqs);
  for (const r of reqs) {
    const [jobs] = await conn.query("SELECT id, request_id, title, status FROM jobs WHERE request_id = ?", [r.id]);
    console.log("Jobs for " + r.id + ":", jobs);
  }
  await conn.end();
}
test();
