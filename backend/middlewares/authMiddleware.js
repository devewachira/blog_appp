const jwt = require("jsonwebtoken");
const { User } = require("../models");

// Middleware to protect routes
const protect = async (req, res, next) => {
  try {
    let token = req.headers.authorization;

    if (token && token.startsWith("Bearer")) {
      token = token.split(" ")[1]; // Extract token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const user = await User.findByPk(decoded.id, {
        attributes: ["id", "name", "email", "role"],
      });

      if (!user) {
        return res.status(401).json({ message: "Not authorized, user not found" });
      }

      req.user = user.toJSON();
      next();
    } else {
      res.status(401).json({ message: "Not authorized, no token" });
    }
  } catch (error) {
    res.status(401).json({ message: "Token failed", error: error.message });
  }
};

// Middleware to check for roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Authorized roles: ${roles.join(", ")}`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
