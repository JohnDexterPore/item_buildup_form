const express = require("express");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const sqlConfig = require("../db/sqlConfig");

const router = express.Router();

let refreshTokens = [];

const generateAccessToken = (user) =>
  jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });

const generateRefreshToken = (user) => {
  const token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  refreshTokens.push(token);
  return token;
};

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { employee_id, password } = req.body;

  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .input("employee_id", sql.VarChar, employee_id)
      .query("SELECT * FROM mtbl_users WHERE employee_id = @employee_id");

    const user = result.recordset[0];
    if (!user) return res.status(404).json({ message: "User not found" });

    const isPasswordMatch = await bcrypt.compare(password, user.password);
    if (!isPasswordMatch)
      return res.status(401).json({ message: "Incorrect password" });

    const userPayload = {
      employee_id: user.employee_id,
      role: user.role,
      name: user.first_name + " " + user.last_name,
      accountType: user.account_type,
      jobTitle: user.job_title,
      department: user.department,
      email: user.email,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false,
      sameSite: "strict",
      path: "/api/auth/refresh",
    });

    res.json({ accessToken });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// GET /api/auth/refresh
router.get("/refresh", (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token || !refreshTokens.includes(token)) return res.sendStatus(403);

  jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);

    const accessToken = generateAccessToken({
      employee_id: user.employee_id,
      role: user.role,
      name: user.name,
      accountType: user.accountType,
      jobTitle: user.jobTitle,
      department: user.department,
      email: user.email,
    });
    res.json({ accessToken });
  });
});

// POST /api/auth/logout
router.post("/logout", (req, res) => {
  refreshTokens = refreshTokens.filter((t) => t !== req.cookies.refreshToken);
  res.clearCookie("refreshToken");
  res.sendStatus(204);
});

module.exports = router;
