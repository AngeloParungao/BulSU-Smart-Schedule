const express = require('express');
const db = require('../database');
const router = express.Router();

router.put('/update/:id', (req, res) => {
    const userId = req.params.id;
    const { password } = req.body;

    const sql = "UPDATE users SET password = ? WHERE user_id = ?";

    db.query(sql, [password, userId], (err, result) => {
        if (err) {
            console.error('Error updating user:', err);
            return res.status(500).json({ error: 'Failed to update user' });
        }
        res.status(200).json({ message: 'User updated successfully' });
    }); 
});

module.exports = router;
