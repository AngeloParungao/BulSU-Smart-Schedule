import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import PasswordPrompt from "../components/PasswordPrompt";
import DeleteConfirmation from "../components/DeleteConfirmation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenToSquare, faSearch } from "@fortawesome/free-solid-svg-icons";
import { exportToCSV } from "../utils/exportToCSV";

const Rooms = () => {
  const currentDepartment = atob(localStorage.getItem("userDept"));
  const currentUser = JSON.parse(atob(localStorage.getItem("userID")));
  const url = process.env.REACT_APP_URL;
  const [search, setSearch] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [showPasswordPrompt, setShowPasswordPrompt] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [rooms, setRooms] = useState([]);
  const [roomsIdToUpdate, setRoomsIdToUpdate] = useState("");
  const [selectedRooms, setSelectedRooms] = useState([]);
  const [selectedBuilding, setSelectedBuilding] = useState("All");
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    room_name: "",
    room_type: "",
    room_building: "",
  });

  useEffect(() => {
    setErrors({});
  }, [isUpdating]);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      const response = await axios.get(`${url}api/rooms/fetch`);
      setRooms(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const resetForm = () => {
    setData({
      room_name: "",
      room_type: "",
      room_building: "",
    });
    setIsUpdating(false);
  };

  const filterRooms = rooms.filter((room) => {
    const matchesSearch =
      room.room_name.toLowerCase().includes(search.toLowerCase()) ||
      room.room_type.toLowerCase().includes(search.toLowerCase()) ||
      room.room_building.toLowerCase().includes(search.toLowerCase());

    const matchesBuilding =
      selectedBuilding === "All" ||
      room.room_building.toLowerCase() === selectedBuilding.toLowerCase();

    return matchesSearch && matchesBuilding;
  });

  const selectAll = () => {
    if (selectedRooms.length === filterRooms.length) {
      setSelectedRooms([]);
    } else {
      const allRoomIds = filterRooms.map((room) => room.room_id);
      setSelectedRooms(allRoomIds);
    }
  };

  const handleCheckboxChange = (room) => {
    if (selectedRooms.includes(room)) {
      setSelectedRooms(selectedRooms.filter((i) => i !== room));
    } else {
      setSelectedRooms([...selectedRooms, room]);
    }
  };

  const handleUpdate = (room) => {
    setIsUpdating(true);
    setRoomsIdToUpdate(room.room_id);
    setData({
      room_name: room.room_name,
      room_type: room.room_type,
      room_building: room.room_building,
    });
  };

  const handleDelete = async () => {
    if (!selectedRooms.length) {
      toast.error("Please select at least one room.");
      return;
    }
    // Prompt the user to confirm the deletion
    setShowDeleteConfirmation(false);
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
          await axios.delete(`${url}api/rooms/delete/`, {
            data: { room_ids: selectedRooms },
          });

          // Log the deletion activity
          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Delete",
            details: `${selectedRooms.length}`,
            type: "room",
          });

          toast.success("Deleted successfully!");
          setSelectedRooms([]);
          fetchRooms();
        } catch (error) {
          console.error("Error deleting data:", error);
          toast.error("Error deleting rooms.");
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

  const handleExportCSV = () => {
    const headers = ["Room Name", "Room Type", "Room Building"];
    const data = filterRooms.map((room) => [
      room.room_name,
      room.room_type,
      room.room_building,
    ]);
    exportToCSV("rooms", headers, data);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validateErrors = {};
    const roomExists = rooms.some(
      (room) =>
        room.room_name.toLowerCase() === data.room_name.toLowerCase() &&
        (!isUpdating || room.room_id !== roomsIdToUpdate)
    );

    if (roomExists) {
      validateErrors.room_name = "Room Already Exists!";
    }
    if (!data.room_name) {
      validateErrors.room_name = "Room Name is required";
    }
    if (!data.room_type) {
      validateErrors.room_type = "Room Type is required";
    }
    if (!data.room_building) {
      validateErrors.room_building = "Room Building is required";
    }

    if (Object.keys(validateErrors).length > 0) {
      setErrors(validateErrors);
    } else {
      setErrors({});
      try {
        if (isUpdating) {
          await axios.put(`${url}api/rooms/update/${roomsIdToUpdate}`, data);

          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Update",
            details: `${data.room_name}`,
            type: "room",
          });

          toast.success("Updated Successfully!");
        } else {
          await axios.post(`${url}api/rooms/adding`, data);

          await axios.post(`${url}api/activity/adding`, {
            user_id: currentUser,
            department_code: currentDepartment,
            action: "Add",
            details: `${data.room_name}`,
            type: "room",
          });

          toast.success("Added Successfully!");
        }

        fetchRooms();
        resetForm();
      } catch (error) {
        console.error(
          `Error ${isUpdating ? "updating" : "adding"} room:`,
          error
        );
        toast.error(`Error in ${isUpdating ? "updating" : "adding"}`);
      }
    }
  };

  const getRoomName = () => {
    const room = rooms.find((room) => room.room_id === selectedRooms[0]);
    return room ? `${room.room_name} - ${room.room_building}` : null;
  };

  return (
    <div className="h-full flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-20 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-full">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)] z-10">
          <span className="md:text-4xl text-2xl font-medium">Rooms</span>
          <Navbar />
        </div>
        <div className="flex flex-col lg:flex-row lg:items-start items-center w-full h-[calc(100%-4.5rem)] p-3 gap-8 lg:gap-0">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 p-4 px-4 bg-white shadow-md rounded-lg w-[100%] lg:w-[30%]"
          >
            <h2 className="text-xl font-semibold text-black">
              {isUpdating ? "Update Room" : "Add Room"}
            </h2>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2">
                <label htmlFor="room_name" className="text-sm text-black">
                  Room Name:
                </label>
                {errors.room_name && (
                  <p className="text-red-500 text-xs">{errors.room_name}</p>
                )}
              </div>
              <input
                type="text"
                name="room_name"
                id="room_name"
                placeholder="ex: RM101"
                value={data.room_name}
                onChange={(e) => {
                  setData({ ...data, room_name: e.target.value });
                  setErrors({ ...errors, room_name: "" });
                }}
                className={`${
                  errors.room_name ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500} placeholder:text-gray-300 placeholder:italic`}
              />
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <div className="flex items-center gap-2 w-full">
                <label htmlFor="room_type" className="text-sm text-black">
                  Room Type:
                </label>
                {errors.room_type && (
                  <p className="text-red-500 text-xs">{errors.room_type}</p>
                )}
              </div>
              <select
                name="room_type"
                id="room_type"
                value={data.room_type}
                onChange={(e) => {
                  setData({ ...data, room_type: e.target.value });
                  setErrors({ ...errors, room_type: "" });
                }}
                className={`${
                  errors.room_type ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500}`}
              >
                <option value="">Room Type</option>
                <option value="Lecture">Lecture</option>
                <option value="Laboratory">Laboratory</option>
              </select>
            </div>
            <div className="flex flex-col gap-[0.2rem]">
              <label htmlFor="room_building" className="text-sm text-black">
                Building:
              </label>
              <input
                type="text"
                name="room_building"
                id="room_building"
                placeholder="ex: Pancho Hall"
                value={data.room_building}
                onChange={(e) => {
                  setData({ ...data, room_building: e.target.value });
                  setErrors({ ...errors, room_building: "" });
                }}
                className={`${
                  errors.room_name ? "border-red-500" : ""
                } p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500} placeholder:text-gray-300 placeholder:italic`}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="w-full bg-blue-500 text-sm text-white py-2 rounded-md hover:bg-blue-600 transition-all"
              >
                {isUpdating ? "UPDATE ROOM" : "ADD ROOM"}
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
              <div className="flex flex-col gap-4">
                <FontAwesomeIcon
                  icon={faSearch}
                  className="absolute left-3 top-3 text-sm text-gray-300"
                />
                <input
                  className="md:w-[14rem] w-[10rem] h-[2.3rem] border border-gray-300 pl-8 rounded-2xl focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-sm placeholder:text-gray-300"
                  type="text"
                  placeholder="Search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)} // Update search term on input change
                />
                <div className="flex items-center gap-2">
                  <label htmlFor="building" className="text-sm text-black">
                    Building:
                  </label>
                  <select
                    name="building"
                    value={selectedBuilding}
                    onChange={(e) => setSelectedBuilding(e.target.value)}
                    className="p-[0.2rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="All">All</option>
                    {Array.from(
                      new Set(rooms.map((room) => room.room_building))
                    ).map((building, index) => (
                      <option key={index} value={building}>
                        {building}
                      </option>
                    ))}
                  </select>
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
                  onClick={() => setShowDeleteConfirmation(true)}
                >
                  Remove
                </button>
                {showDeleteConfirmation && (
                  <DeleteConfirmation
                    isOpen={showDeleteConfirmation}
                    onRequestClose={() => setShowDeleteConfirmation(false)}
                    category={selectedRooms.length === 1 ? "room" : "rooms"}
                    data={
                      selectedRooms.length === 1 ? getRoomName() : selectedRooms
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
            <div className="scrollbar max-h-[30rem] w-full overflow-y-auto text-black bg-white border border-gray-400 rounded-lg p-[0.4rem]">
              <table className="w-[100%] text-md text-center border border-gray-200 table-fixed">
                <thead>
                  <tr className="border-b border-gray-300 bg-gray-100">
                    <th className="md:w-10 w-6"></th>
                    <th className="text-xs md:text-[1rem] py-2">Room Name</th>
                    <th className="text-xs md:text-[1rem] py-2">Room Type</th>
                    <th className="text-xs md:text-[1rem] py-2">
                      Room Building
                    </th>
                    <th className="md:w-10 w-6"></th>
                  </tr>
                </thead>
                <tbody>
                  {filterRooms.map((room, index) => (
                    <tr key={index} className="border-b border-gray-300">
                      <td className="md:p-2 border-r border-gray-300">
                        <input
                          type="checkbox"
                          checked={selectedRooms.includes(room.room_id)}
                          onChange={() => handleCheckboxChange(room.room_id)}
                        />
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {room.room_name}
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {room.room_type}
                      </td>
                      <td className="md:p-2 md:text-sm text-[0.6rem] border-r border-gray-300">
                        {room.room_building}
                      </td>
                      <td className="p-2 md:text-sm text-[0.6rem]">
                        <button id="update-btn">
                          <FontAwesomeIcon
                            icon={faPenToSquare}
                            className="text-orange-500 hover:text-orange-600 cursor-pointer"
                            onClick={() => handleUpdate(room)}
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
      </div>
    </div>
  );
};

export default Rooms;
