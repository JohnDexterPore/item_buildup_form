import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";
import { jwtDecode } from "jwt-decode";
import { LuLayoutDashboard } from "react-icons/lu";
import * as LuIcons from "react-icons/lu";

function Navbar() {
  const [collapsed, setCollapsed] = useState(false);
  const [fetchCompanies, setFetchCompanies] = useState([]);
  const [navigationItems, setNavigationItems] = useState([]);
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const axios = useAxiosWithAuth();
  const location = useLocation();
  const pathName = location.pathname;
  const segments = pathName.split("/").filter(Boolean);
  const rawText = segments.join(" ");
  const locatioName =
    rawText.charAt(0).toUpperCase() + rawText.slice(1).toLowerCase();

  useEffect(() => {
    if (!token) {
      console.log("Redirecting because token is missing");
      navigate("/");
      return;
    }

    let decoded;
    try {
      decoded = jwtDecode(token);
      setUser(decoded);
    } catch (err) {
      console.error("Invalid token:", err);
      navigate("/");
      return;
    }

    // Fetch companies and navigation items concurrently
    const fetchData = async () => {
      try {
        const [companiesResponse, navigationResponse] = await Promise.all([
          axios.get("/companies/getCompanies"),
          axios.get(`navigation/getNavigation/${decoded.accountType}`),
        ]);
        setFetchCompanies(companiesResponse.data);
        setNavigationItems(navigationResponse.data);
      } catch (err) {
        console.error("Data fetch error:", err);
      } finally {
        setLoading(false);
      }
    };
    console.log("Fetching data with navigationItems:", navigationItems);

    fetchData();
  }, [token, axios, navigate]);

  return (
    <>
      <div className="flex">
        {/* Sidebar */}
        <div
          className={`h-screen bg-gray-900 text-white transition-all duration-300 ${
            collapsed ? "w-16" : "w-64"
          }`}
        >
          <div
            className={`flex items-center justify-between p-4 border-b border-gray-700 ${
              collapsed ? "justify-center" : ""
            }`}
          >
            {!collapsed && <span className="text-xl font-bold">IBU Form</span>}
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="text-white focus:outline-none"
            >
              <LuLayoutDashboard />
            </button>
          </div>

          <ul className="mt-4 space-y-2">
            {loading ? (
              <li className="text-center">Loading...</li>
            ) : (
              navigationItems.map((item, index) => {
                const Icon = LuIcons[item.nav_svg];
                return (
                  <li
                    key={index}
                    className={`flex items-center space-x-3 px-4 py-2 hover:bg-gray-700 cursor-pointer ${
                      collapsed ? "justify-center" : ""
                    }`}
                  >
                    <span className="text-lg">{Icon && <Icon />}</span>
                    {!collapsed && <span>{item.nav_name}</span>}
                  </li>
                );
              })
            )}
          </ul>
        </div>

        <div className="flex flex-col flex-1">
          {/* Top Navbar */}
          <div className="bg-white shadow flex justify-between items-center px-6 py-3">
            <h1 className="text-xl font-semibold text-gray-700">
              {locatioName}
            </h1>
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

          {/* Content */}
          <div className="p-6 bg-gray-100 flex-1 overflow-y-auto"></div>
        </div>
      </div>
    </>
  );
}

export default Navbar;
