const express = require("express");
const sql = require("mssql");
const sqlConfig = require("../db/sqlConfig");
const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/get-navigation/:userType", authenticateToken, async (req, res) => {
  const { userType } = req.params;
  let condition = "";

  switch (parseInt(userType, 10)) {
    case 1:
      condition = "WHERE user_type != 0";
      break;
    case 2:
      condition = "WHERE user_type = 2";
      break;
    case 0:
      break;
    default:
      return res.status(400).send("Invalid userType");
  }
  try {
    const pool = await sql.connect(sqlConfig);
    const result = await pool
      .request()
      .query("SELECT * FROM mtbl_navigation " + condition);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching navigation:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
