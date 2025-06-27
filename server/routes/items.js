const express = require("express");
const sql = require("mssql");
const sqlConfig = require("../db/sqlConfig");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/add-item", authenticateToken, async (req, res) => {
  const { name } = req.query; // ?name=Category
  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    let query = "SELECT * FROM mtbl_dropdown";
    if (name) {
      query += " WHERE dropdown_name = @name";
      request.input("name", sql.VarChar, name);
    }

    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching dropdown:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;