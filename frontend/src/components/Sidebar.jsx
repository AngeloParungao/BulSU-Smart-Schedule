import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { toast, Toaster } from "react-hot-toast";
import axios from "axios";
import logo from "../assets/logo_white_no_bg 2.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faXmark,
  faHome,
  faNoteSticky,
  faCalendar,
  faBell,
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

  const logout = () => {
    toast.success("Logging Out");
    setTimeout(() => {
      localStorage.removeItem("userID");
      localStorage.removeItem("userDept");
      localStorage.removeItem("userRole");
      navigate("/");
      window.location.reload();
    }, 2000);
  };

  return (
    <div
      className={`bg-[#343B46] h-screen flex flex-col justify-between pb-4 w-[6rem] ${
        showSidebar ? "ml-0" : "ml-[-6rem]"
      } lg:ml-0 transition-all duration-300`}
    >
      <Toaster position="bottom-right" reverseOrder={false} />
      <div
        className={`${
          showSidebar
            ? "left-[5rem] bg-[#343B46] w-[4rem] h-[4rem] rounded-r-3xl"
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
      <div className="side-logo">
        <img src={logo} alt="" />
      </div>
      <div className="flex flex-col items-center text-white text-lg">
        <NavLink
          to="/home"
          className={({ isActive }) =>
            `flex justify-center items-center w-full h-[4rem] hover:bg-[#2c323b] hover:text-white ${
              isActive ? "bg-white text-[#343B46]" : ""
            }`
          }
        >
          <FontAwesomeIcon icon={faHome} />
        </NavLink>
        {role === "Administrator" ? (
          <>
            <NavLink
              to="/users"
              className={({ isActive }) =>
                `flex justify-center items-center w-full h-[4rem] hover:bg-[#2c323b] hover:text-white ${
                  isActive ? "bg-white text-[#343B46]" : ""
                }`
              }
            >
              <FontAwesomeIcon icon={faUsers} />
            </NavLink>
            <NavLink
              to="/departments"
              className={({ isActive }) =>
                `flex justify-center items-center w-full h-[4rem] hover:bg-[#2c323b] hover:text-white ${
                  isActive ? "bg-white text-[#343B46]" : ""
                }`
              }
            >
              <FontAwesomeIcon icon={faTable} />
            </NavLink>
          </>
        ) : (
          <>
            <NavLink
              to="/draft-schedules"
              className={({ isActive }) =>
                `flex justify-center items-center w-full h-[4rem] hover:bg-[#2c323b] hover:text-white ${
                  isActive ? "bg-white text-[#343B46]" : ""
                }`
              }
            >
              <FontAwesomeIcon icon={faNoteSticky} />
            </NavLink>
            <NavLink
              to="/scheduling"
              className={({ isActive }) =>
                `flex justify-center items-center w-full h-[4rem] hover:bg-[#2c323b] hover:text-white ${
                  isActive ? "bg-white text-[#343B46]" : ""
                }`
              }
            >
              <FontAwesomeIcon icon={faCalendar} />
            </NavLink>
          </>
        )}
        <NavLink
          to="/activity-logs"
          className={({ isActive }) =>
            `flex justify-center items-center w-full h-[4rem] hover:bg-[#2c323b] hover:text-white ${
              isActive ? "bg-white text-[#343B46]" : ""
            }`
          }
        >
          <FontAwesomeIcon icon={faBell} />
        </NavLink>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex justify-center items-center w-full h-[4rem] hover:bg-[#2c323b] hover:text-white ${
              isActive ? "bg-white text-[#343B46]" : ""
            }`
          }
        >
          <FontAwesomeIcon icon={faGear} />
        </NavLink>
      </div>

      <div className="flex flex-col items-center text-white text-lg">
        <button
          className="flex justify-center items-center w-full h-[4rem] hover:bg-[#2c323b]"
          onClick={logout}
        >
          <FontAwesomeIcon icon={faRightFromBracket} className="" />
        </button>
        <div className="flex justify-center items-center w-full h-[4rem]">
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
