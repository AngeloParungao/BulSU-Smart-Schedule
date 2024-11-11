import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PasswordPrompt from "../components/PasswordPrompt";
import DeleteConfirmation from "../components/DeleteConfirmation";
import { exportToCSV } from "../utils/exportToCSV";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSearch } from "@fortawesome/free-solid-svg-icons";

const Departments = () => {
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const url = process.env.REACT_APP_URL;
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [departmentCodeToUpdate, setDepartmentCodeToUpdate] = useState("");
  const [selectedDepartments, setSelectedDepartments] = useState([]);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    program_code: "",
    department_code: "",
    department: "",
    department_head: "",
  });

  useEffect(() => {
    setErrors({});
  }, [isUpdating]);

  useEffect(() => {
    fetchDepartments();
  }, []);

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
      program_code: "",
      department_code: "",
      department: "",
      department_head: "",
    });
    setIsUpdating(false);
  };

  const filterDepartments = departments.filter(
    (department) =>
      department.department.toLowerCase().includes(search.toLowerCase()) ||
      department.department_code.toLowerCase().includes(search.toLowerCase()) ||
      department.department_head.toLowerCase().includes(search.toLowerCase())
  );

  const selectAll = () => {
    if (selectedDepartments.length === departments.length) {
      setSelectedDepartments([]);
    } else {
      const allDepartmentCodes = departments.map(
        (department) => department.department_code
      );
      setSelectedDepartments(allDepartmentCodes);
    }
  };

  const handleCheckboxChange = (department) => {
    if (selectedDepartments.includes(department)) {
      setSelectedDepartments(
        selectedDepartments.filter((code) => code !== department)
      );
    } else {
      setSelectedDepartments([...selectedDepartments, department]);
    }
  };

  const handleUpdate = (department) => {
    setIsUpdating(true);
    setDepartmentCodeToUpdate(department.department_code);
    setData({
      program_code: department.department_code.split(" ")[0],
      department_code: department.department_code
        .replace(/[()]/g, "")
        .split(" ")[1],
      department: department.department,
      department_head: department.department_head,
    });
  };

  const handleDelete = async (department) => {
    if (!selectedDepartments.length) {
      toast.error("Please select at least one department.");
      return;
    }
    // Prompt the user to confirm the deletion
    setShowDeleteConfirmation(false);
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
          await axios.delete(`${url}api/departments/delete/`, {
            data: { department_code: selectedDepartments },
          });

          // Log the deletion activity
          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Delete",
            details: `${selectedDepartments.length}`,
            type: "department",
          });

          toast.success("Deleted successfully!");
          setSelectedDepartments([]);
          fetchDepartments();
        } catch (error) {
          console.error("Error deleting data:", error);
          toast.error("Error deleting department/s.");
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

  // CSV export functionality
  const handleExportCSV = () => {
    const headers = ["Department", "Department Code", "Department Head"];
    const data = departments.map((department) => [
      department.department,
      department.department_code,
      department.department_head,
    ]);

    exportToCSV("departments", headers, data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validateErrors = {};
    const departmentExists = departments.some(
      (department) =>
        department.department.toLowerCase() === data.department.toLowerCase() &&
        department.department_code ===
          data.program_code + " (" + data.department_code + ")" &&
        (!isUpdating || department.department_code !== departmentCodeToUpdate)
    );

    if (departmentExists) {
      validateErrors.program_code = "Department Already Exists!";
      validateErrors.department_code = "Department Already Exists!";
    }
    if (!data.program_code) {
      validateErrors.program_code = "Program Code is required!";
    }
    if (!data.department_code) {
      validateErrors.department_code = "Department Code is required!";
    }
    if (!data.department) {
      validateErrors.department = "Department Name is required!";
    }
    if (!data.department_head) {
      validateErrors.department_head = "Department Head is required!";
    }

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
    } else {
      setErrors({});
      try {
        if (isUpdating) {
          await axios.put(
            `${url}api/departments/update/${departmentCodeToUpdate}`,
            data
          );

          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Update",
            details: `${data.department_code}`,
            type: "department",
          });

          toast.success("Updated Successfully!");
        } else {
          await axios.post(`${url}api/departments/adding`, data);

          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Add",
            details: `${data.department_code}`,
            type: "department",
          });

          toast.success("Added Successfully!");
        }

        fetchDepartments();
        resetForm();
      } catch (error) {
        console.error(
          `Error ${isUpdating ? "updating" : "adding"} department:`,
          error
        );
        toast.error(`Error in ${isUpdating ? "updating" : "adding"}`);
      }
    }
  };

  const getDepartmentName = () => {
    const department = departments.find(
      (department) => department.department_code === selectedDepartments[0]
    );
    return department
      ? `${department.department} (${department.department_code})`
      : null;
  };

  return (
    <div className="h-full flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-20 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-full">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)] z-10">
          <span className="md:text-4xl text-2xl font-medium">Departments</span>
          <Navbar />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start items-center w-full h-[calc(100%-4.5rem)] p-3 gap-8 lg:gap-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 p-4 px-4 bg-white shadow-md rounded-lg w-[100%] lg:w-[30%]"
          >
            <h2 className="text-xl font-semibold text-black">
              {isUpdating ? "Update Department" : "Add Department"}
            </h2>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2">
                <label htmlFor="program_code" className="text-sm text-black">
                  Program Code:
                </label>
                {errors.program_code && (
                  <p className="text-red-500 text-xs">{errors.program_code}</p>
                )}
              </div>
              <input
                type="text"
                name="program_code"
                id="program_code"
                placeholder="Program Code (ex: BSIT, BSBA, BSED, etc..)"
                value={data.program_code}
                onChange={(e) => {
                  setData({
                    ...data,
                    program_code: e.target.value.toUpperCase(),
                  });
                  setErrors({ ...errors, program_code: "" });
                }}
                className={`${
                  errors.program_code ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2">
                <label htmlFor="department_code" className="text-sm text-black">
                  Department Code:
                </label>
                {errors.department_code && (
                  <p className="text-red-500 text-xs">
                    {errors.department_code}
                  </p>
                )}
              </div>
              <input
                type="text"
                name="department_code"
                id="department_code"
                placeholder="Department Code (ex: CICS, CBEA, COEd, etc..)"
                value={data.department_code}
                onChange={(e) => {
                  setData({
                    ...data,
                    department_code: e.target.value.toUpperCase(),
                  });
                  setErrors({ ...errors, department_code: "" });
                }}
                className={`${
                  errors.department_code ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2">
                <label htmlFor="department" className="text-sm text-black">
                  Department Name:
                </label>
                {errors.department && (
                  <p className="text-red-500 text-xs">{errors.department}</p>
                )}
              </div>
              <input
                type="text"
                name="department"
                id="department"
                placeholder="ex: College of Information and Computing Sciences"
                value={data.department}
                onChange={(e) => {
                  setData({ ...data, department: e.target.value });
                  setErrors({ ...errors, department: "" });
                }}
                className={`${
                  errors.department ? "border-red-500" : ""
                } placeholder:text-[0.75rem] p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2">
                <label htmlFor="department_head" className="text-sm text-black">
                  Department Head:
                </label>
                {errors.department_head && (
                  <p className="text-red-500 text-xs">
                    {errors.department_head}
                  </p>
                )}
              </div>
              <input
                type="text"
                name="department_head"
                id="department_head"
                placeholder="Department Head"
                value={data.department_head}
                onChange={(e) => {
                  setData({ ...data, department_head: e.target.value });
                  setErrors({ ...errors, department_head: "" });
                }}
                className={`${
                  errors.department_head ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-sm text-white py-2 rounded-md hover:bg-blue-600 transition-all"
              >
                {isUpdating ? "UPDATE DEPARTMENT" : "ADD DEPARTMENT"}
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
              <FontAwesomeIcon
                icon={faSearch}
                className="absolute left-3 text-sm text-gray-300"
              />
              <input
                className="md:w-[14rem] w-[10rem] h-[2.3rem] border border-gray-300 pl-8 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-300"
                type="text"
                placeholder="Search"
                value={search}
                onChange={(e) => setSearch(e.target.value)} // Update search term on input change
              />
              <div className="flex gap-4">
                <button
                  className="text-orange-500 md:text-sm text-[0.8rem] hover:text-orange-600"
                  onClick={selectAll}
                >
                  Select All
                </button>
                <button
                  className="text-white md:text-[0.8rem] text-[0.6rem] bg-red-500 py-2 px-4 rounded-full hover:bg-red-600 transition-all"
                  onClick={() => setShowDeleteConfirmation(true)}
                >
                  Remove
                </button>
                {showDeleteConfirmation && (
                  <DeleteConfirmation
                    isOpen={showDeleteConfirmation}
                    onRequestClose={() => setShowDeleteConfirmation(false)}
                    category={
                      selectedDepartments.length === 1
                        ? "department"
                        : "departments"
                    }
                    data={
                      selectedDepartments.length === 1
                        ? getDepartmentName()
                        : selectedDepartments
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
            <div className="scrollbar max-h-[30.5rem] w-full overflow-y-auto text-black bg-white border border-gray-400 rounded-lg p-[0.4rem]">
              <table className="w-[100%] text-md text-center border border-gray-200 table-fixed">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100">
                    <th className="md:w-10 w-6"></th>
                    <th className="text-xs md:text-[1rem] py-2">
                      Department Code
                    </th>
                    <th className="text-xs md:text-[1rem] py-2">Department</th>
                    <th className="text-xs md:text-[1rem] py-2">
                      Department Head
                    </th>
                    <th className="md:w-10 w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {filterDepartments.map((department, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="md:p-2 border-r border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedDepartments.includes(
                            department.department_code
                          )}
                          onChange={() =>
                            handleCheckboxChange(department.department_code)
                          }
                        />
                      </td>
                      <td className="md:p-2 border border-gray-300 text-[0.6rem] md:text-sm">
                        {department.department_code}
                      </td>
                      <td className="md:p-2 p-1 border border-gray-300 text-[0.6rem] md:text-sm">
                        {department.department}
                      </td>
                      <td className="md:p-2 border border-gray-300 text-[0.6rem] md:text-sm">
                        {department.department_head}
                      </td>
                      <td className="p-2 text-[0.6rem] md:text-sm">
                        <button id="update-btn">
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="text-orange-500 hover:text-orange-600 cursor-pointer"
                            onClick={() => handleUpdate(department)}
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

export default Departments;
