import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import UserForm from "../components/UserForm";
import UserInfo from "../components/UserInfo";
import PasswordPrompt from "../components/PasswordPrompt";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

function Settings() {
  const url = process.env.REACT_APP_URL;
  const [backgroundColor, setBackgroundColor] = useState("");
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentRole = atob(localStorage.getItem("userRole"));
  const [collaborators, setCollaborators] = useState([]);
  const [showUserInfo, setShowUserInfo] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showAddUser, setShowAddUser] = useState(false);
  const [selectedCollaborator, setSelectedCollaborator] = useState(null);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    fetchData();
  }, [showAddUser, showUserInfo, selectedCollaborator, showPasswordPrompt]);

  const fetchData = async () => {
    if (currentUser) {
      try {
        axios
          .get(`${url}api/users/fetch`)
          .then((response) => {
            const user = response.data.find((u) => u.user_id === currentUser);
            const collab = response.data.filter(
              (u) =>
                u.department_code === currentDepartment &&
                u.status === "active" &&
                u.user_id !== currentUser
            );
            setCollaborators(collab);
            if (user) {
              const { email } = user;
              setCredentials((prevState) => ({ ...prevState, email }));
            } else {
              toast.error("User not found.");
            }
          })
          .catch((error) => {
            console.error("Error fetching user:", error);
            toast.error("Failed to fetch user details.");
          });
      } catch (error) {
        console.error("Invalid token format:", error);
        toast.error("Invalid token format.");
      }
    } else {
      toast.error("User not logged in.");
    }
  };

  const handleBackgroundColorChange = (color) => {
    document.body.classList.remove("default", "gray", "red", "green");
    document.body.classList.add(color);
    setBackgroundColor(color);
  };

  const handleThemeChange = () => {
    try {
      if (currentUser) {
        localStorage.setItem(`theme-${currentUser}`, btoa(backgroundColor));
        toast.success("Theme changed successfully!");
      } else {
        toast.error("User not logged in.");
      }
    } catch (error) {
      toast.error("Error saving theme. Please try again.");
    }
  };

  const updatePage = () => {
    fetchData();
    setShowAddUser(false);
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
        setShowAddUser(true);
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
    // Ensure new password matches the confirm password field
    if (credentials.new_password !== credentials.confirm_password) {
      toast.error("Passwords do not match.");
      return;
    }
    try {
      if (currentUser) {
        // Send PUT request to update password
        await axios.put(`${url}api/auth/update`, {
          user_id: currentUser,
          old_password: credentials.old_password,
          new_password: credentials.new_password,
        });

        // Show success toast if password update succeeds
        toast.success("Password updated successfully!");
        setCredentials((prevState) => ({
          ...prevState,
          old_password: "",
          new_password: "",
          confirm_password: "",
        }));
      } else {
        // Handle case where user is not logged in
        toast.error("User not logged in.");
      }
    } catch (error) {
      // Check for 401 error (old password does not match)
      if (error.response?.status === 401) {
        toast.error(error.response.data.error); // "Old password does not match"
      } else {
        // Handle other errors
        const errorMessage =
          error.response?.data?.error ||
          "An error occurred while updating the password.";
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="h-full flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-full">
        <div className="flex items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-2xl font-medium">Settings</span>
        </div>
        <div className="flex lg:flex-row flex-col justify-center items-center lg:h-[calc(100vh-4.5rem)] w-full gap-4 lg:p-0 p-8">
          <div className="flex flex-col justify-center items-center p-5 bg-white rounded-lg shadow-md w-[25rem] h-[30rem] gap-2">
            <h3 className="self-start text-xl font-bold text-black">
              Settings
            </h3>
            <form
              onSubmit={handleSubmit}
              className="flex flex-col w-full gap-2"
            >
              <label htmlFor="email" className="text-sm text-gray-500">
                Email:
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 pl-5 text-sm text-gray-500 bg-gray-100 rounded-md placeholder:text-gray-400 focus:outline-green-800 focus:text-green-800"
                value={credentials.email}
                readOnly
                disabled
                placeholder="Email"
              />
              <label
                htmlFor="current-password"
                className="text-sm text-gray-500"
              >
                Current Password:
              </label>
              <input
                type="password"
                id="current-password"
                value={credentials.old_password || ""}
                required
                onChange={(e) => {
                  setCredentials({
                    ...credentials,
                    old_password: e.target.value,
                  });
                }}
                className="w-full p-2 pl-5 text-sm text-black bg-gray-100 rounded-md placeholder:text-gray-400 focus:outline-green-800 focus:text-green-800"
                placeholder="Current Password"
              />
              <label htmlFor="new-password" className="text-sm text-gray-500">
                New Password:
              </label>
              <input
                type="password"
                id="new-password"
                value={credentials.new_password || ""}
                required
                onChange={(e) => {
                  setCredentials({
                    ...credentials,
                    new_password: e.target.value,
                  });
                }}
                className="w-full p-2 pl-5 text-sm text-black bg-gray-100 rounded-md placeholder:text-gray-400 focus:outline-green-800 focus:text-green-800"
                placeholder="New Password"
                minLength={8}
              />
              <label
                htmlFor="confirm-password"
                className="text-sm text-gray-500"
              >
                Confirm Password:
              </label>
              <input
                type="password"
                id="confirm-password"
                value={credentials.confirm_password || ""}
                required
                onChange={(e) => {
                  setCredentials({
                    ...credentials,
                    confirm_password: e.target.value,
                  });
                }}
                className="w-full p-2 pl-5 text-sm text-black bg-gray-100 rounded-md placeholder:text-gray-400 focus:outline-green-800 focus:text-green-800"
                placeholder="Confirm Password"
                minLength={8}
              />
              <button className="w-full bg-red-600 text-sm text-white font-medium p-2 rounded-md hover:bg-red-700 hover:cursor-pointer mt-3">
                Change Password
              </button>
            </form>
          </div>
          <div className="flex flex-col justify-between items-center p-5 bg-white rounded-xl shadow-md w-[25rem] h-[30rem] gap-2">
            <h3 className="self-start text-xl font-bold mt-3 text-black">
              User Preference
            </h3>
            <div className="flex flex-col w-full gap-2 p-2">
              <h4 className="self-start text-lg font-medium text-black">
                Color theme
              </h4>
              <div className="flex flex-col gap-5 w-full">
                <label className="mr-4 text-black">Background color:</label>
                <div className="flex justify-center items-center gap-6 p-8 border border-gray-200 rounded-xl">
                  <div
                    className="w-12 h-12 rounded-full bg-[#f9f9f9] border border-gray-400 cursor-pointer"
                    onClick={() => handleBackgroundColorChange("default")}
                  ></div>
                  <div
                    className="w-12 h-12 rounded-full bg-gray-600 cursor-pointer"
                    onClick={() => handleBackgroundColorChange("gray")}
                  ></div>
                  <div
                    className="w-12 h-12 rounded-full bg-[#CA6666] cursor-pointer"
                    onClick={() => handleBackgroundColorChange("red")}
                  ></div>
                  <div
                    className="w-12 h-12 rounded-full bg-[#558155] cursor-pointer"
                    onClick={() => handleBackgroundColorChange("green")}
                  ></div>
                </div>
              </div>
            </div>
            <div className="flex flex-col w-full gap-2 pb-2">
              <button
                className="w-full bg-green-500 text-sm text-white font-medium p-2 rounded-md hover:bg-green-600 hover:cursor-pointer"
                onClick={handleThemeChange}
              >
                Change Theme
              </button>
              <button className="w-full bg-gray-500 text-sm text-white font-medium p-2 rounded-md hover:bg-gray-600 hover:cursor-pointer">
                Discard Changes
              </button>
            </div>
          </div>
          {currentRole === "User" && (
            <div className="flex flex-col items-center p-5 bg-white rounded-xl shadow-md w-[25rem] h-[30rem] gap-2 overflow-auto">
              <h3 className="self-start text-xl font-bold mt-3 text-black">
                Collaborators
              </h3>
              <div className="flex flex-col w-full gap-4 py-2">
                <div className="flex flex-col gap-3 w-full h-[20rem] overflow-y-auto scrollbar">
                  {collaborators.length === 0 ? (
                    <div className="flex justify-center items-center px-3">
                      <p className="text-gray-500 text-sm p-4 italic">
                        No Collaborators Added
                      </p>
                    </div>
                  ) : (
                    collaborators.map((collaborator, index) => (
                      <div
                        key={index}
                        className="flex justify-between items-center px-3 border border-gray-200 rounded-xl"
                      >
                        <p className="text-black text-sm p-4">{`${collaborator.first_name} ${collaborator.middle_name} ${collaborator.last_name}`}</p>
                        <button
                          className="text-sm text-white hover:cursor-pointer"
                          onClick={() => {
                            setSelectedUser(collaborator);
                            setShowUserInfo(true);
                          }}
                        >
                          <FontAwesomeIcon
                            icon={faInfoCircle}
                            className="text-gray-300 hover:text-gray-500 text-lg"
                          />
                        </button>
                      </div>
                    ))
                  )}
                </div>
                <button
                  className="w-full bg-green-500 text-sm text-white font-medium p-2 rounded-md hover:cursor-pointer hover:bg-green-600"
                  onClick={() => {
                    setShowPasswordPrompt(true);
                  }}
                >
                  Add Collaborator
                </button>
              </div>
            </div>
          )}
        </div>
        <UserForm
          isOpen={showAddUser}
          onRequestClose={() => {
            updatePage();
          }}
        />
        <PasswordPrompt
          isOpen={showPasswordPrompt}
          onRequestClose={() => setShowPasswordPrompt(false)}
          onSubmit={handlePasswordSubmit}
        />
        <UserInfo
          isOpen={showUserInfo}
          onRequestClose={() => {
            setShowUserInfo(false);
            setSelectedCollaborator(null);
          }}
          user={selectedUser}
        />
      </div>
    </div>
  );
}

export default Settings;
