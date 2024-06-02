const jwt = require("jsonwebtoken");
require("dotenv").config();
const User = require("../models/user");

// auth
exports.auth = async (req, res, next) => {
  try {
    // extract token
    const token =
      req.cookies.token ||
      req.body.token ||
      req.header("Authorisation").replace("Bearer ", "");
    // token missing
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "token is missing",
      });
    }
    // verify the token
    try {
      const decode = await jwt.verify(token, process.env.JWT_SECRET);
      console.log(decode);
      req.user = decode;
    } catch (err) {
      // verification issue
      return res.status(401).json({
        success: false,
        message: "token is invalid",
      });
    }
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "token validation unsuccessfull",
    });
  }
};
// isStudent
exports.isStudent = async (req, res,next) => {
  try {
    if (req.user.accountType !== "Student") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for students only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "user role cannot be verified",
    });
  }
};
// isInstructor
exports.isInstructor = async (req, res,next) => {
  try {
    if (req.user.accountType !== "Instructor") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for instructor only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "user role cannot be verified",
    });
  }
};

// isAdmin
exports.isAdmin = async (req, res,next) => {
  try {
    if (req.user.accountType !== "Admin") {
      return res.status(401).json({
        success: false,
        message: "This is a protected route for admin only",
      });
    }
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "user role cannot be verified",
    });
  }
};
