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
  faXmark,
} from "@fortawesome/free-solid-svg-icons";

const AddSchedule = ({ onClose, section, group, onRefreshSchedules }) => {
  const url = process.env.REACT_APP_URL;
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const currentDepartment = atob(localStorage.getItem("userDept"));
  // State variables to manage schedules, instructors, subjects, sections, and rooms data
  const [schedules, setSchedules] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]);

  // State variables for the form fields
  const [subjectName, setSubjectName] = useState("");
  const [instructorName, setInstructorName] = useState("");
  const [roomName, setRoomName] = useState("");
  const [roomBuilding, setRoomBuilding] = useState("");
  const [selectedColor, setSelectedColor] = useState("#ffffff");
  const [meetingDay, setMeetingDay] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [courseType, setCourseType] = useState("Lecture");

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
  const [sectionCollisionTime, setSectionCollisionTime] = useState(null);
  const [instructorCollisionTime, setInstructorCollisionTime] = useState(null);
  const [roomCollisionTime, setRoomCollisionTime] = useState(null);

  // Fetch data when the component mounts
  useEffect(() => {
    fetchSchedules();
    fetchInstructors();
    fetchSections();
    fetchSubjects();
    fetchRooms();
  }, []);

  // Generate recommendations whenever relevant fields change
  useEffect(() => {
    generateRecommendations(schedules);
  }, [instructorName, subjectName, roomName, courseType, meetingDay]);

  // Check for real-time errors whenever relevant fields change
  useEffect(() => {
    checkRealTimeErrors();
  }, [
    instructorName,
    subjectName,
    roomName,
    meetingDay,
    startTime,
    endTime,
    courseType,
  ]);

  // Fetch schedules from the API
  const fetchSchedules = async () => {
    try {
      const response = await axios.get(
        `${url}api/schedule/fetch?dept_code=${currentDepartment}`
      );
      setSchedules(response.data);
    } catch (error) {
      console.error("Error fetching schedules:", error);
      toast.error("Failed to fetch schedules");
    }
  };

  // Fetch instructors from the API
  const fetchInstructors = async () => {
    try {
      const response = await axios.get(
        `${url}api/instructors/fetch?dept_code=${currentDepartment}`
      );
      setInstructors(response.data);
    } catch (error) {
      console.error("Error fetching instructors:", error);
      toast.error("Failed to fetch instructors");
    }
  };

  // Fetch sections from the API
  const fetchSections = async () => {
    try {
      const response = await axios.get(
        `${url}api/sections/fetch?dept_code=${currentDepartment}`
      );
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching sections:", error);
      toast.error("Failed to fetch sections");
    }
  };

  // Fetch subjects from the API
  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        `${url}api/subjects/fetch?dept_code=${currentDepartment}`
      );
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching subjects:", error);
      toast.error("Failed to fetch subjects");
    }
  };

  // Fetch rooms from the API
  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${url}api/rooms/fetch`);
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching rooms:", error);
      toast.error("Failed to fetch rooms");
    }
  };

  // Generate recommendations based on availability of instructors, rooms, and sections
  const generateRecommendations = (schedules) => {
    if (!instructorName || !roomName) {
      setRecommendations([]);
      return;
    }

    const subject = subjects.find(
      (subject) => subject.subject_name === subjectName
    );
    const duration =
      courseType === "Laboratory" ||
      (subject && subject.subject_type === "Minor")
        ? 3
        : 2;
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
      if (meetingDay && meetingDay !== day) {
        return;
      }

      for (let hour = 7; hour <= 20 - duration; hour++) {
        const start = `${hour.toString().padStart(2, "0")}:00:00`;
        const end = `${(hour + duration).toString().padStart(2, "0")}:00:00`;

        const instructorAvailable = !schedules.some(
          (schedule) =>
            schedule.instructor === instructorName &&
            schedule.day === day &&
            ((start >= schedule.start_time && start < schedule.end_time) ||
              (end > schedule.start_time && end <= schedule.end_time) ||
              (start <= schedule.start_time && end >= schedule.end_time))
        );

        const roomAvailable = !schedules.some(
          (schedule) =>
            schedule.room === roomName &&
            schedule.day === day &&
            ((start >= schedule.start_time && start < schedule.end_time) ||
              (end > schedule.start_time && end <= schedule.end_time) ||
              (start <= schedule.start_time && end >= schedule.end_time))
        );

        const sectionAvailable = !schedules.some(
          (schedule) =>
            schedule.section_name === section &&
            schedule.section_group === group &&
            schedule.day === day &&
            ((start >= schedule.start_time && start < schedule.end_time) ||
              (end > schedule.start_time && end <= schedule.end_time) ||
              (start <= schedule.start_time && end >= schedule.end_time))
        );

        const subject = subjects.find(
          (subject) => subject.subject_name === subjectName
        );
        const alternateGroupAvailable =
          subject && subject.subject_type === "Minor"
            ? !schedules.some(
                (schedule) =>
                  schedule.section_name === section &&
                  schedule.section_group ===
                    (group === "Group 1" ? "Group 2" : "Group 1") &&
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

  // Check for real-time errors based on the current schedules and form inputs
  const checkRealTimeErrors = () => {
    // Convert the new start and end times to minutes
    const newStartTimeInMinutes =
      parseInt(startTime.split(":")[0]) * 60 +
      parseInt(startTime.split(":")[1]);
    const newEndTimeInMinutes =
      parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);

    let foundSectionCollisionTime = null;
    let foundInstructorCollisionTime = null;
    let foundRoomCollisionTime = null;

    const timeConflict = (schedule) => {
      const startTimeInMinutes =
        parseInt(schedule.start_time.split(":")[0]) * 60 +
        parseInt(schedule.start_time.split(":")[1]);
      const endTimeInMinutes =
        parseInt(schedule.end_time.split(":")[0]) * 60 +
        parseInt(schedule.end_time.split(":")[1]);

      if (
        schedule.section_name === section &&
        schedule.section_group === group &&
        schedule.day === meetingDay
      ) {
        const isConflict =
          (newStartTimeInMinutes >= startTimeInMinutes &&
            newStartTimeInMinutes < endTimeInMinutes) ||
          (newEndTimeInMinutes > startTimeInMinutes &&
            newEndTimeInMinutes <= endTimeInMinutes) ||
          (newStartTimeInMinutes <= startTimeInMinutes &&
            newEndTimeInMinutes >= endTimeInMinutes);

        if (isConflict) {
          foundSectionCollisionTime = {
            start: schedule.start_time,
            end: schedule.end_time,
          };
          return true;
        }
      }
      return false;
    };

    const instructorConflict = (schedule) => {
      const startTimeInMinutes =
        parseInt(schedule.start_time.split(":")[0]) * 60 +
        parseInt(schedule.start_time.split(":")[1]);
      const endTimeInMinutes =
        parseInt(schedule.end_time.split(":")[0]) * 60 +
        parseInt(schedule.end_time.split(":")[1]);

      if (
        schedule.instructor === instructorName &&
        schedule.day === meetingDay
      ) {
        const isConflict =
          (newStartTimeInMinutes >= startTimeInMinutes &&
            newStartTimeInMinutes < endTimeInMinutes) ||
          (newEndTimeInMinutes > startTimeInMinutes &&
            newEndTimeInMinutes <= endTimeInMinutes) ||
          (newStartTimeInMinutes <= startTimeInMinutes &&
            newEndTimeInMinutes >= endTimeInMinutes);

        if (isConflict) {
          foundInstructorCollisionTime = {
            start: schedule.start_time,
            end: schedule.end_time,
          };
          return true;
        }
      }
      return false;
    };

    const roomConflict = (schedule) => {
      const startTimeInMinutes =
        parseInt(schedule.start_time.split(":")[0]) * 60 +
        parseInt(schedule.start_time.split(":")[1]);
      const endTimeInMinutes =
        parseInt(schedule.end_time.split(":")[0]) * 60 +
        parseInt(schedule.end_time.split(":")[1]);

      if (schedule.room === roomName && schedule.day === meetingDay) {
        const isConflict =
          (newStartTimeInMinutes >= startTimeInMinutes &&
            newStartTimeInMinutes < endTimeInMinutes) ||
          (newEndTimeInMinutes > startTimeInMinutes &&
            newEndTimeInMinutes <= endTimeInMinutes) ||
          (newStartTimeInMinutes <= startTimeInMinutes &&
            newEndTimeInMinutes >= endTimeInMinutes);

        if (isConflict) {
          foundRoomCollisionTime = {
            start: schedule.start_time,
            end: schedule.end_time,
          };
          return true;
        }
      }
      return false;
    };

    const hasSectionConflict = schedules.some(timeConflict);
    const hasInstructorConflict = schedules.some(instructorConflict);
    const hasRoomConflict = schedules.some(roomConflict);

    setTimeError(hasSectionConflict);
    setSectionCollisionTime(foundSectionCollisionTime);
    setInstructorError(hasInstructorConflict);
    setInstructorCollisionTime(foundInstructorCollisionTime);
    setRoomError(hasRoomConflict);
    setRoomCollisionTime(foundRoomCollisionTime);

    const startTimeInMinutes =
      parseInt(startTime.split(":")[0]) * 60 +
      parseInt(startTime.split(":")[1]);
    const endTimeInMinutes =
      parseInt(endTime.split(":")[0]) * 60 + parseInt(endTime.split(":")[1]);
    const newDuration = (endTimeInMinutes - startTimeInMinutes) / 60;

    const subjectSectionSchedules = schedules.filter(
      (schedule) =>
        schedule.subject === subjectName &&
        schedule.section_name === section &&
        schedule.section_group === group
    );

    const totalHours = subjectSectionSchedules.reduce((sum, schedule) => {
      const start =
        parseInt(schedule.start_time.split(":")[0]) * 60 +
        parseInt(schedule.start_time.split(":")[1]);
      const end =
        parseInt(schedule.end_time.split(":")[0]) * 60 +
        parseInt(schedule.end_time.split(":")[1]);
      return sum + (end - start) / 60;
    }, 0);

    const numberOfMeetings = subjectSectionSchedules.length;

    const exceedsLimits = totalHours + newDuration > 5 || numberOfMeetings >= 2;
    setSubjectError(exceedsLimits);

    const hasLecture = subjectSectionSchedules.some(
      (schedule) => schedule.class_type === "Lecture"
    );
    const hasLaboratory = subjectSectionSchedules.some(
      (schedule) => schedule.class_type === "Laboratory"
    );

    const alreadyExists =
      (courseType === "Lecture" && hasLecture) ||
      (courseType === "Laboratory" && hasLaboratory);
    setCourseError(alreadyExists);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      meetingDay === "" ||
      instructorError ||
      roomError ||
      subjectError ||
      courseError ||
      timeError
    ) {
      toast.error("Please fill in all the required fields.");
      return;
    } else {
      const newItem = {
        subjectName,
        instructorName,
        roomName,
        roomBuilding,
        selectedColor,
        meetingDay,
        startTime,
        endTime,
        courseType,
        section,
        group,
        department_code: currentDepartment,
      };

      try {
        // Check if subject type is 'Minor'
        const subject = subjects.find(
          (subject) => subject.subject_name === subjectName
        );
        if (subject && subject.subject_type === "Minor") {
          // Find the alternate group
          const alternateGroup = group === "Group 1" ? "Group 2" : "Group 1";

          // Check if the section has other groups
          const sectionHasOtherGroups = sections.some(
            (sec) => sec.section_name === section && sec.section_group !== group
          );

          if (sectionHasOtherGroups) {
            // Check if alternate group is available
            const isAlternateGroupAvailable = !schedules.some(
              (schedule) =>
                schedule.section_name === section &&
                schedule.section_group === alternateGroup &&
                schedule.day === meetingDay &&
                ((startTime >= schedule.start_time &&
                  startTime < schedule.end_time) ||
                  (endTime > schedule.start_time &&
                    endTime <= schedule.end_time) ||
                  (startTime <= schedule.start_time &&
                    endTime >= schedule.end_time))
            );

            if (
              isAlternateGroupAvailable /*&& window.confirm(`Do you want to also add this to this section's other group (${alternateGroup})?`)*/
            ) {
              // Add the same item to the alternate group
              const alternateItem = {
                ...newItem,
                group: alternateGroup,
              };
              await axios.post(`${url}api/schedule/adding`, alternateItem);
              await axios.post(`${url}api/activity/adding`, {
                user_id: currentUser,
                department_code: currentDepartment,
                action: "Add",
                details: `${section} - ${alternateGroup}`,
                type: "schedule",
              });
            }
          }
        }

        // Add the item to the original group
        await axios.post(`${url}api/schedule/adding`, newItem);

        // Add to activity history for the original item
        await axios.post(`${url}api/activity/adding`, {
          user_id: currentUser,
          department_code: currentDepartment,
          action: "Add",
          details: `${section} - ${group}`,
          type: "schedule",
        });

        toast.success("Item added successfully!");
        onRefreshSchedules();
        setTimeout(onClose, 2000);
      } catch (error) {
        console.error("Error adding item:", error);
        toast.error("Failed to add item");
      }
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
  const filteredRooms = rooms.filter((room) => room.room_type === courseType);

  return (
    <div className="modal">
      <div className="modal-content bg-white">
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
                    setMeetingDay(rec.day);
                    setStartTime(rec.start);
                    setEndTime(rec.end);
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
                  value={instructorName}
                  onChange={(e) => setInstructorName(e.target.value)}
                  className={instructorError ? "error-border" : ""}
                  required
                  readOnly
                />
              </div>
              <div>
                {instructorError && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    Instructor not available between{" "}
                    {`${
                      parseInt(instructorCollisionTime.start.slice(0, 2)) %
                        12 || 12
                    }:${instructorCollisionTime.start.slice(3, 5)} ${
                      parseInt(instructorCollisionTime.start.slice(0, 2)) >= 12
                        ? "PM"
                        : "AM"
                    }`}{" "}
                    and{" "}
                    {`${
                      parseInt(instructorCollisionTime.end.slice(0, 2)) % 12 ||
                      12
                    }:${instructorCollisionTime.end.slice(3, 5)} ${
                      parseInt(instructorCollisionTime.end.slice(0, 2)) >= 12
                        ? "PM"
                        : "AM"
                    }`}
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
                  value={subjectName}
                  onChange={(e) => setSubjectName(e.target.value)}
                  className={subjectError ? "error-border" : ""}
                  required
                  readOnly
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
            {subjectName === "" ||
            subjects.find((subject) => subject.subject_name === subjectName)
              ?.subject_type === "Major" ? (
              <div className="form-content">
                <div>
                  <label>Course Type</label>
                  <select
                    value={courseType}
                    className={courseError ? "error-border" : ""}
                    onChange={(e) => setCourseType(e.target.value)}
                  >
                    <option>Lecture</option>
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
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className={roomError ? "error-border" : ""}
                  required
                  readOnly
                />
              </div>
              <div>
                {roomError && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    Room is not available between{" "}
                    {`${
                      parseInt(roomCollisionTime.start.slice(0, 2)) % 12 || 12
                    }:${roomCollisionTime.start.slice(3, 5)} ${
                      parseInt(roomCollisionTime.start.slice(0, 2)) >= 12
                        ? "PM"
                        : "AM"
                    }`}{" "}
                    and{" "}
                    {`${
                      parseInt(roomCollisionTime.end.slice(0, 2)) % 12 || 12
                    }:${roomCollisionTime.end.slice(3, 5)} ${
                      parseInt(roomCollisionTime.end.slice(0, 2)) >= 12
                        ? "PM"
                        : "AM"
                    }`}
                  </p>
                )}
              </div>
            </div>
            <div className="form-content">
              <div>
                <label>Color</label>
                <input
                  type="color"
                  value={selectedColor}
                  onChange={(e) => setSelectedColor(e.target.value)}
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
                      checked={meetingDay === "Monday"}
                      onChange={(e) => setMeetingDay(e.target.value)}
                    />
                  </label>
                  <label>
                    T
                    <input
                      type="radio"
                      value="Tuesday"
                      name="day"
                      checked={meetingDay === "Tuesday"}
                      onChange={(e) => setMeetingDay(e.target.value)}
                    />
                  </label>
                  <label>
                    W
                    <input
                      type="radio"
                      value="Wednesday"
                      name="day"
                      checked={meetingDay === "Wednesday"}
                      onChange={(e) => setMeetingDay(e.target.value)}
                    />
                  </label>
                  <label>
                    Th
                    <input
                      type="radio"
                      value="Thursday"
                      name="day"
                      checked={meetingDay === "Thursday"}
                      onChange={(e) => setMeetingDay(e.target.value)}
                    />
                  </label>
                  <label>
                    F
                    <input
                      type="radio"
                      value="Friday"
                      name="day"
                      checked={meetingDay === "Friday"}
                      onChange={(e) => setMeetingDay(e.target.value)}
                    />
                  </label>
                  <label>
                    S
                    <input
                      type="radio"
                      value="Saturday"
                      name="day"
                      checked={meetingDay === "Saturday"}
                      onChange={(e) => setMeetingDay(e.target.value)}
                    />
                  </label>
                </div>
              </div>
              <div></div>
            </div>
            <div className="form-content">
              <div>
                <label>Start time</label>
                <input
                  type="time"
                  value={startTime}
                  className={timeError ? "error-border" : ""}
                  onChange={(e) => setStartTime(e.target.value)}
                />
              </div>
              <div>
                {timeError && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    Time conflict detected between{" "}
                    {`${
                      parseInt(sectionCollisionTime.start.slice(0, 2)) % 12 ||
                      12
                    }:${sectionCollisionTime.start.slice(3, 5)} ${
                      parseInt(sectionCollisionTime.start.slice(0, 2)) >= 12
                        ? "PM"
                        : "AM"
                    }`}{" "}
                    and{" "}
                    {`${
                      parseInt(sectionCollisionTime.end.slice(0, 2)) % 12 || 12
                    }:${sectionCollisionTime.end.slice(3, 5)} ${
                      parseInt(sectionCollisionTime.end.slice(0, 2)) >= 12
                        ? "PM"
                        : "AM"
                    }`}
                  </p>
                )}
              </div>
            </div>
            <div className="form-content">
              <div>
                <label>End time</label>
                <input
                  type="time"
                  value={endTime}
                  className={timeError ? "error-border" : ""}
                  onChange={(e) => setEndTime(e.target.value)}
                />
              </div>
              <div></div>
            </div>
            <button className="add-sched" type="submit">
              Add schedule
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
                      setInstructorName(
                        `${instructor.first_name} ${instructor.middle_name} ${instructor.last_name}`
                      )
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
                    onClick={() => setSubjectName(subject.subject_name)}
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
                    onClick={() => {
                      setRoomName(room.room_name);
                      setRoomBuilding(room.room_building);
                    }}
                  >
                    {room.room_name} - {room.room_building}
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

export default AddSchedule;
