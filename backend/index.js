const express = require('express');
const cors = require('cors');
const http = require('http'); // Import http to enable socket.io with Express
const { Server } = require('socket.io');
require('dotenv').config();
const path = require('path');
const authRoutes = require('./routes/authRoutes');
const usersRoutes = require('./routes/usersRoutes');
const schedulesRoutes = require('./routes/schedulesRoutes');
const instructorsRoutes = require('./routes/instructorsRoutes');
const sectionsRoutes = require('./routes/sectionsRoutes');
const subjectsRoutes = require('./routes/subjectsRoutes');
const roomsRoutes = require('./routes/roomsRoutes');
const activityRoutes = require("./routes/activityRoutes");
const departmentsRoutes = require('./routes/departmentsRoutes');

const app = express();
const server = http.createServer(app); // Use http server for socket.io
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/schedule', schedulesRoutes(io));
app.use('/api/instructors', instructorsRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/departments', departmentsRoutes);

app.use('/images', express.static(path.join(__dirname, 'assets')));

// Handle socket.io connections
io.on('connection', (socket) => {
    console.log('A client connected:', socket.id);

    // Listen for disconnection
    socket.on('disconnect', () => {
        console.log('A client disconnected:', socket.id);
    });
});

const PORT = process.env.MYSQLPORT || 3000;
server.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
