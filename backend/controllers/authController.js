const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Member = require("../models/Member");

const signToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
};


// REGISTER
const register = async (req, res, next) => {
  try {
    const {
      name,
      username,
      email,
      password,
      phone,
      phoneNumber,
    } = req.body;

    // Accept either name or username
    const userName = name || username;

    // Accept either phone or phoneNumber
    const userPhone = phone || phoneNumber || "";

    if (!userName || !email || !password) {
      return res.status(400).json({
        message: "Name/Username, Email and Password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters.",
      });
    }

    const existingUser = await User.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      return res.status(400).json({
        message: "An account with this email already exists.",
      });
    }

    // Create User
    const user = await User.create({
      name: userName,
      email,
      password,
      role: "member",
    });

    const memberData = {
      user: user._id,
      phone: userPhone,
    };

    if (req.body.planId) {
      const MembershipPlan = require("../models/MembershipPlan");
      const plan = await MembershipPlan.findById(req.body.planId);
      if (plan) {
        memberData.plan = plan._id;
        memberData.membershipStart = new Date();
        const end = new Date(memberData.membershipStart);
        end.setMonth(end.getMonth() + plan.durationMonths);
        memberData.membershipEnd = end;
        memberData.membershipStatus = 'active';
      }
    }

    // Create Member Profile
    const member = await Member.create(memberData);

    const token = signToken(user);

    res.status(201).json({
      message: "Registration successful.",
      token,
      user: user.toSafeObject(),
      memberId: member._id,
    });
  } catch (err) {
    next(err);
  }
};


// LOGIN
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and Password are required.",
      });
    }

    const user = await User.findOne({
      email: email.toLowerCase(),
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = signToken(user);

    res.json({
      message: "Login successful.",
      token,
      user: user.toSafeObject(),
    });
  } catch (err) {
    next(err);
  }
};


// GET CURRENT USER
const getMe = async (req, res, next) => {
  try {
    res.json({
      user: req.user.toSafeObject
        ? req.user.toSafeObject()
        : req.user,
    });
  } catch (err) {
    next(err);
  }
};


// CHANGE PASSWORD
const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: "Current and new password are required.",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: "New password must be at least 6 characters.",
      });
    }

    const user = await User.findById(req.user._id);

    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(401).json({
        message: "Current password is incorrect.",
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      message: "Password changed successfully.",
    });
  } catch (err) {
    next(err);
  }
};


// FORGOT PASSWORD
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({
      email: (email || "").toLowerCase(),
    });

    if (!user) {
      return res.json({
        message:
          "If that email exists, a reset token has been generated.",
      });
    }

    const resetToken = jwt.sign(
      {
        id: user._id,
        purpose: "reset",
      },
      process.env.JWT_SECRET,
      {
        expiresIn: "15m",
      }
    );

    res.json({
      message:
        "Password reset token generated successfully.",
      resetToken,
    });
  } catch (err) {
    next(err);
  }
};


// RESET PASSWORD
const resetPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;

    if (!resetToken || !newPassword) {
      return res.status(400).json({
        message:
          "Reset token and new password are required.",
      });
    }

    let decoded;

    try {
      decoded = jwt.verify(
        resetToken,
        process.env.JWT_SECRET
      );
    } catch (error) {
      return res.status(400).json({
        message:
          "Reset token is invalid or has expired.",
      });
    }

    if (decoded.purpose !== "reset") {
      return res.status(400).json({
        message: "Invalid token.",
      });
    }

    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    user.password = newPassword;

    await user.save();

    res.json({
      message: "Password reset successful.",
    });
  } catch (err) {
    next(err);
  }
};


module.exports = {
  register,
  login,
  getMe,
  changePassword,
  forgotPassword,
  resetPassword,
};