import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";

import Login from "../pages/Login";
import Inbox from "../pages/Inbox";
import Account from "../pages/Account";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function AppRoutes() {
  const [collapsed, setCollapsed] = useState(false);
  const [navigationItems, setNavigationItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const axios = useAxiosWithAuth();

  const token = localStorage.getItem("accessToken");

  // Auto logout timeout handler
  useEffect(() => {
    let logoutTimer;

    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);

        const currentTime = Date.now() / 1000; // current time in seconds
        const timeUntilExpire = (decoded.exp - currentTime) * 1000; // ms

        // Set timeout to auto logout on token expiration
        logoutTimer = setTimeout(() => {
          console.log("Token expired, logging out...");
          localStorage.removeItem("accessToken");
          navigate("/");
        }, timeUntilExpire);

        // Fetch data
        const fetchData = async () => {
          const [companiesRes, navRes] = await Promise.all([
            axios.get("/companies/getCompanies"),
            axios.get(`/navigation/getNavigation/${decoded.accountType}`),
          ]);
          setNavigationItems(navRes.data);
        };

        fetchData();
      } catch (err) {
        console.error("Invalid token:", err);
        localStorage.removeItem("accessToken");
        navigate("/");
      } finally {
        setLoading(false);
      }
    } else {
      navigate("/");
    }

    return () => {
      clearTimeout(logoutTimer);
    };
  }, [axios, navigate, token]);

  const pathName = location.pathname;
  const segments = pathName.split("/").filter(Boolean);
  const rawText = segments.join(" ");
  const locationName =
    rawText.charAt(0).toUpperCase() + rawText.slice(1).toLowerCase();

  // Show Login without layout
  if (location.pathname === "/") {
    return (
      <Routes>
        <Route path="/" element={<Login />} />
      </Routes>
    );
  }

  return (
    <div className="flex overflow-auto h-screen">
      <Sidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        navigationItems={navigationItems}
        loading={loading}
      />
      <div className="flex flex-col flex-1">
        <Navbar locationName={locationName} user={user} />
        <div className="p-6 bg-gray-100 flex-1 overflow-y-auto">
          <Routes>
            <Route path="/inbox" element={<Inbox />} />
            <Route path="/account" element={<Account user={user} />} />
            {/* Add more routes here */}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AppRoutes;
