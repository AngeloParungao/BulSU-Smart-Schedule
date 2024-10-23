import React, { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChalkboardTeacher,
  faBook,
  faDoorClosed,
  faCalendar,
  faUser,
  faBuilding,
} from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

function ActivityLog() {
  const url = process.env.REACT_APP_URL;
  const [activity, setActivity] = useState([]);
  const [users, setUsers] = useState([]);
  const [selectedDate, setSelectedDate] = useState("");
  const currentDepartment = atob(localStorage.getItem("userDept"));

  useEffect(() => {
    toast.dismiss();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activityRes, userRes] = await Promise.all([
        axios.get(`${url}api/activity/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/users/fetch`),
      ]);
      setActivity(activityRes.data);
      setUsers(userRes.data);
    } catch (err) {
      console.error("Error fetching activity logs:", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case "instructor":
        return <FontAwesomeIcon icon={faChalkboardTeacher} />;
      case "section":
        return <FontAwesomeIcon icon={faChalkboardTeacher} />;
      case "subject":
        return <FontAwesomeIcon icon={faBook} />;
      case "room":
        return <FontAwesomeIcon icon={faDoorClosed} />;
      case "schedule":
        return <FontAwesomeIcon icon={faCalendar} />;
      case "user":
        return <FontAwesomeIcon icon={faUser} />;
      case "department":
        return <FontAwesomeIcon icon={faBuilding} />;
      default:
        return null;
    }
  };

  const getBackgroundColor = (action) => {
    switch (action) {
      case "Add":
        return "#ccffcc";
      case "Update":
        return "#ffffcc";
      case "Delete":
        return "#ffcccc";
      default:
        return "white";
    }
  };

  const getActionMessage = (log) => {
    switch (log.action) {
      case "Add":
        if (log.type === "instructor") {
          return `${log.details} has been added to ${log.type}`;
        } else if (log.type === "section") {
          return `Section ${log.details} has been created`;
        } else if (log.type === "subject") {
          return `${log.details} has been added to ${log.type}`;
        } else if (log.type === "room") {
          return `${log.details} has been added to ${log.type}`;
        } else if (log.type === "schedule") {
          return `Schedule added for ${log.details}`;
        } else if (log.type === "user") {
          return `User ${log.details} has been added`;
        } else if (log.type === "department") {
          return `Department ${log.details} has been added`;
        }
      case "Update":
        if (log.type === "instructor") {
          return `Instructor ${log.details} has been updated`;
        } else if (log.type === "section") {
          return `Section ${log.details} has been updated`;
        } else if (log.type === "subject") {
          return `Subject ${log.details} has been updated`;
        } else if (log.type === "room") {
          return `Room ${log.details} has been updated`;
        } else if (log.type === "schedule") {
          return `Schedule added for ${log.details}`;
        } else if (log.type === "user") {
          return `User ${log.details} has been updated`;
        } else if (log.type === "department") {
          return `Department ${log.details} has been updated`;
        }
      case "Delete":
        return `${log.details} ${log.type} has been deleted`;
      default:
        return log.details;
    }
  };

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  const filteredActivity = selectedDate
    ? activity.filter(
        (log) =>
          new Date(log.timestamp).toISOString().split("T")[0] === selectedDate
      )
    : activity;

  // Sort the filteredActivity by timestamp in descending order
  const sortedActivity = filteredActivity.sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  return (
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-2xl font-medium">
            Activity Logs
          </span>
        </div>
        <div className="flex justify-center items-center h-[calc(100vh-4.5rem)] w-full">
          <div className="lg:w-5/6 w-[95%] lg:h-[35rem] h-[90%] p-4 bg-white rounded-lg shadow-md flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-black opacity-30">
                History
              </h2>
              <div className="flex items-center gap-2">
                <label htmlFor="date" className="text-gray-500 text-sm">
                  Date:
                </label>
                <input
                  className="px-2 py-1 border rounded-md text-gray-500 text-xs"
                  type="date"
                  value={selectedDate}
                  onChange={handleDateChange}
                />
              </div>
            </div>
            <ul className="flex flex-col gap-2 h-full overflow-y-auto scrollbar">
              {sortedActivity.map((log, index) => (
                <li
                  key={index}
                  className="flex items-center items-center p-2 rounded-lg gap-4 shadow-sm shadow-gray-500 hover:cursor-pointer"
                  style={{ backgroundColor: getBackgroundColor(log.action) }}
                >
                  <div className="flex items-center justify-center w-10 h-10 text-center text-gray-700 text-xl rounded-md opacity-80">
                    {getIcon(log.type)}
                  </div>
                  <div className="flex justify-between items-center w-full">
                    <div className="font-medium text-[0.7rem] md:text-sm text-gray-700">
                      {`
                        ${getActionMessage(log)} by ${
                        users.find((u) => u.user_id === log.user_id)
                          ?.first_name +
                        " " +
                        users.find((u) => u.user_id === log.user_id)
                          ?.middle_name +
                        " " +
                        users.find((u) => u.user_id === log.user_id)?.last_name
                      }
                      `}
                    </div>
                    <div className="text-[0.5rem] md:text-[0.7rem] text-gray-500 flex items-center justify-end md:w-1/4 w-2/3 px-2">
                      <span>{new Date(log.timestamp).toLocaleString()}</span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ActivityLog;
