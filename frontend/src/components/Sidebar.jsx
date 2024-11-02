import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import SignOutConfirmation from "./SignOutConfirmation";
import logo from "../assets/FINAL LOGO.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faHome,
  faNoteSticky,
  faCalendar,
  faBook,
  faGear,
  faUsers,
  faTable,
  faRightFromBracket,
} from "@fortawesome/free-solid-svg-icons";

function Sidebar() {
  const url = process.env.REACT_APP_URL;
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const role = atob(localStorage.getItem("userRole"));
  const [user, setUsers] = useState([]);
  const [showSidebar, setShowSidebar] = useState(false);
  const [showSignOutConfirmation, setShowSignOutConfirmation] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios
      .get(`${url}api/users/fetch`)
      .then((res) => {
        setUsers(res.data);
      })
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      });
  }, [url]);

  return (
    <div
      className={`bg-[#343B46] h-[100dvh] flex flex-col justify-between pb-4 w-[6rem] ${
        showSidebar ? "ml-0" : "ml-[-6rem]"
      } lg:ml-0 transition-all duration-300`}
    >
      <Toaster position="bottom-right" reverseOrder={false} />
      <div
        className={`${
          showSidebar
            ? "left-[5rem] bg-[#343B46] w-[4rem] h-[4.5rem] rounded-r-3xl"
            : ""
        } absolute flex justify-center items-center w-[4rem] h-[4.5rem] top-0 left-0 block lg:hidden transition-all duration-300`}
      >
        {!showSidebar ? (
          <FontAwesomeIcon
            icon={faBars}
            className="text-xl"
            onClick={() => setShowSidebar(!showSidebar)}
          />
        ) : (
          <FontAwesomeIcon
            icon={faXmark}
            className="text-xl text-white"
            onClick={() => setShowSidebar(!showSidebar)}
          />
        )}
      </div>
      <div className="flex justify-center items-center h-[5rem]">
        <img src={logo} alt="" className="w-[3rem]" />
      </div>
      <div className="flex flex-col items-center text-white text-lg">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center w-full h-[4.5rem] gap-2 hover:bg-[#2c323b] hover:text-white ${
              isActive ? "bg-white text-[#343B46]" : ""
            }`
          }
        >
          <FontAwesomeIcon icon={faHome} />
          <span className="text-xs">Home</span>
        </NavLink>
        <NavLink
          to="/draft-schedules"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center w-full h-[4.5rem] hover:bg-[#2c323b] hover:text-white ${
              isActive ? "bg-white text-[#343B46]" : ""
            }`
          }
        >
          <FontAwesomeIcon icon={faNoteSticky} />
          <span className="text-[0.6rem]">Draft Schedules</span>
        </NavLink>
        {role === "Administrator" ? (
          <>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex flex-col justify-center items-center w-full h-[4.5rem] gap-2 hover:bg-[#2c323b] hover:text-white ${
                  isActive ? "bg-white text-[#343B46]" : ""
                }`
              }
            >
              <FontAwesomeIcon icon={faUsers} />
              <span className="text-xs">Users</span>
            </NavLink>
            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `flex flex-col justify-center items-center w-full h-[4.5rem] gap-2 hover:bg-[#2c323b] hover:text-white ${
                  isActive ? "bg-white text-[#343B46]" : ""
                }`
              }
            >
              <FontAwesomeIcon icon={faTable} />
              <span className="text-xs">Data</span>
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/scheduling"
              className={({ isActive }) =>
                `flex flex-col justify-center items-center w-full h-[4.5rem] gap-2 hover:bg-[#2c323b] hover:text-white ${
                  isActive ? "bg-white text-[#343B46]" : ""
                }`
              }
            >
              <FontAwesomeIcon icon={faCalendar} />
              <span className="text-xs">Schedule</span>
            </NavLink>
          </>
        )}
        <NavLink
          to="/activity-logs"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center w-full h-[4.5rem] gap-2 hover:bg-[#2c323b] hover:text-white ${
              isActive ? "bg-white text-[#343B46]" : ""
            }`
          }
        >
          <FontAwesomeIcon icon={faBook} />
          <span className="text-xs">Activity</span>
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex flex-col justify-center items-center w-full h-[4.5rem] gap-2 hover:bg-[#2c323b] hover:text-white ${
              isActive ? "bg-white text-[#343B46]" : ""
            }`
          }
        >
          <FontAwesomeIcon icon={faGear} />
          <span className="text-xs">Settings</span>
        </NavLink>
      </div>

      <div className="flex flex-col items-center text-white text-lg">
        <button
          className="flex justify-center items-center w-full h-[3rem] hover:bg-[#2c323b]"
          onClick={() => setShowSignOutConfirmation(!showSignOutConfirmation)}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="" />
        </button>
        {showSignOutConfirmation && (
          <SignOutConfirmation
            isOpen={showSignOutConfirmation}
            onRequestClose={() => setShowSignOutConfirmation(false)}
          />
        )}
        <div className="flex justify-center items-center w-full h-[4.5rem]">
          <div className="flex justify-center items-center border-2 border-white rounded-lg w-12 h-12">
            {user.find((user) => user.user_id === currentUser) ? (
              <span className="uppercase text-3xl font-bold" key={user.user_id}>
                {user
                  .find((user) => user.user_id === currentUser)
                  .first_name.charAt(0)}
              </span>
            ) : (
              <span
                className="uppercase text-3xl font-bold"
                key={currentUser}
              ></span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;
