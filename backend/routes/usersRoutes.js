const express = require('express');
const db = require('../config/database');
const router = express.Router();
const bcryptjs = require('bcryptjs');
require('dotenv').config();
const { sendEmail } = require('../services/emailer');

router.post('/adding', async (req, res) => {
    const { email, first_name, middle_name, last_name, department_code, password } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);
    const sql = "INSERT INTO users (email, first_name, middle_name, last_name, department_code, password) VALUES (?, ?, ?, ?, ?, ?)";

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [email, first_name, middle_name, last_name, department_code, hashedPassword], (err, result) => {
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