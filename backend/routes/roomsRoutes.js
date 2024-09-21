const express = require('express');
const db = require('../config/database');
const router = express.Router();


router.post('/adding', (req, res) => {
    const { room_type, room_name, room_building } = req.body;

    const sql = "INSERT INTO rooms (room_type, room_name, room_building) VALUES (?, ?, ?)";

    db.query(sql, [ room_type, room_name, room_building], (err, result) => {
        if (err) {
            console.error('Error inserting data:', err);
            return res.status(500).json({ error: 'Failed to add room' });
        }
        res.status(200).json({ message: 'Room added successfully' });
    });
});


router.get('/fetch', (req, res) => {
    const sql = "SELECT * FROM rooms";

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching rooms:', err);
            return res.status(500).json({ error: 'Failed to fetch rooms' });
        }
        res.status(200).json(results);
    });
});


router.delete('/delete', (req, res) => {
    const { room_ids } = req.body;

    if (!room_ids || !Array.isArray(room_ids) || room_ids.length === 0) {
        return res.status(400).json({ error: 'Invalid room IDs provided' });
    }

    const sql = "DELETE FROM rooms WHERE room_id IN (?)";

    db.query(sql, [room_ids], (err, result) => {
        if (err) {
            console.error('Error deleting rooms:', err);
            return res.status(500).json({ error: 'Failed to delete rooms' });
        }
        res.status(200).json({ message: 'Rooms deleted successfully' });
    });
});


router.put('/update/:id', (req, res) => {
    const roomId = req.params.id;
    const { room_type, room_name, room_building } = req.body;

    const sql = "UPDATE rooms SET room_type = ?, room_name = ?, room_building = ? WHERE room_id = ?";

    db.query(sql, [room_type, room_name, room_building, roomId], (err, result) => {
        if (err) {
            console.error('Error updating room:', err);
            return res.status(500).json({ error: 'Failed to update room' });
        }
        res.status(200).json({ message: 'Rooms updated successfully' });
    });
});


module.exports = router;
