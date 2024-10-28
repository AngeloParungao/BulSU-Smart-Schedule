import React from "react";
import Modal from "react-modal";

const TermsAndConditions = ({ isOpen, onRequestClose }) => {
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
          <h1 className="text-2xl font-bold">Terms and Conditions</h1>
        </div>
        <div className="flex flex-col gap-4">
          <div>
            <span className="text-sm font-semibold">
              1. Acceptance of Terms
            </span>
            <p className="text-sm text-gray-600">
              By accessing or using the SmartSchedule system, you agree to be
              bound by these Terms and Conditions. If you disagree with any part
              of these terms, please do not use the system.
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold">2. User Accounts</span>
            <ul className="list-disc pl-6 text-sm text-gray-600">
              <li>
                You are responsible for maintaining the confidentiality of your
                account credentials.
              </li>
              <li>
                You agree to use the system only for authorized purposes related
                to academic activities at Bulacan State University.
              </li>
              <li>
                You agree not to misuse the system, including but not limited
                to, hacking, spamming, or unauthorized access.
              </li>
            </ul>
          </div>
          <div>
            <span className="text-sm font-semibold">3. System Usage</span>
            <ul className="list-disc pl-6 text-sm text-gray-600">
              <li>
                You agree to use the system in accordance with all applicable
                laws, regulations, and policies of Bulacan State University.
              </li>
              <li>
                You agree not to interfere with the operation of the system or
                attempt to gain unauthorized access to the system or its data.
              </li>
              <li>
                The Administration reserves the right to modify, suspend, or
                discontinue the system at any time without notice.
              </li>
            </ul>
          </div>
          <div>
            <span className="text-sm font-semibold">
              4. Intellectual Property
            </span>
            <ul className="list-disc pl-6 text-sm text-gray-600">
              <li>
                The SmartSchedule system and its content, including but not
                limited to, software, text, images, and graphics, are the
                property of Bulacan State University and the Developers and are
                protected by copyright and other intellectual property laws.
              </li>
              <li>
                You agree not to reproduce, distribute, modify, or create
                derivative works of the system or its content without prior
                written consent from the Administration.
              </li>
            </ul>
          </div>
          <div>
            <span className="text-sm font-semibold">
              5. Limitation of Liability
            </span>
            <p className="text-sm text-gray-600">
              The University shall not be liable for any damages, direct or
              indirect, arising from the use or inability to use the system.
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold">
              6. Modification of Terms
            </span>
            <p className="text-sm text-gray-600">
              The Administration reserves the right to modify these Terms and
              Conditions at any time. Any changes will be effective immediately
              upon posting on the system.
            </p>
          </div>
          <div>
            <span className="text-sm font-semibold">7. Termination</span>
            <p className="text-sm text-gray-600">
              The University may terminate your access to the system at any
              time, with or without notice, for any reason.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default TermsAndConditions;
