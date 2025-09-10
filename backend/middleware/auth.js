const jwt = require("jsonwebtoken");
const User = require("../models/User");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");
    console.log("Auth header:", authHeader);

    const token = authHeader?.replace("Bearer ", "");
    console.log("Extracted token:", token ? "Present" : "Missing");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded token:", decoded);

    const user = await User.findById(decoded.userId).select("-password");
    console.log("Found user:", user ? user.username : "Not found");

    if (!user) {
      return res.status(401).json({ message: "Token is not valid" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ message: "Token is not valid" });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {
      if (req.user.role !== "admin") {
        return res
          .status(403)
          .json({ message: "Access denied. Admin role required." });
      }
      next();
    });
  } catch (error) {
    res.status(401).json({ message: "Authorization failed" });
  }
};

module.exports = { auth, adminAuth };
