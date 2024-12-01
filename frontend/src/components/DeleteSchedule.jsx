import React, { useState, useEffect } from "react";
import axios from "axios";
import PasswordPrompt from "./PasswordPrompt";
import DeleteConfirmation from "./DeleteConfirmation";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function DeleteItem({ onClose, schedules, onRefreshSchedules, subjects }) {
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const url = process.env.REACT_APP_URL;
  const [allSchedules, setAllSchedules] = useState([]);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState([]);

  useEffect(() => {
    try {
      const fetchSchedules = async () => {
        const response = await axios.get(`${url}api/schedule/fetch`);
        setAllSchedules(response.data);
      };
      fetchSchedules();
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  }, []);

  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const sortedSchedules = schedules
    .filter((schedule) =>
      subjects.some((s) => s.subject_name === schedule.subject)
    )
    .sort(
      (a, b) =>
        daysOrder.indexOf(a.day) - daysOrder.indexOf(b.day) ||
        a.start_time.localeCompare(b.start_time)
    );

  const isDarkBackground = (backgroundColor) => {
    // Convert hex to RGB
    let r = parseInt(backgroundColor.slice(1, 3), 16);
    let g = parseInt(backgroundColor.slice(3, 5), 16);
    let b = parseInt(backgroundColor.slice(5, 7), 16);

    // Using luminance formula to determine if color is dark
    let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    return luminance < 0.5;
  };

  const selectAll = () => {
    if (sortedSchedules.length === selectedSchedules.length) {
      setSelectedSchedules([]);
    } else {
      const allScheduleIds = sortedSchedules.map(
        (schedule) => schedule.schedule_id
      );
      setSelectedSchedules(allScheduleIds);
    }
  };

  const handleCheckboxChange = (schedule) => {
    if (selectedSchedules.includes(schedule)) {
      setSelectedSchedules(selectedSchedules.filter((i) => i !== schedule));
    } else {
      setSelectedSchedules([...selectedSchedules, schedule]);
    }
  };

  const handleDelete = async () => {
    selectedSchedules.map((schedule) => {
      const scheduleData = allSchedules.find((s) => s.schedule_id === schedule);
      //check every subject if it is minor, if minor include the id of the other group
      if (scheduleData) {
        const otherGroup = allSchedules.find(
          (s) =>
            s.subject === scheduleData.subject &&
            s.class_type === scheduleData.class_type &&
            s.section_name === scheduleData.section_name &&
            s.section_group !== scheduleData.section_group &&
            s.day === scheduleData.day &&
            s.start_time === scheduleData.start_time &&
            s.end_time === scheduleData.end_time
        );
        if (otherGroup) {
          selectedSchedules.push(otherGroup.schedule_id);
        }
      }
    });

    // Prompt the user to confirm the deletion
    setShowDeleteConfirmation(false);
    if (selectedSchedules.length === 1) {
      try {
        await axios.delete(`${url}api/schedule/delete/`, {
          data: { schedule_ids: selectedSchedules },
        });

        // Log the deletion activity
        await axios.post(`${url}api/activity/adding`, {
          user_id: currentUser,
          department_code: currentDepartment,
          action: "Delete",
          details: `${selectedSchedules.length}`,
          type: "schedule",
        });

        toast.success("Deleted successfully!");
        setSelectedSchedules([]);
        onRefreshSchedules();
        setTimeout(onClose, 2000);
      } catch (error) {
        console.error("Error deleting data:", error);
        toast.error("Error deleting schedule.");
      }
    } else {
      setShowPasswordPrompt(true);
    }
  };

  const handlePasswordSubmit = async (password) => {
    try {
      // Fetch user data to validate password
      const response = await axios.post(`${url}api/auth/verify-password`, {
        user_id: currentUser,
        password: password,
      });

      // Check if the password is correct (isMatch: true)
      if (response.data.isMatch) {
        try {
          // Proceed with deletion
          await axios.delete(`${url}api/schedule/delete/`, {
            data: { schedule_ids: selectedSchedules },
          });

          // Log the deletion activity
          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Delete",
            details: `${selectedSchedules.length}`,
            type: "schedule",
          });

          toast.success("Deleted successfully!");
          setSelectedSchedules([]);
          onRefreshSchedules();
          setTimeout(onClose, 1000);
        } catch (error) {
          console.error("Error deleting data:", error);
          toast.error("Error deleting schedule.");
        }
      }
    } catch (error) {
      if (error.response.status === 401) {
        toast.error("Incorrect Password!");
      } else {
        console.error("Error verifying password:", error);
        toast.error("Error verifying password.");
      }
    } finally {
      setShowPasswordPrompt(false);
    }
  };

  const getSchedule = () => {
    const schedule = sortedSchedules.find(
      (schedule) => schedule.schedule_id === selectedSchedules[0]
    );
    return schedule
      ? `${schedule.day} ${schedule.start_time} - ${schedule.end_time}`
      : null;
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 h-screen w-screen fixed top-0 left-0 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-4 lg:w-1/2 w-[95%]">
        <div className="flex justify-between items-center border-b-2 pb-2">
          <input type="checkbox" onChange={selectAll} />
          <div className="text-xl text-red-500 font-semibold">
            Delete Schedules
          </div>
          <button onClick={onClose} className="text-red-500">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div>
          <div className="flex flex-col md:py-5 gap-2 md:p-6 py-2 max-h-[20rem] overflow-y-auto overflow-x-hidden scrollbar">
            {sortedSchedules.map((schedule) => (
              <div
                key={schedule.schedule_id}
                className="flex justify-between items-center border-b-2 p-2 py-4 rounded-lg hover:scale-[1.05] cursor-pointer transition-all duration-300"
                style={{ background: schedule.background_color }}
              >
                <div className="flex md:gap-4 gap-2 items-center">
                  <input
                    type="checkbox"
                    checked={selectedSchedules.includes(schedule.schedule_id)}
                    onChange={() => handleCheckboxChange(schedule.schedule_id)}
                  />
                  <span
                    className={`md:text-sm text-xs ${
                      isDarkBackground(schedule.background_color)
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {schedule.instructor}
                  </span>
                  <span
                    className={`md:text-xs text-[0.6rem] opacity-60 ${
                      isDarkBackground(schedule.background_color)
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {schedule.subject}
                  </span>
                </div>
                <div className="flex items-center md:gap-4 gap-2">
                  <span
                    className={`md:text-xs text-[0.6rem] opacity-60 ${
                      isDarkBackground(schedule.background_color)
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {schedule.room}
                  </span>
                  <span
                    className={`md:text-sm text-[0.6rem] ${
                      isDarkBackground(schedule.background_color)
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {schedule.day}
                  </span>
                  <span
                    className={`md:text-xs text-[0.5rem] opacity-80 ${
                      isDarkBackground(schedule.background_color)
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    ({schedule.start_time.slice(0, 2) % 12 || 12}:
                    {schedule.start_time.slice(3, 5)}{" "}
                    {schedule.start_time.slice(0, 2) >= 12 ? " PM" : " AM"} -{" "}
                    {schedule.end_time.slice(0, 2) % 12 || 12}:
                    {schedule.end_time.slice(3, 5)}{" "}
                    {schedule.end_time.slice(0, 2) >= 12 ? " PM" : " AM"})
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex justify-end">
            <button
              className="bg-red-500 text-white text-sm px-4 py-2 rounded hover:bg-red-600"
              onClick={() => setShowDeleteConfirmation(true)}
              disabled={selectedSchedules.length === 0}
            >
              Delete
            </button>
          </div>
        </div>
        {showDeleteConfirmation && (
          <DeleteConfirmation
            isOpen={showDeleteConfirmation}
            onRequestClose={() => setShowDeleteConfirmation(false)}
            category={selectedSchedules.length === 1 ? "Schedule" : "Schedules"}
            data={
              selectedSchedules.length === 1 ? getSchedule() : selectedSchedules
            }
            confirm={handleDelete}
          />
        )}
        {showPasswordPrompt && (
          <PasswordPrompt
            isOpen={showPasswordPrompt}
            onRequestClose={() => {
              setSelectedSchedules([]);
              setShowPasswordPrompt(false);
            }}
            onSubmit={handlePasswordSubmit}
          />
        )}
      </div>
    </div>
  );
}

export default DeleteItem;
