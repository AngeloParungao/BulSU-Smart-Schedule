// OfflinePage.js
import React from "react";

const OfflinePage = () => (
  <div className="h-screen flex flex-col items-center justify-center bg-gray-200">
    <h1 className="md:text-6xl text-2xl text-center font-bold">
      No Internet Connection
    </h1>
    <p className="md:text-2xl text-md text-center mt-4">
      Please check your connection and try again.
    </p>
  </div>
);
export default OfflinePage;
