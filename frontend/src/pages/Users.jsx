import React, { useState, useEffect } from "react";
import axios from "axios";
import Sidebar from "../components/Sidebar";
import UserForm from "../components/UserForm";
import { exportToCSV } from "../utils/exportToCSV";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSearch } from "@fortawesome/free-solid-svg-icons";

const Users = () => {
  const url = process.env.REACT_APP_URL;
  const [search, setSearch] = useState("");
  const [users, setUsers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [userToUpdate, setUserToUpdate] = useState(null);

  useEffect(() => {
    fetchUsers();
  }, [showAddUser, userToUpdate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${url}api/users/fetch`);
      setUsers(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const filterUsers = users.filter((user) => {
    return (
      user.email.toLowerCase().includes(search.toLowerCase()) ||
      user.first_name.toLowerCase().includes(search.toLowerCase()) ||
      user.middle_name.toLowerCase().includes(search.toLowerCase()) ||
      user.last_name.toLowerCase().includes(search.toLowerCase()) ||
      user.department_code.toLowerCase().includes(search.toLowerCase())
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
            </div>
            <div className="flex md:flex-row flex-col items-center md:gap-4 gap-2">
              <button
                className="bg-blue-400 hover:bg-blue-500 text-white md:text-sm text-xs font-semibold w-[7rem] py-2 rounded-lg"
                onClick={() => setShowAddUser(true)}
              >
                Add Account
              </button>
              <button className="bg-red-400 hover:bg-red-500 text-white md:text-sm text-xs font-semibold w-[7rem] py-2 rounded-lg">
                Delete Account
              </button>
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
                  <th className="md:w-10 w-6"></th>
                </tr>
              </thead>
              <tbody>
                {filterUsers.map((user, index) => (
                  <tr
                    key={index}
                    className="border-b border-gray-300 h-[2.5rem]"
                  >
                    <td className="md:p-2 border-r border-gray-300">
                      <input type="checkbox" />
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
        onRequestClose={() => {
          setShowAddUser(false);
          setUserToUpdate(null);
        }}
        user={userToUpdate}
      />
    </div>
  );
};

export default Users;
