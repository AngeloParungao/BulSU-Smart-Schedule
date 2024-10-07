import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { exportToCSV } from "../utils/exportToCSV";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const Report = ({ schedules, isOpen, onClose }) => {
  const url = process.env.REACT_APP_URL;
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentRole = atob(localStorage.getItem("userRole"));
  const [instructors, setInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [csvPreview, setCsvPreview] = useState([]); // State for CSV preview
  const [data, setData] = useState({
    department: currentRole === "Administrator" ? "" : currentDepartment,
    instructor: "",
    subject: "",
    room: "",
    day: "",
  });

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    generateCsvPreview(); // Generate preview whenever filters change
  }, [data, schedules]);

  const fetchData = async () => {
    try {
      const [instructorRes, departmentRes, subjectRes, roomRes] =
        await Promise.all([
          axios.get(
            `${url}api/instructors/fetch?dept_code=${currentDepartment}`
          ),
          axios.get(
            `${url}api/departments/fetch?dept_code=${currentDepartment}`
          ),
          axios.get(`${url}api/subjects/fetch?dept_code=${currentDepartment}`),
          axios.get(`${url}api/rooms/fetch`),
        ]);
      setInstructors(instructorRes.data);
      setDepartments(departmentRes.data);
      setSubjects(subjectRes.data);
      setRooms(roomRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const generateCsvPreview = () => {
    // Filter the schedules based on form data
    const filteredSchedules = schedules.filter((schedule) => {
      return (
        (!data.department || schedule.department_code === data.department) &&
        (!data.instructor || schedule.instructor === data.instructor) &&
        (!data.subject || schedule.subject === data.subject) &&
        (!data.room || schedule.room === data.room) &&
        (!data.day || schedule.day === data.day)
      );
    });

    const groupedSchedules = {};

    filteredSchedules.forEach((schedule) => {
      const key = `${schedule.day}-${schedule.start_time}-${schedule.end_time}-${schedule.subject}-${schedule.section_name}`;

      if (!groupedSchedules[key]) {
        groupedSchedules[key] = {
          ...schedule,
          section_group: [schedule.section_group],
        };
      } else {
        groupedSchedules[key].section_group.push(schedule.section_group);
      }
    });

    const previewData = Object.values(groupedSchedules).map((schedule) => {
      const uniqueGroups = Array.from(new Set(schedule.section_group));

      const sortedGroups = uniqueGroups.sort((a, b) => {
        if (a === "Group 1") return -1;
        if (b === "Group 1") return 1;
        return 0;
      });

      return [
        schedule.day,
        schedule.start_time,
        schedule.end_time,
        schedule.room,
        schedule.room_building,
        schedule.subject,
        schedule.instructor,
        schedule.section_name,
        sortedGroups.join(" and "),
        schedule.department_code,
      ];
    });

    // Sort data by department_code
    previewData.sort((a, b) => {
      if (a[9] < b[9]) return -1;
      if (a[9] > b[9]) return 1;
      return 0;
    });

    setCsvPreview([...previewData]);
  };

  const handleExportCSV = () => {
    const headers = [
      "Day",
      "Start Time",
      "End Time",
      "Room",
      "Building",
      "Course",
      "Instructor",
      "Section",
      "Group",
      "Department",
    ];
    exportToCSV("report", headers, csvPreview);
  };

  const customStyles = {
    overlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
    },
    content: {
      width: "95%",
      height: "95%",
      padding: "1rem",
      background: "#fff",
      borderRadius: "0.5rem",
      boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
      position: "relative",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: "1rem",
      inset: "auto", // removes the default positioning
      fontFamily: '"Poppins", sans-serif',
    },
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      style={customStyles}
      appElement={document.getElementById("root")}
    >
      <div className="flex bg-white w-full h-full">
        <div className="flex lg:flex-row flex-col gap-4 w-full h-[calc(100vh-4.5rem)]">
          <form className="flex flex-col gap-4 lg:w-[20rem] w-full">
            <span className="font-medium text-lg text-gray-500">
              FILTER REPORT
            </span>
            {currentRole === "Administrator" && (
              <div className="flex flex-col">
                <label htmlFor="department">Department</label>
                <select
                  name="department"
                  value={data.department}
                  onChange={(e) =>
                    setData({ ...data, department: e.target.value })
                  }
                  className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}"
                >
                  <option value="">Department</option>
                  {departments.map((department, index) => (
                    <option key={index} value={department.department_code}>
                      {department.department_code}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="flex flex-col">
              <label htmlFor="instructor">Instructors</label>
              <select
                name="instructor"
                value={data.instructor}
                onChange={(e) =>
                  setData({ ...data, instructor: e.target.value })
                }
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}"
              >
                <option value="">Instructor</option>
                {instructors
                  .filter((instructor) => {
                    return data.department
                      ? instructor.department_code === data.department
                      : true;
                  })
                  .map((instructor, index) => (
                    <option
                      key={index}
                      value={`${instructor.first_name} ${instructor.middle_name} ${instructor.last_name}`}
                    >
                      {instructor.first_name} {instructor.middle_name}
                      {instructor.last_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="subject">Subjects</label>
              <select
                name="subject"
                value={data.subject}
                onChange={(e) => setData({ ...data, subject: e.target.value })}
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}"
              >
                <option value="">Subject</option>
                {data.instructor
                  ? Array.from(
                      new Set(
                        schedules
                          .filter(
                            (schedule) =>
                              schedule.instructor === data.instructor &&
                              (!data.department ||
                                schedule.department_code === data.department)
                          )
                          .map((schedule) => schedule.subject) // Extract subject names
                      )
                    ).map((subject, index) => (
                      <option key={index} value={subject}>
                        {subject}
                      </option>
                    ))
                  : subjects
                      .filter((subject) =>
                        data.department
                          ? subject.department_code === data.department
                          : true
                      )
                      .map((subject, index) => (
                        <option key={index} value={subject.subject_name}>
                          {subject.subject_name}
                        </option>
                      ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="room">Rooms</label>
              <select
                name="room"
                value={data.room}
                onChange={(e) => setData({ ...data, room: e.target.value })}
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}"
              >
                <option value="">Room</option>
                {rooms
                  .filter((room) => {
                    return data.department
                      ? room.department_code === data.department
                      : true;
                  })
                  .map((room, index) => (
                    <option key={index} value={room.room_name}>
                      {room.room_name}
                    </option>
                  ))}
              </select>
            </div>
            <div className="flex flex-col">
              <label htmlFor="day">Day</label>
              <select
                name="day"
                value={data.day}
                onChange={(e) => setData({ ...data, day: e.target.value })}
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}"
              >
                <option value="">Day</option>
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
              </select>
            </div>
            <button
              type="button"
              className="bg-blue-500 text-white px-4 py-2 rounded-md mt-4 hover:bg-blue-600"
              onClick={handleExportCSV}
            >
              Export CSV
            </button>
          </form>
          <div className="flex flex-col items-end h-full flex-1 gap-4 w-full">
            <h3 className="text-xl font-semibold mb-2 uppercase opacity-40">
              Preview
            </h3>
            <div className="overflow-y-auto w-full h-[35rem] p-2 border border-gray-300 rounded-lg scrollbar bg-[#f5f5f5]">
              <table className="w-full border-collapse border border-gray-300 bg-white">
                <thead>
                  <tr>
                    {[
                      "Day",
                      "Start",
                      "End",
                      "Room",
                      "Building",
                      "Course",
                      "Instructor",
                      "Section",
                      "Group",
                      "Department",
                    ].map((header, index) => (
                      <th
                        key={index}
                        className="lg:text-sm md:text-xs text-[0.45rem] font-semibold border border-gray-300 md:p-2 bg-gray-200"
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-center text-sm">
                  {csvPreview.length > 0 ? (
                    csvPreview.map((row, rowIndex) => (
                      <tr key={rowIndex}>
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="border border-gray-300 md:p-2 text-[0.4rem] lg:text-sm md:text-xs"
                          >
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="10" className="text-center p-2">
                        No data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default Report;
