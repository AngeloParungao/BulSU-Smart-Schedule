const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.post('/adding', (req, res) => {
    const { department, department_code, department_head } = req.body;

    const sql = "INSERT INTO departments (department, department_code, department_head) VALUES (?, ?, ?)";

    db.query(sql, [department, department_code, department_head], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add department' });
        }
        res.status(200).json({ message: 'Department added successfully' });
    });
});

router.get('/fetch', (req, res) => {
    const sql = "SELECT * FROM departments";

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching departments:', err);
            return res.status(500).json({ error: 'Failed to fetch departments' });
        }
        res.status(200).json(results);
    });
});

router.delete('/delete', (req, res) => {
    const { department_code } = req.body;

    if (!department_code || !Array.isArray(department_code) || department_code.length === 0) {
        return res.status(400).json({ error: 'Invalid department IDs provided' });
    }

    const sql = "DELETE FROM departments WHERE department_code IN (?)";

    db.query(sql, [department_code], (err, result) => {
        if (err) {
            console.error('Error deleting department:', err);
            return res.status(500).json({ error: 'Failed to delete department' });
        }
        res.status(200).json({ message: 'Department deleted successfully' });
    });
});


router.put('/update/:code', (req, res) => {
    const deptCode = req.params.code;
    const { department, department_code, department_head } = req.body;

    const sql = "UPDATE departments SET department = ?, department_code = ?, department_head = ? WHERE department_code = ?";

    db.query(sql, [department, department_code, department_head, deptCode], (err, result) => {
        if (err) {
            console.error('Error updating department:', err);
            return res.status(500).json({ error: 'Failed to update department' });
        }
        res.status(200).json({ message: 'Departments updated successfully' });
    });
});

module.exports = router;