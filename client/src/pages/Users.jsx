import React, { useEffect, useState } from "react";
import Search from "../components/search";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";
import { LuPencilLine, LuTrash2 } from "react-icons/lu";
import Placeholder from "../img/placeholder.png";

function Users() {
  const axios = useAxiosWithAuth();
  const [users, setUsers] = useState([]);
  const [fetchUsers, setFetchUsers] = useState([]);

  useEffect(() => {
    const fetchUsersData = async () => {
      try {
        const res = await axios.get("/users/get-users");
        setUsers(res.data);
        setFetchUsers(res.data);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };

    fetchUsersData();
  }, [axios]);

  return (
    <div className="bg-gray-100 flex items-center justify-center p-5">
      <div className="flex flex-col lg:flex-col p-5 gap-5 w-full max-w-8xl h-full overflow-auto bg-white shadow-2xl rounded-3xl">
        <div className="flex flex-row">
          <div className="flex flex-4"></div>
          <div className="flex flex-1 items-end justify-end">
            <Search />
          </div>
        </div>

        <table className="min-w-full table-auto border-collapse">
          <thead>
            <tr className="bg-gray-700 text-white">
              <th className="p-3 text-left text-sm font-semibold rounded-tl-xl">
                Actions
              </th>
              <th className="p-3 text-left text-sm font-semibold">
                Full Name / Email
              </th>
              <th className="p-3 text-left text-sm font-semibold">
                Title / Department
              </th>
              <th className="p-3 text-left text-sm font-semibold">
                Account Type
              </th>
              <th className="p-3 text-left text-sm font-semibold rounded-tr-xl">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="text-gray-700 ">
            {users.map((user, index) => (
              <tr
                key={user.employee_id || index}
                className="hover:bg-gray-100 transition normal-case"
              >
                <td className="p-3 border-b border-gray-300 space-x-2 transition transistion-duration-300">
                  <button className="hover:text-white text-xl hover:underline hover:bg-red-600 p-2 rounded-xl">
                    <LuPencilLine />
                  </button>
                  <button className="hover:text-white text-xl hover:underline hover:bg-blue-500 p-2 rounded-xl">
                    <LuTrash2 />
                  </button>
                </td>
                <td className="p-3 border-b border-gray-300 normal-case">
                  <div className="flex flex-row gap-5">
                    <img
                      src={
                        user?.profile_image
                          ? `${
                              import.meta.env.VITE_API_BASE_URL ||
                              "http://localhost:5000"
                            }/uploads/${user.profile_image}`
                          : Placeholder
                      }
                      alt={
                        `${user?.firstName || ""} ${
                          user?.lastName || ""
                        } Profile`.trim() || "User"
                      }
                      className="object-cover rounded-full w-12 h-12"
                    />
                    <div className="flex flex-col justify-center">
                      <span className="normal-case font-semibold text-md">
                        {user.first_name + " " + user.last_name}
                      </span>
                      <span className="normal-case text-gray-500 text-sm">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3 border-b border-gray-300 normal-case">
                  <div className="flex flex-row gap-5">
                    <div className="flex flex-col justify-center">
                      <span className="normal-case font-semibold text-md">
                        {user.job_title + " " + user.department}
                      </span>
                      <span className="normal-case text-gray-500 text-sm">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </td>
                <td className="p-3 border-b border-gray-300 ">
                  {user?.account_type || "N/A"}
                </td>
                <td className="p-3 border-b border-gray-300 ">
                  <span
                    className={`py-2 px-4  rounded-full ${
                      user?.status === "ACTIVE"
                        ? "text-green-700 bg-green-200 font-semibold"
                        : "text-red-700 bg-red-200 font-semibold"
                    }`}
                  >
                    {user?.status || "N/A"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Users;
