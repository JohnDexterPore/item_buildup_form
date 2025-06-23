const express = require("express");
const sql = require("mssql");
const multer = require("multer");
const bcrypt = require("bcryptjs");
const sqlConfig = require("../db/sqlConfig");
const authenticateToken = require("../middleware/authMiddleware");

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

const now = new Date();

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
      request.input("now", sql.DateTime, now);
      if (hashedPassword) {
        request.input("password", sql.VarChar, hashedPassword);
      }
      if (image) {
        request.input("image", sql.VarChar, image);
      }

      // Build query safely
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

      if (hashedPassword) {
        updateQuery += `, password = @password`;
      }
      if (image) {
        updateQuery += `, profile_image = @image`;
      }

      updateQuery += ` WHERE employee_id = @employee_id`;
      console.log("Update Query:", updateQuery);
      await request.query(updateQuery);

      return res.status(200).json({
        message: "Profile updated successfully",
        image: image ? `/uploads/${image}` : null,
      });
    } catch (err) {
      console.error("Error updating profile:", err);
      return res.status(500).json({ message: "Server error" });
    }
  }
);

module.exports = router;
