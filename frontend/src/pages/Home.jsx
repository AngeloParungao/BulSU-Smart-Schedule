import React, { useState, useEffect } from "react";
import axios from "axios";
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
  const url = process.env.REACT_APP_URL;
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentRole = atob(localStorage.getItem("userRole"));
  const [users, setUsers] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const navigate = useNavigate();
  const role = atob(localStorage.getItem("userRole"));

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [
        userRes,
        scheduleRes,
        departmentRes,
        instructorRes,
        sectionRes,
        subjectRes,
        roomRes,
      ] = await Promise.all([
        axios.get(`${url}api/users/fetch`),
        axios.get(`${url}api/schedule/fetch`),
        axios.get(`${url}api/departments/fetch`),
        axios.get(`${url}api/instructors/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/sections/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/subjects/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/rooms/fetch`),
      ]);

      if (currentRole === "Administrator") {
        setUsers(userRes.data.filter((user) => user.status === "active"));
      } else {
        setUsers(
          userRes.data.filter(
            (user) =>
              user.role === "Collaborator" &&
              user.department_code === currentDepartment &&
              user.status === "active"
          )
        );
      }
      setSchedules(scheduleRes.data);
      setDepartments(departmentRes.data);
      setInstructors(instructorRes.data);
      setSections(sectionRes.data);
      setSubjects(subjectRes.data);
      setRooms(roomRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
        <div className="flex flex-col justify-center items-center gap-10 h-[calc(100%-4.5rem)] w-full">
          <div className="flex flex-wrap lg:flex-nowrap justify-center items-center w-full gap-4 lg:p-0 p-8">
            <div className="flex flex-col items-center bg-white rounded-xl lg:w-[10rem] lg:h-[8rem] w-[6rem] h-[6rem] border">
              <div className="flex flex-col justify-center items-center p-2 lg:px-4 border-b">
                <span className="lg:text-[0.9rem] text-xs font-medium">
                  Schedule
                </span>
              </div>
              <div className="flex justify-center items-center h-full">
                <span
                  className={`lg:text-5xl text-2xl font-bold ${
                    schedules.length < 10
                      ? "text-red-500"
                      : schedules.length < 30
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {schedules.length}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center bg-white rounded-xl lg:w-[10rem] lg:h-[8rem] w-[6rem] h-[6rem] border">
              <div className="flex flex-col justify-center items-center p-2 lg:px-4 border-b">
                <span className="lg:text-[0.9rem] text-xs font-medium">
                  {role === "Administrator" ? "Users" : "Collaborators"}
                </span>
              </div>
              <div className="flex justify-center items-center h-full">
                <span
                  className={`lg:text-5xl text-2xl font-bold ${
                    users.length < 10
                      ? "text-red-500"
                      : users.length < 30
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {users.length}
                </span>
              </div>
            </div>
            {currentRole === "Administrator" && (
              <div className="flex flex-col items-center bg-white rounded-xl lg:w-[10rem] lg:h-[8rem] w-[6rem] h-[6rem] border">
                <div className="flex flex-col justify-center items-center p-2 lg:px-4 border-b">
                  <span className="lg:text-[0.9rem] text-xs font-medium">
                    Departments
                  </span>
                </div>
                <div className="flex justify-center items-center h-full">
                  <span
                    className={`lg:text-5xl text-2xl font-bold ${
                      departments.length < 10
                        ? "text-red-500"
                        : departments.length < 30
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {departments.length}
                  </span>
                </div>
              </div>
            )}
            <div className="flex flex-col items-center bg-white rounded-xl lg:w-[10rem] lg:h-[8rem] w-[6rem] h-[6rem] border">
              <div className="flex flex-col justify-center items-center p-2 lg:px-4 border-b">
                <span className="lg:text-[0.9rem] text-xs font-medium">
                  Instructors
                </span>
              </div>
              <div className="flex justify-center items-center h-full">
                <span
                  className={`lg:text-5xl text-2xl font-bold ${
                    instructors.length < 10
                      ? "text-red-500"
                      : instructors.length < 30
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {instructors.length}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center bg-white rounded-xl lg:w-[10rem] lg:h-[8rem] w-[6rem] h-[6rem] border">
              <div className="flex flex-col justify-center items-center p-2 lg:px-4 border-b">
                <span className="lg:text-[0.9rem] text-xs font-medium">
                  Sections
                </span>
              </div>
              <div className="flex justify-center items-center h-full">
                <span
                  className={`lg:text-5xl text-2xl font-bold ${
                    sections.length < 10
                      ? "text-red-500"
                      : sections.length < 30
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {sections.length}
                </span>
              </div>
            </div>
            <div className="flex flex-col items-center bg-white rounded-xl lg:w-[10rem] lg:h-[8rem] w-[6rem] h-[6rem] border">
              <div className="flex flex-col justify-center items-center p-2 lg:px-4 border-b">
                <span className="lg:text-[0.9rem] text-xs font-medium">
                  Subjects
                </span>
              </div>
              <div className="flex justify-center items-center h-full">
                <span
                  className={`lg:text-5xl text-2xl font-bold ${
                    subjects.length < 10
                      ? "text-red-500"
                      : subjects.length < 30
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  {subjects.length}
                </span>
              </div>
            </div>
            {currentRole === "Administrator" ? (
              <div className="flex flex-col items-center bg-white rounded-xl lg:w-[10rem] lg:h-[8rem] w-[6rem] h-[6rem] border">
                <div className="flex flex-col justify-center items-center p-2 lg:px-4 border-b">
                  <span className="lg:text-[0.9rem] text-xs font-medium">
                    Rooms
                  </span>
                </div>
                <div className="flex justify-center items-center h-full">
                  <span
                    className={`lg:text-5xl text-2xl font-bold ${
                      rooms.length < 10
                        ? "text-red-500"
                        : rooms.length < 30
                        ? "text-yellow-500"
                        : "text-green-500"
                    }`}
                  >
                    {rooms.length}
                  </span>
                </div>
              </div>
            ) : null}
          </div>
          <div className="flex flex-wrap lg:flex-nowrap justify-center items-center w-full gap-4 lg:p-0 p-8">
            <div
              className="relative overflow-hidden flex justify-center items-center lg:h-[15rem] lg:w-[15rem] h-[8rem] w-[8rem] rounded-2xl bg-blue-500 hover:bg-blue-600 text-white p-4 shadow-md shadow-gray-600 hover:cursor-pointer"
              onClick={() => {
                role === "Administrator"
                  ? navigate("/users")
                  : navigate("/draft-schedules");
              }}
            >
              <FontAwesomeIcon
                icon={role === "Administrator" ? faUsers : faEye}
                className="absolute lg:w-52 lg:h-52 w-20 h-20 lg:left-[-2rem] lg:bottom-[-1rem] left-[-1rem] bottom-[-0.5rem] opacity-25"
              />
              <span className="lg:text-3xl text-xl font-medium text-center">
                {role === "Administrator" ? "Users" : "Draft Schedules"}
              </span>
            </div>
            <div
              className="relative overflow-hidden flex justify-center items-center lg:h-[15rem] lg:w-[15rem] h-[8rem] w-[8rem] rounded-2xl bg-green-500 hover:bg-green-600 text-white p-4 shadow-md shadow-gray-600 hover:cursor-pointer"
              onClick={() => {
                role === "Administrator"
                  ? navigate("/departments")
                  : navigate("/scheduling");
              }}
            >
              <FontAwesomeIcon
                icon={role === "Administrator" ? faTable : faCalendarPlus}
                className="absolute lg:w-52 lg:h-52 w-20 h-20 lg:left-[-2rem] md:bottom-[-1rem] left-[-1rem] bottom-[-0.5rem] opacity-25"
              />
              <span className="lg:text-3xl text-xl font-medium text-center">
                {role === "Administrator" ? "Tables" : "Create Schedule"}
              </span>
            </div>
            <div
              className="relative overflow-hidden flex justify-center items-center lg:h-[15rem] lg:w-[15rem] h-[8rem] w-[8rem] rounded-2xl bg-yellow-500 hover:bg-yellow-600 text-white p-4 shadow-md shadow-gray-600 hover:cursor-pointer"
              onClick={() => navigate("/activity-logs")}
            >
              <FontAwesomeIcon
                icon={faBell}
                className="absolute lg:w-52 lg:h-52 w-20 h-20 lg:left-[-2rem] md:bottom-[-1rem] left-[-1rem] bottom-[-0.5rem] opacity-25"
              />
              <span className="lg:text-3xl text-xl font-medium text-center">
                Activity Logs
              </span>
            </div>
            <div
              className="relative overflow-hidden flex justify-center items-center lg:h-[15rem] lg:w-[15rem] h-[8rem] w-[8rem] rounded-2xl bg-gray-500 hover:bg-gray-600 text-white p-4 shadow-md shadow-gray-600 hover:cursor-pointer"
              onClick={() => navigate("/settings")}
            >
              <FontAwesomeIcon
                icon={faCog}
                className="absolute lg:w-52 lg:h-52 w-20 h-20 lg:left-[-2rem] md:bottom-[-1rem] left-[-1rem] bottom-[-0.5rem] opacity-25"
              />
              <span className="lg:text-3xl text-xl font-medium text-center">
                Settings
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
