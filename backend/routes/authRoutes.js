const bcrypt = require('bcrypt');
const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.post('/login', (req, res) => {
    const { email, password } = req.body;

    console.log("Login Request:", req.body); // Log incoming request data

    // Query to find the user by email
    const sql = "SELECT * FROM users WHERE email = ?";

    db.query(sql, [email], (err, result) => {
        if (err) {
            console.error('Error fetching user:', err);
            return res.status(500).json({ error: 'Failed to fetch user' });
        } else if (result.length === 0) {
            return res.status(401).json({ error: 'Invalid email or password' });
        } else {
            const user = result[0];

            // Compare the provided password with the hashed password in the database
            bcrypt.compare(password, user.password, (err, isMatch) => {
                if (err) {
                    console.error('Error comparing passwords:', err);
                    return res.status(500).json({ error: 'Failed to compare passwords' });
                }
                if (isMatch) {
                    console.log("Login Successful:", user); // Log successful login
                    return res.status(200).json({
                        message: 'Login successful',
                        user_id: user.user_id,
                        department_code: user.department_code,
                        role: user.role
                    });
                } else {
                    console.log("Login Failed:", user); // Log failed login
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
            });
            
        }
    });
});


router.put('/update', async (req, res) => {
    const { user_id, old_password, new_password } = req.body;

    if (!user_id || !old_password || !new_password) {
        return res.status(400).json({ error: 'All inputs are required' });
    }

    try {
        // Fetch the user's current password from the database
        const sql = "SELECT password FROM users WHERE user_id = ?";
        db.query(sql, [user_id], async (err, result) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ error: 'Failed to fetch user' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = result[0];

            // Compare the old password with the stored hashed password
            const isMatch = await bcrypt.compare(old_password, user.password);
            if (!isMatch) {
                return res.status(401).json({ error: 'Old password does not match' });
            }

            // Hash the new password and update it in the database
            const hashedPassword = await bcrypt.hash(new_password, 10);
            db.query("UPDATE users SET password = ? WHERE user_id = ?", [hashedPassword, user_id], (err, result) => {
                if (err) {
                    console.error('Error updating password:', err);
                    return res.status(500).json({ error: 'Failed to update password' });
                }

                return res.status(200).json({ message: 'Password updated successfully' });
            });
        });
    } catch (error) {
        console.error('Error updating password:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

router.post('/verify-password', async (req, res) => {
    const { user_id, password } = req.body;

    if (!user_id || !password) {
        return res.status(400).json({ error: 'User ID and password are required' });
    }

    try {
        // Fetch the user's current password from the database
        const sql = "SELECT password FROM users WHERE user_id = ?";
        db.query(sql, [user_id], async (err, result) => {
            if (err) {
                console.error('Error fetching user:', err);
                return res.status(500).json({ error: 'Failed to fetch user' });
            }

            if (result.length === 0) {
                return res.status(404).json({ error: 'User not found' });
            }

            const user = result[0];

            // Compare the provided password with the stored hashed password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ isMatch: false, error: 'Incorrect password' });
            }

            return res.status(200).json({ isMatch: true, message: 'Password verified successfully' });
        });
    } catch (error) {
        console.error('Error verifying password:', error);
        res.status(500).json({ error: 'Server error' });
    }
});




module.exports = router;

