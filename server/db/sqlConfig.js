const sql = require("mssql");
require("dotenv").config();

const sqlConfig = {
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  server: process.env.DB_SERVER,
  database: process.env.DB_DATABASE,
  options: {
    trustServerCertificate: true,
    enableArithAbort: true,
    trustedConnection: false,
    instancename: "SQLEXPRESS",
  },
  port: parseInt(process.env.DB_PORT, 10) || 1433, // Default SQL Server port
};

module.exports = sqlConfig;
