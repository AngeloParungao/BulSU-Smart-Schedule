import React, { useEffect, useState } from "react";
import axios from "axios";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DeleteItem from "../components/DeleteSchedule";
import UpdateItem from "../components/UpdateSchedule";
import AddItem from "../components/AddSchedule";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const Scheduling = () => {
  const url = process.env.REACT_APP_URL;
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const [schedules, setSchedules] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  const [showAddModal, setShowAddModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    toast.dismiss();
    fetchData();
    return () => {
      toast.dismiss();
    };
  }, []);

  const fetchData = async () => {
    try {
      const [scheduleRes, sectionRes] = await Promise.all([
        axios.get(`${url}api/schedule/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/sections/fetch?dept_code=${currentDepartment}`),
      ]);
      setSchedules(scheduleRes.data);
      setSections(sectionRes.data);

      if (scheduleRes.data.length > 0) {
        if (selectedSection === "")
          setSelectedSection(scheduleRes.data[0].section_name);
        if (selectedGroup === "")
          setSelectedGroup(scheduleRes.data[0].section_group);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const refreshData = () => {
    fetchData();
  };

  const handleEditItemClick = (item) => {
    setItemToEdit(item);
    setShowListModal(false);
    setShowUpdateModal(true);
  };

  const daysOfWeek = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  const rowSpans = Array(daysOfWeek.length).fill(0);
  const timesOfDay = [
    { startTime: "07:00:00", endTime: "08:00:00" },
    { startTime: "08:00:00", endTime: "09:00:00" },
    { startTime: "09:00:00", endTime: "10:00:00" },
    { startTime: "10:00:00", endTime: "11:00:00" },
    { startTime: "11:00:00", endTime: "12:00:00" },
    { startTime: "12:00:00", endTime: "13:00:00" },
    { startTime: "13:00:00", endTime: "14:00:00" },
    { startTime: "14:00:00", endTime: "15:00:00" },
    { startTime: "15:00:00", endTime: "16:00:00" },
    { startTime: "16:00:00", endTime: "17:00:00" },
    { startTime: "17:00:00", endTime: "18:00:00" },
    { startTime: "18:00:00", endTime: "19:00:00" },
    { startTime: "19:00:00", endTime: "20:00:00" },
  ];

  const calculateRowSpan = (startTime, endTime) => {
    const startHour = parseInt(startTime.split(":")[0], 10);
    const endHour = parseInt(endTime.split(":")[0], 10);
    return endHour - startHour;
  };

  const isDarkBackground = (backgroundColor) => {
    // Convert hex to RGB
    let r = parseInt(backgroundColor.slice(1, 3), 16);
    let g = parseInt(backgroundColor.slice(3, 5), 16);
    let b = parseInt(backgroundColor.slice(5, 7), 16);

    // Using luminance formula to determine if color is dark
    let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    return luminance < 0.5;
  };

  return (
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <Toaster
        position="bottom-right"
        containerStyle={{ zIndex: 99999 }}
        reverseOrder={false}
      />
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-3xl font-medium">Scheduling</span>
          <Navbar />
        </div>
        <div className="flex justify-between items-center w-full p-5 md:px-8">
          <div className="flex md:flex-row flex-col gap-4">
            <div className="flex items-center gap-4 ">
              <label
                htmlFor="section"
                className="font-semibold text-sm text-[var(--text-color)]"
              >
                Section:
              </label>
              <select
                name="section"
                id="section"
                value={selectedSection}
                onChange={(e) => setSelectedSection(e.target.value)}
                className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
              >
                {sections.length === 0 ? (
                  <option value="Section">Section</option>
                ) : (
                  [...new Set(sections.map((s) => s.section_name))].map(
                    (section, index) => (
                      <option key={index} value={section}>
                        {section}
                      </option>
                    )
                  )
                )}
              </select>
            </div>
            {sections
              .filter((section) => section.section_name === selectedSection)
              .some((section) => section.section_group) && (
              <div className="flex items-center gap-4">
                <label
                  htmlFor="group"
                  className="font-semibold text-sm text-[var(--text-color)]"
                >
                  Group:
                </label>
                <select
                  name="group"
                  id="group"
                  value={selectedGroup}
                  onChange={(e) => setSelectedGroup(e.target.value)}
                  className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                >
                  {sections
                    .filter(
                      (section) => section.section_name === selectedSection
                    )
                    .map((section, index) => (
                      <option key={index} value={section.section_group}>
                        {section.section_group}
                      </option>
                    ))}
                </select>
              </div>
            )}
          </div>
          <div className="flex md:flex-row flex-col items-center md:gap-4 gap-2">
            <button
              className="bg-blue-400 hover:bg-blue-500 text-white md:text-sm text-xs font-semibold py-2 w-24 rounded-lg"
              onClick={() => setShowAddModal(true)}
            >
              Add Item
            </button>
            <button
              className="bg-yellow-400 hover:bg-yellow-500 text-white md:text-sm text-xs font-semibold py-2 w-24 rounded-lg"
              onClick={() => setShowListModal(true)}
            >
              Edit Item
            </button>
            <button
              className="bg-red-400 hover:bg-red-500 text-white md:text-sm text-xs font-semibold py-2 w-24 rounded-lg"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Item
            </button>
          </div>
        </div>
        <div className="timetable md:h-[calc(100vh-10rem)]" id="scheduleTable">
          <div className="h-full w-[95%] bg-white p-4 border rounded-lg border-gray-300">
            <table>
              <thead>
                <tr>
                  <th></th>
                  {daysOfWeek.map((day) => (
                    <th key={day}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {timesOfDay.map((time) => (
                  <tr key={time.startTime}>
                    <td>
                      <span className="time">
                        {time.startTime.slice(0, 2) % 12 || 12}:
                        {time.startTime.slice(3, 5)}{" "}
                        {time.startTime.slice(0, 2) >= 12 ? "PM" : "AM"} -{" "}
                        {time.endTime.slice(0, 2) % 12 || 12}:
                        {time.endTime.slice(3, 5)}{" "}
                        {time.endTime.slice(0, 2) >= 12 ? "PM" : "AM"}
                      </span>
                    </td>
                    {daysOfWeek.map((day, dayIndex) => {
                      if (rowSpans[dayIndex] > 0) {
                        rowSpans[dayIndex]--;
                        return null;
                      }

                      const scheduleItem = schedules.find(
                        (item) =>
                          item.start_time === time.startTime &&
                          item.day === day &&
                          item.section_name === selectedSection &&
                          item.section_group === selectedGroup
                      );

                      // Calculate rowSpan if there's a schedule item
                      let rowSpan = 1;
                      if (scheduleItem) {
                        rowSpan = calculateRowSpan(
                          scheduleItem.start_time,
                          scheduleItem.end_time
                        );
                        rowSpans[dayIndex] = rowSpan - 1; // Set the remaining rowSpan for this column
                      }

                      return (
                        <td
                          key={`${time.startTime}-${day}`}
                          rowSpan={rowSpan}
                          style={{
                            backgroundColor: scheduleItem?.background_color,
                          }}
                          className="sched"
                        >
                          {scheduleItem && (
                            <>
                              <div
                                className="subject-name"
                                style={{
                                  color: isDarkBackground(
                                    scheduleItem.background_color
                                  )
                                    ? "white"
                                    : "black",
                                }}
                              >
                                {scheduleItem.subject}
                              </div>
                              <div
                                className="instructor-name"
                                style={{
                                  color: isDarkBackground(
                                    scheduleItem.background_color
                                  )
                                    ? "white"
                                    : "black",
                                }}
                              >
                                {scheduleItem.instructor}
                              </div>
                              <div
                                className="room-name"
                                style={{
                                  color: isDarkBackground(
                                    scheduleItem.background_color
                                  )
                                    ? "white"
                                    : "black",
                                }}
                              >
                                ({scheduleItem.room})
                              </div>
                            </>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      {showAddModal && (
        <AddItem
          onClose={() => setShowAddModal(false)}
          section={selectedSection}
          group={selectedGroup}
          onRefreshSchedules={refreshData}
        />
      )}
      {showListModal && (
        <ListOfItem
          onClose={() => setShowListModal(false)}
          schedules={schedules.filter(
            (schedule) =>
              schedule.section_name === selectedSection &&
              schedule.section_group === selectedGroup
          )}
          onUpdateSchedule={handleEditItemClick}
        />
      )}
      {showUpdateModal && (
        <UpdateItem
          onClose={() => setShowUpdateModal(false)}
          item={itemToEdit}
          onRefreshSchedules={refreshData}
        />
      )}
      {showDeleteModal && (
        <DeleteItem
          onClose={() => setShowDeleteModal(false)}
          schedule={schedules.filter(
            (schedule) =>
              schedule.section_name === selectedSection &&
              schedule.section_group === selectedGroup
          )}
          onRefreshSchedules={refreshData}
        />
      )}
    </div>
  );
};

function ListOfItem({ onClose, schedules, onUpdateSchedule }) {
  // Define the order of days
  const daysOrder = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
  ];

  // Function to get the index of the day
  const getDayIndex = (day) => {
    return daysOrder.indexOf(day);
  };

  // Sort schedules by day and then by start time
  const sortedSchedules = [...schedules].sort((a, b) => {
    const dayComparison = getDayIndex(a.day) - getDayIndex(b.day);
    if (dayComparison !== 0) {
      return dayComparison;
    }
    // Compare by start time if days are the same
    return a.start_time.localeCompare(b.start_time);
  });

  const isDarkBackground = (backgroundColor) => {
    // Convert hex to RGB
    let r = parseInt(backgroundColor.slice(1, 3), 16);
    let g = parseInt(backgroundColor.slice(3, 5), 16);
    let b = parseInt(backgroundColor.slice(5, 7), 16);

    // Using luminance formula to determine if color is dark
    let luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

    return luminance < 0.5;
  };

  return (
    <div className="bg-gray-800 bg-opacity-50 h-screen w-screen fixed top-0 left-0 z-50 flex justify-center items-center">
      <div className="bg-white rounded-lg p-4 lg:w-1/2 w-[95%]">
        <div className="flex justify-between items-center border-b-2 pb-2">
          <div className="text-xl text-orange-500 font-semibold">
            Update Schedule
          </div>
          <button onClick={onClose} className="text-orange-500">
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className="flex flex-col gap-2 md:p-6 py-2 max-h-[20rem] overflow-y-auto overflow-x-hidden scrollbar">
          {sortedSchedules.map((schedule) => (
            <div
              key={schedule.schedule_id}
              className="flex justify-between items-center border-b-2 p-2 py-4 rounded-lg hover:scale-[1.05] cursor-pointer transition-all duration-300"
              style={{ background: schedule.background_color }}
              onClick={() => onUpdateSchedule(schedule)}
            >
              <div className="flex md:gap-4 gap-2 items-center">
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
                  {schedule.start_time.slice(0, 2) > 12 ? " PM" : " AM"}-
                  {schedule.end_time.slice(0, 2) % 12 || 12}:
                  {schedule.end_time.slice(3, 5)}{" "}
                  {schedule.end_time.slice(0, 2) < 12 ? " AM" : " PM"})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Scheduling;
