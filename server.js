const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

// ===============================
// Database configuration
// ===============================
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit: 100,
    queueLimit: 0,
};

// ===============================
// Initialize express app
// ===============================
const app = express();
app.use(express.json());

// ===============================
// Start server
// ===============================
app.listen(port, () => {
    console.log('Server running on port', port);
});

// ===============================
// READ: Get all incidents
// ===============================
app.get('/allincidents', async (req, res) => {
    try {
        const connection = await mysql.createConnection(dbConfig);
        const [rows] = await connection.execute('SELECT * FROM incidents');
        await connection.end();
        res.json(rows);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error for allincidents' });
    }
});

// ===============================
// CREATE: Add incident
// ===============================
app.post('/addincident', async (req, res) => {
    const { incident_type, severity, reference_url } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        await connection.execute(
            'INSERT INTO incidents (incident_type, severity, reference_url) VALUES (?, ?, ?)',
            [incident_type, severity, reference_url]
        );
        await connection.end();

        res.status(201).json({
            message: `Incident "${incident_type}" added successfully`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error - could not add incident'
        });
    }
});


// UPDATE: Update incident by ID

app.put('/updateincident/:id', async (req, res) => {
    const { id } = req.params;
    const { incident_type, severity, reference_url } = req.body;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'UPDATE incidents SET incident_type = ?, severity = ?, reference_url = ? WHERE id = ?',
            [incident_type, severity, reference_url, id]
        );
        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: `Incident ${id} not found`
            });
        }

        res.json({
            message: `Incident ${id} updated successfully`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error - could not update incident'
        });
    }
});

// ===============================
// DELETE: Delete incident by ID
// ===============================
app.delete('/deleteincident/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const connection = await mysql.createConnection(dbConfig);
        const [result] = await connection.execute(
            'DELETE FROM incidents WHERE id = ?',
            [id]
        );
        await connection.end();

        if (result.affectedRows === 0) {
            return res.status(404).json({
                message: `Incident ${id} not found`
            });
        }

        res.json({
            message: `Incident ${id} deleted successfully`
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            message: 'Server error - could not delete incident'
        });
    }
});
