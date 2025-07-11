const express = require("express");
const sql = require("mssql");
const sqlConfig = require("../db/sqlConfig");
const authenticateToken = require("../middleware/authMiddleware");
const { DateTime } = require("luxon");

const router = express.Router();

// POST to save form + summary
router.post("/create-item", authenticateToken, async (req, res) => {
  const {
    companyCode,
    parentItemDescription,
    posTxt,
    datePrepared,
    startDate,
    endDate,
    priceTier,
    grossPrice,
    deliveryPrice,
    category,
    subcategory,
    coverage,
    components,
    transactionTypes,
    summary,
    userId,
  } = req.body;

  try {
    const pool = await sql.connect(sqlConfig);
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    const request = new sql.Request(transaction);

    // Step 1: Count existing items with same companyCode + userId
    const refPrefix = `${companyCode}-${userId}-`; // no dashes
    const countQuery = `
      SELECT COUNT(*) AS itemCount
      FROM tbl_items
      WHERE reference_no LIKE @refPrefix + '%'
    `;
    const countResult = await request
      .input("refPrefix", sql.VarChar, refPrefix)
      .query(countQuery);

    const latestCount = (countResult.recordset[0]?.itemCount || 0) + 1;
    const newReferenceNo = `${companyCode}-${userId}-${latestCount}`;

    // Step 2: Format transaction types
    const txTypesString = Object.entries(transactionTypes)
      .filter(([_, checked]) => checked)
      .map(([key]) =>
        key.replace(/([A-Z])/g, " $1").replace(/^./, (c) => c.toUpperCase())
      )
      .join(", ");

    const summaryJson = JSON.stringify(summary);

    // Step 3: Prepare insert query
    const insertParentQuery = `
      INSERT INTO tbl_items (
        reference_no, brand, parent_item_description, pos_txt, date_prepared,
        start_date, end_date, price_tier, gross_price, delivery_price,
        category, subcategory, coverage, components, transaction_types,
        summary_data, created_date, created_by, state
      )
      VALUES (
        @reference_no, @companyCode, @parentItemDescription, @posTxt, @datePrepared,
        @startDate, @endDate, @priceTier, @grossPrice, @deliveryPrice,
        @category, @subcategory, @coverage, @components, @transactionType,
        @summary, CURRENT_TIMESTAMP, @createdBy, @state
      )
    `;

    request.input("reference_no", sql.VarChar, newReferenceNo);
    request.input("companyCode", sql.VarChar, companyCode);
    request.input("parentItemDescription", sql.VarChar, parentItemDescription);
    request.input("posTxt", sql.VarChar, posTxt);
    request.input("datePrepared", sql.Date, datePrepared);
    request.input("startDate", sql.Date, startDate);
    request.input("endDate", sql.Date, endDate);
    request.input("priceTier", sql.VarChar, priceTier);
    request.input("grossPrice", sql.Decimal(18, 2), grossPrice);
    request.input("deliveryPrice", sql.Decimal(18, 2), deliveryPrice);
    request.input("category", sql.VarChar, category);
    request.input("subcategory", sql.VarChar, subcategory);
    request.input("coverage", sql.VarChar, coverage);
    request.input("components", sql.VarChar, components);
    request.input("transactionType", sql.VarChar, txTypesString);
    request.input("summary", sql.NVarChar(sql.MAX), summaryJson);
    request.input("createdBy", sql.VarChar, userId);
    request.input("state", sql.VarChar, "Ongoing");

    await request.query(insertParentQuery);
    await transaction.commit();

    res.json({
      message: "Item created successfully!",
      reference_no: newReferenceNo,
    });
  } catch (err) {
    console.error("Error saving item:", err);
    res.status(500).json({ message: "Failed to save item." });
  }
});


router.get("/get-items", authenticateToken, async (req, res) => {
  const { state } = req.query; // Use query for GET params

  try {
    const pool = await sql.connect(sqlConfig);
    const request = pool.request();

    let query = "SELECT * FROM tbl_items";

    // Add condition only if status is provided
    if (state) {
      query += " WHERE state = @state";
      request.input("state", sql.VarChar, state);
    }
    query += " ORDER BY created_date DESC";
    const result = await request.query(query);
    res.json(result.recordset);
  } catch (err) {
    console.error("Error fetching items:", err);
    res.status(500).json({ message: "Server error" });
  }
});
module.exports = router;
