import React, { useState, useEffect } from "react";
import axios from "axios";
import Modal from "react-modal";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Sidebar from "../components/Sidebar";
import Report from "../components/Report";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faXmark } from "@fortawesome/free-solid-svg-icons";

function DraftSchedules() {
  const url = process.env.REACT_APP_URL;
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const [category, setCategory] = useState("instructor");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [sections, setSections] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [showInstructorSearch, setShowInstructorSearch] = useState(false);
  const [showRoomSearch, setShowRoomSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInstructor, setSearchInstructor] = useState("");
  const [searchRoom, setSearchRoom] = useState("");
  const [searchError, setSearchError] = useState({});
  const [selectedDepartment, setSelectedDepartment] = useState("Department");
  const [selectedSectionDepartment, setSelectedSectionDepartment] =
    useState("Department");
  const [selectedInstructor, setSelectedInstructor] = useState("Instructor");
  const [selectedSection, setSelectedSection] = useState("Section");
  const [selectedGroup, setSelectedGroup] = useState("Group");
  const [selectedRoom, setSelectedRoom] = useState("Room");
  const [selectedBuilding, setSelectedBuilding] = useState("Building");
  const [showReportModal, setShowReportModal] = useState(false);
  const [showPrintAllConfirmation, setShowPrintAllConfirmation] =
    useState(false);

  useEffect(() => {
    toast.dismiss();
    fetchData();
  }, []);

  //TODO: add special class
  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    if (month >= 1 && month <= 5) {
      setSemester("2nd");
      setAcademicYear(`${year - 1}-${year}`);
    }
    if (month >= 6 && month <= 8) {
      setSemester("Mid-Year");
      setAcademicYear(`${year - 1}-${year}`);
    }
    if (month >= 6 && month <= 12) {
      setSemester("1st");
      setAcademicYear(`${year}-${year + 1}`);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [scheduleRes, sectionRes, instructorRes, roomRes, departmentRes] =
        await Promise.all([
          axios.get(`${url}api/schedule/fetch`),
          axios.get(`${url}api/sections/fetch?dept_code=${currentDepartment}`),
          axios.get(
            `${url}api/instructors/fetch?dept_code=${currentDepartment}`
          ),
          axios.get(`${url}api/rooms/fetch`),
          axios.get(`${url}api/departments/fetch`),
        ]);

      setSchedules(scheduleRes.data);
      setSections(sectionRes.data);
      setRooms(roomRes.data);
      setDepartments(
        departmentRes.data.filter((d) =>
          currentDepartment === "ADMIN" ||
          currentDepartment === "LSSD (LSSD)" ||
          currentDepartment === "NSMD (NSMD)"
            ? departmentRes.data
            : d.department_code === currentDepartment
        )
      );
      setInstructors(
        instructorRes.data.sort((a, b) =>
          a.first_name.localeCompare(b.first_name)
        )
      );

      if (scheduleRes.data.length > 0) {
        setSchedules(
          scheduleRes.data.sort((a, b) =>
            a.instructor.localeCompare(b.instructor)
          )
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  };

  const generatePDF = async () => {
    if (category === "instructor") {
      if (selectedInstructor === "Instructor") {
        toast.error("Please select an instructor");
        return;
      }
    } else if (category === "section") {
      if (selectedSection === "Section") {
        toast.error("Please select a section");
        return;
      }
    } else if (category === "room") {
      if (selectedRoom === "Room" || selectedBuilding === "Building") {
        toast.error("Please select a room or building");
        return;
      }
    }

    const scheduleContainer = document.querySelector(".timetable");
    const clone = scheduleContainer.cloneNode(true);
    document.body.appendChild(clone);

    clone.style.width = "1200px";
    clone.style.fontSize = "16px";
    clone.style.lineHeight = "1.5";
    clone.style.position = "absolute";
    clone.style.left = "-9999px";
    clone.style.height = "auto";
    clone.style.margin = "0";

    const timeElements = clone.querySelectorAll(".time");
    timeElements.forEach((el) => {
      el.style.color = "black";
      el.style.fontSize = "12px";
    });
    const dayElements = clone.querySelectorAll(".timetable th");
    dayElements.forEach((el) => {
      el.style.fontSize = "12px";
    });
    const subjectElements = clone.querySelectorAll(".subject-name");
    subjectElements.forEach((el) => {
      el.style.fontSize = "12px";
    });
    const instructorElements = clone.querySelectorAll(".instructor-name");
    instructorElements.forEach((el) => {
      el.style.fontSize = "10px";
    });
    const roomElements = clone.querySelectorAll(".room-name");
    roomElements.forEach((el) => {
      el.style.fontSize = "10px";
    });
    const sectionElements = clone.querySelectorAll(".section-name");
    sectionElements.forEach((el) => {
      el.style.fontSize = "10px";
    });

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210;
      const imgHeight = 150;

      pdf
        .setFontSize(18)
        .text(
          `${
            category === "section"
              ? "SECTION"
              : category === "instructor"
              ? "INSTRUCTOR"
              : "ROOM"
          } SCHEDULE`,
          pdf.internal.pageSize.getWidth() / 2,
          20,
          { align: "center" }
        );
      pdf
        .setFontSize(14)
        .text(
          "Republic of the Philippines",
          pdf.internal.pageSize.getWidth() / 2,
          30,
          { align: "center" }
        );
      pdf
        .setFontSize(14)
        .text(
          "Bulacan State University, Malolos City, Bulacan",
          pdf.internal.pageSize.getWidth() / 2,
          36,
          { align: "center" }
        );
      pdf
        .setFontSize(14)
        .text(
          `Academic Year: ${semester} semester ${academicYear}`,
          pdf.internal.pageSize.getWidth() / 2,
          42,
          { align: "center" }
        );
      pdf
        .setFontSize(14)
        .text(
          `${
            category === "section"
              ? "Section: " + selectedSection + ` - ${selectedGroup}`
              : category === "instructor"
              ? "Instructor: " + selectedInstructor
              : "Room: " + selectedRoom
          }`,
          pdf.internal.pageSize.getWidth() / 2,
          48,
          { align: "center" }
        );

      pdf.addImage(imgData, "PNG", 0, 80, imgWidth, imgHeight);
      pdf.save("schedule.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      document.body.removeChild(clone);
      timeElements.forEach((el) => (el.style.color = ""));
    }
  };

  const generateAllPDFs = async () => {
    const scheduleContainer = document.querySelector("#scheduleTable");
    if (!scheduleContainer) {
      return toast.error("No schedule found to print.");
    }

    setShowInstructorSearch("");
    setShowRoomSearch("");
    setSearchTerm("");
    setSearchInstructor("");
    setSearchRoom("");

    try {
      const pdf = new jsPDF("p", "mm", "a4");
      let isFirstPage = true;

      const addPage = async (name) => {
        const clone = scheduleContainer.cloneNode(true);
        document.body.appendChild(clone);

        clone.style.width = "1200px";
        clone.style.fontSize = "16px";
        clone.style.lineHeight = "1.5";
        clone.style.position = "absolute";
        clone.style.left = "-9999px";
        clone.style.height = "auto";
        clone.style.margin = "0";

        const timeElements = clone.querySelectorAll(".time");
        timeElements.forEach((el) => {
          el.style.color = "black";
          el.style.fontSize = "12px";
        });
        const dayElements = clone.querySelectorAll(".timetable th");
        dayElements.forEach((el) => {
          el.style.fontSize = "12px";
        });
        const subjectElements = clone.querySelectorAll(".subject-name");
        subjectElements.forEach((el) => {
          el.style.fontSize = "12px";
        });
        const instructorElements = clone.querySelectorAll(".instructor-name");
        instructorElements.forEach((el) => {
          el.style.fontSize = "10px";
        });
        const roomElements = clone.querySelectorAll(".room-name");
        roomElements.forEach((el) => {
          el.style.fontSize = "10px";
        });
        const sectionElements = clone.querySelectorAll(".section-name");
        sectionElements.forEach((el) => {
          el.style.fontSize = "10px";
        });

        const canvas = await html2canvas(clone, {
          scale: 1, // Lower scale to reduce load
          useCORS: true,
          backgroundColor: null,
        });

        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;

        pdf
          .setFontSize(18)
          .text(
            `${
              category === "section"
                ? "SECTION"
                : category === "instructor"
                ? "INSTRUCTOR"
                : "ROOM"
            } SCHEDULE`,
            pdf.internal.pageSize.getWidth() / 2,
            20,
            { align: "center" }
          );
        pdf
          .setFontSize(14)
          .text(
            "Republic of the Philippines",
            pdf.internal.pageSize.getWidth() / 2,
            30,
            { align: "center" }
          );
        pdf
          .setFontSize(14)
          .text(
            "Bulacan State University, Malolos City, Bulacan",
            pdf.internal.pageSize.getWidth() / 2,
            36,
            { align: "center" }
          );
        pdf
          .setFontSize(14)
          .text(
            `Academic Year: ${semester} semester ${academicYear}`,
            pdf.internal.pageSize.getWidth() / 2,
            42,
            { align: "center" }
          );
        pdf
          .setFontSize(14)
          .text(
            `${
              category === "section"
                ? "Section: "
                : category === "instructor"
                ? "Instructor: "
                : "Room: "
            } ${name}`,
            pdf.internal.pageSize.getWidth() / 2,
            48,
            { align: "center" }
          );

        pdf.addImage(imgData, "PNG", 0, 80, imgWidth, imgHeight);

        document.body.removeChild(clone); // Remove the clone after rendering
      };

      const addSchedules = async () => {
        const batchSize = 10; // Process 10 items at a time

        if (category === "instructor") {
          const instructorsList = [
            ...new Set(
              instructors.map(
                ({ first_name, middle_name, last_name }) =>
                  `${first_name} ${middle_name} ${last_name}`
              )
            ),
          ];
          for (let i = 0; i < instructorsList.length; i += batchSize) {
            const batch = instructorsList.slice(i, i + batchSize);
            for (const name of batch) {
              setSelectedInstructor(name);
              await new Promise((resolve) => setTimeout(resolve, 100)); // Allow time for update
              await addPage(name);
            }
          }
          pdf.save("instructor-schedules.pdf");
        } else if (category === "section") {
          const sectionGroups = [
            ...new Set(
              sections
                .map(
                  ({ section_name, section_group }) =>
                    `${section_name}-${section_group}`
                )
                .sort()
            ),
          ];
          for (let i = 0; i < sectionGroups.length; i += batchSize) {
            const batch = sectionGroups.slice(i, i + batchSize);
            for (const sectionGroup of batch) {
              const [sectionName, group] = sectionGroup.split("-");
              setSelectedSection(sectionName);
              setSelectedGroup(group);
              await new Promise((resolve) => setTimeout(resolve, 100)); // Allow time for update
              await addPage(
                `${sectionName} ${group === "" ? "" : `- ${group}`}`
              );
            }
          }
          pdf.save("section-schedules.pdf");
        } else if (category === "room") {
          const buildingsArray = [
            ...new Set(
              rooms.map(
                ({ room_building, room_name }) =>
                  `${room_building}-${room_name}`
              )
            ),
          ];
          for (let i = 0; i < buildingsArray.length; i += batchSize) {
            const batch = buildingsArray.slice(i, i + batchSize);
            for (const building of batch) {
              const [buildingName, roomName] = building.split("-");
              setSelectedBuilding(buildingName);
              setSelectedRoom(roomName);
              await new Promise((resolve) => setTimeout(resolve, 100)); // Allow time for update
              await addPage(`${buildingName} - ${roomName}`);
            }
          }
          pdf.save("room-schedules.pdf");
        }
      };

      await addSchedules();
    } catch (error) {
      console.error("Error generating all PDFs:", error);
      toast.error("Failed to generate all PDFs");
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

  const handleSearch = () => {
    if (category === "instructor") {
      if (searchTerm === "") {
        setSearchError({
          error: true,
          message: "Please enter an instructor.",
        });
      } else {
        const result = schedules.some(
          (schedule) =>
            schedule.instructor
              .toLowerCase()
              .includes(searchTerm.toLowerCase()) &&
            (currentDepartment === "ADMIN" ||
            currentDepartment === "LSSD (LSSD)" ||
            currentDepartment === "NSMD (NSMD)"
              ? true
              : schedule.department_code === currentDepartment)
        );
        if (result) {
          setSearchError({
            error: false,
            message: "",
          });
          setSearchInstructor(searchTerm);
        } else {
          setSearchError({
            error: true,
            message: "Instructor not found.",
          });
        }
      }
    } else if (category === "room") {
      if (searchTerm === "") {
        setSearchError({
          error: true,
          message: "Please enter a room.",
        });
      } else {
        const result = schedules.some(
          (schedule) =>
            schedule.room &&
            schedule.room.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (result) {
          setSearchError({
            error: false,
            message: "",
          });
          setSearchRoom(searchTerm);
        } else {
          setSearchError({
            error: true,
            message: "Room not found.",
          });
        }
      }
    }
  };

  const handlePublish = async (status) => {
    try {
      await axios.put(`${url}api/schedule/publish`, {
        is_published: status,
        department_code: currentDepartment,
        academic_year: academicYear,
        semester: semester,
      });
      fetchData();
      if (status) {
        toast.success("Schedule published successfully.");
      } else {
        toast.success("Schedule unpublished successfully.");
      }
    } catch (error) {
      toast.error("Error publishing schedule.");
      console.log(error);
    }
  };

  return (
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-2xl font-medium">Schedules</span>
          <div className="flex items-center gap-4">
            {!(
              currentDepartment === "ADMIN" ||
              currentDepartment === "LSSD (LSSD)" ||
              currentDepartment === "NSMD (NSMD)"
            ) && (
              <div className="flex items-center gap-4">
                <label className="font-semibold text-sm text-[var(--text-color)]">
                  All Schedules:
                </label>
                {schedules.filter(
                  (schedule) =>
                    schedule.department_code === currentDepartment &&
                    schedule.is_published === 0 &&
                    schedule.academic_year === academicYear &&
                    schedule.semester === semester
                ).length > 0 ? (
                  <button
                    className="text-white md:text-[0.8rem] text-[0.6rem] font-semibold bg-green-500 py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
                    onClick={() => handlePublish(1)}
                  >
                    Publish
                  </button>
                ) : (
                  <button
                    className="text-white md:text-[0.8rem] text-[0.6rem] font-semibold bg-red-500 py-2 px-4 rounded-lg hover:bg-red-600 transition-all"
                    onClick={() => handlePublish(0)}
                  >
                    Unpublish
                  </button>
                )}
              </div>
            )}
            <button
              className="mr-4 text-white md:text-[0.8rem] text-[0.6rem] bg-green-500 py-2 px-4 rounded-lg hover:bg-green-600 transition-all"
              onClick={() => setShowReportModal(true)}
            >
              generate CSV
            </button>
            {showReportModal && (
              <Report
                schedules={schedules}
                isOpen={showReportModal}
                onClose={() => setShowReportModal(false)}
              />
            )}
          </div>
        </div>
        <div className="w-full p-3 md:px-8">
          {/* Category Selector */}
          <div className="flex flex-col md:flex-row md:items-center md:gap-4 gap-2">
            <div className="flex items-center gap-4">
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
                  setSearchTerm("");
                  setSearchError({});
                  setShowInstructorSearch(false);
                  setShowRoomSearch(false);
                  setSearchInstructor("");
                  setSearchRoom("");
                  setCategory(e.target.value);
                }}
                className="w-[6rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
              >
                <option value="instructor">Instructor</option>
                <option value="section">Section</option>
                <option value="room">Room</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label
                htmlFor="semester"
                className="font-semibold text-sm text-[var(--text-color)]"
              >
                Semester:
              </label>
              <select
                name="semester"
                id="semester"
                value={semester}
                onChange={(e) => setSemester(e.target.value)}
                className="w-[5rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
              >
                <option value="1st">1st</option>
                <option value="2nd">2nd</option>
                <option value="mid-year">Mid-Year</option>
              </select>
            </div>
            <div className="flex items-center gap-4">
              <label
                htmlFor="academic_year"
                className="font-semibold text-sm text-[var(--text-color)]"
              >
                Year:
              </label>
              <select
                name="academic_year"
                id="academic_year"
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className="w-[7rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
              >
                {[...Array(11).keys()].map((i) => (
                  <option key={i + 2024} value={`${i + 2024}-${i + 2025}`}>{`${
                    i + 2024
                  }-${i + 2025}`}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Conditional Instructor or Section/Group */}
          <div className="flex justify-between items-center gap-2 mt-2">
            {category === "instructor" ? (
              <div className="flex md:flex-row flex-col md:items-center items-start gap-4">
                <div className="relative flex justify-center items-center">
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 text-sm text-gray-300 cursor-pointer hover:text-gray-400 transition-all ease-in-out duration-300 "
                    onClick={() => {
                      setSelectedDepartment("department");
                      setSelectedInstructor("instructor");
                      setSearchTerm("");
                      setSearchInstructor("");
                      setSearchError({ error: false, message: "" });
                      setShowInstructorSearch(true);
                    }}
                  />
                  <input
                    className={`${
                      showInstructorSearch ? "w-[15rem]" : "w-[2.3rem]"
                    } h-[2.3rem] text-sm border border-gray-300 pl-9 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-300 transition-all ease-in-out duration-300`}
                    type="text"
                    placeholder="Search"
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchError({ error: false, message: "" });
                      setSearchTerm(e.target.value);
                    }}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Handle enter key
                    disabled={!showInstructorSearch}
                  />
                  {showInstructorSearch && (
                    <div className="flex justify-center items-center ml-2">
                      <FontAwesomeIcon
                        icon={faXmark}
                        className="w-4 h-4 text-sm p-1 bg-red-300 text-white rounded-full cursor-pointer hover:bg-red-400 transition-all ease-in-out duration-300"
                        onClick={() => {
                          setSearchTerm("");
                          setSearchInstructor("");
                          setSearchError({ error: false, message: "" });
                          setShowInstructorSearch(false);
                        }}
                      />
                    </div>
                  )}
                </div>
                {searchError.error && (
                  <span className="text-sm text-red-500">
                    {searchError.message}
                  </span>
                )}
                {showInstructorSearch ? null : (
                  <div className="flex md:flex-row flex-col md:items-center gap-4">
                    {(currentDepartment === "ADMIN" ||
                      currentDepartment === "LSSD (LSSD)" ||
                      currentDepartment === "NSMD (NSMD)") && (
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
                          onChange={(e) =>
                            setSelectedDepartment(e.target.value)
                          }
                          className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                        >
                          <option value="Department">Department</option>
                          {departments.map((department, index) => (
                            <option
                              key={index}
                              value={department.department_code}
                            >
                              {department.department_code}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}
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
                          .filter((instructor) =>
                            currentDepartment === "ADMIN" ||
                            currentDepartment === "LSSD (LSSD)" ||
                            currentDepartment === "NSMD (NSMD)"
                              ? instructor.department_code ===
                                selectedDepartment
                              : instructor.department_code === currentDepartment
                          )
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
                  </div>
                )}
              </div>
            ) : category === "section" ? (
              <div className="flex md:flex-row flex-col gap-2 md:gap-6">
                {(currentDepartment === "ADMIN" ||
                  currentDepartment === "LSSD (LSSD)" ||
                  currentDepartment === "NSMD (NSMD)") && (
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
                      value={selectedSectionDepartment}
                      onChange={(e) =>
                        setSelectedSectionDepartment(e.target.value)
                      }
                      className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                    >
                      <option value="Department">Department</option>
                      {departments.map((department, index) => (
                        <option key={index} value={department.department_code}>
                          {department.department_code}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
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
                    <option value="Section">Section</option>
                    {[
                      ...new Set(
                        sections
                          .filter((s) =>
                            currentDepartment === "ADMIN" ||
                            currentDepartment === "LSSD (LSSD)" ||
                            currentDepartment === "NSMD (NSMD)"
                              ? s.department_code === selectedSectionDepartment
                              : s.department_code === currentDepartment
                          )
                          .map((s) => s.section_name)
                      ),
                    ]
                      .sort() // Sort section names alphabetically
                      .map((section, index) => (
                        <option key={index} value={section}>
                          {section}
                        </option>
                      ))}
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
                      className="w-[6rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                    >
                      <option value="Group">Group</option>
                      {sections
                        .filter(
                          (section) => section.section_name === selectedSection
                        )
                        .sort()
                        .map((section, index) => (
                          <option key={index} value={section.section_group}>
                            {section.section_group}
                          </option>
                        ))}
                    </select>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex md:flex-row flex-col gap-2 md:gap-6">
                <div className="flex md:flex-row flex-col md:items-center items-start gap-4">
                  <div className="relative flex justify-center items-center">
                    <FontAwesomeIcon
                      icon={faSearch}
                      className="absolute left-3 text-sm text-gray-300 cursor-pointer hover:text-gray-400 transition-all ease-in-out duration-300 "
                      onClick={() => {
                        setSelectedRoom("Room");
                        setSelectedBuilding("Building");
                        setSearchTerm("");
                        setSearchRoom("");
                        setSearchError({ error: false, message: "" });
                        setShowRoomSearch(true);
                      }}
                    />
                    <input
                      className={`${
                        showRoomSearch ? "w-[15rem]" : "w-[2.3rem]"
                      } h-[2.3rem] text-sm border border-gray-300 pl-9 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-300 transition-all ease-in-out duration-300`}
                      type="text"
                      placeholder="Search"
                      value={searchTerm}
                      onChange={(e) => {
                        setSearchError({ error: false, message: "" });
                        setSearchTerm(e.target.value);
                      }}
                      onKeyDown={(e) => e.key === "Enter" && handleSearch()} // Handle enter key
                      disabled={!showRoomSearch}
                    />
                    {showRoomSearch && (
                      <div className="flex justify-center items-center ml-2">
                        <FontAwesomeIcon
                          icon={faXmark}
                          className="w-4 h-4 text-sm p-1 bg-red-300 text-white rounded-full cursor-pointer hover:bg-red-400 transition-all ease-in-out duration-300"
                          onClick={() => {
                            setSearchTerm("");
                            setSearchRoom("");
                            setSearchError({ error: false, message: "" });
                            setShowRoomSearch(false);
                          }}
                        />
                      </div>
                    )}
                  </div>
                  {searchError.error && (
                    <span className="text-sm text-red-500">
                      {searchError.message}
                    </span>
                  )}
                  {showRoomSearch ? null : (
                    <div className="flex md:flex-row flex-col md:items-center gap-4">
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor="room"
                          className="font-semibold text-sm text-[var(--text-color)]"
                        >
                          Building:
                        </label>
                        <select
                          name="building"
                          id="building"
                          value={selectedBuilding}
                          onChange={(e) => {
                            setSelectedBuilding(e.target.value);
                            setSelectedRoom(
                              rooms.filter(
                                (r) => r.room_building === e.target.value
                              )[0]?.room_name
                            );
                          }}
                          className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                        >
                          <option value="Building">Building</option>
                          {[...new Set(rooms.map((r) => r.room_building))].map(
                            (building, index) => (
                              <option key={index} value={building}>
                                {building}
                              </option>
                            )
                          )}
                        </select>
                      </div>
                      <div className="flex items-center gap-4">
                        <label
                          htmlFor="room"
                          className="font-semibold text-sm text-[var(--text-color)]"
                        >
                          Room:
                        </label>
                        <select
                          name="room"
                          id="room"
                          value={selectedRoom}
                          onChange={(e) => setSelectedRoom(e.target.value)}
                          className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                        >
                          <option value="Room">Room</option>
                          {rooms
                            .filter((r) => r.room_building === selectedBuilding)
                            .map((room, index) => (
                              <option key={index} value={room.room_name}>
                                {room.room_name}
                              </option>
                            ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
            <div className="flex md:flex-row flex-col md:gap-4 gap-2">
              <button
                className="p-2 bg-blue-500 lg:text-sm text-[0.7rem] text-white rounded-md hover:bg-blue-600 transition"
                onClick={generatePDF}
              >
                Save as PDF
              </button>
              <button
                className="p-2 bg-green-500 md:text-sm text-[0.7rem] text-white rounded-md hover:bg-green-600 transition"
                onClick={() => setShowPrintAllConfirmation(true)}
              >
                Save All as PDF
              </button>
              {showPrintAllConfirmation && (
                <Modal
                  isOpen={showPrintAllConfirmation}
                  style={{
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
                      width: "25rem",
                      padding: "1.5rem",
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
                  }}
                >
                  <div className="flex flex-col items-center text-center gap-4">
                    <h2 className="text-lg font-semibold">
                      Confirm to print all schedules?
                    </h2>
                    <p className="text-sm text-gray-600">
                      This action might take a while, please stay at this page
                      until the download is complete.
                    </p>
                    <div className="flex w-full gap-2 py-2">
                      <button
                        className="p-2 bg-green-500 md:text-sm text-[0.7rem] w-full text-white rounded-md hover:bg-green-600 transition"
                        onClick={() => {
                          setShowPrintAllConfirmation(false);
                          generateAllPDFs();
                        }}
                      >
                        Confirm
                      </button>
                      <button
                        className="p-2 bg-red-500 md:text-sm text-[0.7rem] w-full text-white rounded-md hover:bg-red-600 transition"
                        onClick={() => setShowPrintAllConfirmation(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                </Modal>
              )}
            </div>
          </div>
        </div>
        <div className="timetable md:h-[calc(100vh-12rem)]" id="scheduleTable">
          <div className="h-full w-[95%] bg-white p-4 border rounded-lg border-gray-300 overflow-y-auto">
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

                      const scheduleItem = schedules.find((item) => {
                        if (category === "instructor") {
                          if (searchInstructor !== "") {
                            return (
                              item.start_time === time.startTime &&
                              item.day === day &&
                              item.instructor
                                .toLowerCase()
                                .includes(searchInstructor.toLowerCase()) &&
                              item.semester === semester &&
                              item.academic_year === academicYear &&
                              (currentDepartment === "ADMIN" ||
                              currentDepartment === "LSSD (LSSD)" ||
                              currentDepartment === "NSMD (NSMD)"
                                ? true
                                : item.department_code === currentDepartment)
                            );
                          } else {
                            return (
                              item.start_time === time.startTime &&
                              item.day === day &&
                              item.instructor === selectedInstructor &&
                              item.semester === semester &&
                              item.academic_year === academicYear
                            );
                          }
                        } else if (category === "room") {
                          if (searchRoom !== "") {
                            return (
                              item.start_time === time.startTime &&
                              item.day === day &&
                              item.room
                                .toLowerCase()
                                .includes(searchRoom.toLowerCase()) &&
                              item.semester === semester &&
                              item.academic_year === academicYear
                            );
                          } else {
                            return (
                              item.start_time === time.startTime &&
                              item.day === day &&
                              item.room === selectedRoom &&
                              item.semester === semester &&
                              item.academic_year === academicYear
                            );
                          }
                        } else {
                          return (
                            item.start_time === time.startTime &&
                            item.day === day &&
                            item.section_name === selectedSection &&
                            item.semester === semester &&
                            item.academic_year === academicYear &&
                            (!item.section_group ||
                              item.section_group === selectedGroup)
                          );
                        }
                      });

                      let rowSpan = 1;
                      if (scheduleItem) {
                        rowSpan = calculateRowSpan(
                          scheduleItem.start_time,
                          scheduleItem.end_time
                        );
                        rowSpans[dayIndex] = rowSpan - 1;
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
                                            item.semester === semester &&
                                            item.academic_year === academicYear
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
    </div>
  );
}

export default DraftSchedules;
