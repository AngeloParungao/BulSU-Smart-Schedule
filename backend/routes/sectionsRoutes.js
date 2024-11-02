const express = require('express');
const db = require('../config/database');
const router = express.Router();


router.post('/adding', (req, res) => {
    const { section_name , section_group, year_level , section_capacity , section_tags, department_code } = req.body;

    const sql = "INSERT INTO sections (section_name, section_group, year_level, section_capacity, section_tags, department_code) VALUES (?, ?, ?, ?, ?, ?)";

    db.query(sql, [section_name , section_group, year_level , section_capacity , section_tags, department_code], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add sectionId' });
        }
        res.status(200).json({ message: 'Section added successfully' });
    });
});


router.get('/fetch', (req, res) => {
    const { dept_code } = req.query;
    let sql;
    if (dept_code === 'ADMIN') {
        sql = "SELECT * FROM sections";
    } else {
        sql = "SELECT * FROM sections WHERE department_code = ?";
    }

    db.query(sql, dept_code !== 'ADMIN' ? [dept_code] : [], (err, results) => {
        if (err) {
            console.error('Error fetching sections:', err);
            return res.status(500).json({ error: 'Failed to fetch sections' });
        }
        res.status(200).json(results);
    });
});


router.delete('/delete', (req, res) => {
    const { section_ids } = req.body;


    if (!section_ids || !Array.isArray(section_ids) || section_ids.length === 0) {
        return res.status(400).json({ error: 'Invalid subjectId IDs provided' });
    }


    const sql = "DELETE FROM sections WHERE section_id IN (?)";

    db.query(sql, [section_ids], (err, result) => {
        if (err) {
            console.error('Error deleting sectionId:', err);
            return res.status(500).json({ error: 'Failed to delete sectionId' });
        }
        res.status(200).json({ message: 'Sections deleted successfully' });
    });
});


router.put('/update/:id', (req, res) => {
    const sectionId = req.params.id;
    const { section_name, section_group, year_level, section_capacity, section_tags, department_code, old_section_name, old_section_group } = req.body;

    const sql = "UPDATE sections SET section_name = ?, section_group = ?, year_level = ?, section_capacity = ?, section_tags = ?, department_code = ? WHERE section_id = ?";

    db.query(sql, [section_name, section_group, year_level, section_capacity, section_tags, department_code, sectionId], (err, result) => {
        if (err) {
            console.error('Error updating sectionId:', err);
            return res.status(500).json({ error: 'Failed to update sectionId' });
        }

        const sql2 = "UPDATE schedules SET section_name = ? WHERE section_name = ? AND section_group = ?";
        db.query(sql2, [section_name, old_section_name, old_section_group], (err, result) => {
            if (err) {
                console.error('Error updating schedules:', err);
                return res.status(500).json({ error: 'Failed to update schedules' });
            }
            res.status(200).json({ message: 'Section updated successfully' });
        });
    });
});


module.exports = router;
