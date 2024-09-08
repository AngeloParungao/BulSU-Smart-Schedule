const express = require('express');
const db = require('../database');
const router = express.Router();

router.post('/adding', (req, res) => {
    const { instructorName, subjectName, section, group, courseType, roomName, selectedColor, meetingDay, startTime, endTime, currentUser } = req.body;

    const sql = `
        INSERT INTO schedules (instructor, subject, section_name, section_group, class_type, room, background_color, day, start_time, end_time, creator_id)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.query(sql, [instructorName, subjectName, section, group, courseType, roomName, selectedColor, meetingDay, startTime, endTime, currentUser], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add schedule' });
        }
        res.status(200).json({ message: 'Schedule added successfully' });
    });
});

router.get('/fetch', (req, res) => {
    const { dept_code } = req.query;
    const sql = "SELECT * FROM schedules WHERE department_code = ?";
    db.query(sql, [dept_code], (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Failed to fetch schedules' });
        }
        res.status(200).json(results);
    });
});

router.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { instructorName, subjectName, courseType, roomName, selectedColor, meetingDay, startTime, endTime } = req.body;

    const sql = `
        UPDATE schedules 
        SET instructor = ?, subject = ?, class_type = ?, room = ?, background_color = ?, day = ?, start_time = ?, end_time = ?
        WHERE schedule_id = ?
    `;

    db.query(sql, [instructorName, subjectName, courseType, roomName, selectedColor, meetingDay, startTime, endTime, id], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'Failed to update schedule' });
        }
        res.status(200).json({ message: 'Schedule updated successfully' });
    });
});

router.delete('/delete/:id', (req, res) => {
    const { id } = req.params;
    const sql = "DELETE FROM schedules WHERE schedule_id = ?";

    db.query(sql, [id], (err, result) => {
        if (err) {
            console.error('Error deleting data:', err);
            return res.status(500).json({ error: 'Failed to delete schedule' });
        }
        res.status(200).json({ message: 'Schedule deleted successfully' });
    });
});

module.exports = router;
