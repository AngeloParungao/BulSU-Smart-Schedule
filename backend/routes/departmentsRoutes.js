const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.get('/fetch', (req, res) => {
    let sql = "SELECT * FROM departments";

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            return res.status(500).json({ error: 'Failed to fetch departments' });
        }
        res.status(200).json(results);
    });
});

module.exports = router;