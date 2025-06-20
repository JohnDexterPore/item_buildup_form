import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export function useAxiosWithAuth() {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const location = useLocation();

  // Initial token refresh only if not on /login or public page
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const res = await axiosInstance.get("/auth/refresh");
        setToken(res.data.accessToken);
        localStorage.setItem("accessToken", res.data.accessToken);
      } catch (err) {
        console.log("Initial refresh failed", err);
        setToken(null);
        localStorage.removeItem("accessToken");
      }
    };

    // ⛔ Avoid refresh on public pages
    const isPublic = ["/"].includes(location.pathname);
    if (!token && !isPublic) {
      refreshToken();
    }
  }, [token, location.pathname]);

  // Attach token to every request
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    return () => {
      axiosInstance.interceptors.request.eject(interceptor);
    };
  }, []);

  return axiosInstance;
}
