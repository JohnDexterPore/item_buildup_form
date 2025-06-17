const express = require("express");
const sql = require("mssql");
const bcrypt = require("bcrypt");
const sqlConfig = require("../db/sqlConfig");

const router = express.Router();

router.get("/getCompanies", async (req, res) => {
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool.request().query("SELECT * FROM mtbl_companies");
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching companies:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
