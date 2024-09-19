const express = require('express');
const cors = require('cors');
require('dotenv').config();
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

app.use(express.json());
app.use(cors());

app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/schedule', schedulesRoutes);
app.use('/api/instructors', instructorsRoutes);
app.use('/api/sections', sectionsRoutes);
app.use('/api/subjects', subjectsRoutes);
app.use('/api/rooms', roomsRoutes);
app.use('/api/activity', activityRoutes);
app.use('/api/departments', departmentsRoutes);


const PORT = process.env.MYSQLPORT;
app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});
