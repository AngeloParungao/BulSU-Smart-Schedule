import React, { useState, useEffect } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Modal from "react-modal";
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

const AddSchedule = ({
  isOpen,
  onClose,
  section,
  group,
  onRefreshSchedules,
}) => {
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
  const [isSubmitting, setIsSubmitting] = useState(false);

  // For mobile view
  const [showErrors, setShowErrors] = useState({
    instructor: false,
    subject: false,
    course_type: false,
    room: false,
    time: false,
  });

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

    // Check limits for minor subjects
    const subject = subjects.find((sub) => sub.subject_name === data.subject);
    const isMinor = subject && subject.subject_type === "Minor";

    const exceedsMinorLimit =
      isMinor && totalDuration + newScheduleDuration > 180; // 180 minutes = 3 hours

    const exceedsLimits =
      totalDuration + newScheduleDuration > 5 * 60 ||
      subjectSchedules.length >= 2;

    const alreadyExists = subjectSchedules.some(
      (schedule) => schedule.class_type === data.course_type && !isMinor
    );

    // Check if the instructor is a part-timer and limit to 9 hours (540 minutes)
    const instructorSchedules = schedules.filter(
      (schedule) =>
        schedule.instructor === data.instructor && schedule.day === data.day
    );

    const instructorTotalHours = calculateTotalDuration(instructorSchedules);
    const instructor = instructors.find(
      (inst) =>
        inst.first_name + " " + inst.middle_name + " " + inst.last_name ===
        data.instructor
    );
    const isPartTimer = instructor && instructor.work_type === "Part-timer";

    const exceedsPartTimeLimit =
      isPartTimer && instructorTotalHours + newScheduleDuration > 540; // 540 minutes = 9 hours

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
            section: hasRoomConflict.section_name,
            department: hasRoomConflict.department_code,
          }
        : null,
      subject_error: exceedsLimits || exceedsMinorLimit,
      course_error: alreadyExists,
      part_time_error: exceedsPartTimeLimit,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

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
      setIsSubmitting(false);
      return;
    } else if (
      errors.time_error ||
      errors.section_collision_time ||
      errors.instructor_error ||
      errors.instructor_collision_time ||
      errors.room_error ||
      errors.room_collision_time ||
      errors.subject_error ||
      errors.course_error ||
      errors.part_time_error
    ) {
      toast.error("There are errors in the form. Please fix them.");
      setIsSubmitting(false);
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
        setIsSubmitting(false);
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
  const [selectedBuilding, setSelectedBuilding] = useState("");
  const [searchInstructorQuery, setSearchInstructorQuery] = useState("");
  const [searchSubjectQuery, setSearchSubjectQuery] = useState("");
  const [searchRoomQuery, setSearchRoomQuery] = useState("");

  const filteredInstructors = instructors.filter((instructor) => {
    const matchesTag = selectedTag === "" || instructor.tags === selectedTag;
    const matchesSearch =
      instructor.first_name
        .toLowerCase()
        .includes(searchInstructorQuery.toLowerCase()) ||
      instructor.last_name
        .toLowerCase()
        .includes(searchInstructorQuery.toLowerCase());
    return matchesTag && matchesSearch;
  });

  const filteredSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.subject_name
        .toLowerCase()
        .includes(searchSubjectQuery.toLowerCase()) ||
      subject.subject_code
        .toLowerCase()
        .includes(searchSubjectQuery.toLowerCase());
    const matchesLevel =
      selectedLevel === "" || subject.year_level === selectedLevel;
    const specialized =
      selectedTag === "" || subject.subject_tags === selectedTag;
    return matchesSearch && matchesLevel && specialized;
  });

  //------rooms-------//
  const filteredRooms = rooms.filter((room) => {
    const matchesSearch =
      room.room_name.toLowerCase().includes(searchRoomQuery.toLowerCase()) ||
      room.room_type.toLowerCase().includes(searchRoomQuery.toLowerCase()) ||
      room.room_building.toLowerCase().includes(searchRoomQuery.toLowerCase());

    const matchesBuilding =
      selectedBuilding === "" || room.room_building === selectedBuilding;

    return matchesSearch && matchesBuilding;
  });

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
      width: "98%",
      height: "98%",
      padding: "0.5rem",
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
      <div className="flex flex-col w-full h-full lg:gap-0 gap-4">
        <div className="flex w-full lg:h-1/2">
          <div className="absolute top-2 right-4">
            <button onClick={onClose}>
              <FontAwesomeIcon icon={faXmark} className="text-lg" />
            </button>
          </div>
          <div className="w-full h-full flex flex-col lg:flex-row items-center gap-4">
            <div className="lg:w-1/3 w-full lg:h-full h-[25rem] overflow-y-auto p-2 flex flex-col md:gap-2 gap-1 border-4 border-orange-100 rounded-md scrollbar">
              <span className="md:text-lg text-sm text-orange-400">
                <FontAwesomeIcon
                  icon={faLightbulb}
                  className="md:text-lg text-sm mr-2 text-orange-400"
                />
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
                    className="bg-orange-400 text-white p-2 rounded-md cursor-pointer"
                  >
                    <span className="text-white text-sm font-semibold mr-2 ml-2">
                      {rec.day}
                    </span>
                    :
                    <span className="text-white text-sm font-semibold ml-2">
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
            <form
              className="lg:w-2/3 lg:p-0 p-4 w-full h-full"
              onSubmit={handleSubmit}
            >
              <div className="flex flex-col justify-between h-full">
                <div className="flex gap-4">
                  <div
                    className={`${
                      showErrors.instructor ? "hidden" : ""
                    } flex items-center lg:w-1/2 w-full`}
                  >
                    <label className="w-1/2">Instructor</label>
                    <input
                      type="text"
                      name="instructorName"
                      placeholder="Instructor Name"
                      value={data.instructor}
                      onChange={(e) =>
                        setData({ ...data, instructor: e.target.value })
                      }
                      className={`${
                        errors.instructor_error
                          ? "border border-red-500"
                          : "border border-gray-300"
                      } w-full h-8 p-2 rounded-md text-sm focus:outline focus:outline-green-400 text-black`}
                      required
                      readOnly
                    />
                  </div>
                  <div
                    className={`${
                      showErrors.instructor ? "block" : "hidden"
                    } lg:block lg:w-1/2 w-full`}
                  >
                    {errors.part_time_error && (
                      <p className="text-[0.8rem] flex items-center px-2 py-[0.35rem] rounded-md border border-red-400">
                        <FontAwesomeIcon
                          icon={faWarning}
                          className="text-orange-500 text-lg mr-2"
                        />
                        Part timer instructor exceeds working hours
                      </p>
                    )}
                    {errors.instructor_error && (
                      <p className="text-[0.8rem] flex items-center px-2 py-[0.35rem] rounded-md border border-red-400">
                        <FontAwesomeIcon
                          icon={faWarning}
                          className="text-orange-500 text-lg mr-2"
                        />
                        Instructor not available between{" "}
                        {`${
                          parseInt(
                            errors.instructor_collision_time.start_time.slice(
                              0,
                              2
                            )
                          ) % 12 || 12
                        }:${errors.instructor_collision_time.start_time.slice(
                          3,
                          5
                        )} ${
                          parseInt(
                            errors.instructor_collision_time.start_time.slice(
                              0,
                              2
                            )
                          ) >= 12
                            ? "PM"
                            : "AM"
                        }`}{" "}
                        and{" "}
                        {`${
                          parseInt(
                            errors.instructor_collision_time.end_time.slice(
                              0,
                              2
                            )
                          ) % 12 || 12
                        }:${errors.instructor_collision_time.end_time.slice(
                          3,
                          5
                        )} ${
                          parseInt(
                            errors.instructor_collision_time.end_time.slice(
                              0,
                              2
                            )
                          ) >= 12
                            ? "PM"
                            : "AM"
                        }`}
                      </p>
                    )}
                  </div>
                  {errors.instructor_error && (
                    <div
                      className="flex items-center justify-center ml-2 hover:cursor-pointer lg:hidden"
                      onClick={() =>
                        setShowErrors({
                          ...showErrors,
                          instructor: !showErrors.instructor,
                        })
                      }
                    >
                      <FontAwesomeIcon
                        icon={faWarning}
                        className="text-orange-500 text-lg mr-2"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <div
                    className={`${
                      showErrors.subject ? "hidden" : ""
                    } flex items-center lg:w-1/2 w-full`}
                  >
                    <label className="w-1/2">Course Title</label>
                    <input
                      type="text"
                      name="subjectName"
                      placeholder="Subject Name"
                      value={data.subject}
                      onChange={(e) =>
                        setData({ ...data, subject: e.target.value })
                      }
                      className={`${
                        errors.subject_error
                          ? "border border-red-500"
                          : "border border-gray-300"
                      }
                      w-full h-8 p-2 rounded-md text-sm focus:outline focus:outline-green-400 text-black`}
                      required
                      readOnly
                    />
                  </div>
                  <div
                    className={`${
                      showErrors.subject ? "block" : "hidden"
                    } lg:block lg:w-1/2 w-full`}
                  >
                    {errors.subject_error && (
                      <p className="text-[0.8rem] flex items-center px-2 py-[0.35rem] rounded-md border border-red-400">
                        <FontAwesomeIcon
                          icon={faWarning}
                          className="text-orange-500 text-lg mr-2"
                        />
                        Subject has reached meeting quota
                      </p>
                    )}
                  </div>
                  {errors.subject_error && (
                    <div
                      className="flex items-center justify-center ml-2 hover:cursor-pointer lg:hidden"
                      onClick={() =>
                        setShowErrors({
                          ...showErrors,
                          subject: !showErrors.subject,
                        })
                      }
                    >
                      <FontAwesomeIcon
                        icon={faWarning}
                        className="text-orange-500 text-lg mr-2"
                      />
                    </div>
                  )}
                </div>
                {data.subject === "" ||
                subjects.find(
                  (subject) => subject.subject_name === data.subject
                )?.subject_type === "Major" ? (
                  <div className="flex gap-4">
                    <div
                      className={`${
                        showErrors.course_type ? "hidden" : ""
                      } flex items-center lg:w-1/2 w-full`}
                    >
                      <label className="w-1/2">Course Type</label>
                      <select
                        value={data.course_type}
                        className={`${
                          errors.course_error
                            ? "border border-red-500"
                            : "border border-gray-300"
                        } w-full h-8 px-2 rounded-md text-sm focus:outline focus:outline-green-400 text-black`}
                        onChange={(e) =>
                          setData({ ...data, course_type: e.target.value })
                        }
                      >
                        <option value="Lecture">Lecture</option>
                        <option value="Laboratory">Laboratory</option>
                      </select>
                    </div>
                    <div
                      className={`${
                        showErrors.course_type ? "block" : "hidden"
                      } lg:block lg:w-1/2 w-full`}
                    >
                      {errors.course_error && (
                        <p className="text-[0.8rem] flex items-center px-2 py-[0.35rem] rounded-md border border-red-400">
                          <FontAwesomeIcon
                            icon={faWarning}
                            className="text-orange-500 text-lg mr-2"
                          />
                          This course type is already created
                        </p>
                      )}
                    </div>
                    {errors.course_error && (
                      <div
                        className="flex items-center justify-center ml-2 hover:cursor-pointer lg:hidden"
                        onClick={() =>
                          setShowErrors({
                            ...showErrors,
                            course_type: !showErrors.course_type,
                          })
                        }
                      >
                        <FontAwesomeIcon
                          icon={faWarning}
                          className="text-orange-500 text-lg mr-2"
                        />
                      </div>
                    )}
                  </div>
                ) : null}
                <div className="flex gap-4">
                  <div
                    className={`${
                      showErrors.room ? "hidden" : ""
                    } flex items-center lg:w-1/2 w-full`}
                  >
                    <label className="w-1/2">Room #</label>
                    <input
                      type="text"
                      name="roomName"
                      placeholder="Room"
                      value={data.room}
                      onChange={(e) =>
                        setData({ ...data, room: e.target.value })
                      }
                      className={`${
                        errors.room_error
                          ? "border border-red-500"
                          : "border border-gray-300"
                      }
                      w-full h-8 p-2 rounded-md text-sm focus:outline focus:outline-green-400 text-black`}
                      required
                      readOnly
                    />
                  </div>
                  <div
                    className={`${
                      showErrors.room ? "block" : "hidden"
                    } lg:block lg:w-1/2 w-full`}
                  >
                    {errors.room_error && (
                      <p className="text-[0.8rem] flex items-center px-2 py-[0.35rem] rounded-md border border-red-400">
                        <FontAwesomeIcon
                          icon={faWarning}
                          className="text-orange-500 text-lg mr-2"
                        />
                        {`Room is occupied by ${
                          errors.room_collision_time.department
                        } department section ${errors.room_collision_time.section.slice(
                          -2
                        )} at
                    ${
                      parseInt(
                        errors.room_collision_time.start_time.slice(0, 2)
                      ) % 12 || 12
                    }:${errors.room_collision_time.start_time.slice(3, 5)} ${
                          parseInt(
                            errors.room_collision_time.start_time.slice(0, 2)
                          ) >= 12
                            ? "PM"
                            : "AM"
                        }`}{" "}
                        to{" "}
                        {`${
                          parseInt(
                            errors.room_collision_time.end_time.slice(0, 2)
                          ) % 12 || 12
                        }:${errors.room_collision_time.end_time.slice(3, 5)} ${
                          parseInt(
                            errors.room_collision_time.end_time.slice(0, 2)
                          ) >= 12
                            ? "PM"
                            : "AM"
                        }`}
                      </p>
                    )}
                  </div>
                  {errors.room_error && (
                    <div
                      className="flex items-center justify-center ml-2 hover:cursor-pointer lg:hidden"
                      onClick={() =>
                        setShowErrors({
                          ...showErrors,
                          room: !showErrors.room,
                        })
                      }
                    >
                      <FontAwesomeIcon
                        icon={faWarning}
                        className="text-orange-500 text-lg mr-2"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center lg:w-1/2 w-full">
                    <label className="w-1/2">Color</label>
                    <input
                      type="color"
                      value={data.background_color}
                      onChange={(e) =>
                        setData({ ...data, background_color: e.target.value })
                      }
                      className="w-full h-8 rounded-md focus:outline focus:outline-green-400 text-black"
                    />
                  </div>
                  <div className="lg:block lg:w-1/2 w-full hidden"></div>
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center lg:w-1/2 w-full">
                    <label className="w-1/2">Meeting Day</label>
                    <select
                      value={data.day}
                      className="w-full h-8 rounded-md px-2 text-sm focus:outline focus:outline-green-400 text-black border border-gray-300"
                      onChange={(e) =>
                        setData({ ...data, day: e.target.value })
                      }
                    >
                      <option value="">Select Day</option>
                      <option value="Monday">Monday</option>
                      <option value="Tuesday">Tuesday</option>
                      <option value="Wednesday">Wednesday</option>
                      <option value="Thursday">Thursday</option>
                      <option value="Friday">Friday</option>
                      <option value="Saturday">Saturday</option>
                      <option value="Sunday">Sunday</option>
                    </select>
                  </div>
                  <div className="lg:block lg:w-1/2 w-full hidden"></div>
                </div>
                <div className="flex gap-4">
                  <div
                    className={`${
                      showErrors.time ? "hidden" : ""
                    } flex items-center lg:w-1/2 w-full`}
                  >
                    <label className="w-1/2">Start time</label>
                    <input
                      type="time"
                      name="startTime"
                      className={`${
                        errors.time_error
                          ? "border border-red-500"
                          : "border border-gray-300"
                      } w-full h-8 p-2 rounded-md text-sm focus:outline focus:outline-green-400 text-black`}
                      value={data.start_time}
                      onChange={(e) =>
                        setData({ ...data, start_time: e.target.value })
                      }
                    />
                  </div>
                  <div
                    className={`${
                      showErrors.time ? "block" : "hidden"
                    } lg:block lg:w-1/2 w-full`}
                  >
                    {errors.time_error && (
                      <p className="text-[0.8rem] flex items-center px-2 py-[0.35rem] rounded-md border border-red-400">
                        <FontAwesomeIcon
                          icon={faWarning}
                          className="text-orange-500 text-lg mr-2"
                        />
                        Time conflict detected between{" "}
                        {`${
                          parseInt(
                            errors.section_collision_time.start_time.slice(0, 2)
                          ) % 12 || 12
                        }:${errors.section_collision_time.start_time.slice(
                          3,
                          5
                        )} ${
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
                        }:${errors.section_collision_time.end_time.slice(
                          3,
                          5
                        )} ${
                          parseInt(
                            errors.section_collision_time.end_time.slice(0, 2)
                          ) >= 12
                            ? "PM"
                            : "AM"
                        }`}
                      </p>
                    )}
                  </div>
                  {errors.time_error && (
                    <div
                      className="flex items-center justify-center ml-2 hover:cursor-pointer lg:hidden"
                      onClick={() =>
                        setShowErrors({
                          ...showErrors,
                          time: !showErrors.time,
                        })
                      }
                    >
                      <FontAwesomeIcon
                        icon={faWarning}
                        className="text-orange-500 text-lg mr-2"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-4">
                  <div className="flex items-center lg:w-1/2 w-full">
                    <label className="w-1/2">End Time</label>
                    <input
                      type="time"
                      name="endTime"
                      placeholder="End Time"
                      className={`${
                        errors.time_error
                          ? "border border-red-500"
                          : "border border-gray-300"
                      } w-full h-8 p-2 rounded-md text-sm focus:outline focus:outline-green-400 text-black`}
                      value={data.end_time}
                      onChange={(e) =>
                        setData({ ...data, end_time: e.target.value })
                      }
                    />
                  </div>
                  <div className="lg:block lg:w-1/2 w-full hidden"></div>
                </div>
                <button
                  className="lg:w-1/2 w-full h-8 bg-green-500 rounded-md text-white hover:bg-green-600"
                  type="submit"
                  disabled={isSubmitting}
                >
                  Add schedule
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="flex lg:flex-row flex-col justify-between lg:gap-8 gap-4 h-1/2 w-full">
          <div className="flex flex-col justify-between items-center h-full lg:w-[33.3%] w-full lg:border-none border border-gray-300 rounded-md p-4">
            <div className="w-full">
              <div className="flex justify-between items-center">
                <span className="text-md">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-gray-600 text-sm mr-2"
                  />
                  Instructors
                </span>
                <div className="flex items-center gap-2">
                  <label htmlFor="specialization" className="text-sm">
                    Specialization:
                  </label>
                  <select
                    name="specialization"
                    id="specialization"
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className="w-16 px-2 rounded-sm"
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
              </div>
              <div className="flex items-center p-[0.5rem] px-4 gap-2 border border-gray-300 rounded-lg focus-within:border-green-500">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Search instructors"
                  value={searchInstructorQuery}
                  onChange={(e) => setSearchInstructorQuery(e.target.value)}
                  className="w-full rounded-md text-sm focus:outline-none text-black"
                />
              </div>
            </div>
            <ul className="flex flex-col py-2 gap-1 w-full h-full">
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
                    className={`${
                      data.instructor ===
                      `${instructor.first_name} ${instructor.middle_name} ${instructor.last_name}`
                        ? "bg-green-500 text-white"
                        : "bg-gray-100"
                    } p-2 rounded-md cursor-pointer hover:bg-gray-300 hover:text-black text-sm`}
                  >
                    {instructor.first_name} {instructor.last_name}
                  </li>
                ))}
            </ul>
            <ReactPaginate
              previousLabel={
                <FontAwesomeIcon icon={faAngleLeft} className="p-1 px-2" />
              }
              nextLabel={
                <FontAwesomeIcon icon={faAngleRight} className="p-1 px-2" />
              }
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={Math.ceil(filteredInstructors.length / itemsPerPage)}
              onPageChange={({ selected }) =>
                setCurrentInstructorPage(selected)
              }
              activeClassName={"bg-green-600 text-white rounded-md p-1 px-2"}
              className="flex justify-end items-center gap-2 p-1 px-2 w-full"
            />
          </div>
          <div className="flex flex-col justify-between items-center h-full lg:w-[33.3%] w-full lg:border-none border border-gray-300 rounded-md p-4">
            <div className="w-full">
              <div className="flex justify-between items-center">
                <span className="text-md">
                  <FontAwesomeIcon
                    icon={faBook}
                    className="text-gray-600 text-sm mr-2"
                  />
                  Subjects
                </span>
                <div className="flex items-center gap-2">
                  <label htmlFor="yearLevel" className="text-sm">
                    Year Level:
                  </label>
                  <select
                    name="yearLevel"
                    id="yearLevel"
                    value={selectedLevel}
                    onChange={(e) => setSelectedLevel(e.target.value)}
                    className="w-16 px-2 rounded-sm"
                  >
                    <option value="">All</option>
                    {Array.from(
                      new Set(subjects.map((subject) => subject.year_level))
                    )
                      .sort()
                      .map((year, index) => (
                        <option key={index} value={year}>
                          {year}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center p-[0.5rem] px-4 gap-2 border border-gray-300 rounded-lg focus-within:border-green-500">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Search subjects"
                  value={searchSubjectQuery}
                  onChange={(e) => setSearchSubjectQuery(e.target.value)}
                  className="w-full rounded-md text-sm focus:outline-none text-black"
                />
              </div>
            </div>
            <ul className="flex flex-col py-2 gap-1 w-full h-full">
              {filteredSubjects
                .slice(
                  currentSubjectPage * itemsPerPage,
                  (currentSubjectPage + 1) * itemsPerPage
                )
                .map((subject) => {
                  const hasTwoMeetings =
                    schedules.filter(
                      (schedule) =>
                        schedule.subject === subject.subject_name &&
                        schedule.section_name === section &&
                        schedule.section_group === group
                    ).length >= 2;
                  return (
                    <li
                      key={subject.id}
                      onClick={() =>
                        setData({ ...data, subject: subject.subject_name })
                      }
                      className={`${
                        data.subject === subject.subject_name
                          ? "bg-green-500 text-white"
                          : hasTwoMeetings
                          ? "bg-gray-300"
                          : "bg-gray-100"
                      } p-2 rounded-md cursor-pointer hover:bg-gray-300 hover:text-black text-sm`}
                    >
                      {`${subject.subject_code} - ${subject.subject_name}`}
                    </li>
                  );
                })}
            </ul>
            <ReactPaginate
              previousLabel={
                <FontAwesomeIcon icon={faAngleLeft} className="p-1 px-2" />
              }
              nextLabel={
                <FontAwesomeIcon icon={faAngleRight} className="p-1 px-2" />
              }
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={Math.ceil(subjects.length / itemsPerPage)}
              onPageChange={({ selected }) => setCurrentSubjectPage(selected)}
              activeClassName={"bg-green-600 text-white rounded-md p-1 px-2"}
              className="flex justify-end items-center gap-2 p-1 px-2 w-full"
            />
          </div>
          <div className="flex flex-col justify-between items-center h-full lg:w-[33.3%] w-full lg:border-none border border-gray-300 rounded-md p-4">
            <div className="w-full">
              <div className="flex justify-between items-center">
                <span className="text-md">
                  <FontAwesomeIcon
                    icon={faDoorOpen}
                    className="text-gray-600 text-sm mr-2"
                  />
                  Rooms
                </span>
                <div className="flex items-center gap-2">
                  <label htmlFor="building" className="text-sm">
                    Building:
                  </label>
                  <select
                    name="building"
                    id="building"
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="w-16 px-2 rounded-sm"
                  >
                    <option value="">All</option>
                    {Array.from(
                      new Set(rooms.map((room) => room.room_building))
                    )
                      .sort()
                      .map((building, index) => (
                        <option key={index} value={building}>
                          {building}
                        </option>
                      ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center p-[0.5rem] px-4 gap-2 border border-gray-300 rounded-lg focus-within:border-green-500">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="text-gray-400 text-sm"
                />
                <input
                  type="text"
                  placeholder="Search rooms"
                  value={searchRoomQuery}
                  onChange={(e) => setSearchRoomQuery(e.target.value)}
                  className="w-full rounded-md text-sm focus:outline-none text-black"
                />
              </div>
            </div>
            <ul className="flex flex-col py-2 gap-1 w-full h-full">
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
                    className={`${
                      data.room === room.room_name
                        ? "bg-green-500 text-white"
                        : "bg-gray-100"
                    } p-2 rounded-md cursor-pointer hover:bg-gray-300 hover:text-black text-sm`}
                  >
                    {room.room_name} - {room.room_building}
                  </li>
                ))}
            </ul>
            <ReactPaginate
              previousLabel={
                <FontAwesomeIcon icon={faAngleLeft} className="p-1 px-2" />
              }
              nextLabel={
                <FontAwesomeIcon icon={faAngleRight} className="p-1 px-2" />
              }
              breakLabel={"..."}
              breakClassName={"break-me"}
              pageCount={Math.ceil(filteredRooms.length / itemsPerPage)}
              onPageChange={({ selected }) => setCurrentRoomPage(selected)}
              activeClassName={"bg-green-600 text-white rounded-md p-1 px-2"}
              className="flex justify-end items-center gap-2 p-1 px-2 w-full"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default AddSchedule;
