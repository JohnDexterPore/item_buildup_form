const express = require("express");
const jwt = require("jsonwebtoken");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const sqlConfig = require("../db/sqlConfig");
const authenticateToken = require("../middleware/authMiddleware");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  isRefreshTokenValid,
} = require("../utils/tokenUtils");

const router = express.Router();

// POST /api/auth/login
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

    // ✅ Update user status to ACTIVE
    await pool
      .request()
      .input("employee_id", sql.VarChar, employee_id)
      .input("status", sql.VarChar, "ACTIVE")
      .query(
        "UPDATE mtbl_users SET status = @status WHERE employee_id = @employee_id"
      );

    const userPayload = {
      employee_id: user.employee_id,
      firstName: user.first_name,
      lastName: user.last_name,
      profile_image: user.profile_image,
      jobTitle: user.job_title,
      department: user.department,
      accountType: user.account_type,
      email: user.email,
    };

    const accessToken = generateAccessToken(userPayload);
    const refreshToken = generateRefreshToken(userPayload);

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: false, // set to true if using HTTPS
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
router.get("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;

  if (!token || !isRefreshTokenValid(token)) {
    return res.sendStatus(403);
  }

  try {
    const user = await verifyRefreshToken(token);

    const newAccessToken = generateAccessToken({
      employee_id: user.employee_id,
      firstName: user.firstName,
      lastName: user.lastName,
      profile_image: user.profile_image,
      jobTitle: user.jobTitle,
      department: user.department,
      accountType: user.accountType,
      email: user.email,
    });

    res.json({ accessToken: newAccessToken });
  } catch (err) {
    console.error("Refresh token error:", err);
    res.sendStatus(403);
  }
});

// POST /api/auth/logout
router.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  const { employee_id } = req.body;

  // Revoke token and clear cookie
  revokeRefreshToken(token);
  res.clearCookie("refreshToken");

  if (!employee_id) {
    return res
      .status(400)
      .json({ message: "employee_id is required to logout" });
  }

  try {
    const pool = await sql.connect(sqlConfig);
    await pool
      .request()
      .input("employee_id", sql.VarChar, employee_id)
      .input("status", sql.VarChar, "OFFLINE")
      .query(
        "UPDATE mtbl_users SET status = @status WHERE employee_id = @employee_id"
      );

    res.sendStatus(204);
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ message: "Server error during logout" });
  }
});


module.exports = router;
