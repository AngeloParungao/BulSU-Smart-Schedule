import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";

function DraftSchedules() {
  const url = process.env.REACT_APP_URL;
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const [category, setCategory] = useState("section");
  const [schedules, setSchedules] = useState([]);
  const [sections, setSections] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [selectedInstructor, setSelectedInstructor] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("");

  useEffect(() => {
    toast.dismiss();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [scheduleRes, sectionRes, instructorRes] = await Promise.all([
        axios.get(`${url}api/schedule/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/sections/fetch?dept_code=${currentDepartment}`),
        axios.get(`${url}api/instructors/fetch?dept_code=${currentDepartment}`),
      ]);

      setSchedules(scheduleRes.data);
      setSections(sectionRes.data);
      setInstructors(instructorRes.data);

      if (scheduleRes.data.length > 0) {
        setSelectedInstructor(scheduleRes.data[0].instructor.toString());
      }

      if (sectionRes.data.length > 0) {
        setSelectedSection(sectionRes.data[0].section_name.toString());
        setSelectedGroup(sectionRes.data[0].section_group.toString());
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  };

  const generatePDF = async () => {
    const scheduleContainer = document.querySelector("#scheduleTable");
    if (!scheduleContainer) return toast.error("No schedule found to print.");

    const timeElements = document.querySelectorAll(".time");
    timeElements.forEach((el) => (el.style.color = "black")); // Set time color to black

    try {
      const canvas = await html2canvas(scheduleContainer, {
        scale: 2,
        useCORS: true,
        backgroundColor: null,
      });
      const pdf = new jsPDF("l", "mm", "a4");
      const imgData = canvas.toDataURL("image/png");
      const imgWidth = 297,
        imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight,
        pageHeight = 210;

      pdf
        .setFontSize(18)
        .text("Schedule for:", 14, 20)
        .setFontSize(14)
        .text(
          category === "instructor"
            ? `Instructor: ${selectedInstructor}`
            : `Section: ${selectedSection}, Group: ${selectedGroup}`,
          14,
          30
        );
      pdf.addImage(imgData, "PNG", 0, 40, imgWidth, imgHeight);

      while (heightLeft > pageHeight) {
        pdf.addPage();
        pdf.addImage(
          imgData,
          "PNG",
          0,
          heightLeft - imgHeight,
          imgWidth,
          imgHeight
        );
        heightLeft -= pageHeight;
      }

      pdf.save("schedule.pdf");
    } catch (error) {
      console.error("Error generating PDF:", error);
      toast.error("Failed to generate PDF");
    } finally {
      timeElements.forEach((el) => (el.style.color = "")); // Reset time color
    }
  };

  const generateAllPDFs = async () => {
    const timeElements = document.querySelectorAll(".time");
    timeElements.forEach((el) => (el.style.color = "black"));

    try {
      const pdf = new jsPDF("l", "mm", "a4"),
        imgWidth = 297,
        pageHeight = 210;
      let isFirstPage = true;

      const generatePage = async (text, setFields) => {
        setFields();
        await new Promise((resolve) => setTimeout(resolve, 100));
        const canvas = await html2canvas(
          document.querySelector("#scheduleTable"),
          { scale: 2, useCORS: true, backgroundColor: null }
        );
        const imgData = canvas.toDataURL("image/png"),
          imgHeight = (canvas.height * imgWidth) / canvas.width;
        let heightLeft = imgHeight;

        if (!isFirstPage) pdf.addPage();
        isFirstPage = false;

        pdf
          .setFontSize(18)
          .text(text, 14, 20)
          .addImage(imgData, "PNG", 0, 40, imgWidth, imgHeight);
        while (heightLeft > pageHeight) {
          pdf.addPage();
          pdf.addImage(
            imgData,
            "PNG",
            0,
            heightLeft - imgHeight,
            imgWidth,
            imgHeight
          );
          heightLeft -= pageHeight;
        }
      };

      if (category === "instructor") {
        for (const instructor of instructors) {
          await generatePage(
            `Instructor: ${instructor.firstname} ${instructor.lastname}`,
            () =>
              setSelectedInstructor(
                `${instructor.firstname} ${instructor.middlename} ${instructor.lastname}`
              )
          );
        }
      } else {
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
          await generatePage(`Section: ${sectionName}, Group: ${group}`, () => {
            setSelectedSection(sectionName);
            setSelectedGroup(group);
          });
        }
      }

      pdf.save("all_schedules.pdf");
    } catch (error) {
      console.error("Error generating all PDFs:", error);
      toast.error("Failed to generate all PDFs");
    } finally {
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
        <div className="flex items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-3xl font-medium">
            Draft Schedules
          </span>
        </div>
        <div className="p-3 md:px-8">
          {/* Category Selector */}
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
              className="w-[8rem] md:p-[0.3rem] p-[0.4rem] border border-gray-300 rounded-md shadow-sm focus:border-blue-500 md:text-[0.75rem] text-[0.7rem] text-black"
            >
              <option value="instructor">Instructor</option>
              <option value="section">Section</option>
            </select>
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
            ) : (
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
                            (section) =>
                              section.section_name === selectedSection
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
            )}

            {/* Buttons */}
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

                      const scheduleItem = schedules.find((item) => {
                        if (category === "instructor") {
                          return (
                            item.start_time === time.startTime &&
                            item.day === day &&
                            item.instructor === selectedInstructor
                          );
                        } else {
                          return (
                            item.start_time === time.startTime &&
                            item.day === day &&
                            item.section_name === selectedSection &&
                            item.section_group === selectedGroup
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
