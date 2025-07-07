import React, { useEffect, useState } from "react";
import Search from "../components/Search";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";
import { LuPencilLine, LuTrash2 } from "react-icons/lu";
import {
  MdKeyboardDoubleArrowLeft,
  MdKeyboardArrowLeft,
  MdKeyboardArrowRight,
  MdKeyboardDoubleArrowRight,
} from "react-icons/md";
import Placeholder from "../img/placeholder.png";
import Prompt from "../components/Prompt";
import UserModal from "../components/UserModal";

function Users() {
  const axios = useAxiosWithAuth();
  const [fetchUsers, setFetchUsers] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [type, setType] = useState("");
  const [message, setMessage] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [data, setData] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);

  const usersPerPage = 7;

  const fetchUsersData = async () => {
    try {
      const res = await axios.get("/users/get-users");
      setFetchUsers(res.data);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  useEffect(() => {
    fetchUsersData();
  }, []);

  const filteredUsers = fetchUsers.filter((user) => {
    const fullName = `${user.first_name} ${user.last_name}`.toLowerCase();
    return (
      fullName.includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.department?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const handleDeleteUser = (userId) => {
    setType("question");
    setMessage("Are you sure you want to delete this user?");
    setData(userId);
    setIsVisible(true);
  };

  const handleAcceptDelete = async (userId) => {
    try {
      await axios.delete(`/users/delete-user/${userId}`);
      setUsers((prev) => prev.filter((u) => u.employee_id !== userId));
      setFetchUsers((prev) => prev.filter((u) => u.employee_id !== userId));

      // Show success message
      setType("info");
      setMessage("User deleted successfully.");
      setData(null);
      setIsVisible(true);
    } catch (err) {
      console.error("Failed to delete user:", err);
      // Optional: You can show an error prompt here
      setType("info");
      setMessage("Failed to delete user.");
      setIsVisible(true);
    }
  };

  const handleCancelDelete = () => {
    setIsVisible(false);
    setData(null);
  };

  const handleCloseInfoPrompt = () => {
    setIsVisible(false);
    setData(null);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setUserModalVisible(true);
  };

  const handleCloseUserModal = () => {
    setSelectedUser(null);
    setUserModalVisible(false);
  };

  return (
    <>
      <div className="bg-gray-100 flex items-center justify-center p-5">
        <div className="flex flex-col lg:flex-col p-5 gap-5 w-full max-w-8xl bg-white shadow-2xl rounded-3xl">
          <div className="flex flex-row items-center justify-between">
            <div className="flex flex-4 font-bold text-xl text-gray-700">
              Results:
              <span className="ml-2 font-normal text-xl text-gray-600">
                {filteredUsers.length} users...
              </span>
            </div>

            <div className="flex flex-1 items-end justify-end">
              <Search
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                showMobileSearch={showMobileSearch}
                setShowMobileSearch={setShowMobileSearch}
              />
            </div>
          </div>
          <div className="">
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
              <tbody className="text-gray-700">
                {currentUsers.map((user, index) => (
                  <tr
                    key={user.employee_id || index}
                    className="hover:bg-gray-100 transition normal-case border-b border-gray-200 rounded-2xl"
                  >
                    <td className="p-3  space-x-2 transition transistion-duration-300">
                      <button
                        onClick={() => handleEditUser(user)}
                        className="hover:text-white text-xl hover:underline hover:bg-blue-500 p-2 rounded-xl"
                      >
                        <LuPencilLine />
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.employee_id)}
                        className="hover:text-white text-xl hover:underline hover:bg-red-600 p-2 rounded-xl"
                      >
                        <LuTrash2 />
                      </button>
                    </td>
                    <td className="p-3 normal-case">
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
                    <td className="p-3 normal-case">
                      <div className="flex flex-row gap-5">
                        <div className="flex flex-col justify-center">
                          <span className="normal-case font-semibold text-md">
                            {user.job_title}
                          </span>
                          <span className="normal-case text-gray-500 text-sm">
                            {user.department}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      {{ 0: "Admin", 1: "Approver", 2: "User" }[
                        user?.account_type
                      ] || "N/A"}
                    </td>
                    <td className="p-3">
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
          <div className="flex justify-end mt-4 space-x-1 text-md">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <MdKeyboardDoubleArrowLeft />
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <MdKeyboardArrowLeft />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(
                Math.max(0, currentPage - 4),
                Math.min(currentPage + 1, totalPages)
              )
              .map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-1 border rounded ${
                    currentPage === page
                      ? "bg-gray-700 text-white"
                      : "bg-white text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {page}
                </button>
              ))}

            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <MdKeyboardArrowRight />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="px-2 py-1 border rounded disabled:opacity-50"
            >
              <MdKeyboardDoubleArrowRight />
            </button>
          </div>
        </div>
      </div>
      <Prompt
        type={type}
        message={message}
        onAccept={
          type === "question" ? handleAcceptDelete : handleCloseInfoPrompt
        }
        onCancel={
          type === "question" ? handleCancelDelete : handleCloseInfoPrompt
        }
        isVisible={isVisible}
        data={data}
      />
      <UserModal
        visible={userModalVisible}
        onClose={handleCloseUserModal}
        account={selectedUser}
        onSaved={fetchUsersData} // <-- NEW
      />
    </>
  );
}

export default Users;
