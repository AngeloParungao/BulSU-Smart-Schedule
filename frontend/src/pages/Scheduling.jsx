import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Scheduling = () => {
  const url = process.env.REACT_APP_URL;
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const [schedules, setSchedules] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    toast.dismiss();
    fetchData();
  }, []);

  useEffect(() => {
    const sectionGroups = [
      ...new Set(
        sections
          .filter((section) => section.section_name === selectedSection)
          .map((section) => section.section_group)
      ),
    ];

    if (sectionGroups.length > 0) {
      setSelectedGroup(
        sectionGroups.includes("Group 1") ? "Group 1" : sectionGroups[0]
      );
    }
  }, [selectedSection, sections]);

  const fetchData = async () => {
    try {
      const [scheduleRes, sectionRes] = await Promise.all([
        axios.get(`${url}api/schedule/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/sections/fetch?dept_code=${currentDepartment}`),
      ]);
      setSchedules(scheduleRes.data);
      setSections(sectionRes.data);

      if (sectionRes.data.length > 0) {
        setSelectedSection(sectionRes.data[0].section_name.toString());
        setSelectedGroup(sectionRes.data[0].section_group.toString());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-3xl font-medium">Scheduling</span>
          <Navbar />
        </div>
        <div className="flex justify-between items-center w-full p-6 md:px-8">
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
            {currentDepartment !== "CICT" || currentDepartment !== "CIT" ? (
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
                  {sections.length === 0 ? (
                    <option value="Group">Group</option>
                  ) : (
                    sections
                      .filter(
                        (section) => section.section_name === selectedSection
                      )
                      .map((section, index) => (
                        <option key={index} value={section.section_group}>
                          {section.section_group}
                        </option>
                      ))
                  )}
                </select>
              </div>
            ) : null}
          </div>
          <div className="flex md:flex-row flex-col items-center md:gap-4 gap-2">
            <button className="bg-blue-400 hover:bg-blue-700 text-white md:text-sm text-xs font-bold py-2 w-24 rounded-lg">
              Add Item
            </button>
            <button className="bg-yellow-400 hover:bg-yellow-700 text-white md:text-sm text-xs font-bold py-2 w-24 rounded-lg">
              Edit Item
            </button>
            <button className="bg-red-400 hover:bg-red-700 text-white md:text-sm text-xs font-bold py-2 w-24 rounded-lg">
              Delete Item
            </button>
          </div>
        </div>
        <div className="timetable md:h-[calc(100vh-12rem)]" id="scheduleTable">
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
    </div>
  );
};

export default Scheduling;
