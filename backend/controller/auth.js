import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import Recommend from "../models/Recommend.js";
import Notification from "../models/Notification.js";

export const signup = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username is already taken" });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ error: "Email is already taken" });
    }
    if (password.length < 12) {
      return res
        .status(400)
        .json({ error: "Password must be at least 12 characters long" });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    // check this logic
    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });
    if (newUser) {
      generateTokenAndSetCookie(newUser._id, res);
      await newUser.save();

      res.status(201).json({
        _id: newUser._id,

        username: newUser.username,
        email: newUser.email,
        // followers: newUser.followers,
        // following: newUser.following,
      });
    } else {
      res.status(500).json({ error: "Internal Server Error" });
    }
  } catch (error) {
    console.log("Error in signup controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    const isPasswordCorrect = await bcrypt.compare(
      password,
      user?.password || ""
    );
    if (!user || !isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid username or password" });
    }
    generateTokenAndSetCookie(user._id, res);

    res.status(200).json({
      _id: user._id,
      username: user.username,
      email: user.email,
      followers: user.followers,
      following: user.following,
    });
  } catch (error) {
    console.log("Error in login controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req, res) => {
  try {
    const options = {
      maxAge: 0,
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      secure: process.env.NODE_ENV !== "development",
    };

    res.cookie("jwt", "", { ...options, httpOnly: true });
    res.cookie("isLoggedIn", "", options);
    res.status(200).json({ message: "Logged out successfully" });
  } catch (error) {
    console.log("Error in logout controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in getMe controller", error.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
export const deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete all user's recommendations
    await Recommend.deleteMany({ user: userId });

    // Delete all notifications to/from this user
    await Notification.deleteMany({
      $or: [{ from: userId }, { to: userId }],
    });

    // Remove user from all friends' following arrays
    await User.updateMany(
      { following: userId },
      {
        $pull: {
          following: userId,
          pendingRequests: userId,
          sentRequests: userId,
        },
      }
    );

    // Delete the user
    await User.findByIdAndDelete(userId);

    // Clear cookies using same options as logout
    const options = {
      maxAge: 0,
      sameSite: process.env.NODE_ENV === "development" ? "lax" : "none",
      secure: process.env.NODE_ENV !== "development",
    };

    res.cookie("jwt", "", { ...options, httpOnly: true });
    res.cookie("isLoggedIn", "", options);

    res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.log("Error in deleteAccount:", error.message);
    res.status(500).json({ error: error.message });
  }
};
