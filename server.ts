
/**
 * PRODUCTION BACKEND REFERENCE
 * This file serves as the specification for the Node.js / PostgreSQL backend.
 * Deploy this using Express and the 'pg' library.
 */

/* 
import express from 'express';
import { Pool } from 'pg';
import cors from 'cors';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:password@localhost:5432/walpberry_db'
});

// USERS
app.get('/api/users', async (req, res) => {
  const { rows } = await pool.query('SELECT * FROM users ORDER BY name ASC');
  res.json(rows);
});

app.post('/api/users', async (req, res) => {
  const u = req.body;
  await pool.query(
    'INSERT INTO users (id, name, surname, first_name, ippis_number, email, phone, role, designation, department) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) ON CONFLICT (id) DO UPDATE SET name=$2, surname=$3, first_name=$4, email=$6, phone=$7, role=$8, designation=$9, department=$10',
    [u.id, u.name, u.surname, u.firstName, u.ippisNumber, u.email, u.phone, u.role, u.designation, u.department]
  );
  res.sendStatus(200);
});

// CONTRACTS (Using JSONB for complex structures)
app.get('/api/contracts', async (req, res) => {
  const { rows } = await pool.query('SELECT data FROM contracts');
  res.json(rows.map(r => r.data));
});

app.post('/api/contracts', async (req, res) => {
  const c = req.body;
  // Handle isActive toggle for employee
  if (c.isActive) {
    await pool.query("UPDATE contracts SET data = data || '{\"isActive\": false}' WHERE data->>'employeeId' = $1", [c.employeeId]);
  }
  await pool.query(
    'INSERT INTO contracts (id, employee_id, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET data=$3',
    [c.id, c.employeeId, JSON.stringify(c)]
  );
  res.sendStatus(200);
});

// APPRAISALS
app.get('/api/appraisals', async (req, res) => {
  const { rows } = await pool.query('SELECT data FROM appraisals');
  res.json(rows.map(r => r.data));
});

app.post('/api/appraisals', async (req, res) => {
  const a = req.body;
  await pool.query(
    'INSERT INTO appraisals (id, employee_id, data) VALUES ($1, $2, $3) ON CONFLICT (id) DO UPDATE SET data=$3',
    [a.id, a.employeeId, JSON.stringify(a)]
  );
  res.sendStatus(200);
});

app.listen(3001, () => console.log('Performance Backend running on port 3001'));
*/
