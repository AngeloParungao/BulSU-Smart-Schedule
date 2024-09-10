import React, { useState } from "react";
import axios from "axios";
import PasswordPrompt from "./PasswordPrompt";
import { toast } from "react-hot-toast";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

function DeleteItem({ onClose, schedule }) {
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userToken")));
  const url = process.env.REACT_APP_URL;
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [selectedSchedules, setSelectedSchedules] = useState([]);
  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  const sortedSchedules = [...schedule].sort(
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
    if (!selectedSchedules.length) {
      toast.error("Please select at least one instructor.");
      return;
    }
    // Prompt the user to confirm the deletion
    setShowPasswordPrompt(true);
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
            type: "Schedule",
          });

          toast.success("Deleted successfully!");
          setSelectedSchedules([]);
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

  return (
    <div className="bg-gray-800 bg-opacity-50 h-screen w-screen fixed top-0 left-0 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-4 w-1/3">
        <div className="flex justify-between items-center border-b-2 pb-2">
          <input type="checkbox" onChange={selectAll} />
          <div className="text-xl font-bold">Delete Schedules</div>
          <button onClick={onClose}>
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="mt-4">
          <div className="delete-list">
            {sortedSchedules.map((schedule) => (
              <div
                key={schedule.schedule_id}
                className="delete-item flex justify-between items-center border-b-2 py-2"
                style={{ background: schedule.background_color }}
              >
                <input
                  type="checkbox"
                  checked={selectedSchedules.includes(schedule.schedule_id)}
                  onChange={() => handleCheckboxChange(schedule.schedule_id)}
                />
                <div>
                  <span
                    className={`text-sm ${
                      isDarkBackground(schedule.background_color)
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {schedule.instructor}
                  </span>
                  <span
                    className={`text-sm ${
                      isDarkBackground(schedule.background_color)
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {schedule.subject}
                  </span>
                </div>
                <div>
                  <span
                    className={`text-sm ${
                      isDarkBackground(schedule.background_color)
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {schedule.room}
                  </span>
                  <span
                    className={`text-sm ${
                      isDarkBackground(schedule.background_color)
                        ? "text-white"
                        : "text-black"
                    }`}
                  >
                    {schedule.day}
                  </span>
                  <span
                    className={`text-sm ${
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
          <div className="delete-footer flex justify-end mt-4">
            <button
              className="delete-btn bg-red-500 text-white px-4 py-2 rounded"
              onClick={handleDelete}
            >
              Delete
            </button>
          </div>
        </div>
        <PasswordPrompt
          isOpen={showPasswordPrompt}
          onRequestClose={() => setShowPasswordPrompt(false)}
          onSubmit={handlePasswordSubmit}
        />
      </div>
    </div>
  );
}

export default DeleteItem;
