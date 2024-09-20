import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import logo from "../assets/smartsched_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faLock } from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";
import { RotatingLines } from "react-loader-spinner";

const ResetPassword = () => {
  const url = process.env.REACT_APP_URL;
  const [errors, setErrors] = useState({});
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Use useLocation to access the URL parameters
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token"); // Extract the token from the URL

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validationErrors = {};

    if (!newPassword) {
      validationErrors.new_password = "Please enter a new password";
    } else if (newPassword.length < 8) {
      validationErrors.new_password = "Password must be at least 8 characters";
    } else if (newPassword !== confirmPassword) {
      validationErrors.confirm_password = "Passwords do not match";
    }

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
    } else {
      setErrors({});
      try {
        const response = await axios.post(`${url}api/auth/reset-password`, {
          token,
          newPassword,
        });

        toast.success(response.data.message);
        setTimeout(() => {
          navigate("/");
        }, 4000);
      } catch (error) {
        if (error.response) {
          toast.error(error.response.data.error);
        } else {
          toast.error("An unexpected error occurred. Please try again.");
        }
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="bg-bulsu bg-no-repeat bg-cover h-screen flex justify-center items-center h-[100dvh]">
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="flex justify-center items-center h-[70%] lg:w-3/5 md:w-3/4 w-[90%] bg-white rounded-xl shadow-md">
        <div className="w-1/2 h-full hidden lg:flex flex-col justify-center items-center bg-[#F7F7F7] rounded-l-3xl p-12">
          <img src={logo} alt="SmartSched Logo" className="h-22 w-auto" />
          <span className="font-bold text-2xl text-green-900 text-center">
            BulSU SmartSchedule
          </span>
          <p className="text-sm text-gray-400 text-center">
            Your one-stop scheduling app for Bulacan State University
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="lg:w-1/2 w-full p-12 flex flex-col justify-center items-center gap-5"
        >
          <div className="self-start flex items-center">
            <img
              src={logo}
              alt="SmartSched Logo"
              className="block lg:hidden h-20 w-auto ml-[-2rem]"
            />
            <span className="text-2xl font-bold text-black">
              RESET PASSWORD
            </span>
          </div>
          <div className="flex flex-col gap-2 w-full">
            {errors.new_password && (
              <p className="text-red-500 text-xs">{errors.new_password}</p>
            )}
            <div
              className={`${
                errors.new_password ? "border-red-500" : ""
              } flex items-center border border-gray-300 rounded-lg p-2 px-3 w-full focus-within:border-green-700`}
            >
              <FontAwesomeIcon icon={faLock} className="text-gray-300 mr-3" />
              <input
                type="password"
                placeholder="New Password"
                value={newPassword}
                onChange={(e) => {
                  setNewPassword(e.target.value);
                  setErrors({ ...errors, new_password: "" });
                }}
                aria-label="New Password"
                name="new_password"
                className="w-full outline-none text-sm text-black focus:text-green-700 placeholder:text-gray-300 placeholder:text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            {errors.confirm_password && (
              <p className="text-red-500 text-xs">{errors.confirm_password}</p>
            )}
            <div
              className={`${
                errors.confirm_password ? "border-red-500" : ""
              } flex items-center border border-gray-300 rounded-lg p-2 px-3 w-full focus-within:border-green-700`}
            >
              <FontAwesomeIcon icon={faLock} className="text-gray-300 mr-3" />
              <input
                type="password"
                placeholder="Password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  setErrors({ ...errors, confirm_password: "" });
                }}
                aria-label="Confirm Password"
                name="confirm_password"
                className="w-full outline-none text-sm text-black focus:text-green-700 placeholder:text-gray-300 placeholder:text-sm"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="flex justify-center items-center bg-green-700 text-white p-2 rounded-md hover:bg-green-800 w-full"
          >
            {loading ? (
              <RotatingLines
                height={20}
                width={20}
                color="white"
                strokeWidth="4"
              />
            ) : (
              "Change Password"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;
