const express = require('express');
const db = require('../config/database');
const router = express.Router();
const bcryptjs = require('bcryptjs');
require('dotenv').config();
const { sendEmail } = require('../services/emailer');

router.post('/adding', async (req, res) => {
    const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
    const localDate = new Date(date);
    const formattedDate = `${localDate.getMonth() + 1}/${localDate.getDate()}/${localDate.getFullYear()}`;

    const { email, first_name, middle_name, last_name, department_code, password, role } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);
    const sql = "INSERT INTO users (email, first_name, middle_name, last_name, department_code, password, role, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [email, first_name, middle_name, last_name, department_code, hashedPassword, role , formattedDate], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });

        const subject = "Welcome to Our Platform";
        const html = `<p>Hello ${last_name}, ${first_name} ${middle_name}</p><p>Your profile has been created successfully.</p><p>Credentials for Logging in to your account are as follows:</p><p>Email: ${email}</p><p>Password: ${password}</p>`;

        await sendEmail(email, subject, html);

        res.status(200).json({ message: 'User added successfully and email sent.' });
    } catch (error) {
        console.error("Error adding user or sending email:", error);
        res.status(500).json({ error: 'Failed to add user or send email' });
    }
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

router.put('/update', (req, res) => {
    const { user_ids, status } = req.body;
    
    if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const sql = "UPDATE users SET status =? WHERE user_id IN (?)";

    db.query(sql, [status, user_ids], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'Failed to update user' });
        }
        res.status(200).json({ message: 'User updated successfully' }); 
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

router.delete('/delete', (req, res) => {
    const { user_ids } = req.body;

    if (!Array.isArray(user_ids) || user_ids.length === 0) {
        return res.status(400).json({ error: 'Invalid user IDs' });
    }

    const sql = "DELETE FROM users WHERE user_id IN (?)";

    db.query(sql, [user_ids], (err, result) => {
        if (err) {
            console.error('Error deleting users:', err);
            return res.status(500).json({ error: 'Failed to delete users' });
        }
        res.status(200).json({ message: 'Users deleted successfully' });
    });
});


router.delete('/delete/:user_id', (req, res) => {
    const user_id = req.params.user_id;
    const sql = "DELETE FROM users WHERE user_id = ?";

    db.query(sql, [user_id], (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
            return res.status(500).json({ error: 'Failed to delete user' });
        }  
        res.status(200).json({ message: 'User deleted successfully' });
    });
});

module.exports = router;