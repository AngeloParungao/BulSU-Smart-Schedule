const express = require('express');
const db = require('../database');
const router = express.Router();


router.post('/adding', (req, res) => {
    const { user_id , department_code , action , details , type} = req.body;

    const sql = "INSERT INTO activity (user_id, department_code, action, details, type) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [user_id, department_code, action, details, type], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add history' });
        }
        res.status(200).json({ message: 'History added successfully' });
    });
});

router.get('/fetch', (req, res) => {
    const { dept_code } = req.query;

    // Use a parameterized query to prevent SQL injection
    const sql = "SELECT * FROM activity WHERE department_code = ?";

    db.query(sql, [dept_code], (err, results) => {
        if (err) {
            console.error('Error fetching activity:', err);
            return res.status(500).json({ error: 'Failed to fetch activity' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;
