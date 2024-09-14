import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PasswordPrompt from "../components/PasswordPrompt";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSearch } from "@fortawesome/free-solid-svg-icons";

const Subjects = () => {
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userToken")));
  const currentRole = atob(localStorage.getItem("userRole"));
  const url = process.env.REACT_APP_URL;
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [subjectIdToUpdate, setSubjectIdToUpdate] = useState("");
  const [selectedSubjects, setSelectedSubjects] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [selectedSemester, setSelectedSemester] = useState("All");
  const [data, setData] = useState({
    subject_name: "",
    subject_code: "",
    year_level: "1st Year",
    subject_semester: "1",
    subject_type: "Minor",
    subject_units: "1",
    subject_tags: "",
    department_code: currentDepartment,
  });

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
      year_level: "1st Year",
      subject_semester: "1",
      subject_type: "Minor",
      subject_units: "1",
      subject_tags: "",
      department_code: currentDepartment,
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
      subject.subject_tags.toLowerCase().includes(search.toLowerCase()) ||
      subject.department_code.toLowerCase().includes(search.toLowerCase());

    const matchesYear =
      selectedYear === "All" || subject.year_level === selectedYear;

    const matchesSemester =
      selectedSemester === "All" ||
      subject.subject_semester.toString() === selectedSemester;

    return matchesSearch && matchesYear && matchesSemester;
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
    });
  };

  const handleDelete = async () => {
    if (!selectedSubjects.length) {
      toast.error("Please select at least one subject.");
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Check if email already exists
    const subjectExists = subjects.some(
      (subject) =>
        subject.subject_name === data.subject_name &&
        subject.subject_code === data.subject_code &&
        (!isUpdating || subject.subject_id !== subjectIdToUpdate)
    );

    if (subjectExists) {
      toast.error("Subject already exists!");
      return;
    }

    try {
      if (isUpdating) {
        await axios.put(`${url}api/subjects/update/${subjectIdToUpdate}`, data);
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
  };

  return (
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-20 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)] z-10">
          <span className="md:text-4xl text-3xl font-medium">Subjects</span>
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
              <label htmlFor="subject_name" className="text-sm text-black">
                Subject Name:
              </label>
              <input
                type="text"
                name="subject_name"
                id="subject_name"
                placeholder="Subject Name"
                value={data.subject_name}
                onChange={(e) =>
                  setData({ ...data, subject_name: e.target.value })
                }
                required
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <label htmlFor="subject_code" className="text-sm text-black">
                Subject Code:
              </label>
              <input
                type="text"
                name="subject_code"
                id="subject_code"
                placeholder="Subject Code"
                value={data.subject_code}
                onChange={(e) =>
                  setData({ ...data, subject_code: e.target.value })
                }
                required
                className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
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
            <div className="flex gap-2">
              <div className="flex flex-col gap-[0.2rem] w-full">
                <label htmlFor="subject_type" className="text-sm text-black">
                  Subject Type:
                </label>
                <select
                  name="subject_type"
                  id="subject_type"
                  value={data.subject_type}
                  onChange={(e) =>
                    setData({ ...data, subject_type: e.target.value })
                  }
                  required
                  className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Minor">Minor</option>
                  <option value="Major">Major</option>
                </select>
              </div>
              <div className="flex flex-col gap-[0.2rem] w-full">
                <label htmlFor="subject_unit" className="text-sm text-black">
                  Subject Unit:
                </label>
                <select
                  name="subject_unit"
                  id="subject_unit"
                  value={data.subject_units}
                  onChange={(e) =>
                    setData({ ...data, subject_units: e.target.value })
                  }
                  required
                  className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <div className="flex flex-col gap-[0.2rem] w-full">
                <label
                  htmlFor="subject_semester"
                  className="text-sm text-black"
                >
                  Semester:
                </label>
                <select
                  name="subject_semester"
                  id="subject_semester"
                  value={data.subject_semester}
                  onChange={(e) =>
                    setData({ ...data, subject_semester: e.target.value })
                  }
                  required
                  className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  <option value="1">1st Semester</option>
                  <option value="2">2nd Semester</option>
                </select>
              </div>
              {currentRole === "Administrator" && (
                <div className="flex flex-col gap-[0.2rem] w-full">
                  <label htmlFor="department" className="text-sm text-black">
                    Department:
                  </label>
                  <select
                    name="department"
                    id="department"
                    value={data.department_code}
                    onChange={(e) =>
                      setData({ ...data, department_code: e.target.value })
                    }
                    required
                    className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
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
              <div className="flex md:flex-row flex-col md:items-center justify-center md:gap-4 gap-2">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 md:top-5 top-3 text-sm text-gray-300"
                />
                <input
                  className="md:w-[14rem] w-[8rem] h-[2.3rem] border border-gray-300 pl-8 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-300"
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)} // Update search term on input change
                />
                <div className="flex md:flex-row flex-col md:items-center justify-center gap-2">
                  <div className="flex md:flex-col flex-row gap-[0.2rem] w-full">
                    <label
                      htmlFor="order"
                      className="flex items-center md:text-sm text-xs text-black"
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
                  <div className="flex md:flex-col flex-row gap-[0.2rem] w-full">
                    <label
                      htmlFor="order"
                      className="flex items-center md:text-sm text-xs text-black"
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
                    {currentRole === "Administrator" && (
                      <th className="text-sm md:text-[1rem] py-2">
                        Department
                      </th>
                    )}
                    <th className="text-sm md:text-[1rem] py-2">Subject</th>
                    <th className="text-sm md:text-[1rem] py-2">Level</th>
                    <th className="text-sm md:text-[1rem] py-2">Type</th>
                    <th className="text-sm md:text-[1rem] py-2 w-10">Units</th>
                    <th className="text-sm md:text-[1rem] py-2">Semester</th>
                    <th className="text-sm md:text-[1rem] py-2">Labels</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {filterSubjects.map((subject, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="p-2 border-r border-gray-300">
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
                        <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                          {subject.department_code}
                        </td>
                      )}
                      <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                        {subject.subject_name} ({subject.subject_code})
                      </td>
                      <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                        {subject.year_level}
                      </td>
                      <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                        {subject.subject_type}
                      </td>
                      <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                        {subject.subject_units}
                      </td>
                      <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                        {subject.subject_semester === 1
                          ? "1st Semester"
                          : "2nd Semester"}
                      </td>
                      <td className="p-2 border border-gray-300 text-xs md:text-[0.9rem]">
                        {subject.subject_tags}
                      </td>
                      <td className="p-2">
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
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Subjects;
