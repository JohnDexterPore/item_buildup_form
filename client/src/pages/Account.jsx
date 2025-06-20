import React, { useState, useEffect } from "react";
import Placeholder from "../img/placeholder.png"; // Adjust the path as necessary

function Account({ user }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || "");
      setLastName(user.lastName || "");
      setEmail(user.email || "");
      setJobTitle(user.jobTitle || "");
      setDepartment(user.department || "");
    }
  }, [user]);

  return (
    <div className=" bg-gray-100 flex items-center justify-center p-6">
      <div className="flex flex-col lg:flex-row w-full max-w-6xl bg-white shadow-2xl rounded-3xl overflow-hidden">
        {/* Left Side - Form */}
        <div className="w-full lg:w-1/3 bg-blue-50 flex items-center justify-center p-10">
          <div className="text-center">
            <img
              src={Placeholder}
              alt="User"
              className="w-40 h-40 rounded-full mx-auto mb-4 border-4 border-blue-300"
            />
            <p className="text-gray-700 font-semibold">
              {firstName} {lastName}
            </p>
            <p className="text-sm text-gray-500">{email}</p>
          </div>
        </div>

        {/* Right Side - Avatar */}
        <div className="w-full lg:w-2/3 p-10">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">
            Account Information
          </h1>
          <form className="space-y-6">
            {/* Employee ID */}
            <div>
              <label
                htmlFor="grid-employee-id"
                className="block text-sm font-semibold text-gray-600 uppercase"
              >
                Employee ID
              </label>
              <input
                id="grid-employee-id"
                type="text"
                readOnly
                value={user?.employee_id || "Loading..."}
                className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            {/* First and Last Name */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label
                  htmlFor="grid-first-name"
                  className="block text-sm font-semibold text-gray-600 uppercase"
                >
                  First Name
                </label>
                <input
                  id="grid-first-name"
                  type="text"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="grid-last-name"
                  className="block text-sm font-semibold text-gray-600 uppercase"
                >
                  Last Name
                </label>
                <input
                  id="grid-last-name"
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="grid-email"
                className="block text-sm font-semibold text-gray-600 uppercase"
              >
                Email
              </label>
              <input
                id="grid-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="grid-password"
                className="block text-sm font-semibold text-gray-600 uppercase"
              >
                Password
              </label>
              <input
                id="grid-password"
                type="password"
                value="******************"
                onChange={(e) => setPassword(e.target.value)}
                className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
              />
              <p className="text-xs text-gray-500 italic mt-1">
                Password cannot be changed here.
              </p>
            </div>

            {/* Job Title and Department */}
            <div className="flex flex-col md:flex-row gap-6">
              <div className="flex-1">
                <label
                  htmlFor="grid-job-title"
                  className="block text-sm font-semibold text-gray-600 uppercase"
                >
                  Job Title
                </label>
                <input
                  id="grid-job-title"
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
              <div className="flex-1">
                <label
                  htmlFor="grid-department"
                  className="block text-sm font-semibold text-gray-600 uppercase"
                >
                  Department
                </label>
                <input
                  id="grid-department"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full mt-1 px-4 py-3 bg-gray-100 border border-gray-300 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            {/* Save Button */}
            <div className="text-center">
              <button
                type="submit"
                className="mt-4 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Save
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Account;
