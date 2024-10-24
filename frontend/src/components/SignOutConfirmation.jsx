import React from "react";
import Modal from "react-modal";
import { toast, Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";

const SignOutConfirmation = ({ isOpen, onRequestClose }) => {
  const navigate = useNavigate();
  const logout = () => {
    onRequestClose();
    toast.success("Logging Out");
    setTimeout(() => {
      localStorage.removeItem("userID");
      localStorage.removeItem("userDept");
      localStorage.removeItem("userRole");
      navigate("/");
      window.location.reload();
    }, 2000);
  };

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

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onRequestClose}
      style={customStyles}
      appElement={document.getElementById("root")}
    >
      <div className="bg-white rounded-lg p-4">
        <h2 className="text-lg">Are you sure you want to sign out?</h2>
        <div className="mt-4 flex justify-end">
          <button
            onClick={logout}
            className="bg-red-500 hover:bg-red-700 text-white text-sm font-bold py-2 px-4 rounded"
          >
            Sign out
          </button>
          <button
            onClick={onRequestClose}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-bold py-2 px-4 rounded ml-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default SignOutConfirmation;
