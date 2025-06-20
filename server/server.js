const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const companiesRoutes = require("./routes/companies");
const navigationRoutes = require("./routes/navigation");
const usersRoutes = require("./routes/users");
require("dotenv").config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/navigation", navigationRoutes);

app.listen(5000, () => console.log("Server running on port 5000"));
