import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Login, Home, DraftSchedules, Scheduling, Departments, Instructors, Sections, Subjects, Rooms, ActivityLog, Setting, Users, ResetPassword } from './pages/Pages';
import './App.css';

function App() {
  const currentUser = atob(localStorage.getItem("userID"));
  
  useEffect(() => {
    if (currentUser) {
      const getTheme = atob(localStorage.getItem(`theme-${currentUser}`));
      const theme = getTheme ? getTheme : 'default';
      document.body.classList.remove("default", "gray", "red", "green");
      document.body.classList.add(theme);
    }
  }, []);

  // Private route component for authentication check
  const PrivateRoute = ({ element: Component }) => {
    return localStorage.getItem('userID') ? <Component /> : <Navigate to="/" />;
  };

  return (
    <Router>
      <Routes>
        {/* Public route for Login */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Private route for Home and Settings */}
        <Route path="/home" element={<PrivateRoute element={Home} />} />
        <Route path="/draft-schedules" element={<PrivateRoute element={DraftSchedules} />} />
        <Route path="/scheduling" element={<PrivateRoute element={Scheduling} />} />
        <Route path="/departments" element={<PrivateRoute element={Departments} />} /> 
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
