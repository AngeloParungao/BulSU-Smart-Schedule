import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PasswordPrompt from "../components/PasswordPrompt";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSearch } from "@fortawesome/free-solid-svg-icons";

const Sections = () => {
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userToken")));
  const url = process.env.REACT_APP_URL;
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [sections, setSections] = useState([]);
  const [sectionIdToUpdate, setSectionIdToUpdate] = useState("");
  const [selectedSections, setSelectedSections] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [data, setData] = useState({
    section_name: "",
    section_group: "Group 1",
    year_level: "1st Year",
    section_capacity: "",
    section_tags: "",
    department_code: currentDepartment,
  });

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const response = await axios.get(
        `${url}api/sections/fetch?dept_code=${currentDepartment}`
      );
      setSections(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const resetForm = () => {
    setData({
      section_name: "",
      section_group: "Group 1",
      year_level: "1st Year",
      section_capacity: "",
      section_tags: "",
      department_code: currentDepartment, // Ensure this is reset
    });
    setIsUpdating(false);
  };

  const filterSections = sections
    .filter((section) => {
      const matchesSearch =
        section.section_name.toLowerCase().includes(search.toLowerCase()) ||
        section.section_group.toLowerCase().includes(search.toLowerCase()) ||
        section.year_level.toLowerCase().includes(search.toLowerCase()) ||
        section.section_tags.toLowerCase().includes(search.toLowerCase());

      const matchesYear =
        selectedYear === "All" || section.year_level === selectedYear;

      return matchesSearch && matchesYear;
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
      section_tags: section.section_tags,
      department_code: currentDepartment,
    });
  };

  const handleDelete = async () => {
    if (!selectedSections.length) {
      toast.error("Please select at least one section.");
      return;
    }
    // Prompt the user to confirm the deletion
    setShowPasswordPrompt(true);
  };

  const handlePasswordSubmit = async (password) => {
    try {
      // Fetch user data to validate password
      const response = await axios.get(`${url}api/user/fetch`);
      const user = response.data.find((user) => user.user_id === currentUser);

      if (user) {
        if (password === user.password) {
          try {
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

            toast.success("Deleted Successfully!");
            setSelectedSections([]);
            fetchSections();
          } catch (error) {
            console.error("Error deleting data:", error);
            toast.error("Error deleting sections.");
          }
        } else {
          toast.error("Incorrect password");
        }
      } else {
        toast.error("User mismatch. Unable to verify credentials.");
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      toast.error("Error verifying user.");
    }

    setShowPasswordPrompt(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let updatedData = { ...data };

    // Clear the section group if the department is not CICT or CIT
    if (currentDepartment !== "CICT" && currentDepartment !== "CIT") {
      updatedData.section_group = "";
    }

    const sectionExists = sections.some(
      (section) =>
        section.section_name === updatedData.section_name &&
        (currentDepartment === "CICT" || currentDepartment === "CIT"
          ? section.section_group === updatedData.section_group
          : true) &&
        (!isUpdating || section.section_id !== sectionIdToUpdate)
    );

    if (sectionExists) {
      const message =
        currentDepartment === "CICT" || currentDepartment === "CIT"
          ? "Section and Group already exists!"
          : "Section already exists!";
      toast.error(message);
      return;
    }

    try {
      if (isUpdating) {
        await axios.put(
          `${url}api/sections/update/${sectionIdToUpdate}`,
          updatedData
        );
        toast.success("Updated Successfully!");
      } else {
        await axios.post(`${url}api/sections/adding`, updatedData);
        toast.success("Added Successfully!");
      }

      await axios.post(`${url}api/activity/adding`, {
        user_id: currentUser,
        department_code: currentDepartment,
        action: isUpdating ? "Update" : "Add",
        details: `${updatedData.section_name} - ${updatedData.section_group}`,
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
  };

  return (
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-20 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)] z-10">
          <span className="md:text-4xl text-3xl font-medium">Sections</span>
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
              <label htmlFor="section_name" className="text-sm text-black">
                Section Name:
              </label>
              <input
                type="text"
                name="section_name"
                id="section_name"
                placeholder="Section Name"
                value={data.section_name}
                onChange={(e) =>
                  setData({ ...data, section_name: e.target.value })
                }
                required
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {(currentDepartment === "CICT" || currentDepartment === "CIT") && (
              <div className="flex flex-col gap-[0.2rem]">
                <label htmlFor="section_group" className="text-sm text-black">
                  Section Group:
                </label>
                <select
                  name="section_group"
                  id="section_group"
                  value={data.section_group}
                  onChange={(e) =>
                    setData({ ...data, section_group: e.target.value })
                  }
                  required
                  className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Group 1">Group 1</option>
                  <option value="Group 2">Group 2</option>
                </select>
              </div>
            )}
            <div className="flex flex-col gap-[0.2rem]">
              <label htmlFor="year_level" className="text-sm text-black">
                Year Level:
              </label>
              <select
                name="year_level"
                id="year_level"
                value={data.year_level}
                onChange={(e) =>
                  setData({ ...data, year_level: e.target.value })
                }
                required
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="1st Year">1st Year</option>
                <option value="2nd Year">2nd Year</option>
                <option value="3rd Year">3rd Year</option>
                <option value="4th Year">4th Year</option>
              </select>
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <label htmlFor="section_capacity" className="text-sm text-black">
                Section Capacity:
              </label>
              <input
                type="text"
                name="section_capacity"
                id="section_capacity"
                placeholder="Section Capacity"
                value={data.section_capacity}
                onChange={(e) =>
                  setData({ ...data, section_capacity: e.target.value })
                }
                required
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
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
              <div className="flex items-center gap-4">
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
                  Remove Instructor/s
                </button>
                <PasswordPrompt
                  isOpen={showPasswordPrompt}
                  onRequestClose={() => setShowPasswordPrompt(false)}
                  onSubmit={handlePasswordSubmit}
                />
              </div>
            </div>
            <div className="scrollbar h-full w-full overflow-y-auto text-black bg-white border border-gray-400 rounded-lg p-[0.4rem]">
              <table className="w-[100%] text-md text-center border border-gray-200 table-fixed">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100">
                    <th className="w-10"></th>
                    <th className="text-sm md:text-[1rem] py-2">Section</th>
                    {currentDepartment === "CICT" ||
                    currentDepartment === "CIT" ? (
                      <th className="text-sm md:text-[1rem] py-2">Group</th>
                    ) : null}
                    <th className="text-sm md:text-[1rem] py-2">Capacity</th>
                    <th className="text-sm md:text-[1rem] py-2">Year</th>
                    <th className="text-sm md:text-[1rem] py-2">Labels</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filterSections.map((section, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="p-2 border-r border-gray-300">
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
                      <td className="md:p-2 p-1 border border-gray-300 text-xs md:text-[0.9rem]">
                        {section.section_name}
                      </td>
                      {currentDepartment === "CICT" ||
                      currentDepartment === "CIT" ? (
                        <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                          {section.section_group}
                        </td>
                      ) : null}
                      <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                        {section.section_capacity}
                      </td>
                      <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                        {section.year_level}
                      </td>
                      <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                        {section.section_tags}
                      </td>
                      <td className="p-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sections;
