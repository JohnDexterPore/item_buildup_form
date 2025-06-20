const express = require("express");
const sql = require("mssql");
const multer = require("multer");
const sqlConfig = require("../db/sqlConfig");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"), // 'uploads' folder
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
  (req, res) => {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded." });
    }

    // Optional: Save file info to user's profile in DB
    res.status(200).json({
      message: "Upload successful",
      filePath: `/uploads/${req.file.filename}`,
    });
  }
);

module.exports = router;
