import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosInstance";
import { jwtDecode } from "jwt-decode";

function Login() {
  const navigate = useNavigate();
  const [fetchCompanies, setFetchCompanies] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp * 1000 < Date.now();

        if (!isExpired) {
          setIsAuthenticated(true);
          navigate("/Inbox");
        } else {
          localStorage.removeItem("accessToken");
        }
      } catch {
        localStorage.removeItem("accessToken");
      }
    }
    axios
      .get("/companies/getCompanies")
      .then((res) => setFetchCompanies(res.data))
      .catch((err) => console.log(err));
  }, []);

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/auth/login", {
        employee_id: employeeId,
        password: password,
      });
      localStorage.setItem("accessToken", res.data.accessToken);
      alert("Login successful!");
      navigate("/Inbox");
    } catch (err) {
      alert("Login failed");
    }
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center bg-gradient-to-t from-[#ed1c24] to-[#ed1c24]/60">
      <div className="w-2/3 md:w-2/3 lg:1/3 max-w-md h-auto flex flex-col justify-center items-center rounded-lg shadow-lg p-6 bg-white">
        <div className="flex min-h-full flex-1 flex-col justify-center lg:py-12 py-5 lg:px-8">
          <div className="mx-auto w-full max-w-sm">
            <div className="flex flex-wrap justify-center items-center gap-5">
              {fetchCompanies.map((company, index) => (
                <img
                  key={index}
                  className="lg:h-15 h-10 w-auto"
                  src={company.logo_address}
                  alt={`${company.company_name} Logo`}
                />
              ))}
            </div>
            <h2 className="mt-10 text-center text-xl font-bold tracking-tight text-gray-900">
              Item Build Up Form
            </h2>
          </div>

          <div className="mt-10 mx-auto w-full max-w-sm">
            <form onSubmit={login} className="space-y-6">
              <div>
                <label
                  htmlFor="id_number"
                  className="block text-sm font-medium text-gray-900"
                >
                  ID Number
                </label>
                <div className="mt-2">
                  <input
                    id="id_number"
                    name="id_number"
                    type="number"
                    required
                    value={employeeId}
                    onChange={(e) => {
                      const value = e.target.value.slice(0, 6);
                      setEmployeeId(value);
                    }}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 text-sm"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-900"
                >
                  Password
                </label>
                <div className="mt-2">
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md bg-white px-3 py-1.5 text-gray-900 outline-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:outline-indigo-600 text-sm"
                  />
                </div>
              </div>
              <div>
                <button
                  type="submit"
                  className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline-indigo-600"
                >
                  Sign in
                </button>
              </div>
            </form>

            <p className="mt-10 text-center text-sm text-gray-500">
              Not a user? Ask{" "}
              <span className="font-bold text-black">IT Department</span> to
              create an account for you.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
