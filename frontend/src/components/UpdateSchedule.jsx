import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import ReactPaginate from "react-paginate";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faAngleRight,
  faWarning,
  faLightbulb,
  faUser,
  faDoorOpen,
  faBook,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";
import "./scheduling.css";

const UpdateSchedule = ({ onClose, item }) => {
  const url = process.env.REACT_APP_URL;
  const currentUser = JSON.parse(atob(localStorage.getItem("userToken")));
  const currentDepartment = atob(localStorage.getItem("userDept"));
  // State variables to manage schedules, instructors, subjects, sections, and rooms data
  const [schedules, setSchedules] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]);

  // State variables for the form fields
  const [data, setData] = useState({
    subject: item.subject,
    instructor: item.instructor,
    room: item.room,
    background_color: item.background_color,
    day: item.day,
    start_time: item.start_time,
    end_time: item.end_time,
    course_type: item.class_type,
  });

  // Pagination state for instructors, subjects, and rooms
  const [currentInstructorPage, setCurrentInstructorPage] = useState(0);
  const [currentSubjectPage, setCurrentSubjectPage] = useState(0);
  const [currentRoomPage, setCurrentRoomPage] = useState(0);
  const itemsPerPage = 5;

  // State variables for error handling
  const [instructorError, setInstructorError] = useState(false);
  const [roomError, setRoomError] = useState(false);
  const [courseError, setCourseError] = useState(false);
  const [subjectError, setSubjectError] = useState(false);
  const [timeError, setTimeError] = useState(false);
  const [recommendations, setRecommendations] = useState([]);

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    // Call generateRecommendations and checkRealTimeErrors
    generateRecommendations(schedules);
    checkRealTimeErrors();
  }, [
    data.subject,
    data.instructor,
    data.room,
    data.background_color,
    data.day,
    data.start_time,
    data.end_time,
    data.course_type,
  ]);

  // Fetch data from the API
  const fetchData = async () => {
    try {
      const [scheduleRes, instructorRes, sectionRes, subjectRes, roomRes] =
        await Promise.all([
          axios.get(`${url}api/schedule/fetch?dept_code=${currentDepartment}`),
          axios.get(
            `${url}api/instructors/fetch?dept_code=${currentDepartment}`
          ),
          axios.get(`${url}api/sections/fetch?dept_code=${currentDepartment}`),
          axios.get(`${url}api/subjects/fetch?dept_code=${currentDepartment}`),
          axios.get(`${url}api/rooms/fetch`),
        ]);

      setSchedules(scheduleRes.data);
      setInstructors(instructorRes.data);
      setSections(sectionRes.data);
      setSubjects(subjectRes.data);
      setRooms(roomRes.data);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data");
    }
  };
  // Generate recommendations based on availability of instructors, rooms, and sections
  const generateRecommendations = (schedules) => {
    if (Object.values(data).some((value) => !value)) {
      setRecommendations([]);
      return;
    }

    const subject = subjects.find(
      (subject) => subject.subject_name === data.subject
    );
    const duration =
      data.course_type === "Laboratory" ||
      (subject && subject.subject_type === "Minor")
        ? 3 // Set the duration to 2 hours for minor subjects
        : 2; // Set the duration to 3 hours for other subjects

    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const availableSlots = [];

    days.forEach((day) => {
      if (data.day && data.day !== day) {
        return;
      }

      for (let hour = 7; hour <= 20 - duration; hour++) {
        const start = `${hour.toString().padStart(2, "0")}:00:00`;
        const end = `${(hour + duration).toString().padStart(2, "0")}:00:00`;

        const isConflict = (schedule, start, end) => {
          return (
            (start >= schedule.start_time && start < schedule.end_time) ||
            (end > schedule.start_time && end <= schedule.end_time) ||
            (start <= schedule.start_time && end >= schedule.end_time)
          );
        };

        const instructorAvailable = !schedules.some(
          (schedule) =>
            schedule.instructor === item.instructor &&
            schedule.instructor === data.instructor &&
            schedule.day === day &&
            isConflict(schedule, start, end)
        );

        const roomAvailable = !schedules.some(
          (schedule) =>
            schedule.room === item.room &&
            schedule.room === data.room &&
            schedule.day === day &&
            isConflict(schedule, start, end)
        );

        const sectionAvailable = !schedules.some(
          (schedule) =>
            schedule.section_name === item.section_name &&
            schedule.section_group === item.section_group &&
            schedule.day === day &&
            isConflict(schedule, start, end)
        );

        const subject = subjects.find(
          (subject) => subject.subject_name === data.subject
        );

        const alternateGroupAvailable =
          subject && subject.subject_type === "Minor"
            ? !schedules.some(
                (schedule) =>
                  schedule.section_name === item.section_name &&
                  schedule.section_group ===
                    (item.section_group === "Group 1"
                      ? "Group 2"
                      : "Group 1") &&
                  schedule.day === day &&
                  ((start >= schedule.start_time &&
                    start < schedule.end_time) ||
                    (end > schedule.start_time && end <= schedule.end_time) ||
                    (start <= schedule.start_time && end >= schedule.end_time))
              )
            : true;

        const bothSectionAndAlternateGroupAvailable =
          subject && subject.subject_type === "Minor"
            ? sectionAvailable && alternateGroupAvailable
            : sectionAvailable;

        if (
          instructorAvailable &&
          roomAvailable &&
          bothSectionAndAlternateGroupAvailable
        ) {
          availableSlots.push({ day, start, end });
        }
      }
    });

    setRecommendations(availableSlots);
  };

  const checkRealTimeErrors = () => {
    const parseTimeToMinutes = (time) => {
      const [hours, minutes] = time.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const startTimeInMinutes = parseTimeToMinutes(data.start_time);
    const endTimeInMinutes = parseTimeToMinutes(data.end_time);

    const subject = subjects.find(
      (subject) => subject.subject_name === data.subject
    );
    const isMinor = subject && subject.subject_type === "Minor";
    const alternateGroup = isMinor
      ? item.section_group === "Group 1"
        ? "Group 2"
        : "Group 1"
      : null;

    const checkTimeConflict = (schedule) => {
      const start = parseTimeToMinutes(schedule.start_time);
      const end = parseTimeToMinutes(schedule.end_time);

      if (schedule.schedule_id === item.schedule_id) {
        return false; // Skip checking the current schedule
      }

      // Check for conflicts with both groups if minor subject
      if (isMinor) {
        const inCurrentGroup =
          schedule.section_group === item.section_group &&
          schedule.section_name === item.section_name &&
          schedule.day === data.day;

        const inAlternateGroup =
          schedule.section_group === alternateGroup &&
          schedule.section_name === item.section_name &&
          schedule.day === data.day;

        const overlaps =
          (startTimeInMinutes >= start && startTimeInMinutes < end) ||
          (endTimeInMinutes > start && endTimeInMinutes <= end) ||
          (startTimeInMinutes <= start && endTimeInMinutes >= end);

        return (inCurrentGroup || inAlternateGroup) && overlaps;
      }

      // For non-minor subjects
      return (
        schedule.section_name === item.section_name &&
        schedule.section_group === item.section_group &&
        schedule.day === data.day &&
        ((startTimeInMinutes >= start && startTimeInMinutes < end) ||
          (endTimeInMinutes > start && endTimeInMinutes <= end) ||
          (startTimeInMinutes <= start && endTimeInMinutes >= end))
      );
    };

    const hasTimeConflict = schedules.some(checkTimeConflict);
    setTimeError(hasTimeConflict);

    const instructorAvailability = schedules.some(
      (schedule) =>
        schedule.schedule_id !== item.schedule_id &&
        schedule.instructor === data.instructor &&
        schedule.day === data.day &&
        ((data.start_time >= schedule.start_time &&
          data.start_time < schedule.end_time) ||
          (data.end_time > schedule.start_time &&
            data.end_time <= schedule.end_time) ||
          (data.start_time <= schedule.start_time &&
            data.end_time >= schedule.end_time))
    );
    setInstructorError(instructorAvailability);

    const roomAvailability = schedules.some(
      (schedule) =>
        schedule.schedule_id !== item.schedule_id &&
        schedule.room === data.room &&
        schedule.day === data.day &&
        ((data.start_time >= schedule.start_time &&
          data.start_time < schedule.end_time) ||
          (data.end_time > schedule.start_time &&
            data.end_time <= schedule.end_time) ||
          (data.start_time <= schedule.start_time &&
            data.end_time >= schedule.end_time))
    );
    setRoomError(roomAvailability);

    const subjectSectionSchedules = schedules.filter(
      (schedule) =>
        schedule.schedule_id !== item.schedule_id &&
        (!isMinor || schedule.section_group !== alternateGroup) &&
        schedule.subject === data.subject &&
        schedule.section_name === item.section_name &&
        schedule.section_group === item.section_group
    );

    const totalHours = subjectSectionSchedules.reduce((sum, schedule) => {
      const start = parseTimeToMinutes(schedule.start_time);
      const end = parseTimeToMinutes(schedule.end_time);
      return sum + (end - start) / 60;
    }, 0);

    const numberOfMeetings = subjectSectionSchedules.length;

    const exceedsLimits =
      totalHours + (endTimeInMinutes - startTimeInMinutes) / 60 > 5 ||
      numberOfMeetings >= 2;
    setSubjectError(exceedsLimits);

    // Check for existing course type conflicts, excluding the current schedule
    const alreadyExists = subjectSectionSchedules.some((schedule) => {
      if (schedule.schedule_id === item.schedule_id) return false;
      return schedule.class_type === data.course_type;
    });
    setCourseError(alreadyExists);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form fields
    if (
      instructorError ||
      roomError ||
      subjectError ||
      courseError ||
      timeError
    ) {
      toast.error("Error in updating");
      return;
    }

    try {
      // Check if the subject type is 'Minor'
      const subject = subjects.find(
        (subject) => subject.subject_name === data.subject
      );
      if (subject && subject.subject_type === "Minor") {
        // Determine the alternate group
        const alternateGroup =
          item.section_group === "Group 1" ? "Group 2" : "Group 1";

        // Check if the section has other groups
        const sectionHasOtherGroups = sections.some(
          (sec) =>
            sec.section_name === item.section_name &&
            sec.section_group !== item.section_group
        );

        if (sectionHasOtherGroups) {
          // Determine if we need to check the alternate group availability
          const hasTimeChanged =
            item.day !== data.day ||
            item.start_time !== data.start_time ||
            item.end_time !== data.end_time;
          let isAlternateGroupAvailable = true;

          if (hasTimeChanged) {
            // Check if the alternate group is available
            isAlternateGroupAvailable = !schedules.some(
              (schedule) =>
                schedule.section_name === item.section_name &&
                schedule.section_group === alternateGroup &&
                schedule.day === data.day &&
                ((data.start_time >= schedule.start_time &&
                  data.start_time < schedule.end_time) ||
                  (data.end_time > schedule.start_time &&
                    data.end_time <= schedule.end_time) ||
                  (data.start_time <= schedule.start_time &&
                    data.end_time >= schedule.end_time))
            );
          }

          if (isAlternateGroupAvailable) {
            // Update the alternate group schedule if available
            const alternateGroupSchedule = schedules.find(
              (schedule) =>
                schedule.section_name === item.section_name &&
                schedule.section_group === alternateGroup &&
                schedule.subject === data.subject
            );

            if (alternateGroupSchedule) {
              await axios.put(
                `${url}api/schedule/update/${alternateGroupSchedule.schedule_id}`,
                data
              );
              await axios.post(`${url}api/activity/adding`, {
                user_id: currentUser,
                department_code: currentDepartment,
                action: "Update",
                details: `${item.section_name} - ${alternateGroup}`,
                type: "schedule",
              });
            }
          } else if (!hasTimeChanged) {
            // If the time hasn't changed, update the alternate group even if it's not available
            const alternateGroupSchedule = schedules.find(
              (schedule) =>
                schedule.section_name === item.section_name &&
                schedule.section_group === alternateGroup &&
                schedule.subject === data.subject
            );

            if (alternateGroupSchedule) {
              await axios.put(
                `${url}api/schedule/update/${alternateGroupSchedule.schedule_id}`,
                {
                  ...data,
                  start_time: alternateGroupSchedule.start_time,
                  end_time: alternateGroupSchedule.end_time,
                  day: alternateGroupSchedule.day,
                }
              );
              await axios.post(`${url}api/activity/adding`, {
                user_id: currentUser,
                department_code: currentDepartment,
                action: "Update",
                details: `${item.section_name} - ${alternateGroup}`,
                type: "schedule",
              });
            }
          }
        }
      }

      // Update the original item
      await axios.put(`${url}api/schedule/update/${item.schedule_id}`, data);

      // Add to activity history for the original item
      await axios.post(`${url}api/activity/adding`, {
        user_id: currentUser,
        department_code: currentDepartment,
        action: "Update",
        details: `${item.section_name} - ${item.section_group}`,
        type: "schedule",
      });

      toast.success("Item updated successfully!");
      setTimeout(onClose, 1000);
    } catch (error) {
      console.error("Error updating item:", error);
      toast.error("Failed to update item");
    }
  };

  //------FILTERING------//

  //------instructors-------//
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const handleTagChange = (e) => {
    setSelectedTag(e.target.value);
    setCurrentInstructorPage(0); // Reset pagination when filter changes
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    setCurrentInstructorPage(0); // Reset pagination when search query changes
  };

  const filteredInstructors = instructors.filter((instructor) => {
    const matchesTag = selectedTag === "" || instructor.tags === selectedTag;
    const matchesSearch =
      instructor.first_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      instructor.last_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  //------subject-------//
  const handleLevelChange = (e) => {
    setSelectedLevel(e.target.value);
    setCurrentInstructorPage(0); // Reset pagination when filter changes
  };

  const filteredSubjects = subjects.filter((subject) => {
    const matchesLevel =
      selectedLevel === "" || subject.year_lvl === selectedLevel;
    const specialized =
      selectedTag === "" || subject.subject_tags === selectedTag;
    return matchesLevel && specialized;
  });

  //------rooms-------//
  const filteredRooms = rooms.filter(
    (room) => room.room_type === data.course_type
  );

  return (
    <div className="modal">
      <div className="modal-content">
        <div className="upper">
          <button className="close-btn" onClick={onClose}>
            X
          </button>
        </div>
        <form className="schedule-form" onSubmit={handleSubmit}>
          <div className="recommendation">
            <span>
              <FontAwesomeIcon icon={faLightbulb} className="lightbulb" />
              Recommendation
            </span>
            {recommendations.length > 0 ? (
              recommendations.map((rec, index) => (
                <div
                  key={index}
                  onClick={() => {
                    setData({
                      ...data,
                      day: rec.day,
                      start_time: rec.start,
                      end_time: rec.end,
                    });
                  }}
                >
                  <span id="day">{rec.day}</span>:
                  <span id="time">
                    {`${rec.start.slice(0, 2) % 12 || 12}:${rec.start.slice(
                      3,
                      5
                    )} ${rec.start.slice(0, 2) >= 12 ? "PM" : "AM"} - ${
                      rec.end.slice(0, 2) % 12 || 12
                    }:${rec.end.slice(3, 5)} ${
                      rec.end.slice(0, 2) >= 12 ? "PM" : "AM"
                    }`}
                  </span>
                </div>
              ))
            ) : (
              <p>No recommendations available</p>
            )}
          </div>
          <div className="form">
            <div className="form-content">
              <div>
                <label>Instructor</label>
                <input
                  type="text"
                  name="instructorName"
                  placeholder="Instructor Name"
                  value={data.instructor}
                  onChange={(e) =>
                    setData({ ...data, instructor: e.target.value })
                  }
                  className={instructorError ? "error-border" : ""}
                  required
                />
              </div>
              <div>
                {instructorError && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    Instructor is not available during this time slot.
                  </p>
                )}
              </div>
            </div>
            <div className="form-content">
              <div>
                <label>Course Title</label>
                <input
                  type="text"
                  name="subjectName"
                  placeholder="Subject Name"
                  value={data.subject}
                  onChange={(e) =>
                    setData({ ...data, subject: e.target.value })
                  }
                  className={subjectError ? "error-border" : ""}
                  required
                />
              </div>
              <div>
                {subjectError && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    Subject has reached meeting quota
                  </p>
                )}
              </div>
            </div>
            {data.subject === "" ||
            subjects.find((subject) => subject.subject_name === data.subject)
              ?.subject_type === "Major" ? (
              <div className="form-content">
                <div>
                  <label>Course Type</label>
                  <select
                    value={data.course_type}
                    className={courseError ? "error-border" : ""}
                    onChange={(e) =>
                      setData({ ...data, course_type: e.target.value })
                    }
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                </div>
                <div>
                  {courseError && (
                    <p className="error-message">
                      <FontAwesomeIcon
                        icon={faWarning}
                        className="warning-icon"
                      />
                      This course type is already created
                    </p>
                  )}
                </div>
              </div>
            ) : null}
            <div className="form-content">
              <div>
                <label>Room #</label>
                <input
                  type="text"
                  name="roomName"
                  placeholder="Room"
                  value={data.room}
                  onChange={(e) => setData({ ...data, room: e.target.value })}
                  className={roomError ? "error-border" : ""}
                  required
                />
              </div>
              <div>
                {roomError && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    Room is not available during this time slot.
                  </p>
                )}
              </div>
            </div>
            <div className="form-content">
              <div>
                <label>Color</label>
                <input
                  type="color"
                  name="selectedColor"
                  value={data.background_color}
                  onChange={(e) =>
                    setData({ ...data, background_color: e.target.value })
                  }
                  required
                />
              </div>
              <div></div>
            </div>
            <div className="form-content">
              <div>
                <label>Meeting Day</label>
                <div className="days-checkboxes">
                  <label>
                    M
                    <input
                      type="radio"
                      value="Monday"
                      name="day"
                      checked={data.day === "Monday"}
                      onChange={(e) =>
                        setData({ ...data, day: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    T
                    <input
                      type="radio"
                      value="Tuesday"
                      name="day"
                      checked={data.day === "Tuesday"}
                      onChange={(e) =>
                        setData({ ...data, day: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    W
                    <input
                      type="radio"
                      value="Wednesday"
                      name="day"
                      checked={data.day === "Wednesday"}
                      onChange={(e) =>
                        setData({ ...data, day: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    Th
                    <input
                      type="radio"
                      value="Thursday"
                      name="day"
                      checked={data.day === "Thursday"}
                      onChange={(e) =>
                        setData({ ...data, day: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    F
                    <input
                      type="radio"
                      value="Friday"
                      name="day"
                      checked={data.day === "Friday"}
                      onChange={(e) =>
                        setData({ ...data, day: e.target.value })
                      }
                    />
                  </label>
                  <label>
                    S
                    <input
                      type="radio"
                      value="Saturday"
                      name="day"
                      checked={data.day === "Saturday"}
                      onChange={(e) =>
                        setData({ ...data, day: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
              <div></div>
            </div>
            <div className="form-content">
              <div>
                <label>Start Time</label>
                <input
                  type="time"
                  name="startTime"
                  placeholder="Start Time"
                  value={data.start_time}
                  onChange={(e) =>
                    setData({ ...data, start_time: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                {timeError && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    Time not available for this section
                  </p>
                )}
              </div>
            </div>
            <div className="form-content">
              <div>
                <label>End Time</label>
                <input
                  type="time"
                  name="endTime"
                  placeholder="End Time"
                  value={data.end_time}
                  onChange={(e) =>
                    setData({ ...data, end_time: e.target.value })
                  }
                  required
                />
              </div>
              <div></div>
            </div>
            <button type="submit" className="add-sched">
              Save
            </button>
          </div>
        </form>
        <div className="lists">
          <div className="list-container">
            <div>
              <div className="list-headings">
                <h4>
                  <FontAwesomeIcon icon={faUser} className="instructor-icon" />
                  Instructors
                </h4>
                <select
                  name="instructorTags"
                  id="instructorTags"
                  value={selectedTag}
                  onChange={handleTagChange}
                >
                  <option value="">All</option>
                  {Array.from(
                    new Set(instructors.map((instructor) => instructor.tags))
                  ).map((tag, index) => (
                    <option key={index} value={tag}>
                      {tag}
                    </option>
                  ))}
                </select>
              </div>
              <FontAwesomeIcon icon={faSearch} className="search-bar-icon" />
              <input
                type="text"
                className="search-bar"
                placeholder="Search"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <ul>
              {filteredInstructors
                .slice(
                  currentInstructorPage * itemsPerPage,
                  (currentInstructorPage + 1) * itemsPerPage
                )
                .map((instructor) => (
                  <li
                    key={instructor.id}
                    onClick={() =>
                      setData({
                        ...data,
                        instructor: `${instructor.first_name} ${instructor.middle_name} ${instructor.last_name}`,
                      })
                    }
                  >
                    {instructor.first_name} {instructor.last_name}
                  </li>
                ))}
            </ul>
            <ReactPaginate
              previousLabel={
                <FontAwesomeIcon icon={faAngleLeft} className="previous-icon" />
              }
              nextLabel={
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className="previous-icon"
                />
              }
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={Math.ceil(filteredInstructors.length / itemsPerPage)}
              onPageChange={({ selected }) =>
                setCurrentInstructorPage(selected)
              }
              containerClassName={"pagination"}
              activeClassName={"active-page"}
            />
          </div>
          <div className="list-container">
            <div className="list-headings">
              <h4>
                <FontAwesomeIcon icon={faBook} className="subject-icon" />
                Subjects
              </h4>
              <select
                name="yearLevel"
                id="yearLevel"
                value={selectedLevel}
                onChange={handleLevelChange}
              >
                <option value="">All</option>
                {Array.from(
                  new Set(subjects.map((subject) => subject.year_lvl))
                ).map((year, index) => (
                  <option key={index} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>
            <ul>
              {filteredSubjects
                .slice(
                  currentSubjectPage * itemsPerPage,
                  (currentSubjectPage + 1) * itemsPerPage
                )
                .map((subject) => (
                  <li
                    key={subject.id}
                    onClick={() =>
                      setData({ ...data, subject: subject.subject_name })
                    }
                  >
                    {subject.subject_name}
                  </li>
                ))}
            </ul>
            <ReactPaginate
              previousLabel={
                <FontAwesomeIcon icon={faAngleLeft} className="previous-icon" />
              }
              nextLabel={
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className="previous-icon"
                />
              }
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={Math.ceil(subjects.length / itemsPerPage)}
              onPageChange={({ selected }) => setCurrentSubjectPage(selected)}
              containerClassName={"pagination"}
              activeClassName={"active-page"}
            />
          </div>
          <div className="list-container">
            <div className="list-headings">
              <h4>
                <FontAwesomeIcon icon={faDoorOpen} className="room-icon" />
                Rooms
              </h4>
            </div>
            <ul>
              {filteredRooms
                .slice(
                  currentRoomPage * itemsPerPage,
                  (currentRoomPage + 1) * itemsPerPage
                )
                .map((room) => (
                  <li
                    key={room.id}
                    onClick={() => setData({ ...data, room: room.room_name })}
                  >
                    {room.room_name}
                  </li>
                ))}
            </ul>
            <ReactPaginate
              previousLabel={
                <FontAwesomeIcon icon={faAngleLeft} className="previous-icon" />
              }
              nextLabel={
                <FontAwesomeIcon
                  icon={faAngleRight}
                  className="previous-icon"
                />
              }
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={Math.ceil(filteredRooms.length / itemsPerPage)}
              onPageChange={({ selected }) => setCurrentRoomPage(selected)}
              containerClassName={"pagination"}
              activeClassName={"active-page"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default UpdateSchedule;
