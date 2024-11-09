import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import UserForm from "../components/UserForm";
import PasswordPrompt from "../components/PasswordPrompt";
import ChangeStatusConfirmation from "../components/ChangeStatusConfirmation copy";
import DeleteConfirmation from "../components/DeleteConfirmation";
import { exportToCSV } from "../utils/exportToCSV";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSearch } from "@fortawesome/free-solid-svg-icons";
import toast from "react-hot-toast";

const Users = () => {
  const url = process.env.REACT_APP_URL;
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showChangeStatus, setShowChangeStatus] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [onDelete, setOnDelete] = useState(false);
  const [showArchive, setShowArchive] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [showAddUser, userToUpdate, showArchive]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${url}api/users/fetch`);
      if (showArchive) {
        setUsers(response.data.filter((user) => user.status === "archived"));
      } else {
        setUsers(
          response.data.filter(
            (user) => user.status === "active" && user.role !== "Administrator"
          )
        );
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const refreshUser = () => {
    fetchUsers();
    setUserToUpdate(null);
  };

  const filterUsers = users.filter((user) => {
    return (
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.first_name.toLowerCase().includes(search.toLowerCase()) ||
      (user.middle_name === null
        ? ""
        : user.middle_name.toLowerCase()
      ).includes(search.toLowerCase()) ||
      user.last_name.toLowerCase().includes(search.toLowerCase()) ||
      user.department_code.toLowerCase().includes(search.toLowerCase()) ||
      user.role.toLowerCase().includes(search.toLowerCase())
    );
  });

  const handleExportCSV = () => {
    const headers = [
      "Email",
      "First Name",
      "Middle Name",
      "Last Name",
      "Department Code",
    ];
    const data = users.map((user) => [
      user.email,
      user.first_name,
      user.middle_name,
      user.last_name,
      user.department_code,
    ]);
    exportToCSV("users", headers, data);
  };

  const handleCheckboxChange = (user) => {
    if (selectedUsers.includes(user)) {
      setSelectedUsers(selectedUsers.filter((u) => u !== user));
    } else {
      setSelectedUsers([...selectedUsers, user]);
    }
  };

  const changeStatus = async () => {
    // Check if there are any selected users
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    setShowChangeStatus(false);

    try {
      await axios.put(`${url}api/users/update`, {
        user_ids: selectedUsers, // Use directly if already an array
        status: showArchive ? "active" : "archived",
      });

      await axios.post(`${url}api/activity/adding`, {
        user_id: currentUser,
        department_code: currentDepartment,
        action: showArchive ? "Restored" : "Archived",
        details: `${selectedUsers.length}`,
        type: "user",
      });

      toast.success("User status updated successfully!");
      setSelectedUsers([]);
      fetchUsers();
    } catch (error) {
      console.error("Error updating user status:", error);
      toast.error("Failed to update user status."); // Notify the user of the failure
    }
  };

  const handleDelete = () => {
    // Check if there are any selected users
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
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
          await axios.delete(`${url}api/users/delete`, {
            data: { user_ids: selectedUsers }, // Ensure it's passed as the data payload
          });

          // Log the deletion activity
          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Delete",
            details: `${selectedUsers.length}`,
            type: "user",
          });

          toast.success("User/s deleted successfully!");
          setSelectedUsers([]);
          setOnDelete(false);
          fetchUsers();
        } catch (error) {
          console.error("Error deleting user:", error);
          toast.error("Failed to delete user/s."); // Notify the user of the failure
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

  const getUserName = () => {
    const user = users.find((user) => user.user_id === selectedUsers[0]);
    return user
      ? `${user.first_name} ${user.middle_name} ${user.last_name}`
      : null;
  };

  return (
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-2xl font-medium">
            Account Management
          </span>
        </div>
        <div className="flex flex-col w-full p-5 md:px-8 gap-8 h-[calc(100vh-4.5rem)]">
          <div className="flex justify-between items-center w-full">
            <div className="relative flex items-center">
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
              <button
                className={`ml-4 text-sm ${
                  showArchive
                    ? "text-blue-300 hover:text-blue-500"
                    : "text-red-300 hover:text-red-500"
                }`}
                onClick={() => {
                  setShowArchive(!showArchive);
                  setSelectedUsers([]);
                }}
              >
                {showArchive ? "hide archived" : "show archive"}
              </button>
            </div>
            <div className="flex md:flex-row flex-col items-center md:gap-4 gap-2">
              <button
                className={`${
                  showArchive
                    ? "hidden"
                    : "bg-blue-400 hover:bg-blue-500 text-white md:text-sm text-xs font-semibold w-[7rem] py-2 rounded-lg"
                }`}
                onClick={() => setShowAddUser(true)}
              >
                Add Account
              </button>
              <button
                className={`${
                  showArchive
                    ? "bg-blue-400 hover:bg-blue-500"
                    : "bg-red-400 hover:bg-red-500"
                } text-white text-xs font-semibold w-[7rem] py-[0.6rem] rounded-lg`}
                onClick={() => {
                  setShowChangeStatus(true);
                }}
              >
                {showArchive ? "Restore Account" : "Archive Account"}
              </button>
              {showArchive && (
                <button
                  className="bg-red-400 hover:bg-red-500 text-white text-xs font-semibold w-[9rem] py-[0.6rem] px-[0.2rem] rounded-lg"
                  onClick={() => {
                    setOnDelete(true);
                    setShowConfirmDelete(true);
                  }}
                >
                  Delete Permanently
                </button>
              )}
              {showChangeStatus && (
                <ChangeStatusConfirmation
                  isOpen={showChangeStatus}
                  onRequestClose={() => setShowChangeStatus(false)}
                  category={`${showArchive ? "Restore" : "Archive"} ${
                    selectedUsers.length === 1 ? "User" : "Users"
                  }`}
                  data={
                    selectedUsers.length === 1 ? getUserName() : selectedUsers
                  }
                  confirm={changeStatus}
                />
              )}
              {showConfirmDelete && (
                <DeleteConfirmation
                  isOpen={showConfirmDelete}
                  onRequestClose={() => setShowConfirmDelete(false)}
                  category={selectedUsers.length === 1 ? "User" : "Users"}
                  data={
                    selectedUsers.length === 1 ? getUserName() : selectedUsers
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
          <div className="scrollbar h-full w-full overflow-y-auto text-black bg-white border border-gray-400 rounded-lg p-[0.4rem]">
            <table className="w-[100%] text-md text-center border border-gray-200 table-fixed">
              <thead>
                <tr className="border-b border-gray-300 ">
                  <th className="md:w-10 w-6"></th>
                  <th className="text-xs md:text-[1rem] py-2">Name</th>
                  <th className="text-xs md:text-[1rem] py-2">Email</th>
                  <th className="text-xs md:text-[1rem] py-2">Department</th>
                  <th className="text-xs md:text-[1rem] py-2">Date Created</th>
                  <th className="text-xs md:text-[1rem] py-2">Role</th>
                  {showArchive ? null : <th className="md:w-10 w-6"></th>}
                </tr>
              </thead>
              <tbody>
                {filterUsers.map((user, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-300 h-[2.5rem]"
                  >
                    <td className="md:p-2 border-r border-gray-300">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.user_id)}
                        onChange={() => handleCheckboxChange(user.user_id)}
                      />
                    </td>
                    <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                      {user.first_name} {user.middle_name} {user.last_name}
                    </td>
                    <td
                      className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300"
                      style={{
                        wordBreak: "break-word",
                        overflowWrap: "anywhere",
                      }}
                    >
                      {user.email}
                    </td>
                    <td className="p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                      {user.department_code}
                    </td>
                    <td className="p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                      {user.created_at}
                    </td>
                    <td className="p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                      {user.role}
                    </td>
                    {showArchive ? null : (
                      <td className="p-2 md:text-sm text-[0.6rem]">
                        <button
                          id="update-btn"
                          onClick={() => {
                            setUserToUpdate(user);
                            setShowAddUser(true);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="text-orange-500 hover:text-orange-600 cursor-pointer"
                          />
                        </button>
                      </td>
                    )}
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
      <UserForm
        isOpen={showAddUser}
        refresh={fetchUsers}
        onRequestClose={() => {
          setUserToUpdate(null);
          setShowAddUser(false);
        }}
        user={userToUpdate}
      />
    </div>
  );
};

export default Users;
