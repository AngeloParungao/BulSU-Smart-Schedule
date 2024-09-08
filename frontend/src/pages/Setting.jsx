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
  });

  useEffect(() => {
    const userToken = localStorage.getItem("userToken");

    if (userToken) {
      try {
        const userId = JSON.parse(atob(userToken));
        axios
          .get(`${url}api/auth/fetch`)
          .then((response) => {
            const user = response.data.find((u) => u.user_id === userId);
            if (user) {
              const { email, password } = user;
              setCredentials({ email, password });
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
  }, [url]);

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
            <div className="flex flex-col w-full gap-2">
              <label htmlFor="email" className="text-sm text-gray-500">
                Email:
              </label>
              <input
                type="email"
                id="email"
                className="w-full p-2 pl-5 text-sm text-gray-500 bg-gray-100 rounded-md placeholder:text-gray-400 focus:outline-green-800 focus:text-green-800"
                value={credentials.email}
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
                className="w-full p-2 pl-5 text-sm text-black bg-gray-100 rounded-md placeholder:text-gray-400 focus:outline-green-800 focus:text-green-800"
                placeholder="Current Password"
              />
              <label htmlFor="new-password" className="text-sm text-gray-500">
                New Password:
              </label>
              <input
                type="password"
                id="new-password"
                className="w-full p-2 pl-5 text-sm text-black bg-gray-100 rounded-md placeholder:text-gray-400 focus:outline-green-800 focus:text-green-800"
                placeholder="New Password"
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
                className="w-full p-2 pl-5 text-sm text-black bg-gray-100 rounded-md placeholder:text-gray-400 focus:outline-green-800 focus:text-green-800"
                placeholder="Confirm Password"
              />
            </div>
            <div className="flex flex-col w-full gap-2 pt-5">
              <button className="w-full bg-red-600 text-sm text-white font-medium p-2 rounded-md hover:bg-red-700 hover:cursor-pointer">
                Change Password
              </button>
              <button className="w-full bg-red-600 text-sm text-white font-medium p-2 rounded-md hover:bg-red-700 hover:cursor-pointer">
                Reset All Schedule
              </button>
            </div>
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
