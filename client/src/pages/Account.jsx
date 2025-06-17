import React from "react";
import Placeholder from "../img/placeholder.png"; // Adjust the path as necessary

function Account() {
  return (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-full w-2/3 flex flex-col gap-5">
        <div className="w-full flex flex-[1] justify-center items-center">
          <button className="p-15 bg-blue-200 rounded-full hover:bg-blue-300 transition-colors">
            <img
              src={Placeholder}
              alt="User Image"
              className="w-10 h-10 rounded-full"
            />
          </button>
        </div>
        <div className="bg-green-200 w-full flex flex-[2] flex-col justify-center items-center">
          Bottom (2/3)
        </div>
      </div>
    </div>
  );
}

export default Account;
