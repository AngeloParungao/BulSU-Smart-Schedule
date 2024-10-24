import React from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCalendarPlus,
  faEye,
  faBell,
  faCog,
  faUsers,
  faTable,
} from "@fortawesome/free-solid-svg-icons";

function Home() {
  const navigate = useNavigate();
  const role = atob(localStorage.getItem("userRole"));

  return (
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          {role === "Administrator" ? (
            <span className="md:text-4xl text-2xl font-medium">
              Admin Dashboard
            </span>
          ) : (
            <span className="md:text-4xl text-3xl font-medium">Dashboard</span>
          )}
        </div>
        <div className="flex flex-wrap justify-center items-center lg:h-[calc(100vh-4.5rem)] w-full md:gap-8 gap-4 lg:p-0 p-8">
          <div
            className="relative overflow-hidden flex justify-center items-center md:h-[15rem] md:w-[15rem] h-[8rem] w-[8rem] rounded-2xl bg-blue-500 hover:bg-blue-600 text-white p-4 shadow-md shadow-gray-600 hover:cursor-pointer"
            onClick={() => {
              role === "Administrator"
                ? navigate("/users")
                : navigate("/draft-schedules");
            }}
          >
            <FontAwesomeIcon
              icon={role === "Administrator" ? faUsers : faEye}
              className="absolute md:w-52 md:h-52 w-20 h-20 md:left-[-2rem] md:bottom-[-1rem] left-[-1rem] bottom-[-0.5rem] opacity-25"
            />
            <span className="md:text-3xl text-xl font-medium text-center">
              {role === "Administrator" ? "Users" : "Draft Schedules"}
            </span>
          </div>
          <div
            className="relative overflow-hidden flex justify-center items-center md:h-[15rem] md:w-[15rem] h-[8rem] w-[8rem] rounded-2xl bg-green-500 hover:bg-green-600 text-white p-4 shadow-md shadow-gray-600 hover:cursor-pointer"
            onClick={() => {
              role === "Administrator"
                ? navigate("/departments")
                : navigate("/scheduling");
            }}
          >
            <FontAwesomeIcon
              icon={role === "Administrator" ? faTable : faCalendarPlus}
              className="absolute md:w-52 md:h-52 w-20 h-20 md:left-[-2rem] md:bottom-[-1rem] left-[-1rem] bottom-[-0.5rem] opacity-25"
            />
            <span className="md:text-3xl text-xl font-medium text-center">
              {role === "Administrator" ? "Tables" : "Create Schedule"}
            </span>
          </div>
          <div
            className="relative overflow-hidden flex justify-center items-center md:h-[15rem] md:w-[15rem] h-[8rem] w-[8rem] rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-white p-4 shadow-md shadow-gray-600 hover:cursor-pointer"
            onClick={() => navigate("/activity-logs")}
          >
            <FontAwesomeIcon
              icon={faBell}
              className="absolute md:w-52 md:h-52 w-20 h-20 md:left-[-2rem] md:bottom-[-1rem] left-[-1rem] bottom-[-0.5rem] opacity-25"
            />
            <span className="md:text-3xl text-xl font-medium text-center">
              Activity Logs
            </span>
          </div>
          <div
            className="relative overflow-hidden flex justify-center items-center md:h-[15rem] md:w-[15rem] h-[8rem] w-[8rem] rounded-2xl bg-gray-500 hover:bg-gray-600 text-white p-4 shadow-md shadow-gray-600 hover:cursor-pointer"
            onClick={() => navigate("/settings")}
          >
            <FontAwesomeIcon
              icon={faCog}
              className="absolute md:w-52 md:h-52 w-20 h-20 md:left-[-2rem] md:bottom-[-1rem] left-[-1rem] bottom-[-0.5rem] opacity-25"
            />
            <span className="md:text-3xl text-xl font-medium text-center">
              Settings
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
