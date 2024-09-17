const express = require('express');
const db = require('../config/database');
const router = express.Router();


router.post('/adding', (req, res) => {
    const { email, first_name, middle_name, last_name, work_type, tags, department_code} = req.body;

    const sql = "INSERT INTO instructors (email, first_name, middle_name, last_name, work_type, tags, department_code) VALUES (?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [email, first_name, middle_name, last_name, work_type, tags, department_code], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add instructor' });
        }
        res.status(200).json({ message: 'Instructor added successfully' });
    });
});


router.get('/fetch', (req, res) => {
    const { dept_code } = req.query;
    let sql;
    if (dept_code === 'ADMIN') {
        sql = "SELECT * FROM instructors";
    } else {
        sql = "SELECT * FROM instructors WHERE department_code = ?";
    }

    db.query(sql, dept_code !== 'ADMIN' ? [dept_code] : [], (err, results) => {
        if (err) {
            console.error('Error fetching instructors:', err);
            return res.status(500).json({ error: 'Failed to fetch instructors' });
        }
        res.status(200).json(results);
    });
});



router.delete('/delete', (req, res) => {
    const { instructor_ids } = req.body;

    // Check if instructorIds is provided and is an array
    if (!instructor_ids || !Array.isArray(instructor_ids) || instructor_ids.length === 0) {
        return res.status(400).json({ error: 'Invalid instructor IDs provided' });
    }

    // Construct SQL query to delete instructors with matching IDs
    const sql = "DELETE FROM instructors WHERE instructor_id IN (?)";

    db.query(sql, [instructor_ids], (err, result) => {
        if (err) {
            console.error('Error deleting instructors:', err);
            return res.status(500).json({ error: 'Failed to delete instructors' });
        }
        res.status(200).json({ message: 'Instructors deleted successfully' });
    });
});


// Update Instructor
router.put('/update/:id', (req, res) => {
    const instructorId = req.params.id;
    const { email, first_name, middle_name, last_name, work_type, tags,department_code } = req.body;

    const sql = "UPDATE instructors SET email = ?, first_name = ?, middle_name = ?, last_name = ?, work_type = ?, tags = ?, department_code = ? WHERE instructor_id = ?";

    db.query(sql, [email, first_name, middle_name, last_name, work_type, tags, department_code, instructorId], (err, result) => {
        if (err) {
            console.error('Error updating instructor:', err);
            return res.status(500).json({ error: 'Failed to update instructor' });
        }
        res.status(200).json({ message: 'Instructor updated successfully' });
    });
});


module.exports = router;
