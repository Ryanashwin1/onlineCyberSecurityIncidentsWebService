const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const PORT = 3000;

const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
};

const app = express();
app.use(express.json());

// ===============================
// START SERVER
// ===============================
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// ===============================
// READ ALL INCIDENTS
// ===============================
app.get('/allincidents', async (req, res) => {
  try {
    const conn = await mysql.createConnection(dbConfig);
    const [rows] = await conn.execute('SELECT * FROM incidents ORDER BY reported_at DESC');
    await conn.end();
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching incidents' });
  }
});

// ===============================
// ADD INCIDENT
// ===============================
app.post('/addincident', async (req, res) => {
  const { incident_type, severity, reference_url, reported_at } = req.body;

  try {
    const conn = await mysql.createConnection(dbConfig);
    await conn.execute(
      'INSERT INTO incidents (incident_type, severity, reference_url, reported_at) VALUES (?, ?, ?, ?)',
      [incident_type, severity, reference_url, reported_at || new Date()]
    );
    await conn.end();

    res.status(201).json({ message: 'Incident added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error adding incident' });
  }
});

// ===============================
// UPDATE INCIDENT BY ID
// ===============================
app.put('/updateincident/:id', async (req, res) => {
  const { id } = req.params;
  const { incident_type, severity, reference_url } = req.body;

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
      'UPDATE incidents SET incident_type=?, severity=?, reference_url=? WHERE id=?',
      [incident_type, severity, reference_url, id]
    );
    await conn.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Incident ${id} not found` });
    }

    res.json({ message: `Incident ${id} updated successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error updating incident' });
  }
});

// ===============================
// DELETE INCIDENT BY ID
// ===============================
app.delete('/deleteincident/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const conn = await mysql.createConnection(dbConfig);
    const [result] = await conn.execute(
      'DELETE FROM incidents WHERE id=?',
      [id]
    );
    await conn.end();

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `Incident ${id} not found` });
    }

    res.json({ message: `Incident ${id} deleted successfully` });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting incident' });
  }
});
