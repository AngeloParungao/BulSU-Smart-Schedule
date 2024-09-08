import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSelectChange = (event) => {
    navigate(event.target.value);
  };

  return (
    <div className="flex justify-between items-center text-[var(--text-color)]">
      <div className="lg:flex items-center gap-8 p-6 text-md font-semibold hidden">
        <NavLink
          to="/scheduling"
          className={({ isActive }) =>
            isActive ? "text-blue-500 border-b-2 border-blue-500" : ""
          }
        >
          Schedule
        </NavLink>
        <NavLink
          to="/instructors"
          className={({ isActive }) =>
            isActive ? "text-blue-500 border-b-2 border-blue-500" : ""
          }
        >
          Instructors
        </NavLink>
        <NavLink to="/sections">Sections</NavLink>
        <NavLink to="/subjects">Subjects</NavLink>
        <NavLink
          to="/rooms"
          className={({ isActive }) =>
            isActive ? "text-blue-500 border-b-2 border-blue-500" : ""
          }
        >
          Rooms
        </NavLink>
      </div>
      <div className="lg:hidden">
        <select value={location.pathname} onChange={handleSelectChange}>
          <option value="/scheduling">Scheduling</option>
          <option value="/instructors">Instructors</option>
          <option value="/sections">Sections</option>
          <option value="/subjects">Subjects</option>
          <option value="/rooms">Rooms</option>
        </select>
      </div>
    </div>
  );
}

export default Navbar;
