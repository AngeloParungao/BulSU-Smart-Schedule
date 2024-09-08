import React from "react";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

const Scheduling = () => {
  return (
    <div className="h-[100dvh] flex bg-[var(--background-color)] text-[var(--text-color)]">
      <div className="z-10 fixed lg:relative top-0 left-0">
        <Sidebar />
      </div>
      <div className="w-full h-screen absolute lg:relative">
        <div className="flex justify-between items-center border-b-2 pl-16 lg:pl-8 h-[4.5rem] sticky top-0 bg-[var(--background-color)] text-[var(--text-color)]">
          <span className="md:text-4xl text-3xl font-medium">Scheduling</span>
          <Navbar />
        </div>
      </div>
    </div>
  );
};

export default Scheduling;
