const bcrypt = require('bcrypt');
const express = require('express');
const db = require('../database');
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
                
                // Log the hashed password and plain text password for debugging purposes
                console.log("Password provided:", password);
                console.log("Hashed password stored in DB:", user.password);
                
                if (isMatch) {
                    console.log("Login Successful:", user); // Log successful login
                    return res.status(200).json({
                        message: 'Login successful',
                        user_id: user.user_id,
                        department_code: user.department_code
                    });
                } else {
                    console.log("Login Failed:", user); // Log failed login
                    return res.status(401).json({ error: 'Invalid email or password' });
                }
            });
            
        }
    });
});



//TODO: add password reset
router.put('/update', async (req, res) => {
    const { user_id, old_password, new_password } = req.body;

    if (!user_id || !old_password || !new_password) {
        return res.status(400).json({ error: 'User ID, old password, and new password are required' });
    }

    try {
        const sql = 'SELECT * FROM users WHERE user_id = ?';
        const [user] = await db.promise().query(sql, [user_id]);

        if (user.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const storedPassword = user[0].password;
        const isMatch = await bcrypt.compare(old_password, storedPassword);

        if (!isMatch) {
            return res.status(401).json({ error: 'Incorrect old password' });
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);
        const sqlUpdate = 'UPDATE users SET password = ? WHERE user_id = ?';
        await db.promise().query(sqlUpdate, [hashedPassword, user_id]);
        return res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Error updating password:', error);
        return res.status(500).json({ error: 'Failed to update password' });
    }
});


module.exports = router;

