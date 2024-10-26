import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PasswordPrompt from "../components/PasswordPrompt";
import { exportToCSV } from "../utils/exportToCSV";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSearch } from "@fortawesome/free-solid-svg-icons";

const Instructors = () => {
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentRole = atob(localStorage.getItem("userRole"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const url = process.env.REACT_APP_URL;
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [instructorIdToUpdate, setInstructorIdToUpdate] = useState("");
  const [selectedInstructors, setSelectedInstructors] = useState([]);
  const [selectedWorkType, setSelectedWorkType] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    email: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    work_type: "",
    tags: "",
    department_code: currentRole === "Administrator" ? "" : currentDepartment,
  });

  useEffect(() => {
    setErrors({});
  }, [isUpdating]);

  useEffect(() => {
    fetchInstructors();
    fetchDepartments();
  }, []);

  const fetchInstructors = async () => {
    try {
      const response = await axios.get(
        `${url}api/instructors/fetch?dept_code=${currentDepartment}`
      );
      setInstructors(response.data);
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
      email: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      department_code: currentRole === "Administrator" ? "" : currentDepartment,
      work_type: "",
      tags: "",
    });
    setIsUpdating(false);
  };

  const filterInstructors = instructors.filter((instructor) => {
    const matchesSearch =
      instructor.email.toLowerCase().includes(search.toLowerCase()) ||
      instructor.first_name.toLowerCase().includes(search.toLowerCase()) ||
      instructor.middle_name.toLowerCase().includes(search.toLowerCase()) ||
      instructor.last_name.toLowerCase().includes(search.toLowerCase()) ||
      instructor.tags.toLowerCase().includes(search.toLowerCase()) ||
      instructor.department_code.toLowerCase().includes(search.toLowerCase());

    const matchesWorkType =
      selectedWorkType === "All" || instructor.work_type === selectedWorkType;

    const matchesDepartment =
      selectedDepartment === "All" ||
      instructor.department_code === selectedDepartment;

    return matchesSearch && matchesWorkType && matchesDepartment;
  });

  const selectAll = () => {
    if (selectedInstructors.length === filterInstructors.length) {
      setSelectedInstructors([]);
    } else {
      // Collect IDs of all filtered instructors
      const allInstructorIds = filterInstructors.map(
        (instructor) => instructor.instructor_id
      );
      setSelectedInstructors(allInstructorIds);
    }
  };

  const handleCheckboxChange = (instructor) => {
    if (selectedInstructors.includes(instructor)) {
      // If the instructor is already selected, remove it from the selectedInstructors array
      setSelectedInstructors(
        selectedInstructors.filter((i) => i !== instructor)
      );
    } else {
      // If the instructor is not selected, add it to the selectedInstructors array
      setSelectedInstructors([...selectedInstructors, instructor]);
    }
  };

  const handleUpdate = (instructor) => {
    setIsUpdating(true);
    setInstructorIdToUpdate(instructor.instructor_id);
    setData({
      email: instructor.email,
      first_name: instructor.first_name,
      middle_name: instructor.middle_name,
      last_name: instructor.last_name,
      department_code: instructor.department_code,
      work_type: instructor.work_type,
      tags: instructor.tags,
    });
  };

  const handleDelete = async () => {
    if (!selectedInstructors.length) {
      toast.error("Please select at least one instructor.");
      return;
    }
    // Prompt the user to confirm the deletion
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
          await axios.delete(`${url}api/instructors/delete/`, {
            data: { instructor_ids: selectedInstructors },
          });

          // Log the deletion activity
          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Delete",
            details: `${selectedInstructors.length}`,
            type: "instructor",
          });

          toast.success("Deleted successfully!");
          setSelectedInstructors([]);
          fetchInstructors();
        } catch (error) {
          console.error("Error deleting data:", error);
          toast.error("Error deleting instructors.");
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
      "Email",
      "First Name",
      "Middle Name",
      "Last Name",
      "Department",
      "Work Type",
      "Tags",
    ];
    const data = filterInstructors.map((instructor) => [
      instructor.email,
      instructor.first_name,
      instructor.middle_name,
      instructor.last_name,
      instructor.department_code,
      instructor.work_type,
      instructor.tags,
    ]);
    exportToCSV("instructors", headers, data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = {};
    const emailExists = instructors.some(
      (instructor) =>
        instructor.email === data.email &&
        (!isUpdating || instructor.instructor_id !== instructorIdToUpdate)
    );

    if (emailExists) {
      validationErrors.email = "Email already exists.";
    }
    if (!data.email) {
      validationErrors.email = "Email is required.";
    }
    if (!data.first_name) {
      validationErrors.first_name = "First name is required.";
    }
    if (!data.last_name) {
      validationErrors.last_name = "Last name is required.";
    }
    if (!data.work_type) {
      validationErrors.work_type = "Required.";
    }
    if (!data.department_code) {
      validationErrors.department_code = "Required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});
      try {
        // Update or add instructor based on `isUpdating`
        if (isUpdating) {
          await axios.put(
            `${url}api/instructors/update/${instructorIdToUpdate}`,
            data
          );
          toast.success("Instructor updated successfully!");
        } else {
          await axios.post(`${url}api/instructors/adding`, data);
          toast.success("Instructor added successfully!");
        }

        // Log activity
        await axios.post(`${url}api/activity/adding`, {
          user_id: currentUser,
          department_code: currentDepartment,
          action: isUpdating ? "Update" : "Add",
          details: `${data.last_name}, ${data.first_name} ${data.middle_name}`,
          type: "instructor",
        });

        // Refresh instructor list and reset form
        fetchInstructors();
        resetForm();
      } catch (error) {
        console.error(
          `Error ${isUpdating ? "updating" : "adding"} instructor:`,
          error
        );
        toast.error(`Error ${isUpdating ? "updating" : "adding"} instructor.`);
      }
    }
  };

  return (
    <div className="h-full flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-20 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-full">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)] z-10">
          <span className="md:text-4xl text-2xl font-medium">Instructors</span>
          <Navbar />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start items-center w-full h-[calc(100%-4.5rem)] p-3 gap-8 lg:gap-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 p-4 px-4 bg-white shadow-md rounded-lg w-[100%] lg:w-[30%]"
          >
            <h2 className="text-xl font-semibold text-black">
              {isUpdating ? "Update Instructor" : "Add Instructor"}
            </h2>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2">
                <label htmlFor="email" className="text-sm text-black">
                  Email:
                </label>
                {errors.email && (
                  <p className="text-red-500 text-xs">{errors.email}</p>
                )}
              </div>
              <input
                type="email"
                name="email"
                id="email"
                placeholder="Email"
                value={data.email}
                onChange={(e) => {
                  setData({ ...data, email: e.target.value.trim() });
                  setErrors({ ...errors, email: "" });
                }}
                className={`${
                  errors.email ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2">
                <label htmlFor="firstName" className="text-sm text-black">
                  First Name:
                </label>
                {errors.first_name && (
                  <p className="text-red-500 text-xs">{errors.first_name}</p>
                )}
              </div>
              <input
                type="text"
                name="firstName"
                id="firstName"
                placeholder="First Name"
                value={data.first_name}
                onChange={(e) => {
                  setData({ ...data, first_name: e.target.value });
                  setErrors({ ...errors, first_name: "" });
                }}
                className={`${
                  errors.first_name ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <label htmlFor="middleName" className="text-sm text-black">
                Middle Name:
              </label>
              <input
                type="text"
                name="middleName"
                id="middleName"
                placeholder="Middle Name"
                value={data.middle_name}
                onChange={(e) =>
                  setData({ ...data, middle_name: e.target.value })
                }
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2">
                <label htmlFor="lastName" className="text-sm text-black">
                  Last Name:
                </label>
                {errors.last_name && (
                  <p className="text-red-500 text-xs">{errors.last_name}</p>
                )}
              </div>
              <input
                type="text"
                name="lastName"
                id="lastName"
                placeholder="Last Name"
                value={data.last_name}
                onChange={(e) => {
                  setData({ ...data, last_name: e.target.value });
                  setErrors({ ...errors, last_name: "" });
                }}
                className={`${
                  errors.last_name ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex flex-col gap-[0.2rem] w-[100%]">
                <div className="flex items-center gap-2 w-full">
                  <label htmlFor="work_type" className="text-sm text-black">
                    Work Type:
                  </label>
                  {errors.work_type && (
                    <p className="text-red-500 text-xs">{errors.work_type}</p>
                  )}
                </div>
                <select
                  name="work_type"
                  id="work_type"
                  value={data.work_type}
                  onChange={(e) => {
                    setData({ ...data, work_type: e.target.value });
                    setErrors({ ...errors, work_type: "" });
                  }}
                  className={`${
                    errors.work_type ? "border-red-500" : ""
                  } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
                >
                  <option value="">Work Type</option>
                  <option value="Regular">Regular</option>
                  <option value="Part-timer">Part Time</option>
                </select>
              </div>
              {currentRole === "Administrator" && (
                <div className="flex flex-col gap-[0.2rem] w-[100%]">
                  <div className="flex items-center gap-2">
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
                      <option key={index} value={department.code}>
                        {department.department_code}
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <label htmlFor="tags" className="text-sm text-black">
                Labels/Tags:
              </label>
              <textarea
                name="tags"
                id="tags"
                placeholder="ex:  Web and Mobile Applications"
                value={data.tags}
                onChange={(e) => setData({ ...data, tags: e.target.value })}
                className="p-2 h-[6rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none placeholder:text-sm placeholder:text-center"
              ></textarea>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-sm text-white py-2 rounded-md hover:bg-blue-600 transition-all"
              >
                {isUpdating ? "UPDATE INSTRUCTOR" : "ADD INSTRUCTOR"}
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
              <div className="flex flex-col gap-4">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-3 text-sm text-gray-300"
                />
                <input
                  className="md:w-[14rem] w-[10rem] h-[2.3rem] border border-gray-300 pl-8 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-300"
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)} // Update search term on input change
                />
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor="work_type" className="text-sm text-black">
                      Work Type:
                    </label>
                    <select
                      className="p-[0.2rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="work_type"
                      value={selectedWorkType}
                      onChange={(e) => setSelectedWorkType(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Regular">Regular</option>
                      <option value="Part-timer">Part Time</option>
                    </select>
                  </div>
                  {currentRole === "Administrator" && (
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="department"
                        className="text-sm text-black"
                      >
                        Department:
                      </label>
                      <select
                        className="p-[0.2rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  onClick={handleDelete}
                >
                  Remove
                </button>
                <PasswordPrompt
                  isOpen={showPasswordPrompt}
                  onRequestClose={() => setShowPasswordPrompt(false)}
                  onSubmit={handlePasswordSubmit}
                />
              </div>
            </div>
            <div className="scrollbar max-h-[30.5rem] w-full overflow-y-auto text-black bg-white border border-gray-400 rounded-lg p-[0.4rem]">
              <table className="w-[100%] text-md text-center border border-gray-200 table-fixed">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100">
                    <th className="md:w-10 w-6"></th>

                    {currentRole === "Administrator" && (
                      <th className="text-xs md:text-[1rem] py-2">
                        Department
                      </th>
                    )}
                    <th className="text-xs md:text-[1rem] py-2">Instructor</th>
                    <th className="text-xs md:text-[1rem] py-2">Email</th>
                    <th className="text-xs md:text-[1rem] py-2">Labels</th>
                    <th className="md:w-10 w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {filterInstructors.map((instructor, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="md:p-2 border-r border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedInstructors.includes(
                            instructor.instructor_id
                          )}
                          onChange={() =>
                            handleCheckboxChange(instructor.instructor_id)
                          }
                        />
                      </td>
                      {currentRole === "Administrator" && (
                        <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                          {instructor.department_code}
                        </td>
                      )}
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">{`${instructor.first_name} ${instructor.middle_name} ${instructor.last_name}`}</td>
                      <td
                        className="p-2 md:text-sm text-[0.6rem] border-r border-gray-300"
                        style={{
                          wordBreak: "break-word",
                          overflowWrap: "anywhere",
                        }}
                      >
                        {instructor.email}
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {instructor.tags}
                      </td>
                      <td className="p-2 md:text-sm text-[0.6rem]">
                        <button id="update-btn">
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="text-orange-500 hover:text-orange-600 cursor-pointer"
                            onClick={() => handleUpdate(instructor)}
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

export default Instructors;
