const jwt = require("jsonwebtoken");

let refreshTokens = [];

const generateAccessToken = (user) => {
  return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: "15m" });
};

const generateRefreshToken = (user) => {
  const token = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });
  refreshTokens.push(token);
  return token;
};

const verifyRefreshToken = (token) => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
      if (err) reject(err);
      else resolve(user);
    });
  });
};

const revokeRefreshToken = (token) => {
  refreshTokens = refreshTokens.filter((t) => t !== token);
};

const isRefreshTokenValid = (token) => {
  return refreshTokens.includes(token);
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  revokeRefreshToken,
  isRefreshTokenValid,
};
