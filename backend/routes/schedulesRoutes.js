const express = require('express');
const db = require('../config/database');
const router = express.Router();

router.post('/adding', (req, res) => {
    const { instructor, subject, section, group, course_type, room, room_building, background_color, day, start_time, end_time, department_code, semester } = req.body;
    let academic_year = "";
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;

    // get the year of the academic year
    if(month >= 6 && month <= 12 && semester === "2nd") {
        academic_year = `${year}-${year + 1}`;
    } else if(month >= 6 && month <= 12 && semester === "1st") {
        academic_year = `${year}-${year + 1}`;
    } else if(month >= 1 && month <= 5 && semester === "2nd") {
        academic_year = `${year - 1}-${year}`;
    } else if(month >= 1 && month <= 5 && semester === "1st") {
        academic_year = `${year - 1}-${year}`;
    }

    const sql = `
        INSERT INTO schedules (instructor, subject, section_name, section_group, class_type, room, room_building, background_color, day, start_time, end_time, department_code, semester, academic_year)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql, [instructor, subject, section, group, course_type, room, room_building, background_color, day, start_time, end_time, department_code, semester, academic_year], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add schedule' });
        }
        res.status(200).json({ message: 'Schedule added successfully' });
    });
});

router.get('/fetch', (req, res) => {

    let sql = "SELECT * FROM schedules";
  
    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching data:', err);
            return res.status(500).json({ error: 'Failed to fetch schedules' });
        }
        res.status(200).json(results);
    });
});


router.delete('/delete', (req, res) => {
    const { schedule_ids } = req.body;

    if (!schedule_ids || !Array.isArray(schedule_ids) || schedule_ids.length === 0) {
        return res.status(400).json({ error: 'Invalid schedule IDs provided' });
    }

    const sql = "DELETE FROM schedules WHERE schedule_id IN (?)";

    db.query(sql, [schedule_ids], (err, result) => {
        if (err) {
            console.error('Error deleting schedules:', err);
            return res.status(500).json({ error: 'Failed to delete schedules' });
        }
        res.status(200).json({ message: 'Schedules deleted successfully' });
    });
});

router.put('/update/:id', (req, res) => {
    const { id } = req.params;
    const { instructor, subject, course_type, room, room_building, background_color, day, start_time, end_time } = req.body;

    const sql = `
        UPDATE schedules 
        SET instructor = ?, subject = ?, class_type = ?, room = ?, room_building = ?, background_color = ?, day = ?, start_time = ?, end_time = ?
        WHERE schedule_id = ?
    `;

    db.query(sql, [instructor, subject, course_type, room, room_building, background_color, day, start_time, end_time, id], (err, result) => {
        if (err) {
            console.error('Error updating data:', err);
            return res.status(500).json({ error: 'Failed to update schedule' });
        }
        res.status(200).json({ message: 'Schedule updated successfully' });
    });
});

module.exports = router;
