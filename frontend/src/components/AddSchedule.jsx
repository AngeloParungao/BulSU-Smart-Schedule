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

  // State variables to manage schedules, instructors, subjects, sections, rooms, errors, recommendations data
  const [schedules, setSchedules] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [sections, setSections] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [errors, setErrors] = useState({});
  const [recommendations, setRecommendations] = useState([]);

  // State variables for the form fields
  const [data, setData] = useState({
    subject: "",
    instructor: "",
    room: "",
    room_building: "",
    background_color: "#ffffff",
    day: "",
    start_time: "",
    end_time: "",
    course_type: "Lecture",
    section,
    group,
    department_code: currentDepartment,
  });

  // Pagination state for instructors, subjects, and rooms
  const [currentInstructorPage, setCurrentInstructorPage] = useState(0);
  const [currentSubjectPage, setCurrentSubjectPage] = useState(0);
  const [currentRoomPage, setCurrentRoomPage] = useState(0);
  const itemsPerPage = 5;

  // Fetch data when the component mounts
  useEffect(() => {
    fetchData();
  }, []);

  // Generate recommendations whenever relevant fields change
  useEffect(() => {
    // Call generateRecommendations and checkRealTimeErrors
    generateRecommendations(schedules);
    checkRealTimeErrors();
  }, [
    data.subject,
    data.instructor,
    data.room,
    data.room_building,
    data.background_color,
    data.day,
    data.start_time,
    data.end_time,
    data.course_type,
  ]);

  // Fetch data from the server
  const fetchData = async () => {
    try {
      const date = new Date();
      const year = date.getFullYear();
      const month = date.getMonth() + 1;
      const [scheduleRes, instructorRes, sectionRes, subjectRes, roomRes] =
        await Promise.all([
          axios.get(`${url}api/schedule/fetch`),
          axios.get(
            `${url}api/instructors/fetch?dept_code=${currentDepartment}`
          ),
          axios.get(`${url}api/sections/fetch?dept_code=${currentDepartment}`),
          axios.get(`${url}api/subjects/fetch?dept_code=${currentDepartment}`),
          axios.get(`${url}api/rooms/fetch`),
        ]);

      if (month >= 1 && month <= 5) {
        setSchedules(
          scheduleRes.data.filter(
            (item) =>
              item.semester === "2nd" &&
              item.academic_year === `${year - 1}-${year}`
          )
        );
      } else if (month >= 6 && month <= 12) {
        setSchedules(
          scheduleRes.data.filter(
            (item) =>
              item.semester === "1st" &&
              item.academic_year === `${year}-${year + 1}`
          )
        );
      }
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
    const days = [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    const availableSlots = [];

    const subject = subjects.find(
      (subject) => subject.subject_name === data.subject
    );

    // Determine the duration based on course type, subject type, and unit
    const duration =
      subject && subject.subject_units === 1
        ? 1
        : data.course_type === "Laboratory" ||
          (subject && subject.subject_type === "Minor")
        ? 3
        : 2;

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
            schedule.instructor === data.instructor &&
            schedule.day === day &&
            isConflict(schedule, start, end)
        );

        const roomAvailable = !schedules.some(
          (schedule) =>
            schedule.room === data.room &&
            schedule.day === day &&
            isConflict(schedule, start, end)
        );

        const sectionAvailable = !schedules.some(
          (schedule) =>
            schedule.section_name === section &&
            schedule.section_group === group &&
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

  const checkRealTimeErrors = () => {
    const timeToMinutes = (time) =>
      parseInt(time.split(":")[0]) * 60 + parseInt(time.split(":")[1]);
    const newStartInMinutes = timeToMinutes(data.start_time);
    const newEndInMinutes = timeToMinutes(data.end_time);

    const isTimeConflict = (schedule) => {
      const scheduleStartInMinutes = timeToMinutes(schedule.start_time);
      const scheduleEndInMinutes = timeToMinutes(schedule.end_time);
      return (
        (newStartInMinutes >= scheduleStartInMinutes &&
          newStartInMinutes < scheduleEndInMinutes) ||
        (newEndInMinutes > scheduleStartInMinutes &&
          newEndInMinutes <= scheduleEndInMinutes) ||
        (newStartInMinutes <= scheduleStartInMinutes &&
          newEndInMinutes >= scheduleEndInMinutes)
      );
    };

    const hasSectionConflict = schedules.find(
      (schedule) =>
        schedule.section_name === section &&
        schedule.section_group === group &&
        schedule.day === data.day &&
        isTimeConflict(schedule)
    );

    const hasInstructorConflict = schedules.find(
      (schedule) =>
        schedule.instructor === data.instructor &&
        schedule.day === data.day &&
        isTimeConflict(schedule)
    );

    const hasRoomConflict = schedules.find(
      (schedule) =>
        schedule.room === data.room &&
        schedule.day === data.day &&
        isTimeConflict(schedule)
    );

    const subjectSchedules = schedules.filter(
      (schedule) =>
        schedule.subject === data.subject &&
        schedule.section_name === section &&
        schedule.section_group === group
    );

    const calculateTotalDuration = (schedules) => {
      return schedules.reduce((sum, schedule) => {
        return (
          sum +
          (timeToMinutes(schedule.end_time) -
            timeToMinutes(schedule.start_time))
        );
      }, 0);
    };

    const totalDuration = calculateTotalDuration(subjectSchedules);
    const newScheduleDuration = newEndInMinutes - newStartInMinutes;

    const exceedsLimits =
      totalDuration + newScheduleDuration > 5 * 60 ||
      subjectSchedules.length >= 2;

    const alreadyExists = subjectSchedules.some(
      (schedule) => schedule.class_type === data.course_type
    );

    setErrors({
      time_error: !!hasSectionConflict,
      section_collision_time: hasSectionConflict
        ? {
            start_time: hasSectionConflict.start_time,
            end_time: hasSectionConflict.end_time,
          }
        : null,
      instructor_error: !!hasInstructorConflict,
      instructor_collision_time: hasInstructorConflict
        ? {
            start_time: hasInstructorConflict.start_time,
            end_time: hasInstructorConflict.end_time,
          }
        : null,
      room_error: !!hasRoomConflict,
      room_collision_time: hasRoomConflict
        ? {
            start_time: hasRoomConflict.start_time,
            end_time: hasRoomConflict.end_time,
            department: hasRoomConflict.department_code,
          }
        : null,
      subject_error: exceedsLimits,
      course_error: alreadyExists,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      data.subject === "" ||
      data.course_type === "" ||
      data.instructor === "" ||
      data.room === "" ||
      data.start_time === "" ||
      data.end_time === "" ||
      data.day === ""
    ) {
      toast.error("Please fill in all the required fields.");
      return;
    } else if (
      errors.time_error ||
      errors.section_collision_time ||
      errors.instructor_error ||
      errors.instructor_collision_time ||
      errors.room_error ||
      errors.room_collision_time ||
      errors.subject_error ||
      errors.course_error
    ) {
      toast.error("There are errors in the form. Please fix them.");
      return;
    } else {
      try {
        // Check if subject type is 'Minor'
        const subject = subjects.find(
          (subject) => subject.subject_name === data.subject
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
                schedule.day === data.day &&
                ((data.start_time >= schedule.start_time &&
                  data.start_time < schedule.end_time) ||
                  (data.end_time > schedule.start_time &&
                    data.end_time <= schedule.end_time) ||
                  (data.start_time <= schedule.start_time &&
                    data.end_time >= schedule.end_time))
            );

            if (
              isAlternateGroupAvailable /*&& window.confirm(`Do you want to also add this to this section's other group (${alternateGroup})?`)*/
            ) {
              // Add the same item to the alternate group
              const alternateItem = {
                ...data,
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
        await axios.post(`${url}api/schedule/adding`, data);

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
        onClose();
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
  const filteredRooms = rooms.filter(
    (room) => room.room_type === data.course_type
  );

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
                  className={errors.instructor_error ? "error-border" : ""}
                  required
                  readOnly
                />
              </div>
              <div>
                {errors.instructor_error && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    Instructor not available between{" "}
                    {`${
                      parseInt(
                        errors.instructor_collision_time.start_time.slice(0, 2)
                      ) % 12 || 12
                    }:${errors.instructor_collision_time.start_time.slice(
                      3,
                      5
                    )} ${
                      parseInt(
                        errors.instructor_collision_time.start_time.slice(0, 2)
                      ) >= 12
                        ? "PM"
                        : "AM"
                    }`}{" "}
                    and{" "}
                    {`${
                      parseInt(
                        errors.instructor_collision_time.end_time.slice(0, 2)
                      ) % 12 || 12
                    }:${errors.instructor_collision_time.end_time.slice(
                      3,
                      5
                    )} ${
                      parseInt(
                        errors.instructor_collision_time.end_time.slice(0, 2)
                      ) >= 12
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
                  value={data.subject}
                  onChange={(e) =>
                    setData({ ...data, subject: e.target.value })
                  }
                  className={errors.subject_error ? "error-border" : ""}
                  required
                  readOnly
                />
              </div>
              <div>
                {errors.subject_error && (
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
                    className={errors.course_error ? "error-border" : ""}
                    onChange={(e) =>
                      setData({ ...data, course_type: e.target.value })
                    }
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Laboratory">Laboratory</option>
                  </select>
                </div>
                <div>
                  {errors.course_error && (
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
                  className={errors.room_error ? "error-border" : ""}
                  required
                  readOnly
                />
              </div>
              <div>
                {errors.room_error && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    {`Room is occupied by ${errors.room_collision_time.department} department`}
                  </p>
                )}
              </div>
            </div>
            <div className="form-content">
              <div>
                <label>Color</label>
                <input
                  type="color"
                  value={data.background_color}
                  onChange={(e) =>
                    setData({ ...data, background_color: e.target.value })
                  }
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
                <label>Start time</label>
                <input
                  type="time"
                  name="startTime"
                  className={errors.time_error ? "error-border" : ""}
                  value={data.start_time}
                  onChange={(e) =>
                    setData({ ...data, start_time: e.target.value })
                  }
                />
              </div>
              <div>
                {errors.time_error && (
                  <p className="error-message">
                    <FontAwesomeIcon
                      icon={faWarning}
                      className="warning-icon"
                    />
                    Time conflict detected between{" "}
                    {`${
                      parseInt(
                        errors.section_collision_time.start_time.slice(0, 2)
                      ) % 12 || 12
                    }:${errors.section_collision_time.start_time.slice(3, 5)} ${
                      parseInt(
                        errors.section_collision_time.start_time.slice(0, 2)
                      ) >= 12
                        ? "PM"
                        : "AM"
                    }`}{" "}
                    and{" "}
                    {`${
                      parseInt(
                        errors.section_collision_time.end_time.slice(0, 2)
                      ) % 12 || 12
                    }:${errors.section_collision_time.end_time.slice(3, 5)} ${
                      parseInt(
                        errors.section_collision_time.end_time.slice(0, 2)
                      ) >= 12
                        ? "PM"
                        : "AM"
                    }`}
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
                  className={errors.time_error ? "error-border" : ""}
                  value={data.end_time}
                  onChange={(e) =>
                    setData({ ...data, end_time: e.target.value })
                  }
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
                    key={room.room_id}
                    onClick={() => {
                      setData({
                        ...data,
                        room: room.room_name,
                        room_building: room.room_building,
                      });
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
