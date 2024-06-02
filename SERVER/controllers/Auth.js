// const User = require("../models/user");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender");
const Profile = require("../models/Profile");
require("dotenv").config();
// send otp
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;
    // check if user already exists
    const checkUserPresent = await User.findOne({ email });
    // if already exists the return a response
    if (checkUserPresent) {
      return res.status(401).json({
        success: false,
        message: "User already exists",
      });
    }

    // generate otp
    var otp = otpGenerator.generate(6, {
      upperCaseAlphabets: false,
      lowerCaseAlphabets: false,
      specialChars: false,
    });
    console.log("OTP generated: ", otp);

    // check unique otp or not
    const result = await OTP.findOne({ otp: otp });

    while (result) {
      otp = otpGenerator(6, {
        upperCaseAlphabets: false,
        lowerCaseAlphabets: false,
        specialChars: false,
      });
      result = await OTP.findOne({ otp: otp });
    }

    const otpPayload = {email, otp};
    // create an entry in DB
    const otpBody = await OTP.create(otpPayload);
    console.log(otpBody);

    // return response successful
    res.status(200).json({
      success: true,
      message: "otp send successfully",
      otp,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// signup
exports.signUp = async (req, res) => {
  try {
    // fetch data from req.body
    const {
      firstName,
      lastName,
      email,
      password,
      confirmPassword,
      accountType,
      contactNumber,
      otp,
    } = req.body;
    // validate data
    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !confirmPassword ||
      !otp
    ) {
      return res.status(403).json({
        success: false,
        message: "All field are required",
      });
    }
    // match the 2 passwords
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message:
          "Password and confirmPassword doesn't not match! palease try again",
      });
    }
    // check user already exists or not
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User is already registered",
      });
    }
    // find most recent otp stored for user
    const recentOtp = await OTP.find({ email })
      .sort({ createdAt: -1 })
      .limit(1);
    console.log(recentOtp);
    // validate otp
    if (recentOtp.length == 0) {
      return res.status(400).json({
        sucess: false,
        message: "OTP not found",
      });
    } else if (otp !== recentOtp) {
      // invalid otp
      res.status(400).json({
        success: false,
        message: "OTP is not correct",
      });
    }
    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);
    // create entry in db

    const ProfileDetails = await Profile.create({
      gender: null,
      dateOfBirth: null,
      about: null,
      contactNumber: null,
    });

    const user = await User.create({
      firstName,
      lastName,
      email,
      contactNumber,
      password: hashedPassword,
      accountType,
      additionalDetails: ProfileDetails._id,
      image: `https://api/dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
    });
    // return res
    return res.status(200).json({
      success: true,
      message: "user is registered successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "user cannot be registered. please try again",
    });
  }
};

// login
exports.login = async (req, res) => {
  try {
    // get data from req.body
    const { email, password } = req.body;

    // validate data
    if (!email || !password) {
      return res.status(403).json({
        success: false,
        message: "All files are required",
      });
    }
    // check user exists or not
    const user = await User.findOne({ email }).populate("additionalDetails");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User is not registered, please signup first",
      });
    }

    // generate token, after password matching
    if (await bcrypt.compare(password, user.password)) {
      const payload = {
        email: user.email,
        id: user._id,
        accountType: user.accountType,
      };
      const token = jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: "2h",
      });
      user.token = token;
      user.password = undefined;

      // create cookie and send response
      const options = {
        expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        httpOnly: true,
      };
      res.cookie("token", token, options).status(200).json({
        success: true,
        token,
        user,
        message: "Logged in successfully",
      });
    } else {
      return res.status(401).json({
        success: false,
        message: "Password is incorrect",
      });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

// change password
exports.changePassword = async (req, res) => {
  try {
    // get data from req body
    const userDetails = await User.findById(req.user.id);
    // get oldPassword, newPassword, confirmPassword
    const { oldPassword, newPassword, confirmPassword } = req.body;

    // validation
    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(401).json({
        success: false,
        messsage: "All details should be filled correctly",
      });
    }
    const isPasswordMatch = await bcrypt.compare(
      oldPassword,
      userDetails.password
    );
    if (!isPasswordMatch) {
      return res.status(401).json({
        success: false,
        message: "Old password is incorrect",
      });
    }
    if (newPassword !== confirmPassword) {
      return res.status(401).json({
        success: false,
        message: "new password not matching with confirm password",
      });
    }

    // update passwrod in DB
    const encryptedPassword = await bcrypt.hash(newPassword, 10);
    const updateUserDetails = await User.findByIdAndUpdate(
      req.user.id,
      { password: encryptedPassword },
      { new: true }
    );

    // send mail - Password updated
    try {
      // Send notification email , here passwordUpdated is template of email which is send to user;
      const emailResponse = await mailSender(
        updatedUserDetails.email,
        passwordUpdated(
          updatedUserDetails.email,
          `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
        )
      );
      console.log("Email sent successfully:", emailResponse.response);
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: "Error occurred while sending email",
        error: error.message,
      });
    }

    return res.status(200).json({ 
      success: true,
      message: "Password updated successfully" 
    });

    // return response
  } catch (error) {
    console.error("Error occurred while updating password:", error);
    return res.status(500).json({
      success: false,
      message: "Error occurred while updating password",
      error: error.message,
    });
  }
};
