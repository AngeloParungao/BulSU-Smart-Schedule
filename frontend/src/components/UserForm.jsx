import React, { useState, useEffect } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Modal from "react-modal";

const UserForm = ({ isOpen, onRequestClose, user }) => {
  const url = process.env.REACT_APP_URL;
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const [departments, setDepartments] = useState([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    email: "",
    first_name: "",
    middle_name: "",
    last_name: "",
    department_code: "",
  });

  useEffect(() => {
    if (isOpen && user) {
      setIsUpdating(true);
      setData({
        email: user.email,
        first_name: user.first_name,
        middle_name: user.middle_name,
        last_name: user.last_name,
        department_code: user.department_code,
      });
    } else if (!isOpen) {
      setIsUpdating(false);
      setData({
        email: "",
        first_name: "",
        middle_name: "",
        last_name: "",
        department_code: "",
      });
    }
  }, [isOpen, user]);

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
      width: "25rem",
      height: "35rem",
      padding: "1rem",
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    let validationErrors = {};
    if (data.email && !/\S+@\S+\.\S+/.test(data.email)) {
      validationErrors.email = "Invalid email address";
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
    if (!data.department_code) {
      validationErrors.department_code = "Department is required.";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
    } else {
      setErrors({});

      try {
        if (isUpdating) {
          await axios.put(`${url}api/users/update/${user.user_id}`, data);
          toast.success("User updated successfully!");
        } else {
          await axios.post(`${url}api/users/adding`, data);
          toast.success("User created successfully!");
        }

        // Log activity
        await axios.post(`${url}api/activity/adding`, {
          user_id: currentUser,
          department_code: currentDepartment,
          action: isUpdating ? "Update" : "Add",
          details: `${data.last_name}, ${data.first_name} ${data.middle_name}`,
          type: "user",
        });

        onRequestClose();
        setData({
          email: "",
          first_name: "",
          middle_name: "",
          last_name: "",
          department_code: "",
        });
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
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      contentLabel="Add Users"
      appElement={document.getElementById("root")}
      style={customStyles}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col items-center gap-4 w-full"
      >
        <span className="text-xl font-semibold text-black w-[100%] text-center border-b-2 pb-2 mb-2 border-gray-200 uppercase">
          {isUpdating ? "Update User" : "Add User"}
        </span>
        <div className="flex flex-col gap-[0.2rem] w-[100%]">
          <div className="flex items-center gap-2 w-[100%]">
            <label htmlFor="email" className="text-md text-black">
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
            onChange={(e) => setData({ ...data, email: e.target.value })}
            className={`${
              errors.email ? "border-red-500" : ""
            } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
          />
        </div>
        <div className="flex flex-col gap-[0.2rem] w-[100%]">
          <div className="flex items-center gap-2 w-[100%]">
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
            onChange={(e) => setData({ ...data, first_name: e.target.value })}
            className={`${
              errors.first_name ? "border-red-500" : ""
            } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
        </div>
        <div className="flex flex-col gap-[0.2rem] w-[100%]">
          <div className="flex items-center gap-2 w-[100%]">
            <label htmlFor="middleName" className="text-sm text-black">
              Middle Name:
            </label>
          </div>
          <input
            type="text"
            name="middleName"
            id="middleName"
            placeholder="Middle Name"
            value={data.middle_name}
            onChange={(e) => setData({ ...data, middle_name: e.target.value })}
            className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-[0.2rem] w-[100%]">
          <div className="flex items-center gap-2 w-[100%]">
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
            onChange={(e) => setData({ ...data, last_name: e.target.value })}
            className={`${
              errors.last_name ? "border-red-500" : ""
            } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
          />
        </div>
        <div className="flex flex-col gap-[0.2rem] w-[100%]">
          <div className="flex items-center gap-2 w-[100%]">
            <label htmlFor="department" className="text-sm text-black">
              Department:
            </label>
            {errors.department_code && (
              <p className="text-red-500 text-xs">{errors.department_code}</p>
            )}
          </div>
          <select
            name="department"
            id="department"
            value={data.department_code}
            onChange={(e) =>
              setData({ ...data, department_code: e.target.value })
            }
            className={`${
              errors.department_code ? "border-red-500" : ""
            } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500`}
          >
            <option value="">Department</option>
            {departments.map((department, index) => (
              <option key={index} value={department.code}>
                {department.department_code}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded-md w-[100%] hover:bg-blue-600"
        >
          {isUpdating ? "Update" : "Add"}
        </button>
      </form>
    </Modal>
  );
};

export default UserForm;