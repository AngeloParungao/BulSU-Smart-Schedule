import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import logo from "../assets/smartsched_logo.png";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";
import { RotatingLines } from "react-loader-spinner";

function Login() {
  const url = process.env.REACT_APP_URL;
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const [credentials, setCredentials] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("userToken");
    if (token) {
      navigate("/home");
      return;
    }

    // Fetch all users
    axios
      .get(`${url}api/auth/fetch`)
      .then((res) => setUsers(res.data))
      .catch((err) => {
        console.error("Failed to fetch users:", err);
      });
  }, [navigate, url]);

  const handleSubmit = (event) => {
    event.preventDefault();
    setLoading(true);

    // Check if credentials are valid
    const user = users.find(
      (user) =>
        user.email === credentials.email &&
        user.password === credentials.password
    );

    // If credentials are valid, login
    if (user) {
      setTimeout(() => {
        setLoading(false);
        toast.success("Login Successful!");
      }, 2000);
      setTimeout(() => {
        localStorage.setItem("userToken", btoa(user.user_id));
        localStorage.setItem("userDept", btoa(user.department_code));
        navigate("/home");
      }, 3000);
    } else {
      setTimeout(() => {
        setLoading(false);
        setCredentials({ email: "", password: "" });
        toast.error("Invalid email or password");
      }, 2000);
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
            <span className="text-2xl font-bold text-black">LOGIN</span>
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg p-2 px-3 w-full focus-within:border-green-700">
            <FontAwesomeIcon icon={faEnvelope} className="text-gray-300 mr-3" />
            <input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials({ ...credentials, email: e.target.value })
              }
              aria-label="Email"
              name="email"
              autoComplete="email"
              required
              className="w-full outline-none text-sm text-black focus:text-green-700 placeholder:text-gray-300 placeholder:text-sm"
            />
          </div>
          <div className="flex items-center border border-gray-300 rounded-lg p-2 px-3 w-full focus-within:border-green-700">
            <FontAwesomeIcon icon={faLock} className="text-gray-300 mr-3" />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials({ ...credentials, password: e.target.value })
              }
              aria-label="Password"
              name="password"
              required
              className="w-full outline-none text-sm text-black focus:text-green-700 placeholder:text-gray-300 placeholder:text-sm"
            />
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
          <a href="#view" className="text-sm text-gray-400 mt-2">
            Viewing schedule
          </a>
        </form>
      </div>
    </div>
  );
}

export default Login;
