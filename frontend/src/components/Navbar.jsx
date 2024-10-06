import React from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";

function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const role = atob(localStorage.getItem("userRole"));

  const handleSelectChange = (event) => {
    navigate(event.target.value);
  };

  return (
    <div className="flex justify-between items-center text-[var(--text-color)]">
      <div className="lg:flex items-center gap-8 p-6 text-md font-semibold hidden">
        {role === "Administrator" ? (
          <NavLink
            to="/departments"
            className={({ isActive }) =>
              isActive ? "text-blue-500 border-b-2 border-blue-500" : ""
            }
          >
            Departments
          </NavLink>
        ) : (
          <NavLink
            to="/scheduling"
            className={({ isActive }) =>
              isActive ? "text-blue-500 border-b-2 border-blue-500" : ""
            }
          >
            Schedule
          </NavLink>
        )}
        <NavLink
          to="/instructors"
          className={({ isActive }) =>
            isActive ? "text-blue-500 border-b-2 border-blue-500" : ""
          }
        >
          Instructors
        </NavLink>
        <NavLink
          to="/sections"
          className={({ isActive }) =>
            isActive ? "text-blue-500 border-b-2 border-blue-500" : ""
          }
        >
          Sections
        </NavLink>
        <NavLink
          to="/subjects"
          className={({ isActive }) =>
            isActive ? "text-blue-500 border-b-2 border-blue-500" : ""
          }
        >
          Subjects
        </NavLink>
        {role === "Administrator" ? (
          <NavLink
            to="/rooms"
            className={({ isActive }) =>
              isActive ? "text-blue-500 border-b-2 border-blue-500" : ""
            }
          >
            Rooms
          </NavLink>
        ) : null}
      </div>
      <div className="lg:hidden mr-2">
        <select
          value={location.pathname}
          onChange={handleSelectChange}
          className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}"
        >
          {role === "Administrator" ? (
            <option value="/departments">Departments</option>
          ) : (
            <option value="/scheduling">Schedule</option>
          )}
          <option value="/instructors">Instructors</option>
          <option value="/sections">Sections</option>
          <option value="/subjects">Subjects</option>
          {role === "Administrator" ? (
            <option value="/rooms">Rooms</option>
          ) : null}
        </select>
      </div>
    </div>
  );
}

export default Navbar;
