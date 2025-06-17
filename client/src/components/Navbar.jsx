import React from "react";
import Placeholder from "../img/placeholder.png"; // Adjust the path as necessary

function Navbar({ locationName, user }) {
  return (
    <>
      <div className="bg-white shadow flex justify-between items-center p-4">
        <h1 className="text-xl font-semibold text-gray-700">{locationName}</h1>
        <div className="flex items-center space-x-3">
          <span className="text-gray-800 font-medium">
            {user?.name || "Loading..."}
          </span>
          <img
            src={user.img || Placeholder}
            alt="User Image"
            className="w-10 h-10 rounded-full"
          />
        </div>
      </div>
    </>
  );
}

export default Navbar;
