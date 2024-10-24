import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Login, Home, DraftSchedules, Scheduling, Departments, Instructors, Sections, Subjects, Rooms, ActivityLog, Setting, Users, ResetPassword } from './pages/Pages';
import OfflinePage from './pages/OfflinePage'; // Import your OfflinePage
import './App.css';

function App() {

  useEffect(() => {
    const userID = localStorage.getItem("userID");
    const currentUser = userID ? atob(userID) : "";
    const theme = localStorage.getItem(`theme-${currentUser}`);
    const getTheme = theme ? atob(theme) : "default";
    document.body.classList.remove("default", "gray", "red", "green");
    document.body.classList.add(getTheme);
  }, []);

  const PrivateRoute = ({ element: Component }) => {
    return localStorage.getItem('userID') ? <Component /> : <Navigate to="/" />;
  };

  return (
    <Router>
      <NetworkChecker />
      <Routes>
        {/* Public route for Login */}
        <Route path="/" element={<Login />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Offline route */}
        <Route path="/offline" element={<OfflinePage />} />

        {/* Private routes */}
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

const NetworkChecker = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [lastLocation, setLastLocation] = useState(() => localStorage.getItem('lastLocation') || location.pathname);

  useEffect(() => {
    // Save the current location in `localStorage` when online and the user navigates
    if (navigator.onLine) {
      setLastLocation(location.pathname);
      localStorage.setItem('lastLocation', location.pathname); // Save to `localStorage`
    }

    const handleOnline = () => {
      console.log('You are back online');
      const savedLocation = localStorage.getItem('lastLocation') || '/home'; // Default to home if no saved location
      if (location.pathname === '/offline') {
        navigate(savedLocation); // Navigate to the saved location
      }
    };

    const handleOffline = () => {
      console.log('You are offline');
      // Store the current location before navigating to the offline page
      localStorage.setItem('lastLocation', location.pathname); // Save to `localStorage`
      setLastLocation(location.pathname);
      navigate('/offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [navigate, location]);

  return null;
};


export default App;
