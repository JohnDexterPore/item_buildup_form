import { useEffect, useState } from "react";
import axiosInstance from "../api/axiosInstance";

export function useAxiosWithAuth() {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));

  // Initial token refresh on mount
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

    refreshToken(); // ✅ always try to refresh on mount
  }, []);

  // Setup request interceptor only once
  useEffect(() => {
    const interceptor = axiosInstance.interceptors.request.use((config) => {
      const storedToken = localStorage.getItem("accessToken");
      if (storedToken) {
        config.headers.Authorization = `Bearer ${storedToken}`;
      }
      return config;
    });

    return () => {
      axiosInstance.interceptors.request.eject(interceptor); // Cleanup
    };
  }, []);

  return axiosInstance;
}
