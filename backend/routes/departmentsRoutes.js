const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.post('/adding', (req, res) => {
    const { department, department_code, program_code, department_head, status } = req.body;

    const sql = "INSERT INTO departments (department, department_code, department_head, status) VALUES (?, ?, ?, ?)";

    db.query(sql, [department, program_code + " (" + department_code + ")", department_head, status], (err, result) => {
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
        const sql2 = "DELETE FROM users WHERE department_code IN (?)";
        db.query(sql2, [department_code], (err, result) => {
            if (err) {
                console.error('Error deleting users:', err);
                return res.status(500).json({ error: 'Failed to delete users' });
            }
        });
        const sql3 = "DELETE FROM schedules WHERE department_code IN (?)";
        db.query(sql3, [department_code], (err, result) => {
            if (err) {
                console.error('Error deleting schedules:', err);
                return res.status(500).json({ error: 'Failed to delete schedules' });
            }
        });
        const sql4 = "DELETE FROM instructors WHERE department_code IN (?)";
        db.query(sql4, [department_code], (err, result) => {
            if (err) {
                console.error('Error deleting instructors:', err);
                return res.status(500).json({ error: 'Failed to delete instructors' }); 
            }
        });
        const sql5 = "DELETE FROM subjects WHERE department_code IN (?)";
        db.query(sql5, [department_code], (err, result) => {
            if (err) {
                console.error('Error deleting subjects:', err);
                return res.status(500).json({ error: 'Failed to delete subjects' });
            }
        });
        const sql6 = "DELETE FROM sections WHERE department_code IN (?)";
        db.query(sql6, [department_code], (err, result) => {
            if (err) {
                console.error('Error deleting sections:', err);
                return res.status(500).json({ error: 'Failed to delete sections' });
            }
        });
        const sql7 = "DELETE FROM activity WHERE department_code IN (?)";
        db.query(sql7, [department_code], (err, result) => {
            if (err) {
                console.error('Error deleting activity:', err);
                return res.status(500).json({ error: 'Failed to delete activity' });
            }
        });
        res.status(200).json({ message: 'Department deleted successfully' });
    });
});

router.put('/update', (req, res) => {
    const { department_codes, status } = req.body;
    
    if (!Array.isArray(department_codes) || department_codes.length === 0) {
        return res.status(400).json({ error: 'Invalid department IDs' });
    }

    const sql = "UPDATE departments SET status =? WHERE department_code IN (?)";

    db.query(sql, [status, department_codes], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'Failed to update department' });
        }
        const sql2 = "UPDATE users SET status = ? WHERE department_code IN (?)";
        db.query(sql2, [status, department_codes], (err, result) => {
            if (err) {
                console.error('Error updating data:', err);
                return res.status(500).json({ error: 'Failed to update users' });
            }
        });
        res.status(200).json({ message: 'Departments updated successfully' }); 
    });
});

router.put('/update/:code', (req, res) => {
    const deptCode = req.params.code;
    const { department, department_code, program_code, department_head, old_department_code } = req.body;

    const sql = "UPDATE departments SET department = ?, department_code = ?, department_head = ? WHERE department_code = ?";

    db.query(sql, [department, program_code + " (" + department_code + ")", department_head, deptCode], (err, result) => {
        if (err) {
            console.error('Error updating department:', err);
            return res.status(500).json({ error: 'Failed to update department' });
        }

        const sql2 = "UPDATE schedules SET department_code = ? WHERE department_code = ?";
        db.query(sql2, [program_code + " (" + department_code + ")", old_department_code], (err, result) => {
            if (err) {
                console.error('Error updating schedules:', err);
                return res.status(500).json({ error: 'Failed to update schedules' });
            }
        });
        const sql3 = "UPDATE users SET department_code = ? WHERE department_code = ?";
        db.query(sql3, [program_code + " (" + department_code + ")", old_department_code], (err, result) => {
            if (err) {
                console.error('Error updating users:', err);
                return res.status(500).json({ error: 'Failed to update users' });
            }
        });
        const sql4 = "UPDATE instructors SET department_code = ? WHERE department_code = ?";
        db.query(sql4, [program_code + " (" + department_code + ")", old_department_code], (err, result) => {
            if (err) {
                console.error('Error updating instructors:', err);
                return res.status(500).json({ error: 'Failed to update instructors' });
            }
        });
        const sql5 = "UPDATE subjects SET department_code = ? WHERE department_code = ?";
        db.query(sql5, [program_code + " (" + department_code + ")", old_department_code], (err, result) => {
            if (err) {
                console.error('Error updating subjects:', err);
                return res.status(500).json({ error: 'Failed to update subjects' });
            }
        });
        const sql6 = "UPDATE sections SET department_code = ? WHERE department_code = ?";
        db.query(sql6, [program_code + " (" + department_code + ")", old_department_code], (err, result) => {
            if (err) {
                console.error('Error updating sections:', err);
                return res.status(500).json({ error: 'Failed to update sections' });
            }
        });
        const sql7 = "UPDATE activity SET department_code = ? WHERE department_code = ?";
        db.query(sql7, [program_code + " (" + department_code + ")", old_department_code], (err, result) => {
            if (err) {
                console.error('Error updating activity:', err);
                return res.status(500).json({ error: 'Failed to update activity' });
            }
        });
        res.status(200).json({ message: 'Departments updated successfully' });
    });
});

module.exports = router;