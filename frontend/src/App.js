import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Home, DraftSchedules, Scheduling, Instructors, Sections, Subjects, Rooms, ActivityLog, Setting, Users } from './pages/Pages';
import './App.css';

function App() {

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");
    if (userToken) {
      const userId = JSON.parse(atob(userToken)); // Decode token safely
      const getTheme = localStorage.getItem(`theme-${userId}`);
      const theme = getTheme ? atob(getTheme) : 'default';
      document.body.classList.remove("default", "gray", "red", "green");
      document.body.classList.add(theme);
    }
  }, []);

  // Private route component for authentication check
  const PrivateRoute = ({ element: Component }) => {
    return localStorage.getItem('userToken') ? <Component /> : <Navigate to="/" />;
  };

  return (
    <Router>
      <Routes>
        {/* Public route for Login */}
        <Route path="/" element={<Login />} />

        {/* Private route for Home and Settings */}
        <Route path="/home" element={<PrivateRoute element={Home} />} />
        <Route path="/draft-schedules" element={<PrivateRoute element={DraftSchedules} />} />
        <Route path="/scheduling" element={<PrivateRoute element={Scheduling} />} />
        <Route path="/instructors" element={<PrivateRoute element={Instructors} />} />
        <Route path="/rooms" element={<PrivateRoute element={Rooms} />} />
        <Route path="/sections" element={<PrivateRoute element={Sections} />} />
        <Route path="/subjects" element={<PrivateRoute element={Subjects} />} />
        <Route path="/activity-logs" element={<PrivateRoute element={ActivityLog} />} />
        <Route path="/settings" element={<PrivateRoute element={Setting} />} />
        <Route path="/users" element={<PrivateRoute element={Users} />} />
      </Routes>
    </Router>
  );
}

export default App;
