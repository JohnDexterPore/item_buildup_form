import React from "react";

function Navbar({ locationName, user }) {
  return (
    <>
      <div className="bg-white shadow flex justify-between items-center px-6 py-3">
        <h1 className="text-xl font-semibold text-gray-700">{locationName}</h1>
        <div className="flex items-center space-x-3">
          <span className="text-gray-800 font-medium">
            {user?.name || "Loading..."}
          </span>
          <img
            src="https://i.pravatar.cc/40"
            alt="User "
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>
    </>
  );
}

export default Navbar;
