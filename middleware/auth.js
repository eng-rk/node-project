const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.status(403).json({ msg: "No token provided" });

  try {
    const decoded = jwt.verify(token, "secret_key");
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ msg: "Invalid Token" });
  }
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ msg: "Access denied: Unauthorized role" });
    }
    next();
  };
};

module.exports = { verifyToken, checkRole };