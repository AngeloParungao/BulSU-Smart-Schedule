import React from "react";
import Modal from "react-modal";

const PrivacyPolicy = ({ isOpen, onRequestClose }) => {
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
      width: "80%",
      height: "80%",
      padding: "1rem",
      background: "#f5f5f5",
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
      <div className="p-6 flex flex-col w-full h-full gap-4 overflow-y-scroll scrollbar">
        <div className="pb-2 border-b-2 border-gray-400">
          <h1 className="text-2xl font-bold">Privacy Policy</h1>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-sm font-semibold">
              1. Information Collection and Use
            </span>
            <p className="text-sm text-gray-600">
              We may collect personal information such as your name, email
              address, and contact information.
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold">
              2. Information Security
            </span>
            <ul className="list-disc pl-6 text-sm text-gray-600">
              <li>
                We implement reasonable security measures to protect your
                personal information from unauthorized access, use, disclosure,
                alteration, or destruction.
              </li>
              <li>
                However, no security system is perfect, and we cannot guarantee
                the absolute security of your information.
              </li>
            </ul>
          </div>
          <div>
            <span className="text-sm font-semibold">3. Data Sharing</span>
            <p className="text-sm text-gray-600">
              We may share your personal information with authorized personnel
              within Bulacan State University for the purposes of academic
              administration and student support.
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold">4. Data Retention</span>
            <p className="text-sm text-gray-600">
              We will retain your personal information for as long as necessary
              to fulfill the purposes for which it was collected or as required
              by law.
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold">5. Your Rights</span>
            <p className="text-sm text-gray-600">
              You may have certain rights regarding your personal information,
              such as the right to access, correct, or delete your information.
              Please contact the administration at Bulacan State University to
              exercise these rights.
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold">
              6. Changes to this Privacy Policy
            </span>
            <p className="text-sm text-gray-600">
              We may update this Privacy Policy from time to time. We will
              notify you of any significant changes.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PrivacyPolicy;
