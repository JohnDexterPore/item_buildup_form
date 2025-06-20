import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axiosInstance from "../api/axiosInstance";

export function useAxiosWithAuth() {
  const [token, setToken] = useState(localStorage.getItem("accessToken"));
  const location = useLocation();
  const navigate = useNavigate();

  // Refresh token on every route change except public pages
  useEffect(() => {
    const refreshToken = async () => {
      try {
        const res = await axiosInstance.get("/auth/refresh");
        setToken(res.data.accessToken);
        localStorage.setItem("accessToken", res.data.accessToken);
      } catch (error) {
        setToken(null);
        localStorage.removeItem("accessToken");
        navigate("/");
      }
    };

    // ⛔ Avoid refresh on public pages
    const isPublic = ["/"].includes(location.pathname);
    if (!isPublic) {
      refreshToken();
    }
  }, [location.pathname, navigate]);

  // Attach token to every request and handle 401 responses
  useEffect(() => {
    const requestInterceptor = axiosInstance.interceptors.request.use(
      (config) => {
        const storedToken = localStorage.getItem("accessToken");
        if (storedToken) {
          config.headers.Authorization = `Bearer ${storedToken}`;
        }
        return config;
      }
    );

    const responseInterceptor = axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;
        if (
          error.response &&
          error.response.status === 401 &&
          !originalRequest._retry
        ) {
          originalRequest._retry = true;
          try {
            const res = await axiosInstance.get("/auth/refresh");
            const newAccessToken = res.data.accessToken;
            setToken(newAccessToken);
            localStorage.setItem("accessToken", newAccessToken);
            axiosInstance.defaults.headers.common[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            originalRequest.headers[
              "Authorization"
            ] = `Bearer ${newAccessToken}`;
            return axiosInstance(originalRequest);
          } catch (refreshError) {
            console.log("Refresh token expired or invalid", refreshError);
            setToken(null);
            localStorage.removeItem("accessToken");
            navigate("/login");
            return Promise.reject(refreshError);
          }
        }
        return Promise.reject(error);
      }
    );

    return () => {
      axiosInstance.interceptors.request.eject(requestInterceptor);
      axiosInstance.interceptors.response.eject(responseInterceptor);
    };
  }, [navigate]);

  return axiosInstance;
}
