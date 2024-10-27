import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/FINAL LOGO.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";
import { RotatingLines } from "react-loader-spinner";

function Login() {
  const url = process.env.REACT_APP_URL;
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  const handleForgotPassword = async () => {
    if (credentials.email === "") {
      toast.error("Email is required");
      return;
    }

    try {
      // Await the axios request
      const response = await axios.post(`${url}api/auth/forgot-password`, {
        email: credentials.email,
      });

      // Check if the response was successful
      if (response.status === 200) {
        toast.success(response.data.message);
      }
    } catch (error) {
      // Handle errors based on the response status
      if (error.response) {
        if (error.response.status === 404) {
          toast.error("User not found");
        } else if (error.response.status === 500) {
          toast.error("Server error. Please try again later.");
        }
      } else {
        toast.error("Network error. Please try again.");
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);

    const validationErrors = {};

    if (!credentials.email) {
      validationErrors.email = "Email is required";
    }
    if (!credentials.password) {
      validationErrors.password = "Password is required";
    }
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      setLoading(false);
    } else {
      setErrors({});
      try {
        // Post credentials to the login endpoint
        const response = await axios.post(`${url}api/auth/login`, {
          email: credentials.email,
          password: credentials.password,
        });

        // Check if login was successful
        if (response.data) {
          const { user_id, department_code, role, status } = response.data;

          if (status === "archived") {
            setLoading(false);
            toast.error("Account Archived or Deleted");
            return;
          }

          localStorage.setItem("userID", btoa(user_id));
          localStorage.setItem("userDept", btoa(department_code));
          localStorage.setItem("userRole", btoa(role));

          // Delay showing success message and navigating
          setTimeout(() => {
            setLoading(false);
            toast.success("Login Successful!");

            setCredentials({ email: "", password: "" });
            setTimeout(() => {
              navigate("/home");
            }, 2000); // Delay before navigation
          }, 2000); // Delay before showing success message
        }
      } catch (error) {
        setTimeout(() => {
          setLoading(false);
          toast.error("Invalid email or password");
        }, 2000); // Delay before showing error message
      }
    }
  };

  return (
    <div className="bg-bulsu bg-no-repeat bg-cover h-screen flex justify-center items-center h-[100dvh]">
      <Toaster position="bottom-right" reverseOrder={false} />
      <div className="flex justify-center items-center h-[70%] lg:w-3/5 md:w-3/4 w-[90%] bg-white rounded-xl shadow-md">
        <div className="w-1/2 h-full hidden lg:flex flex-col justify-center items-center bg-[#F7F7F7] rounded-l-3xl p-12">
          <img src={logo} alt="SmartSched Logo" className="h-48 w-auto" />
          <span className="font-bold text-2xl text-green-900 text-center mt-14">
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
            <span className="text-2xl font-bold text-black">LOGIN</span>
          </div>
          <div className="flex flex-col gap-2 w-full">
            {errors.email && (
              <p className="text-red-500 text-xs">{errors.email}</p>
            )}
            <div
              className={`${
                errors.email ? "border-red-500" : ""
              } flex items-center border border-gray-300 rounded-lg p-2 px-3 w-full focus-within:border-green-700`}
            >
              <FontAwesomeIcon
                icon={faEnvelope}
                className="text-gray-300 mr-3"
              />
              <input
                type="email"
                placeholder="Email"
                value={credentials.email}
                onChange={(e) => {
                  setCredentials({ ...credentials, email: e.target.value });
                  setErrors({ ...errors, email: "" });
                }}
                aria-label="Email"
                name="email"
                autoComplete="email"
                className="w-full outline-none text-sm text-black focus:text-green-700 placeholder:text-gray-300 placeholder:text-sm"
              />
            </div>
          </div>
          <div className="flex flex-col gap-2 w-full">
            {errors.password && (
              <p className="text-red-500 text-xs">{errors.password}</p>
            )}
            <div
              className={`${
                errors.password ? "border-red-500" : ""
              } flex items-center border border-gray-300 rounded-lg p-2 px-3 w-full focus-within:border-green-700`}
            >
              <FontAwesomeIcon icon={faLock} className="text-gray-300 mr-3" />
              <input
                type="password"
                placeholder="Password"
                value={credentials.password}
                onChange={(e) => {
                  setCredentials({ ...credentials, password: e.target.value });
                  setErrors({ ...errors, password: "" });
                }}
                aria-label="Password"
                name="password"
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
              "LOGIN"
            )}
          </button>
          <button
            type="button"
            className="text-sm text-gray-400 mt-2 hover:text-gray-500"
            onClick={handleForgotPassword}
          >
            forgot password?
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
