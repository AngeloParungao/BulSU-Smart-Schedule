import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";

function Settings() {
  const url = process.env.REACT_APP_URL;
  const [backgroundColor, setBackgroundColor] = useState("");
  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
    old_password: "",
    new_password: "",
    confirm_password: "",
  });

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      try {
        const userId = JSON.parse(atob(userToken));
        axios
          .get(`${url}api/users/fetch`)
          .then((response) => {
            const user = response.data.find((u) => u.user_id === userId);
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
  }, []);

  const handleBackgroundColorChange = (color) => {
    document.body.classList.remove("default", "gray", "red", "green");
    document.body.classList.add(color);
    setBackgroundColor(color);
  };

  const handleThemeChange = () => {
    try {
      const userToken = localStorage.getItem("userToken");
      if (userToken) {
        const userId = JSON.parse(atob(userToken));
        localStorage.setItem(`theme-${userId}`, btoa(backgroundColor));
        toast.success("Theme changed successfully!");
      } else {
        toast.error("User not logged in.");
      }
    } catch (error) {
      toast.error("Error saving theme. Please try again.");
    }
  };

  //TODO: add password reset
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Ensure new password matches the confirm password field
      if (credentials.new_password !== credentials.confirm_password) {
        toast.error("Passwords do not match.");
        return;
      }

      // Retrieve userToken from localStorage
      const userToken = localStorage.getItem("userToken");
      if (userToken) {
        // Parse userToken to extract userId
        const userId = JSON.parse(atob(userToken)); // Ensure userId is properly accessed

        // Send PUT request to update password
        await axios.put(`${url}api/auth/update`, {
          user_id: userId,
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
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-3xl font-medium">Settings</span>
        </div>
        <div className="flex lg:flex-row flex-col justify-center items-center lg:h-[calc(100vh-4.5rem)] w-full md:gap-8 gap-4 lg:p-0 p-8">
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
            <button className="w-full bg-red-600 text-sm text-white font-medium p-2 rounded-md hover:bg-red-700 hover:cursor-pointer">
              Reset All Schedule
            </button>
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
                className="w-full bg-green-500 text-sm text-white font-medium p-2 rounded-md"
                onClick={handleThemeChange}
              >
                Change Theme
              </button>
              <button className="w-full bg-gray-500 text-sm text-white font-medium p-2 rounded-md">
                Discard Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Settings;
