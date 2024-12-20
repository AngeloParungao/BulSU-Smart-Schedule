import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PasswordPrompt from "../components/PasswordPrompt";
import DeleteConfirmation from "../components/DeleteConfirmation";
import { exportToCSV } from "../utils/exportToCSV";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAdd,
  faMinus,
  faPenToSquare,
  faSearch,
} from "@fortawesome/free-solid-svg-icons";

const Sections = () => {
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const currentRole = atob(localStorage.getItem("userRole"));
  const url = process.env.REACT_APP_URL;
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [addGroup, setAddGroup] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [sections, setSections] = useState([]);
  const [sectionIdToUpdate, setSectionIdToUpdate] = useState("");
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedGroup, setSelectedGroup] = useState("All");
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedDepartment, setSelectedDepartment] = useState("All");
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    section_name: "",
    section_group: "",
    year_level: "",
    section_capacity: "",
    section_tags: "",
    department_code: currentRole === "Administrator" ? "" : currentDepartment,
    old_section_name: "",
    old_section_group: "",
  });

  useEffect(() => {
    setErrors({});
  }, [isUpdating]);

  useEffect(() => {
    fetchSections();
    fetchDepartments();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await axios.get(
        `${url}api/sections/fetch?dept_code=${currentDepartment}`
      );
      if (
        currentDepartment === "LSSD (LSSD)" ||
        currentDepartment === "NSMD (NSMD)"
      ) {
        setSections(
          response.data.filter(
            (section) => section.department_code === currentDepartment
          )
        );
      } else {
        setSections(response.data);
      }
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
      section_name: "",
      section_group: "",
      year_level: "",
      section_capacity: "",
      department_code: currentRole === "Administrator" ? "" : currentDepartment,
      section_tags: "",
      old_section_name: "",
      old_section_group: "",
    });
    setAddGroup(false);
    setIsUpdating(false);
  };

  const filterSections = sections
    .filter((section) => {
      const matchesSearch =
        section.section_name.toLowerCase().includes(search.toLowerCase()) ||
        section.section_group.toLowerCase().includes(search.toLowerCase()) ||
        section.year_level.toLowerCase().includes(search.toLowerCase()) ||
        section.section_tags.toLowerCase().includes(search.toLowerCase()) ||
        section.department_code.toLowerCase().includes(search.toLowerCase());

      const matchesGroup =
        selectedGroup === "All" || section.section_group === selectedGroup;

      const matchesYear =
        selectedYear === "All" || section.year_level === selectedYear;

      const matchesDepartment =
        selectedDepartment === "All" ||
        section.department_code === selectedDepartment;

      return matchesSearch && matchesGroup && matchesYear && matchesDepartment;
    })
    .sort((a, b) => {
      // Priority sorting for groups
      const groupOrder = {
        "Group 1": 1,
        "Group 2": 2,
      };

      const groupA = groupOrder[a.section_group] || 3;
      const groupB = groupOrder[b.section_group] || 3;

      // First, compare based on group priority
      if (groupA !== groupB) {
        return groupA - groupB;
      }

      // If the groups are the same, sort by section name or other criteria
      return a.section_name.localeCompare(b.section_name);
    });

  const selectAll = () => {
    if (selectedSections.length === filterSections.length) {
      setSelectedSections([]);
    } else {
      const allSectionIds = filterSections.map((section) => section.section_id);
      setSelectedSections(allSectionIds);
    }
  };

  const handleCheckboxChange = (sectionId) => {
    if (selectedSections.includes(sectionId)) {
      setSelectedSections(selectedSections.filter((id) => id !== sectionId));
    } else {
      setSelectedSections([...selectedSections, sectionId]);
    }
  };

  const handleUpdate = (section) => {
    setIsUpdating(true);
    setSectionIdToUpdate(section.section_id);
    setData({
      section_name: section.section_name,
      section_group: section.section_group,
      year_level: section.year_level,
      section_capacity: section.section_capacity,
      department_code: section.department_code,
      section_tags: section.section_tags,
      old_section_name: section.section_name,
      old_section_group: section.section_group,
    });
  };

  const handleDelete = async () => {
    if (!selectedSections.length) {
      toast.error("Please select at least one section.");
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
          await axios.delete(`${url}api/sections/delete/`, {
            data: { section_ids: selectedSections },
          });

          // Log the deletion activity
          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Delete",
            details: `${selectedSections.length}`,
            type: "section",
          });

          toast.success("Deleted successfully!");
          setSelectedSections([]);
          fetchSections();
        } catch (error) {
          console.error("Error deleting data:", error);
          toast.error("Error deleting sections.");
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
      "Section Name",
      "Section Group",
      "Year Level",
      "Section Capacity",
      "Department Code",
      "Section Tags",
    ];

    const data = filterSections.map((section) => [
      section.section_name,
      section.section_group,
      section.year_level,
      section.section_capacity,
      section.department_code,
      section.section_tags,
    ]);

    exportToCSV("sections", headers, data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validateErrors = {};
    const sectionExists = sections.some(
      (section) =>
        section.section_name === data.section_name &&
        section.section_group === data.section_group &&
        (!isUpdating || section.section_id !== sectionIdToUpdate)
    );
    if (sectionExists) {
      validateErrors.section_name = `Section ${
        addGroup ? "and Group" : ""
      } already exists.`;
    }
    if (!data.section_name) {
      validateErrors.section_name = "Section name is required.";
    }
    if (addGroup) {
      if (!data.section_group) {
        validateErrors.section_group = "Section group is required.";
      }
    }
    if (!data.year_level) {
      validateErrors.year_level = "Year level is required.";
    }
    if (!data.section_capacity) {
      validateErrors.section_capacity = "Section capacity is required.";
    }
    if (!data.department_code) {
      validateErrors.department_code = "Department code is required.";
    }

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
    } else {
      setErrors({});
      try {
        if (isUpdating) {
          await axios.put(
            `${url}api/sections/update/${sectionIdToUpdate}`,
            data
          );
          toast.success("Updated Successfully!");
        } else {
          await axios.post(`${url}api/sections/adding`, data);
          toast.success("Added Successfully!");
        }

        await axios.post(`${url}api/activity/adding`, {
          user_id: currentUser,
          department_code: currentDepartment,
          action: isUpdating ? "Update" : "Add",
          details: `${data.section_name} - ${data.section_group}`,
          type: "section",
        });

        fetchSections();
        resetForm();
      } catch (error) {
        console.error(
          `Error ${isUpdating ? "updating" : "adding"} section:`,
          error
        );
        toast.error(`Error ${isUpdating ? "updating" : "adding"} section.`);
      }
    }
  };

  const getSectionName = () => {
    const section = sections.find(
      (section) => section.section_id === selectedSections[0]
    );
    return section ? `${section.section_name} - ${section.section_group}` : "";
  };

  return (
    <div className="h-full flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-20 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-full">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)] z-10">
          <span className="md:text-4xl text-2xl font-medium">Sections</span>
          <Navbar />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start items-center w-full h-[calc(100%-4.5rem)] p-3 gap-8 lg:gap-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 p-4 px-4 bg-white shadow-md rounded-lg w-[100%] lg:w-[30%]"
          >
            <h2 className="text-xl font-semibold text-black">
              {isUpdating ? "Update Section" : "Add Section"}
            </h2>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2 w-full">
                <label htmlFor="section_name" className="text-sm text-black">
                  Section Name:
                </label>
                {errors.section_name && (
                  <span className="text-red-500 text-xs">
                    {errors.section_name}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="section_name"
                id="section_name"
                placeholder="Section Name"
                value={data.section_name}
                onChange={(e) => {
                  // Convert input to uppercase and get the value
                  let value = e.target.value.toUpperCase();

                  // Only allow uppercase letters, numbers, and spaces
                  value = value.replace(/[^A-Z0-9 ]/g, ""); // Removes any special character

                  // Add a space before a number if it follows a letter
                  value = value.replace(/([A-Z])(\d)/g, "$1 $2");

                  setData({
                    ...data,
                    section_name: value.trim(), // Trim leading and trailing spaces if any
                  });
                  setErrors({ ...errors, section_name: "" });
                }}
                className={`${
                  errors.section_name ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
              />
            </div>
            <div className="flex gap-4">
              <div className="flex items-center">
                <button
                  className={`${
                    addGroup
                      ? "bg-red-500 hover:bg-red-600"
                      : "bg-blue-500 hover:bg-blue-600"
                  } flex justify-center items-center gap-2 text-white font-semibold py-2 px-4 rounded-lg`}
                  onClick={() => {
                    setAddGroup(!addGroup);
                    if (!addGroup) {
                      setData({ ...data, section_group: "" });
                    }
                  }}
                  type="button"
                >
                  {addGroup ? (
                    <>
                      <FontAwesomeIcon icon={faMinus} /> Hide
                    </>
                  ) : (
                    <>
                      <FontAwesomeIcon icon={faAdd} /> Group
                    </>
                  )}
                </button>
              </div>
              {addGroup && (
                <div className="flex flex-col gap-[0.2rem] w-[100%]">
                  <div className="flex items-center gap-2 w-full">
                    <label
                      htmlFor="section_group"
                      className="flex gap-2 text-sm text-black"
                    >
                      Group:
                    </label>
                    {errors.section_group && (
                      <span className="text-red-500 text-xs">
                        {errors.section_group}
                      </span>
                    )}
                  </div>
                  <select
                    name="section_group"
                    id="section_group"
                    value={data.section_group}
                    onChange={(e) => {
                      setData({ ...data, section_group: e.target.value });
                      setErrors({ ...errors, section_group: "" });
                    }}
                    className={`${
                      errors.section_group ? "border-red-500" : ""
                    } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
                  >
                    <option value="">Select Group</option>
                    <option value="Group 1">Group 1</option>
                    <option value="Group 2">Group 2</option>
                  </select>
                </div>
              )}
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2 w-full">
                <label htmlFor="year_level" className="text-sm text-black">
                  Year Level:
                </label>
                {errors.year_level && (
                  <span className="text-red-500 text-xs">
                    {errors.year_level}
                  </span>
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
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2 w-full">
                <label
                  htmlFor="section_capacity"
                  className="text-sm text-black"
                >
                  Section Capacity:
                </label>
                {errors.section_capacity && (
                  <span className="text-red-500 text-xs">
                    {errors.section_capacity}
                  </span>
                )}
              </div>
              <input
                type="text"
                name="section_capacity"
                id="section_capacity"
                placeholder="Section Capacity"
                value={data.section_capacity}
                onChange={(e) => {
                  setData({ ...data, section_capacity: e.target.value.trim() });
                  setErrors({ ...errors, section_capacity: "" });
                }}
                className={`${
                  errors.section_capacity ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              />
            </div>
            {currentRole === "Administrator" && (
              <div className="flex flex-col gap-[0.2rem] w-[100%]">
                <div className="flex items-center gap-2 w-full">
                  <label htmlFor="department" className="text-sm text-black">
                    Department:
                  </label>
                  {errors.department_code && (
                    <span className="text-red-500 text-xs">
                      {errors.department_code}
                    </span>
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
            <div className="flex flex-col gap-[0.2rem]">
              <label htmlFor="section_tags" className="text-sm text-black">
                Labels/Tags:
              </label>
              <textarea
                name="section_tags"
                id="section_tags"
                placeholder="ex:  Web and Mobile Applications"
                value={data.section_tags}
                onChange={(e) =>
                  setData({ ...data, section_tags: e.target.value })
                }
                className="p-2 h-[6rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none placeholder:text-sm placeholder:text-center"
              ></textarea>
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-sm text-white py-2 rounded-md hover:bg-blue-600 transition-all"
              >
                {isUpdating ? "UPDATE SECTION" : "ADD SECTION"}
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
                <div className="flex md:flex-row flex-col md:items-center md:gap-4 gap-2">
                  <div>
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
                  </div>
                  <div className="flex items-center gap-2">
                    <label htmlFor="group" className="text-sm text-black">
                      Group:
                    </label>
                    <select
                      className="p-[0.2rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                      id="group"
                      value={selectedGroup}
                      onChange={(e) => setSelectedGroup(e.target.value)}
                    >
                      <option value="All">All</option>
                      <option value="Group 1">Group 1</option>
                      <option value="Group 2">Group 2</option>
                    </select>
                  </div>
                </div>
                <div className="flex md:flex-row flex-col md:gap-4 gap-2">
                  <div className="flex items-center gap-2">
                    <label htmlFor="order" className="text-sm text-black">
                      Year:
                    </label>
                    <select
                      className="p-[0.2rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  onClick={() => setShowConfirmDelete(true)}
                >
                  Remove
                </button>
                {showConfirmDelete && (
                  <DeleteConfirmation
                    isOpen={showConfirmDelete}
                    onRequestClose={() => setShowConfirmDelete(false)}
                    category={
                      selectedSections.length === 1 ? "Section" : "Sections"
                    }
                    data={
                      selectedSections.length === 1
                        ? getSectionName()
                        : selectedSections
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
                    {currentRole === "Administrator" && (
                      <th className="text-[0.6rem] md:text-[1rem] py-2">
                        Department
                      </th>
                    )}
                    <th className="text-xs md:text-[1rem] py-2">Section</th>
                    <th className="text-xs md:text-[1rem] py-2">Capacity</th>
                    <th className="text-xs md:text-[1rem] py-2">Year</th>
                    <th className="text-xs md:text-[1rem] py-2">Labels</th>
                    <th className="md:w-10 w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {filterSections.map((section, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="md:p-2 border-r border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedSections.includes(
                            section.section_id
                          )}
                          onChange={() =>
                            handleCheckboxChange(section.section_id)
                          }
                        />
                      </td>
                      {currentRole === "Administrator" && (
                        <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                          {section.department_code}
                        </td>
                      )}
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {section.section_name}
                        {section.section_group === ""
                          ? ""
                          : ` - ${section.section_group}`}
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {section.section_capacity}
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {section.year_level}
                      </td>
                      <td className="p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {section.section_tags}
                      </td>
                      <td className="p-2 md:text-sm text-[0.6rem]">
                        <button id="update-btn">
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="text-orange-500 hover:text-orange-600 cursor-pointer"
                            onClick={() => handleUpdate(section)}
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

export default Sections;
