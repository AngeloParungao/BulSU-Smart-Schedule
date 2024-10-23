const express = require('express');
const db = require('../config/database');
const router = express.Router();

// Helper function to get the current time in Asia/Manila timezone formatted as YYYY-MM-DD HH:MM:SS
const getFormattedLocalTime = () => {
    const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
    const localDate = new Date(date);

    const year = localDate.getFullYear();
    const month = String(localDate.getMonth() + 1).padStart(2, '0'); // Month is zero-based
    const day = String(localDate.getDate()).padStart(2, '0');
    const hours = String(localDate.getHours()).padStart(2, '0');
    const minutes = String(localDate.getMinutes()).padStart(2, '0');
    const seconds = String(localDate.getSeconds()).padStart(2, '0');

    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
};

router.post('/adding', (req, res) => {
    const { user_id, department_code, action, details, type } = req.body;
    const timestamp = getFormattedLocalTime(); // Get the formatted local time

    const sql = "INSERT INTO activity (user_id, department_code, action, details, type, timestamp) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(sql, [user_id, department_code, action, details, type, timestamp], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add history' });
        }
        res.status(200).json({ message: 'History added successfully' });
    });
});

router.get('/fetch', (req, res) => {
    const { dept_code } = req.query;

    const sql = "SELECT * FROM activity WHERE department_code = ?";

    db.query(sql, [dept_code], (err, results) => {
        if (err) {
            console.error('Error fetching activity:', err);
            return res.status(500).json({ error: 'Failed to fetch activity' });
        }
        res.status(200).json(results);
    });
});

let lastDeletionYear = null; // Track the last year logs were deleted
let lastDeletionMonth = null; // Track the last month logs were deleted

const deleteLogsAtSemesterStart = () => {
    const date = new Date().toLocaleString("en-US", { timeZone: "Asia/Manila" });
    const currentDate = new Date(date);
    const currentMonth = currentDate.getMonth() + 1; // Months are 0-based, so add 1
    const currentYear = currentDate.getFullYear();

    // Check if it's January or August, and ensure logs haven't been deleted for this month and year
    if ((currentMonth === 1 || currentMonth === 8) && (currentYear !== lastDeletionYear || currentMonth !== lastDeletionMonth)) {

        const sql = "DELETE FROM activity";

        db.query(sql, (err, result) => {
            if (err) {
                console.error('Error deleting logs:', err);
            } else {
                console.log(`${result.affectedRows} logs deleted.`);
                lastDeletionYear = currentYear; // Update the last deletion year
                lastDeletionMonth = currentMonth; // Update the last deletion month
            }
        });
    }
};

// Run the check daily (every 24 hours)
setInterval(deleteLogsAtSemesterStart, 24 * 60 * 60 * 1000); // Run every 24 hours



module.exports = router;
