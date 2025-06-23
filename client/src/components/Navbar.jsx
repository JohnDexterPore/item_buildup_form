import React from "react";
import Placeholder from "../img/placeholder.png"; // Adjust the path as necessary

function Navbar({ locationName, user }) {
  return (
    <>
      <div className="bg-white shadow flex justify-between items-center p-4">
        <h1 className="text-xl font-semibold text-gray-700">{locationName}</h1>
        <div className="flex items-center space-x-3">
          <span className="text-gray-800 font-medium">
            {user?.firstName + " " + user?.lastName || "Loading..."}
          </span>
          <img
            src={
              user?.profile_image
                ? `${
                    import.meta.env.VITE_API_BASE_URL || "http://localhost:5000"
                  }/uploads/${user.profile_image}`
                : Placeholder
            }
            alt={
              user ? `${user.firstName} ${user.lastName} Profile` : "User Image"
            }
            className="w-10 h-10 rounded-full"
            onError={(e) => {
              e.currentTarget.onerror = null; // Prevent infinite loop
              e.currentTarget.src = Placeholder;
            }}
          />
        </div>
      </div>
    </>
  );
}

export default Navbar;
