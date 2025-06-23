import React from "react";
import { useNavigate, Link } from "react-router-dom";
import { LuLayoutDashboard, LuLogOut } from "react-icons/lu";
import * as LuIcons from "react-icons/lu";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";

function Sidebar({
  collapsed,
  setCollapsed,
  navigationItems = [],
  loading,
  locationName,
}) {
  const navigate = useNavigate();
  const axios = useAxiosWithAuth();

  const handleSignOut = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      if (token) {
        const { employee_id } = JSON.parse(atob(token.split(".")[1]));

        // Call server-side logout to clear cookie and revoke refresh token
        await axios.post("/auth/logout", {
          employee_id: employee_id,
        });
      }
    } catch (err) {
      console.error("Error during logout:", err);
    } finally {
      localStorage.removeItem("accessToken");
      navigate("/");
    }
  };

  return (
    <>
      {/* Sidebar */}
      <div
        className={`h-screen bg-gray-900 text-white transition-all duration-300 flex flex-col justify-between ${
          collapsed ? "w-16" : "w-64"
        }`}
      >
        <div>
          <div
            className={`flex items-center justify-between p-4 border-b border-gray-700 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {!collapsed && (
              <span className="text-xl font-bold overflow-hidden text-nowrap text-ellipsis">
                IBU Form
              </span>
            )}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white focus:outline-none w-10 h-10 flex items-center justify-center hover:bg-gray-700 rounded-2xl"
            >
              <LuLayoutDashboard />
            </button>
          </div>

          <ul className="mt-4 space-y-2 px-2 py-4">
            {loading ? (
              <li className="text-center">Loading...</li>
            ) : (
              navigationItems.map((item, index) => {
                const Icon = LuIcons[item.nav_svg];
                return (
                  <li key={index}>
                    <Link
                      className={`flex items-center space-x-3 rounded-xl px-4 py-2 hover:bg-gray-700 cursor-pointer h-10
                          ${collapsed ? "justify-center" : ""}
                          ${
                            item.nav_name === locationName
                              ? "bg-gray-700 font-semibold"
                              : ""
                          }
                        `}
                      to={item.nav_link}
                    >
                      <span className="text-lg">{Icon && <Icon />}</span>
                      {!collapsed && <span>{item.nav_name}</span>}
                    </Link>
                  </li>
                );
              })
            )}
          </ul>
        </div>

        {/* Sign Out Button */}
        <div className="border-t border-gray-700 px-2 py-4">
          <button
            onClick={handleSignOut}
            className={`flex items-center space-x-3 w-full px-4 py-2 hover:bg-gray-700 rounded-xl ${
              collapsed ? "justify-center" : ""
            }`}
          >
            <span className="text-lg">
              <LuLogOut />
            </span>
            {!collapsed && <span>Sign Out</span>}
          </button>
        </div>
      </div>
    </>
  );
}

export default Sidebar;
