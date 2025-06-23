const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth");
const companiesRoutes = require("./routes/companies");
const navigationRoutes = require("./routes/navigation");
const usersRoutes = require("./routes/users");
const fs = require("fs");
const path = require("path");
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}
require("dotenv").config();

const app = express();
app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/companies", companiesRoutes);
app.use("/api/navigation", navigationRoutes);
app.use("/api/users", usersRoutes);

// Serve uploads folder as static
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(5000, () => console.log("Server running on port 5000"));
