const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors'); // Import the cors package
const app = express();
const port = 3000;

// Enable CORS for all routes
app.use(cors());

// Create or connect to SQLite database
const db = new sqlite3.Database('./database.db', (err) => {
    if (err) {
        console.error('Error connecting to the database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
        db.run(`CREATE TABLE IF NOT EXISTS items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);
    }
});

// Middleware to parse JSON bodies
app.use(express.json());

// CRUD operations

// Create
app.post('/items', (req, res) => {
    const { name, description } = req.body;
    const sql = `INSERT INTO items (name, description) VALUES (?, ?)`;
    db.run(sql, [name, description], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ id: this.lastID });
    });
});

// Read
app.get('/items', (req, res) => {
    const sql = `SELECT * FROM items`;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json(rows);
    });
});

// Update
app.put('/items/:id', (req, res) => {
    const { name, description } = req.body;
    const sql = `UPDATE items SET name = ?, description = ? WHERE id = ?`;
    db.run(sql, [name, description, req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ changes: this.changes });
    });
});

// Delete
app.delete('/items/:id', (req, res) => {
    const sql = `DELETE FROM items WHERE id = ?`;
    db.run(sql, [req.params.id], function(err) {
        if (err) {
            return res.status(400).json({ error: err.message });
        }
        res.json({ changes: this.changes });
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});