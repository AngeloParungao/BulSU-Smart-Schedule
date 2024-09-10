const express = require('express');
const db = require('../database');
const router = express.Router();


router.post('/adding', (req, res) => {
    const { subject_name , subject_code, year_level, subject_semester, subject_type , subject_units , subject_tags, department_code } = req.body;

    const sql = "INSERT INTO subjects (subject_name, subject_code, year_level, subject_semester, subject_type, subject_units, subject_tags, department_code) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";

    db.query(sql, [subject_name , subject_code, year_level, subject_semester, subject_type , subject_units , subject_tags, department_code], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add subjectId' });
        }
        res.status(200).json({ message: 'Subject added successfully' });
    });
});


router.get('/fetch', (req, res) => {
    const {dept_code} = req.query;
    const sql = "SELECT * FROM subjects WHERE department_code= ?";

    db.query(sql, [dept_code], (err, results) => {
        if (err) {
            console.error('Error fetching subjects:', err);
            return res.status(500).json({ error: 'Failed to fetch subjects' });
        }
        res.status(200).json(results);
    });
});


router.delete('/delete', (req, res) => {
    const { subject_ids } = req.body;


    if (!subject_ids || !Array.isArray(subject_ids) || subject_ids.length === 0) {
        return res.status(400).json({ error: 'Invalid subjectId IDs provided' });
    }


    const sql = "DELETE FROM subjects WHERE subject_id IN (?)";

    db.query(sql, [subject_ids], (err, result) => {
        if (err) {
            console.error('Error deleting subjectId:', err);
            return res.status(500).json({ error: 'Failed to delete subjectId' });
        }
        res.status(200).json({ message: 'Subjects deleted successfully' });
    });
});


router.put('/update/:id', (req, res) => {
    const subjectId = req.params.id;
    const { subject_name , subject_code, year_level, subject_semester, subject_type , subject_units , subject_tags } = req.body;

    const sql = "UPDATE subjects SET subject_name = ?, subject_code = ?, year_level = ?, subject_semester = ?, subject_type = ?, subject_units = ?, subject_tags = ? WHERE subject_id = ?";

    db.query(sql, [subject_name , subject_code, year_level, subject_semester, subject_type , subject_units , subject_tags, subjectId], (err, result) => {
        if (err) {
            console.error('Error updating subjectId:', err);
            return res.status(500).json({ error: 'Failed to update subjectId' });
        }
        res.status(200).json({ message: 'Subject updated successfully' });
    });
});


module.exports = router;
