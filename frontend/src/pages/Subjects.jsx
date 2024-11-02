import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PasswordPrompt from "../components/PasswordPrompt";
import DeleteConfirmation from "../components/DeleteConfirmation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSearch } from "@fortawesome/free-solid-svg-icons";
import { exportToCSV } from "../utils/exportToCSV";

const Subjects = () => {
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const currentRole = atob(localStorage.getItem("userRole"));
  const url = process.env.REACT_APP_URL;
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectIdToUpdate, setSubjectIdToUpdate] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedUnits, setSelectedUnits] = useState("All");
  const [selectedLabels, setSelectedLabels] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    subject_name: "",
    subject_code: "",
    year_level: "",
    subject_semester: "",
    subject_type: "",
    subject_units: "",
    subject_tags: "",
    department_code: currentRole === "Administrator" ? "" : currentDepartment,
    old_subject_name: "",
  });

  useEffect(() => {
    setErrors({});
  }, [isUpdating]);

  useEffect(() => {
    fetchSubjects();
    fetchDepartments();
  }, []);

  const fetchSubjects = async () => {
    try {
      const response = await axios.get(
        `${url}api/subjects/fetch?dept_code=${currentDepartment}`
      );
      setSubjects(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(`${url}api/departments/fetch`);
      setDepartments(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const resetForm = () => {
    setData({
      subject_name: "",
      subject_code: "",
      year_level: "",
      subject_semester: "",
      subject_type: "",
      subject_units: "",
      subject_tags: "",
      department_code: currentRole === "Administrator" ? "" : currentDepartment,
      old_subject_name: "",
    });
    setIsUpdating(false);
  };

  const filterSubjects = subjects.filter((subject) => {
    const matchesSearch =
      subject.subject_name.toLowerCase().includes(search.toLowerCase()) ||
      subject.subject_code.toLowerCase().includes(search.toLowerCase()) ||
      subject.year_level.toLowerCase().includes(search.toLowerCase()) ||
      subject.subject_semester.toString().includes(search) ||
      subject.subject_type.toLowerCase().includes(search.toLowerCase()) ||
      subject.subject_units.toString().includes(search) ||
      (subject.subject_tags || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      subject.department_code.toLowerCase().includes(search.toLowerCase());

    const matchesType =
      selectedType === "All" || subject.subject_type === selectedType;

    const matchesUnits =
      selectedUnits === "All" ||
      subject.subject_units.toString() === selectedUnits;

    const matchesLabels =
      selectedLabels === "All" ||
      (selectedLabels === "" &&
        (!subject.subject_tags || subject.subject_tags.trim() === "")) || // Only match empty tags for "No Labels"
      (selectedLabels &&
        subject.subject_tags &&
        subject.subject_tags.includes(selectedLabels)); // Match specific label

    const matchesYear =
      selectedYear === "All" || subject.year_level === selectedYear;

    const matchesSemester =
      selectedSemester === "All" ||
      subject.subject_semester.toString() === selectedSemester;

    const matchesDepartment =
      selectedDepartment === "All" ||
      subject.department_code === selectedDepartment;

    return (
      matchesSearch &&
      matchesType &&
      matchesUnits &&
      matchesLabels &&
      matchesYear &&
      matchesSemester &&
      matchesDepartment
    );
  });

  const selectAll = () => {
    if (selectedSubjects.length === filterSubjects.length) {
      setSelectedSubjects([]);
    } else {
      const allSubjectIds = filterSubjects.map((subject) => subject.subject_id);
      setSelectedSubjects(allSubjectIds);
    }
  };

  const handleCheckboxChange = (subject) => {
    if (selectedSubjects.includes(subject)) {
      setSelectedSubjects(selectedSubjects.filter((s) => s !== subject));
    } else {
      setSelectedSubjects([...selectedSubjects, subject]);
    }
  };

  const handleUpdate = (subject) => {
    setIsUpdating(true);
    setSubjectIdToUpdate(subject.subject_id);
    setData({
      subject_name: subject.subject_name,
      subject_code: subject.subject_code,
      year_level: subject.year_level,
      subject_semester: subject.subject_semester,
      subject_type: subject.subject_type,
      subject_units: subject.subject_units,
      subject_tags: subject.subject_tags,
      department_code: subject.department_code,
      old_subject_name: subject.subject_name,
    });
  };

  const handleDelete = async () => {
    if (!selectedSubjects.length) {
      toast.error("Please select at least one subject.");
      return;
    }
    // Prompt the user to confirm the deletion
    setShowConfirmDelete(false);
    setShowPasswordPrompt(true);
  };

  const handlePasswordSubmit = async (password) => {
    try {
      // Fetch user data to validate password
      const response = await axios.post(`${url}api/auth/verify-password`, {
        user_id: currentUser,
        password: password,
      });

      // Check if the password is correct (isMatch: true)
      if (response.data.isMatch) {
        try {
          // Proceed with deletion
          await axios.delete(`${url}api/subjects/delete/`, {
            data: { subject_ids: selectedSubjects },
          });

          // Log the deletion activity
          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Delete",
            details: `${selectedSubjects.length}`,
            type: "subject",
          });

          toast.success("Deleted successfully!");
          setSelectedSubjects([]);
          fetchSubjects();
        } catch (error) {
          console.error("Error deleting data:", error);
          toast.error("Error deleting subjects.");
        }
      }
    } catch (error) {
      if (error.response.status === 401) {
        toast.error("Incorrect Password!");
      } else {
        console.error("Error verifying password:", error);
        toast.error("Error verifying password.");
      }
    } finally {
      setShowPasswordPrompt(false);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      "Subject Name",
      "Subject Code",
      "Year Level",
      "Subject Type",
      "Subject Units",
      "Subject Tags",
      "Department Code",
    ];
    const data = subjects.map((subject) => [
      subject.subject_name,
      subject.subject_code,
      subject.year_level,
      subject.subject_type,
      subject.subject_units,
      subject.subject_tags,
      subject.department_code,
    ]);
    exportToCSV("subjects", headers, data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validateErrors = {};
    const subjectExists = subjects.some(
      (subject) =>
        subject.subject_name === data.subject_name &&
        subject.subject_code === data.subject_code &&
        (!isUpdating || subject.subject_id !== subjectIdToUpdate)
    );

    if (subjectExists) {
      validateErrors.subject_name = "Subject already exists!";
    }
    if (!data.subject_name) {
      validateErrors.subject_name = "Subject name is required";
    }
    if (!data.subject_code) {
      validateErrors.subject_code = "Subject code is required";
    }
    if (!data.year_level) {
      validateErrors.year_level = "Year level is required";
    }
    if (!data.subject_type) {
      validateErrors.subject_type = "Required";
    }
    if (!data.subject_units) {
      validateErrors.subject_units = "Required";
    }
    if (!data.subject_semester) {
      validateErrors.subject_semester = "Required";
    }
    if (!data.department_code) {
      validateErrors.department_code = "Required";
    }

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
    } else {
      setErrors({});
      try {
        if (isUpdating) {
          await axios.put(
            `${url}api/subjects/update/${subjectIdToUpdate}`,
            data
          );
          toast.success("Subject updated successfully!");
        } else {
          await axios.post(`${url}api/subjects/adding`, data);
          toast.success("Subject added successfully!");
        }

        // Log activity
        await axios.post(`${url}api/activity/adding`, {
          user_id: currentUser,
          department_code: currentDepartment,
          action: isUpdating ? "Update" : "Add",
          details: `${data.subject_name} (${data.subject_code})`,
          type: "subject",
        });

        fetchSubjects();
        resetForm();
      } catch (error) {
        console.error(
          `Error ${isUpdating ? "updating" : "adding"} subject:`,
          error
        );
        toast.error(`Error ${isUpdating ? "updating" : "adding"} subject.`);
      }
    }
  };

  const getSubjectName = () => {
    const subject = subjects.find(
      (subject) => subject.subject_id === selectedSubjects[0]
    );
    return subject ? `${subject.subject_name} (${subject.subject_code})` : null;
  };

  return (
    <div className="h-full flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-20 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-full">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)] z-10">
          <span className="md:text-4xl text-2xl font-medium">Subjects</span>
          <Navbar />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start items-center w-full h-[calc(100%-4.5rem)] p-3 gap-8 lg:gap-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 p-4 px-4 bg-white shadow-md rounded-lg w-[100%] lg:w-[30%]"
          >
            <h2 className="text-xl font-semibold text-black">
              {isUpdating ? "Update Subject" : "Add Subject"}
            </h2>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2 w-full">
                <label htmlFor="subject_name" className="text-sm text-black">
                  Subject Name:
                </label>
                {errors.subject_name && (
                  <p className="text-red-500 text-xs">{errors.subject_name}</p>
                )}
              </div>
              <input
                type="text"
                name="subject_name"
                id="subject_name"
                placeholder="Subject Name"
                value={data.subject_name}
                onChange={(e) => {
                  setData({ ...data, subject_name: e.target.value });
                  setErrors({ ...errors, subject_name: "" });
                }}
                className={`${
                  errors.subject_name ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2 w-full">
                <label htmlFor="subject_code" className="text-sm text-black">
                  Subject Code:
                </label>
                {errors.subject_code && (
                  <p className="text-red-500 text-xs">{errors.subject_code}</p>
                )}
              </div>
              <input
                type="text"
                name="subject_code"
                id="subject_code"
                placeholder="Subject Code"
                value={data.subject_code}
                onChange={(e) => {
                  setData({ ...data, subject_code: e.target.value });
                  setErrors({ ...errors, subject_code: "" });
                }}
                className={`${
                  errors.subject_code ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2 w-full">
                <label htmlFor="year_level" className="text-sm text-black">
                  Year Level:
                </label>
                {errors.year_level && (
                  <p className="text-red-500 text-xs">{errors.year_level}</p>
                )}
              </div>
              <select
                name="year_level"
                id="year_level"
                value={data.year_level}
                onChange={(e) => {
                  setData({ ...data, year_level: e.target.value });
                  setErrors({ ...errors, year_level: "" });
                }}
                className={`${
                  errors.year_level ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              >
                <option value="">Year Level</option>
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-[0.2rem] w-full">
                <div className="flex items-center gap-2 w-full">
                  <label htmlFor="subject_type" className="text-sm text-black">
                    Subject Type:
                  </label>
                  {errors.subject_type && (
                    <p className="text-red-500 text-xs">
                      {errors.subject_type}
                    </p>
                  )}
                </div>
                <select
                  name="subject_type"
                  id="subject_type"
                  value={data.subject_type}
                  onChange={(e) => {
                    setData({ ...data, subject_type: e.target.value });
                    setErrors({ ...errors, subject_type: "" });
                  }}
                  className={`${
                    errors.subject_type ? "border-red-500" : ""
                  } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
                >
                  <option value="">Subject Type</option>
                  <option value="Minor">Minor</option>
                  <option value="Major">Major</option>
                </select>
              </div>
              <div className="flex flex-col gap-[0.2rem] w-full">
                <div className="flex items-center gap-2 w-full">
                  <label htmlFor="subject_unit" className="text-sm text-black">
                    Subject Unit:
                  </label>
                  {errors.subject_units && (
                    <p className="text-red-500 text-xs">
                      {errors.subject_units}
                    </p>
                  )}
                </div>
                <select
                  name="subject_unit"
                  id="subject_unit"
                  value={data.subject_units}
                  onChange={(e) => {
                    setData({ ...data, subject_units: e.target.value });
                    setErrors({ ...errors, subject_units: "" });
                  }}
                  className={`${
                    errors.subject_units ? "border-red-500" : ""
                  } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
                >
                  <option value="">Units</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-[0.2rem] w-full">
                <div className="flex items-center gap-2 w-full">
                  <label
                    htmlFor="subject_semester"
                    className="text-sm text-black"
                  >
                    Semester:
                  </label>
                  {errors.subject_semester && (
                    <p className="text-red-500 text-xs">
                      {errors.subject_semester}
                    </p>
                  )}
                </div>
                <select
                  name="subject_semester"
                  id="subject_semester"
                  value={data.subject_semester}
                  onChange={(e) =>
                    setData({ ...data, subject_semester: e.target.value })
                  }
                  className={`${
                    errors.subject_semester ? "border-red-500" : ""
                  } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
                >
                  <option value="">Semester</option>
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                </select>
              </div>
              {currentRole === "Administrator" && (
                <div className="flex flex-col gap-[0.2rem] w-full">
                  <div className="flex items-center gap-2 w-full">
                    <label htmlFor="department" className="text-sm text-black">
                      Department:
                    </label>
                    {errors.department_code && (
                      <p className="text-red-500 text-xs">
                        {errors.department_code}
                      </p>
                    )}
                  </div>
                  <select
                    name="department"
                    id="department"
                    value={data.department_code}
                    onChange={(e) => {
                      setData({ ...data, department_code: e.target.value });
                      setErrors({ ...errors, department_code: "" });
                    }}
                    className={`${
                      errors.department_code ? "border-red-500" : ""
                    } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
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
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <label htmlFor="subject_tags" className="text-sm text-black">
                Labels/Tags:
              </label>
              <textarea
                name="subject_tags"
                id="subject_tags"
                placeholder="ex:  Web and Mobile Applications"
                value={data.subject_tags}
                onChange={(e) =>
                  setData({ ...data, subject_tags: e.target.value })
                }
                className="p-2 h-[6rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none placeholder:text-sm placeholder:text-center"
              ></textarea>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-sm text-white py-2 rounded-md hover:bg-blue-600 transition-all"
              >
                {isUpdating ? "UPDATE SUBJECT" : "ADD SUBJECT"}
              </button>
              {isUpdating && (
                <button
                  type="button"
                  onClick={() => {
                    setIsUpdating(false);
                    resetForm();
                  }}
                  className="w-full bg-red-500 text-sm text-white py-2 rounded-md hover:bg-red-600 transition-all"
                >
                  CANCEL
                </button>
              )}
            </div>
          </form>
          <div className="h-full md:flex-1 w-full flex flex-col items-center lg:px-4 px-0 gap-2">
            <div className="relative flex justify-between items-center w-full">
              <div className="flex flex-col md:gap-4 gap-2">
                <div>
                  <FontAwesomeIcon
                    icon={faSearch}
                    className="absolute left-3 top-3 text-sm text-gray-300"
                  />
                  <input
                    className="md:w-[14rem] w-[8rem] h-[2.3rem] border border-gray-300 pl-8 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-300"
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)} // Update search term on input change
                  />
                </div>
                <div className="flex md:flex-row flex-col md:items-center md:gap-4 gap-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="course_type"
                      className="md:text-sm text-xs text-black"
                    >
                      Type:
                    </label>
                    <select
                      className="p-[0.2rem] text-black md:text-sm text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="course_type"
                      value={selectedType}
                      onChange={(e) => setSelectedType(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Major">Major</option>
                      <option value="Minor">Minor</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="units"
                      className="md:text-sm text-xs text-black"
                    >
                      Units:
                    </label>
                    <select
                      className="p-[0.2rem] text-black md:text-sm text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="units"
                      value={selectedUnits}
                      onChange={(e) => setSelectedUnits(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="1">1</option>
                      <option value="2">2</option>
                      <option value="3">3</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="labels"
                      className="md:text-sm text-xs text-black"
                    >
                      Labels/Tags:
                    </label>
                    <select
                      className="p-[0.2rem] text-black md:text-sm text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="labels"
                      value={selectedLabels}
                      onChange={(e) => setSelectedLabels(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="">No Labels</option>
                      {Array.from(
                        new Set(subjects.map((subject) => subject.subject_tags))
                      )
                        .filter(Boolean)
                        .map((label, index) => (
                          <option key={index} value={label}>
                            {label}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
                <div className="flex md:flex-row flex-col md:gap-4 gap-2">
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="order"
                      className="md:text-sm text-xs text-black"
                    >
                      Year:
                    </label>
                    <select
                      className="p-[0.2rem] text-black md:text-sm text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="order"
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="1st Year">1st Year</option>
                      <option value="2nd Year">2nd Year</option>
                      <option value="3rd Year">3rd Year</option>
                      <option value="4th Year">4th Year</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2">
                    <label
                      htmlFor="order"
                      className="md:text-sm text-xs text-black"
                    >
                      Semester:
                    </label>
                    <select
                      className="p-[0.2rem] text-black md:text-sm text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="semester"
                      value={selectedSemester}
                      onChange={(e) => setSelectedSemester(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="1">1st Semester</option>
                      <option value="2">2nd Semester</option>
                    </select>
                  </div>
                  {currentRole === "Administrator" && (
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="department"
                        className="md:text-sm text-xs text-black"
                      >
                        Department:
                      </label>
                      <select
                        className="p-[0.2rem] text-black md:text-sm text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                        id="department"
                        value={selectedDepartment}
                        onChange={(e) => setSelectedDepartment(e.target.value)}
                      >
                        <option value="All">All</option>
                        {departments.map((department, index) => (
                          <option key={index} value={department.code}>
                            {department.department_code}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-4">
                <button
                  className="text-orange-500 md:text-sm text-[0.8rem] hover:text-orange-600"
                  onClick={selectAll}
                >
                  Select All
                </button>
                <button
                  className="text-white md:text-[0.8rem] text-[0.6rem] bg-red-500 py-2 px-4 rounded-full hover:bg-red-600 transition-all"
                  onClick={() => setShowConfirmDelete(true)}
                >
                  Remove
                </button>
                {showConfirmDelete && (
                  <DeleteConfirmation
                    isOpen={showConfirmDelete}
                    onRequestClose={() => setShowConfirmDelete(false)}
                    category={
                      selectedSubjects.length === 1 ? "subject" : "subjects"
                    }
                    data={
                      selectedSubjects.length === 1
                        ? getSubjectName()
                        : selectedSubjects
                    }
                    confirm={handleDelete}
                  />
                )}
                {showPasswordPrompt && (
                  <PasswordPrompt
                    isOpen={showPasswordPrompt}
                    onRequestClose={() => setShowPasswordPrompt(false)}
                    onSubmit={handlePasswordSubmit}
                  />
                )}
              </div>
            </div>
            <div className="scrollbar max-h-[30rem] w-full overflow-y-auto text-black bg-white border border-gray-400 rounded-lg p-[0.4rem]">
              <table className="w-[100%] text-md text-center border border-gray-200 table-fixed">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100">
                    <th className="md:w-10 w-6"></th>
                    {currentRole === "Administrator" && (
                      <th className="text-[0.55rem] md:text-[1rem] py-2">
                        Department
                      </th>
                    )}
                    <th className="text-[0.55rem] md:text-[1rem] py-2">
                      Subject
                    </th>
                    <th className="text-[0.55rem] md:text-[1rem] py-2">
                      Level
                    </th>
                    <th className="text-[0.55rem] md:text-[1rem] py-2">Type</th>
                    <th className="text-[0.55rem] md:text-[1rem] py-2 w-10">
                      Units
                    </th>
                    <th className="text-[0.55rem] md:text-[1rem] py-2">
                      Semester
                    </th>
                    <th className="text-[0.55rem] md:text-[1rem] py-2">
                      Labels
                    </th>
                    <th className="md:w-10 w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {filterSubjects.map((subject, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="md:p-2 border-r border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedSubjects.includes(
                            subject.subject_id
                          )}
                          onChange={() =>
                            handleCheckboxChange(subject.subject_id)
                          }
                        />
                      </td>
                      {currentRole === "Administrator" && (
                        <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                          {subject.department_code}
                        </td>
                      )}
                      <td
                        className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300"
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {subject.subject_name} ({subject.subject_code})
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {subject.year_level}
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {subject.subject_type}
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {subject.subject_units}
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {subject.subject_semester === 1
                          ? "1st Semester"
                          : "2nd Semester"}
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {subject.subject_tags}
                      </td>
                      <td className="p-2 md:text-sm text-[0.6rem]">
                        <button id="update-btn">
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="text-orange-500 hover:text-orange-600 cursor-pointer"
                            onClick={() => handleUpdate(subject)}
                          />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <button
                className="fixed bottom-5 right-5 text-white md:text-[0.8rem] text-[0.6rem] bg-green-500 py-2 px-4 rounded-full hover:bg-green-600 transition-all"
                onClick={handleExportCSV}
              >
                generate CSV
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;
