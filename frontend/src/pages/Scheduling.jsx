import React, { useEffect, useState } from "react";
import axios from "axios";
import io from "socket.io-client";
import { Toaster, toast } from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import DeleteItem from "../components/DeleteSchedule";
import UpdateItem from "../components/UpdateSchedule";
import AddItem from "../components/AddSchedule";
import AddInstructorSchedule from "../components/AddInstructorSchedule";
import DeleteInstructorSchedule from "../components/DeleteInstructorSchedule";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const Scheduling = () => {
  const url = process.env.REACT_APP_URL;
  const socket = io(url); // Replace with your server URL
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const [departments, setDepartments] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [sections, setSections] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [category, setCategory] = useState("section");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedSemester, setSelectedSemester] = useState("");

  const [showDepartmentOptions, setShowDepartmentOptions] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showListModal, setShowListModal] = useState(false);
  const [itemToEdit, setItemToEdit] = useState(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    let updateScheduled = false;

    const handleEvent = (data) => {
      console.log("Event received:", data);

      // Only schedule an update if one isn't already scheduled
      if (!updateScheduled) {
        updateScheduled = true;

        setTimeout(() => {
          fetchData(); // Fetch the data
          updateScheduled = false; // Reset for the next batch
        }, 5000); // Wait 5 seconds before fetching data
      }
    };

    // Listen for events and batch updates
    socket.on("schedule-added", handleEvent);
    socket.on("schedule-updated", handleEvent);
    socket.on("schedules-published", handleEvent);
    socket.on("schedule-deleted", handleEvent);

    // Clean up on component unmount
    return () => {
      toast.dismiss();
      socket.off("schedule-added", handleEvent);
      socket.off("schedule-updated", handleEvent);
      socket.off("schedules-published", handleEvent);
      socket.off("schedule-deleted", handleEvent);
    };
  }, []);

  useEffect(() => {
    if (
      !(
        currentDepartment === "LSSD (LSSD)" ||
        currentDepartment === "NSMD (NSMD)"
      )
    ) {
      setSelectedDepartment(currentDepartment);
    } else {
      setShowDepartmentOptions(true);
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (
      currentDepartment === "LSSD (LSSD)" ||
      currentDepartment === "NSMD (NSMD)"
    ) {
      if (category === "instructor") {
        setShowDepartmentOptions(false);
        setSelectedDepartment(currentDepartment);
      } else {
        setShowDepartmentOptions(true);
      }
    } else {
      setShowDepartmentOptions(false);
      setSelectedDepartment(currentDepartment);
    }
  }, [category]);

  const fetchData = async () => {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const [
        departmentRes,
        scheduleRes,
        instructorRes,
        sectionRes,
        subjectRes,
      ] = await Promise.all([
        axios.get(`${url}api/departments/fetch`),
        axios.get(`${url}api/schedule/fetch`),
        axios.get(`${url}api/instructors/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/sections/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/subjects/fetch?dept_code=${currentDepartment}`),
      ]);

      if (month >= 1 && month <= 5) {
        setSelectedSemester(() =>
          selectedSemester ? selectedSemester : "2nd"
        );
        setSchedules(
          scheduleRes.data.filter(
            (item) =>
              item.academic_year === `${year - 1}-${year}` &&
              (item.semester === "1st" || item.semester === "2nd")
          )
        );
      } else if (month >= 6 && month <= 12) {
        setSelectedSemester(() =>
          selectedSemester ? selectedSemester : "1st"
        );
        setSchedules(
          scheduleRes.data.filter(
            (item) =>
              item.academic_year === `${year}-${year + 1}` &&
              (item.semester === "1st" || item.semester === "2nd")
          )
        );
      }
      setInstructors(instructorRes.data);
      setDepartments(departmentRes.data);
      setSections(sectionRes.data);
      setSubjects(subjectRes.data);
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
    { startTime: "07:00:00", endTime: "07:30:00" },
    { startTime: "07:30:00", endTime: "08:00:00" },
    { startTime: "08:00:00", endTime: "08:30:00" },
    { startTime: "08:30:00", endTime: "09:00:00" },
    { startTime: "09:00:00", endTime: "09:30:00" },
    { startTime: "09:30:00", endTime: "10:00:00" },
    { startTime: "10:00:00", endTime: "10:30:00" },
    { startTime: "10:30:00", endTime: "11:00:00" },
    { startTime: "11:00:00", endTime: "11:30:00" },
    { startTime: "11:30:00", endTime: "12:00:00" },
    { startTime: "12:00:00", endTime: "12:30:00" },
    { startTime: "12:30:00", endTime: "13:00:00" },
    { startTime: "13:00:00", endTime: "13:30:00" },
    { startTime: "13:30:00", endTime: "14:00:00" },
    { startTime: "14:00:00", endTime: "14:30:00" },
    { startTime: "14:30:00", endTime: "15:00:00" },
    { startTime: "15:00:00", endTime: "15:30:00" },
    { startTime: "15:30:00", endTime: "16:00:00" },
    { startTime: "16:00:00", endTime: "16:30:00" },
    { startTime: "16:30:00", endTime: "17:00:00" },
    { startTime: "17:00:00", endTime: "17:30:00" },
    { startTime: "17:30:00", endTime: "18:00:00" },
    { startTime: "18:00:00", endTime: "18:30:00" },
    { startTime: "18:30:00", endTime: "19:00:00" },
    { startTime: "19:00:00", endTime: "19:30:00" },
    { startTime: "19:30:00", endTime: "20:00:00" },
  ];

  const calculateRowSpan = (startTime, endTime) => {
    const startMinutes =
      parseInt(startTime.split(":")[0], 10) * 60 +
      parseInt(startTime.split(":")[1], 10);
    const endMinutes =
      parseInt(endTime.split(":")[0], 10) * 60 +
      parseInt(endTime.split(":")[1], 10);
    return (endMinutes - startMinutes) / 30;
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
          <span className="md:text-4xl text-2xl font-medium">Scheduling</span>
          <Navbar />
        </div>
        <div className="flex justify-between items-center w-full p-3 md:px-8">
          <span className="md:text-3xl text-xl font-medium text-green-500">
            {category === "instructor"
              ? selectedInstructor
                ? selectedInstructor
                : "Instructor"
              : selectedSection
              ? `${selectedSection} ${
                  selectedGroup ? `- ${selectedGroup}` : ""
                }`
              : "Section"}
          </span>
        </div>
        <div className="flex justify-between w-full p-3 md:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex lg:flex-row flex-col gap-4">
              <div className="flex items-center gap-2">
                <label
                  htmlFor="category"
                  className="font-semibold text-sm text-[var(--text-color)]"
                >
                  Schedule for:
                </label>
                <select
                  name="category"
                  id="category"
                  value={category}
                  onChange={(e) => {
                    setSelectedDepartment("");
                    setSelectedInstructor("");
                    setSelectedSection("");
                    setSelectedGroup("");
                    setCategory(e.target.value);
                  }}
                  className="w-[6rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                >
                  <option value="section">Section</option>
                  <option value="instructor">Instructor</option>
                </select>
              </div>
              <div className="flex items-center gap-2">
                <label
                  htmlFor="semester"
                  className="font-semibold text-sm text-[var(--text-color)]"
                >
                  Semester:
                </label>
                <select
                  name="semester:"
                  id="semester:"
                  value={selectedSemester}
                  onChange={(e) => {
                    setSelectedSemester(e.target.value);
                  }}
                  className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                >
                  <option value="1st">1st Semester</option>
                  <option value="2nd">2nd Semester</option>
                </select>
              </div>
            </div>
            <div className="flex lg:flex-row flex-col gap-4">
              {showDepartmentOptions && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="department"
                    className="font-semibold text-sm text-[var(--text-color)]"
                  >
                    Department:
                  </label>
                  <select
                    name="department"
                    id="department"
                    value={selectedDepartment}
                    onChange={(e) => {
                      setSelectedInstructor("");
                      setSelectedSection("");
                      setSelectedGroup("");
                      setSelectedDepartment(e.target.value);
                    }}
                    className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                  >
                    <option value="">Department</option>
                    {departments.map(
                      (department, index) =>
                        department.department_code !== "LSSD (LSSD)" &&
                        department.department_code !== "NSMD (NSMD)" && (
                          <option
                            key={index}
                            value={department.department_code}
                          >
                            {department.department_code}
                          </option>
                        )
                    )}
                  </select>
                </div>
              )}
              {category === "instructor" && (
                <div className="flex items-center gap-2">
                  <label
                    htmlFor="instructor"
                    className="font-semibold text-sm text-[var(--text-color)]"
                  >
                    Instructor:
                  </label>
                  <select
                    name="instructor"
                    id="instructor"
                    value={selectedInstructor}
                    onChange={(e) => setSelectedInstructor(e.target.value)}
                    className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                  >
                    <option value="Instructor">Instructor</option>
                    {instructors
                      .filter(
                        (instructor) =>
                          instructor.department_code === selectedDepartment
                      )
                      .sort((a, b) => a.first_name.localeCompare(b.first_name))
                      .map((instructor, index) => (
                        <option
                          key={index}
                          value={`${instructor.first_name} ${instructor.middle_name} ${instructor.last_name}`}
                        >
                          {`${instructor.first_name} ${instructor.middle_name} ${instructor.last_name}`}
                        </option>
                      ))
                      .sort()}
                  </select>
                </div>
              )}
              {category === "section" && (
                <>
                  <div className="flex items-center gap-2">
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
                      onChange={(e) => {
                        const selectedSectionName = e.target.value;
                        setSelectedSection(selectedSectionName);

                        // Automatically select the first group of the selected section
                        const sectionGroups = sections.filter(
                          (section) =>
                            section.section_name === selectedSectionName
                        );

                        if (sectionGroups.length > 0) {
                          setSelectedGroup(sectionGroups[0].section_group); // Set first group
                        } else {
                          setSelectedGroup(""); // No group available
                        }
                      }}
                      className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                    >
                      <option value="">Section</option>
                      {Array.from(
                        new Set(
                          sections
                            .filter(
                              (section) =>
                                section.department_code === selectedDepartment
                            )
                            .map((section) => section.section_name)
                            .sort()
                        )
                      ).map((sectionName, index) => (
                        <option key={index} value={sectionName}>
                          {sectionName}
                        </option>
                      ))}
                    </select>
                  </div>
                  {sections
                    .filter(
                      (section) => section.section_name === selectedSection
                    )
                    .some((section) => section.section_group) && (
                    <div className="flex items-center gap-2">
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
                            (section) =>
                              section.section_name === selectedSection
                          )
                          .map((section, index) => (
                            <option key={index} value={section.section_group}>
                              {section.section_group}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
          <div className="flex md:flex-row flex-col items-end md:gap-4 gap-2">
            {currentDepartment === "LSSD (LSSD)" ||
            currentDepartment === "NSMD (NSMD)" ? (
              schedules.filter(
                (schedule) =>
                  schedule.is_published === 1 &&
                  schedule.department_code === selectedDepartment
              ).length > 0 ||
              selectedDepartment === "" ||
              category === "instructor" ? (
                <>
                  <button
                    className="bg-blue-400 hover:bg-blue-500 text-white md:text-sm text-xs font-semibold py-2 w-24 rounded-lg"
                    onClick={() => {
                      if (category === "instructor") {
                        if (!selectedInstructor) {
                          toast.error("Please select an instructor");
                          return;
                        }
                      } else if (category === "section") {
                        if (!selectedSection) {
                          toast.error("Please select a section and group");
                          return;
                        }
                      }
                      setShowAddModal(true);
                    }}
                  >
                    Add Item
                  </button>
                  <button
                    className="bg-yellow-400 hover:bg-yellow-500 text-white md:text-sm text-xs font-semibold py-2 w-24 rounded-lg"
                    onClick={() => {
                      if (category === "instructor") {
                        if (!selectedInstructor) {
                          toast.error("Please select an instructor");
                          return;
                        }
                      } else if (category === "section") {
                        if (!selectedSection) {
                          toast.error("Please select a section and group");
                          return;
                        }
                      }
                      setShowListModal(true);
                    }}
                  >
                    Edit Item
                  </button>
                  <button
                    className="bg-red-400 hover:bg-red-500 text-white md:text-sm text-xs font-semibold py-2 w-24 rounded-lg"
                    onClick={() => {
                      if (category === "instructor") {
                        if (!selectedInstructor) {
                          toast.error("Please select an instructor");
                          return;
                        }
                      } else if (category === "section") {
                        if (!selectedSection) {
                          toast.error("Please select a section and group");
                          return;
                        }
                      }
                      setShowDeleteModal(true);
                    }}
                  >
                    Delete Item
                  </button>
                </>
              ) : (
                <span className="text-red-500 md:text-sm text-xs">
                  Schedule for this department is not yet published
                </span>
              )
            ) : (
              <>
                <button
                  className="bg-blue-400 hover:bg-blue-500 text-white md:text-sm text-xs font-semibold py-2 w-24 rounded-lg"
                  onClick={() => {
                    if (category === "instructor") {
                      if (!selectedInstructor) {
                        toast.error("Please select an instructor");
                        return;
                      }
                    } else if (category === "section") {
                      if (!selectedSection) {
                        toast.error("Please select a section and group");
                        return;
                      }
                    }
                    setShowAddModal(true);
                  }}
                >
                  Add Item
                </button>
                <button
                  className="bg-yellow-400 hover:bg-yellow-500 text-white md:text-sm text-xs font-semibold py-2 w-24 rounded-lg"
                  onClick={() => {
                    if (category === "instructor") {
                      if (!selectedInstructor) {
                        toast.error("Please select an instructor");
                        return;
                      }
                    } else if (category === "section") {
                      if (!selectedSection) {
                        toast.error("Please select a section and group");
                        return;
                      }
                    }
                    setShowListModal(true);
                  }}
                >
                  Edit Item
                </button>
                <button
                  className="bg-red-400 hover:bg-red-500 text-white md:text-sm text-xs font-semibold py-2 w-24 rounded-lg"
                  onClick={() => {
                    if (category === "instructor") {
                      if (!selectedInstructor) {
                        toast.error("Please select an instructor");
                        return;
                      }
                    } else if (category === "section") {
                      if (!selectedSection) {
                        toast.error("Please select a section and group");
                        return;
                      }
                    }
                    setShowDeleteModal(true);
                  }}
                >
                  Delete Item
                </button>
              </>
            )}
          </div>
        </div>
        <div className="timetable md:h-[calc(100vh-15rem)]" id="scheduleTable">
          <div className="h-full w-[95%] bg-white p-4 border rounded-lg border-gray-300 overflow-y-auto ">
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
                          ((item.section_name === selectedSection &&
                            item.section_group === selectedGroup) ||
                            item.instructor === selectedInstructor) &&
                          item.semester === selectedSemester
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
                              {category === "instructor" && (
                                <div
                                  className="section-name"
                                  style={{
                                    color: isDarkBackground(
                                      scheduleItem.background_color
                                    )
                                      ? "white"
                                      : "black",
                                  }}
                                >
                                  {scheduleItem.section_name}
                                  {scheduleItem.section_group && (
                                    <>
                                      - (
                                      {schedules
                                        .filter(
                                          (item) =>
                                            item.start_time ===
                                              time.startTime &&
                                            item.day === day &&
                                            item.instructor ===
                                              selectedInstructor &&
                                            item.semester === selectedSemester
                                        )
                                        .sort((a, b) =>
                                          a.section_group.localeCompare(
                                            b.section_group
                                          )
                                        )
                                        .map(
                                          (item) =>
                                            `G${
                                              item.section_group.split(" ")[1]
                                            }`
                                        )
                                        .join(", ")}
                                      )
                                    </>
                                  )}
                                </div>
                              )}
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
      {showAddModal &&
        (category === "section" ? (
          <AddItem
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            section={selectedSection}
            group={selectedGroup}
            semester={selectedSemester}
            department={
              currentDepartment === "LSSD (LSSD)" ||
              currentDepartment === "NSMD (NSMD)"
                ? selectedDepartment
                : currentDepartment
            }
            onRefreshSchedules={refreshData}
          />
        ) : (
          <AddInstructorSchedule
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
            instructor_name={selectedInstructor}
            semester={selectedSemester}
            department={
              currentDepartment === "LSSD (LSSD)" ||
              currentDepartment === "NSMD (NSMD)"
                ? selectedDepartment
                : currentDepartment
            }
            onRefreshSchedules={refreshData}
          />
        ))}
      {showListModal && (
        <ListOfItem
          onClose={() => setShowListModal(false)}
          schedules={schedules.filter(
            (schedule) =>
              schedule.section_name === selectedSection &&
              schedule.section_group === selectedGroup &&
              schedule.semester === selectedSemester
          )}
          subjects={subjects}
          onUpdateSchedule={handleEditItemClick}
        />
      )}
      {showUpdateModal && (
        <UpdateItem
          isOpen={showUpdateModal}
          onClose={() => setShowUpdateModal(false)}
          item={itemToEdit}
          semester={selectedSemester}
          onRefreshSchedules={refreshData}
        />
      )}
      {showDeleteModal &&
        (category === "section" ? (
          <DeleteItem
            onClose={() => setShowDeleteModal(false)}
            schedules={schedules.filter(
              (schedule) =>
                schedule.section_name === selectedSection &&
                schedule.section_group === selectedGroup &&
                schedule.semester === selectedSemester
            )}
            subjects={subjects}
            onRefreshSchedules={refreshData}
          />
        ) : (
          <DeleteInstructorSchedule
            onClose={() => setShowDeleteModal(false)}
            schedules={schedules.filter(
              (schedule) =>
                schedule.instructor === selectedInstructor &&
                schedule.semester === selectedSemester
            )}
            subjects={subjects}
            onRefreshSchedules={refreshData}
          />
        ))}
    </div>
  );
};

function ListOfItem({ onClose, schedules, onUpdateSchedule, subjects }) {
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
  const sortedSchedules = schedules
    .filter((schedule) =>
      subjects.some((s) => s.subject_name === schedule.subject)
    )
    .sort((a, b) => {
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
