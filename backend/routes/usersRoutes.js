const express = require('express');
const db = require('../database');
const router = express.Router();

router.post('/adding', (req, res) => {
    const { email, first_name, middle_name, last_name, department_code } = req.body;

    const sql = "INSERT INTO users (email, first_name, middle_name, last_name, department_code) VALUES (?, ?, ?, ?, ?)";

    db.query(sql, [email, first_name, middle_name, last_name, department_code], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add user' });
        }
        res.status(200).json({ message: 'User added successfully' });
    });
});

router.get('/fetch', (req, res) => {
    const sql = "SELECT * FROM users";

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching users:', err);
            return res.status(500).json({ error: 'Failed to fetch users' });
        }
        res.status(200).json(results);
    });
});

router.put('/update/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const { email, first_name, middle_name, last_name, department_code } = req.body;
    const sql = "UPDATE users SET email = ?, first_name = ?, middle_name = ?, last_name = ?, department_code = ? WHERE user_id = ?";

    db.query(sql, [email, first_name, middle_name, last_name, department_code, user_id], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'Failed to update user' });
        }
        res.status(200).json({ message: 'User updated successfully' });
    });
});

module.exports = router;