import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import Sidebar from "../components/Sidebar";
import Report from "../components/Report";

function DraftSchedules() {
  const url = process.env.REACT_APP_URL;
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const [category, setCategory] = useState("room");
  const [semester, setSemester] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [sections, setSections] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");
  const [selectedRoom, setSelectedRoom] = useState("");
  const [showReportModal, setShowReportModal] = useState(false);

  useEffect(() => {
    toast.dismiss();
    fetchData();
  }, []);

  useEffect(() => {
    const date = new Date();
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    if (month >= 1 && month <= 5) {
      setSemester("2nd");
      setAcademicYear(`${year - 1}-${year}`);
    }
    if (month >= 6 && month <= 12) {
      setSemester("1st");
      setAcademicYear(`${year}-${year + 1}`);
    }
  }, []);

  const fetchData = async () => {
    try {
      const [scheduleRes, sectionRes, instructorRes, roomRes] =
        await Promise.all([
          axios.get(`${url}api/schedule/fetch`),
          axios.get(`${url}api/sections/fetch?dept_code=${currentDepartment}`),
          axios.get(
            `${url}api/instructors/fetch?dept_code=${currentDepartment}`
          ),
          axios.get(`${url}api/rooms/fetch`),
        ]);

      setSchedules(scheduleRes.data);
      setSections(sectionRes.data);
      setInstructors(instructorRes.data);
      setRooms(roomRes.data);

      if (scheduleRes.data.length > 0) {
        setSelectedInstructor(scheduleRes.data[0].instructor.toString());
      }

      if (sectionRes.data.length > 0) {
        setSelectedSection(sectionRes.data[0].section_name.toString());
        setSelectedGroup(sectionRes.data[0].section_group.toString());
      }

      if (roomRes.data.length > 0) {
        setSelectedRoom(roomRes.data[0].room_name.toString());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  };

  const generatePDF = async () => {
    const scheduleContainer = document.querySelector("#scheduleTable");
    if (!scheduleContainer) return toast.error("No schedule found to print.");

    // Clone the scheduleContainer to avoid changing the original
    const clone = scheduleContainer.cloneNode(true);
    document.body.appendChild(clone); // Append the clone to the body

    // Temporarily set the height of the clone for better PDF rendering
    clone.style.height = "800px"; // Set a new height for the clone
    clone.style.position = "absolute"; // Position it off-screen
    clone.style.left = "-9999px"; // Move it out of view

    // Center the table using CSS (if necessary, for future reference)
    clone.style.margin = "0 auto"; // Center the table horizontally

    const timeElements = clone.querySelectorAll(".time");
    timeElements.forEach((el) => (el.style.color = "black")); // Set time color to black

    try {
      const canvas = await html2canvas(clone, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const pdf = new jsPDF("p", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 210; // A4 width in mm
      const imgHeight = 150; // A4 height in mm

      let heightLeft = imgHeight,
        pageHeight = 297; // A4 height in mm

      // Add title and details on the first page
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
          {
            align: "center",
          }
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
          `Academic Year: ${semester} ${academicYear}`,
          pdf.internal.pageSize.getWidth() / 2,
          42,
          { align: "center" }
        );
      pdf
        .setFontSize(14)
        .text(
          `${
            category === "section"
              ? "Section: " + selectedSection
              : category === "instructor"
              ? "Instructor: " + selectedInstructor
              : "Room: " + selectedRoom
          }`,
          pdf.internal.pageSize.getWidth() / 2,
          48,
          {
            align: "center",
          }
        );

      pdf.addImage(imgData, "PNG", 0, 80, imgWidth, imgHeight);

      pdf.save("schedule.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      // Remove the clone from the document
      document.body.removeChild(clone); // Clean up the cloned table
      timeElements.forEach((el) => (el.style.color = "")); // Reset time color
    }
  };

  //TODO: fix same image for first 2 pages
  const generateAllPDFs = async () => {
    const scheduleContainer = document.querySelector("#scheduleTable");
    if (!scheduleContainer) return toast.error("No schedule found to print.");

    // Clone the scheduleContainer to avoid changing the original
    const clone = scheduleContainer.cloneNode(true);
    document.body.appendChild(clone);

    // Temporarily set the height of the clone for better PDF rendering
    clone.style.height = "800px"; // Set a new height for the clone
    clone.style.position = "absolute"; // Position it off-screen
    clone.style.left = "-9999px"; // Move it out of view
    clone.style.margin = "0 auto"; // Center the table horizontally

    const timeElements = clone.querySelectorAll(".time");
    timeElements.forEach((el) => (el.style.color = "black")); // Set time color to black

    try {
      const pdf = new jsPDF("p", "mm", "a4"); // Create a single PDF document
      let isFirstPage = true;

      const addPage = async (name) => {
        // Update the content of the cloned element based on the current section/instructor
        clone.innerHTML = scheduleContainer.innerHTML; // Reset clone to original content

        // Update the specific section/instructor in the clone
        const contentToClone = clone.cloneNode(true);
        contentToClone
          .querySelectorAll(".time")
          .forEach((el) => (el.style.color = "black"));

        // Replace the content in the clone with the correct section/instructor
        clone.innerHTML = contentToClone.innerHTML;

        const canvas = await html2canvas(clone, {
          scale: 2,
          useCORS: true,
          backgroundColor: null,
        });
        const imgData = canvas.toDataURL("image/png");
        const imgWidth = 210; // A4 width in mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width; // Adjust imgHeight based on actual canvas height

        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;

        // Add title and details on the first page
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
            `Academic Year: ${semester} ${academicYear}`,
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

        // Add the image to the PDF
        pdf.addImage(imgData, "PNG", 0, 80, imgWidth, imgHeight); // Start image below title
      };

      // Add instructor schedules to the PDF
      if (category === "instructor") {
        const instructor = [
          ...new Set(
            instructors.map(
              ({ first_name, middle_name, last_name }) =>
                `${first_name} ${middle_name} ${last_name}`
            )
          ),
        ];
        for (const name of instructor) {
          setSelectedInstructor(name);
          await addPage(name);
        }
      } else if (category === "section") {
        // Add section group schedules to the PDF
        const sectionGroups = [
          ...new Set(
            sections.map(
              ({ section_name, section_group }) =>
                `${section_name}-${section_group}`
            )
          ),
        ];
        for (const sectionGroup of sectionGroups) {
          const [sectionName, group] = sectionGroup.split("-");
          setSelectedSection(sectionName);
          setSelectedGroup(group);
          await addPage(`${sectionName} - ${group}`);
        }
      } else if (category === "room") {
        // Add room schedules to the PDF
        const roomsArray = [
          ...new Set(rooms.map(({ room_name }) => room_name)),
        ];
        for (const room of roomsArray) {
          setSelectedRoom(room);
          await addPage(room);
        }
      }

      // Save the combined PDF
      pdf.save("all_schedules.pdf");
    } catch (error) {
      console.error("Error generating all PDFs:", error);
      toast.error("Failed to generate all PDFs");
    } finally {
      // Clean up the cloned table and reset styles
      document.body.removeChild(clone);
      timeElements.forEach((el) => (el.style.color = ""));
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

  return (
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-2xl font-medium">
            Draft Schedules
          </span>
          <button
            className="mr-4 text-white md:text-[0.8rem] text-[0.6rem] bg-green-500 py-2 px-4 rounded-full hover:bg-green-600 transition-all"
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
        <div className="p-3 md:px-8">
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
                onChange={(e) => setCategory(e.target.value)}
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
                {[...Array(6).keys()].map((i) => (
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
              <div className="flex items-center gap-4">
                <label
                  htmlFor="instructor"
                  className="font-semibold text-sm text-[var(--text-color)]"
                >
                  Select Instructor:
                </label>
                <select
                  name="instructor"
                  id="instructor"
                  value={selectedInstructor}
                  onChange={(e) => setSelectedInstructor(e.target.value)}
                  className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
                >
                  {instructors.map((instructor, index) => (
                    <option
                      key={index}
                      value={`${instructor.first_name} ${instructor.middle_name} ${instructor.last_name}`}
                    >
                      {`${instructor.first_name} ${instructor.last_name}`}
                    </option>
                  ))}
                </select>
              </div>
            ) : category === "section" ? (
              <div className="flex md:flex-row flex-col gap-2 md:gap-6">
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
                      [...new Set(sections.map((s) => s.section_name))]
                        .sort() // Sort section names alphabetically
                        .map((section, index) => (
                          <option key={index} value={section}>
                            {section}
                          </option>
                        ))
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
                      className="w-[6rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
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
            ) : (
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
                  {rooms.length === 0 ? (
                    <option value="Room">Room</option>
                  ) : (
                    [...new Set(rooms.map((r) => r.room_name))].map(
                      (room, index) => (
                        <option key={index} value={room}>
                          {room}
                        </option>
                      )
                    )
                  )}
                </select>
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
                onClick={generateAllPDFs}
              >
                Save All as PDF
              </button>
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
                          return (
                            item.start_time === time.startTime &&
                            item.day === day &&
                            item.instructor === selectedInstructor &&
                            item.semester === semester &&
                            item.academic_year === academicYear
                          );
                        } else if (category === "room") {
                          return (
                            item.start_time === time.startTime &&
                            item.day === day &&
                            item.room === selectedRoom &&
                            item.semester === semester &&
                            item.academic_year === academicYear
                          );
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
                                >{`${
                                  scheduleItem.section_name
                                } - ${scheduleItem.section_group.slice(
                                  0,
                                  1
                                )}${scheduleItem.section_group.slice(
                                  6,
                                  7
                                )}`}</div>
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
