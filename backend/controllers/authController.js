import crypto from "crypto";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";
import { sendPasswordResetEmail } from "../services/emailService.js";

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateToken = (userId) =>
  jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

export const signup = async (req, res) => {
  try {
    const { name, email, password, phone, location, interests } = req.body || {};

    if (
      !name ||
      !email ||
      !password ||
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Name, email and password must be valid text strings" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return res.status(400).json({ message: "Please provide a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists" });
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail,
      password,
      phone: typeof phone === "string" ? phone.trim() : "",
      location: typeof location === "string" ? location.trim() : "",
      interests: Array.isArray(interests) ? interests.filter((i) => typeof i === "string") : [],
    });
    const token = generateToken(user._id);

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        interests: user.interests,
        role: user.role,
        isContributor: user.isContributor || false,
        contributions: user.contributions || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Signup failed", error: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      !email ||
      !password ||
      typeof email !== "string" ||
      typeof password !== "string"
    ) {
      return res.status(400).json({ message: "Email and password must be valid text strings" });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        interests: user.interests,
        role: user.role,
        isContributor: user.isContributor || false,
        contributions: user.contributions || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Login failed", error: err.message });
  }
};

export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user", error: err.message });
  }
};

export const updateInterests = async (req, res) => {
  try {
    const { interests } = req.body;

    if (!Array.isArray(interests) || interests.length === 0 || !interests.every((i) => typeof i === "string")) {
      return res.status(400).json({ message: "Interests must be a non-empty array of strings" });
    }

    const cleanInterests = interests.map((i) => i.trim().toLowerCase()).filter(Boolean);

    const user = await User.findByIdAndUpdate(
      req.userId,
      { interests: cleanInterests },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({
      message: "Preferences updated successfully",
      user,
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to update interests", error: err.message });
  }
};

export const googleAuth = async (req, res) => {
  try {
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    if (!process.env.GOOGLE_CLIENT_ID) {
      return res.status(500).json({ message: "Google Client ID is not configured on the server" });
    }

    let ticket;
    try {
      ticket = await client.verifyIdToken({
        idToken,
        audience: process.env.GOOGLE_CLIENT_ID,
      });
    } catch (verifyErr) {
      return res.status(401).json({ message: "Invalid or expired Google token", error: verifyErr.message });
    }

    const payload = ticket.getPayload();
    if (!payload || !payload.email) {
      return res.status(401).json({ message: "Could not retrieve user details from Google token" });
    }

    const { email, name, sub: googleId } = payload;

    let user = await User.findOne({ email });

    if (user) {
      // If user exists: link googleId if it was a local account without googleId
      if (!user.googleId) {
        user.googleId = googleId;
        await user.save();
      }
    } else {
      // Create new user authenticated via Google
      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        authProvider: "google",
        role: "user",
      });
    }

    const token = generateToken(user._id);

    res.status(200).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        location: user.location || "",
        interests: user.interests || [],
        role: user.role,
        isContributor: user.isContributor || false,
        contributions: user.contributions || [],
      },
    });
  } catch (err) {
    res.status(500).json({ message: "Google authentication failed", error: err.message });
  }
};

/**
 * Initiates the password reset process by generating a token and dispatching an email.
 * POST /api/auth/forgot-password
 * Body: { email }
 */
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body || {};

    if (!email || typeof email !== "string") {
      return res.status(400).json({ message: "Please provide a valid email address." });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: cleanEmail });

    // For privacy and security, don't disclose whether an email is registered or not
    if (!user) {
      return res.status(200).json({
        message: "If an account with that email exists, we have sent a password reset link.",
      });
    }

    if (user.authProvider === "google" && !user.password) {
      return res.status(400).json({
        message: "This account is signed in with Google. Please use Google Login to sign in.",
      });
    }

    // Generate a secure 32-byte hex token (valid for 1 hour)
    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    await user.save();

    // Dispatch email
    const emailResult = await sendPasswordResetEmail(user.email, resetToken, user.name);

    return res.status(200).json({
      message: "If an account with that email exists, we have sent a password reset link.",
      // In dev mode when SMTP is missing, send back indicator for easy testing
      isDev: process.env.NODE_ENV !== "production" && Boolean(emailResult?.isDevFallback),
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({
      message: "Failed to process forgot password request",
      error: err.message,
    });
  }
};

/**
 * Resets the password using the provided reset token.
 * POST /api/auth/reset-password
 * Body: { token, password }
 */
export const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body || {};

    if (!token || !password) {
      return res.status(400).json({ message: "Reset token and new password are required." });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long." });
    }

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({
        message: "Password reset token is invalid or has expired. Please request a new one.",
      });
    }

    // Update password and clear reset fields
    user.password = password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();

    // Automatically issue a fresh JWT so user is immediately logged in
    const jwtToken = generateToken(user._id);

    return res.status(200).json({
      message: "Password has been successfully reset.",
      token: jwtToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        location: user.location || "",
        interests: user.interests || [],
        role: user.role,
        isContributor: user.isContributor || false,
        contributions: user.contributions || [],
      },
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({
      message: "Failed to reset password",
      error: err.message,
    });
  }
};