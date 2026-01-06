const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();
const port = 3000;

//database config info

const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    waitForConnections: true,
    connectionLimit:100,
    queueLimit:0,
};

//initialize express app
const app = express();
//helps app to read JSON
app.use(express.json());

//start the server
app.listen(port, () => {
    console.log('Server running on port', port);
});

//Example Route: Get all incidents

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
