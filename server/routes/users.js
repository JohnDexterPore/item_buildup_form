const express = require("express");
const sql = require("mssql");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const sqlConfig = require("../db/sqlConfig");
const authenticateToken = require("../middleware/authMiddleware");
const {
  generateAccessToken,
  generateRefreshToken,
} = require("../utils/tokenUtils");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => {
    const ext = file.originalname.split(".").pop();
    const filename = `${Date.now()}.${ext}`;
    cb(null, filename);
  },
});

const upload = multer({ storage });

router.post(
  "/update-profile",
  authenticateToken,
  upload.single("image"),
  async (req, res) => {
    const {
      employee_id,
      first_name,
      last_name,
      job_title,
      department,
      email,
      password,
    } = req.body;

    if (!employee_id) {
      return res.status(400).json({ message: "Employee ID is required." });
    }

    let hashedPassword = null;
    if (password) {
      try {
        const salt = await bcrypt.genSalt(10);
        hashedPassword = await bcrypt.hash(password, salt);
      } catch (err) {
        return res.status(500).json({ message: "Error hashing password" });
      }
    }

    const image = req.file ? req.file.filename : null;

    try {
      const pool = await sql.connect(sqlConfig);
      const request = pool.request();

      request.input("employee_id", sql.VarChar, employee_id);
      request.input("first_name", sql.VarChar, first_name);
      request.input("last_name", sql.VarChar, last_name);
      request.input("job_title", sql.VarChar, job_title);
      request.input("department", sql.VarChar, department);
      request.input("email", sql.VarChar, email);
      request.input("now", sql.DateTime, new Date());
      if (hashedPassword)
        request.input("password", sql.VarChar, hashedPassword);
      if (image) request.input("image", sql.VarChar, image);

      let updateQuery = `
        UPDATE mtbl_users SET
          first_name = @first_name,
          last_name = @last_name,
          job_title = @job_title,
          department = @department,
          email = @email,
          edit_date = @now,
          edit_by = @employee_id
      `;
      if (hashedPassword) updateQuery += `, password = @password`;
      if (image) updateQuery += `, profile_image = @image`;

      updateQuery += ` WHERE employee_id = @employee_id`;
      await request.query(updateQuery);

      // 🔄 Query updated user details (including account_type)
      const userResult = await pool
        .request()
        .input("employee_id", sql.VarChar, employee_id)
        .query("SELECT * FROM mtbl_users WHERE employee_id = @employee_id");

      const user = userResult.recordset[0];
      if (!user) {
        return res.status(404).json({ message: "User not found after update" });
      }

      // 🧠 Create user payload with accountType included
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

      // 🍪 Set new refresh token in cookie
      res.cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: false, // set to true if using HTTPS
        sameSite: "strict",
        path: "/api/auth/refresh",
      });

      return res.status(200).json({
        message: "Profile updated successfully",
        accessToken,
        image: user.profile_image ? `/uploads/${user.profile_image}` : null,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

router.get("/get-users", authenticateToken, async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .query("SELECT * FROM mtbl_users ORDER BY first_name");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
