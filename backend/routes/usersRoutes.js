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

    const { email, first_name, middle_name, last_name, department_code, password, role, status } = req.body;
    const hashedPassword = await bcryptjs.hash(password, 10);
    const sql = "INSERT INTO users (email, first_name, middle_name, last_name, department_code, password, role, created_at, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)";

    try {
        const result = await new Promise((resolve, reject) => {
            db.query(sql, [email, first_name, middle_name, last_name, department_code, hashedPassword, role , formattedDate, status], (err, result) => {
                if (err) {
                    return reject(err);
                }
                resolve(result);
            });
        });

        const subject = "Your Smart Schedule Account is Ready!";
        const html = `
            <div style="font-family: Arial, sans-serif; font-size: 0.8rem; line-height: 1rem;">
                <img src="${process.env.EMAIL_LOGO}" alt="Smart Schedule Logo" style="width: 300px; height: auto; margin-bottom: 1rem;"/>
                <p style="margin-bottom: 1rem;">Dear ${last_name}, ${first_name} ${middle_name},</p>
                <p style="margin-bottom: 1rem;">Your Smart Schedule account has been successfully created.</p>
                <p style="margin-bottom: 1rem;">Your login credentials:</p>
                <ul style="list-style-type: disc; margin-bottom: 1rem;">
                    <li style="margin-bottom: 0.5rem;">Email: ${email}</li>
                    <li style="margin-bottom: 0.5rem;">Password: ${password}</li>
                </ul>
                <p style="margin-bottom: 1rem;">Thank you for choosing Smart Schedule.</p>
                <p style="margin-bottom: 1rem;">Need Assistance? If you have any questions or encounter any issues, please don't hesitate to contact Smart Schedule Admin.</p>
                <p style="margin-bottom: 1rem;">${process.env.EMAIL_USER}</p>
                <p style="margin-bottom: 1rem;">Thank you,</p>
                <p style="margin-bottom: 1rem;">Administrator</p>
                <p style="margin-bottom: 1rem;">Best regards,</p>
                <p>Smart Schedule Team</p>
            </div>
        `;
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