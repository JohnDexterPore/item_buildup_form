import React, { useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { useAxiosWithAuth } from "../hooks/useAxiosWithAuth";

import Login from "../pages/Login";
import Inbox from "../pages/Inbox";
import Account from "../pages/Account";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar"; // or Topbar if separate

function AppRoutes() {
  const [collapsed, setCollapsed] = useState(false);
  const [navigationItems, setNavigationItems] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();
  const location = useLocation();
  const axios = useAxiosWithAuth();

  const token = localStorage.getItem("accessToken");

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    try {
      const decoded = jwtDecode(token);
      setUser(decoded);

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
      navigate("/");
    } finally {
      setLoading(false);
    }
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

  // Otherwise, wrap with layout
  return (
    <div className="flex">
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
            <Route path="/account" element={<Account />} />
            {/* Add more routes here */}
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default AppRoutes;
