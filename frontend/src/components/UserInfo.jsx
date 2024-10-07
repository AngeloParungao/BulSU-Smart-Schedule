import React, { useEffect } from "react";
import Modal from "react-modal";

const UserInfo = ({ isOpen, onRequestClose, user }) => {
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
      height: "fit-content",
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

  const handleSubmit = (e) => {
    e.preventDefault();
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
          Collaborator
        </span>
        <div className="flex flex-col gap-[0.2rem] w-[100%]">
          <div className="flex items-center gap-2 w-[100%]">
            <label htmlFor="email" className="text-md text-black">
              Email:
            </label>
          </div>
          <input
            type="email"
            name="email"
            id="email"
            placeholder="Email"
            value={user?.email}
            readOnly
            className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-[0.2rem] w-[100%]">
          <div className="flex items-center gap-2 w-[100%]">
            <label htmlFor="name" className="text-md text-black">
              Full Name:
            </label>
          </div>
          <input
            type="text"
            name="name"
            id="name"
            placeholder="Full Name"
            value={
              user
                ? `${user.first_name} ${user.middle_name} ${user.last_name}`
                : ""
            }
            readOnly
            className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-[0.2rem] w-[100%]">
          <div className="flex items-center gap-2 w-[100%]">
            <label htmlFor="department" className="text-md text-black">
              Department:
            </label>
          </div>
          <input
            type="text"
            name="department"
            id="department"
            placeholder="Department"
            value={user?.department_code}
            readOnly
            className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-col gap-[0.2rem] w-[100%]">
          <div className="flex items-center gap-2 w-[100%]">
            <label htmlFor="date" className="text-md text-black">
              Date Created:
            </label>
          </div>
          <input
            type="text"
            name="date"
            id="date"
            placeholder="Date Created"
            value={user?.created_at}
            readOnly
            className="p-[0.5rem] text-black text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </div>
        <button
          type="submit"
          className="bg-red-500 text-white p-2 w-full rounded-md hover:bg-red-600"
        >
          Delete
        </button>
      </form>
    </Modal>
  );
};

export default UserInfo;
