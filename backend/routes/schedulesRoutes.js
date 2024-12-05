module.exports = (io) => {
  const express = require('express');
  const db = require('../config/database');
  const router = express.Router();

  // Fetch all schedules
  router.get('/fetch', (req, res) => {
      const sql = "SELECT * FROM schedules";
      
      db.query(sql, (err, results) => {
          if (err) {
              console.error('Error fetching data:', err);
              return res.status(500).json({ error: 'Failed to fetch schedules' });
          }
          res.status(200).json(results);
      });
  });

  // Add a schedule
  router.post('/adding', (req, res) => {
      const { instructor, subject, section, group, course_type, room, room_building, background_color, day, start_time, end_time, department_code, semester, is_published } = req.body;
      let academic_year = "";
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;

      if (month >= 6 && month <= 12 && semester === "2nd") {
          academic_year = `${year}-${year + 1}`;
      } else if (month >= 6 && month <= 12 && semester === "1st") {
          academic_year = `${year}-${year + 1}`;
      } else if (month >= 1 && month <= 5 && semester === "2nd") {
          academic_year = `${year - 1}-${year}`;
      } else if (month >= 1 && month <= 5 && semester === "1st") {
          academic_year = `${year - 1}-${year}`;
      } else if (semester === "mid-year") {
          academic_year = `${year}-${year + 1}`;
      }

      const sql = `
          INSERT INTO schedules (instructor, subject, section_name, section_group, class_type, room, room_building, background_color, day, start_time, end_time, department_code, semester, academic_year, is_published)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
      
      db.query(sql, [instructor, subject, section, group, course_type, room, room_building, background_color, day, start_time, end_time, department_code, semester, academic_year, is_published], (err, result) => {
          if (err) {
              console.error('Error inserting data:', err);
              return res.status(500).json({ error: 'Failed to add schedule' });
          }
          io.emit('schedule-added', result); // Emit event to notify clients
          res.status(200).json({ message: 'Schedule added successfully' });
      });
  });

  // Update a schedule
  router.put('/update/:id', (req, res) => {
      const { id } = req.params;
      const { instructor, subject, course_type, room, room_building, background_color, day, start_time, end_time } = req.body;

      const sql = `
          UPDATE schedules 
          SET instructor = ?, subject = ?, class_type = ?, room = ?, room_building = ?, background_color = ?, day = ?, start_time = ?, end_time = ?
          WHERE schedule_id = ?`;

      db.query(sql, [instructor, subject, course_type, room, room_building, background_color, day, start_time, end_time, id], (err, result) => {
          if (err) {
              console.error('Error updating data:', err);
              return res.status(500).json({ error: 'Failed to update schedule' });
          }
          io.emit('schedule-updated', result); // Emit event to notify clients
          res.status(200).json({ message: 'Schedule updated successfully' });
      });
  });
    
  // Publish schedules
  router.put('/publish', (req, res) => {
      const { department_code, is_published, semester, academic_year } = req.body;

      const sql = `
          UPDATE schedules 
          SET is_published = ?
          WHERE department_code = ? AND semester = ? AND academic_year = ?`;

      db.query(sql, [is_published, department_code, semester, academic_year], (err, result) => {
          if (err) {
              console.error('Error updating data:', err);
              return res.status(500).json({ error: 'Failed to publish schedules' });
          }
          io.emit('schedules-published', result); // Emit event to notify clients
          res.status(200).json({ message: 'Schedules published successfully' });
      });
  });

  // Delete schedules
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
          io.emit('schedule-deleted', result); // Emit event to notify clients
          res.status(200).json({ message: 'Schedules deleted successfully' });
      });
  });

  return router;
};
