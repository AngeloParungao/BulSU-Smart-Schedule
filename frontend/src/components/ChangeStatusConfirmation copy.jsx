import React from "react";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faWarning } from "@fortawesome/free-solid-svg-icons";

const ChangeStatusConfirmation = ({
  isOpen,
  onRequestClose,
  type,
  category,
  data,
  confirm,
}) => {
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
      width: "23rem",
      padding: "1rem",
      background: "#fff",
      borderRadius: "1rem",
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

  return (
    <Modal
      isOpen={isOpen}
      style={customStyles}
      appElement={document.getElementById("root")}
    >
      <div className="flex flex-col items-center gap-6">
        <div className="text-2xl text-orange-500 h-12 w-12 flex items-center justify-center bg-orange-100 rounded-full">
          <FontAwesomeIcon icon={faWarning} />
        </div>
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-bold text-lg">{category}</p>
          <p className="text-md text-gray-700">
            {Array.isArray(data)
              ? type === "user"
                ? category === "Restore Users"
                  ? `You're going to restore ${data.length} users`
                  : `You're going to archive ${data.length} users`
                : category === "Restore Departments"
                ? `You're going to restore ${data.length} departments`
                : `You're going to archive ${data.length} departments`
              : `You're going to ${category} "${data}"`}
            . Are you sure?
          </p>
        </div>
        <div className="flex w-full gap-2">
          <button
            className="bg-orange-500 text-white w-full p-2 rounded-full hover:bg-orange-600"
            onClick={confirm}
          >
            {category === "Restore User" || category === "Restore Department"
              ? "Restore"
              : "Archive"}
          </button>
          <button
            className="bg-gray-500 text-white w-full p-2 rounded-full hover:bg-gray-600"
            onClick={onRequestClose}
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ChangeStatusConfirmation;
