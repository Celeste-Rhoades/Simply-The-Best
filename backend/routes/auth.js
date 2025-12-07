import express from "express";
import {
  login,
  logout,
  signup,
  getProfile,
  deleteAccount,
} from "../controller/auth.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { getUserRecommendations } from "../controller/user.js";
import passport from "../config/passport.js";
import { generateTokenAndSetCookie } from "../lib/utils/generateToken.js";
import User from "../models/User.js";

const router = express.Router();

router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect:
      process.env.NODE_ENV === "production"
        ? `${process.env.FRONTEND_URL_PROD}/signin`
        : `${process.env.FRONTEND_URL_DEV}/signin`,
    session: false,
  }),
  (req, res) => {
    // Generate JWT token
    generateTokenAndSetCookie(req.user._id, res);

    // Redirect based on whether user has chosen username
    const frontendUrl =
      process.env.NODE_ENV === "production"
        ? process.env.FRONTEND_URL_PROD
        : process.env.FRONTEND_URL_DEV;

    if (!req.user.hasChosenUsername) {
      res.redirect(`${frontendUrl}/choose-username`);
    } else {
      res.redirect(`${frontendUrl}/recommendations`); // Changed from /home to /recommendations
    }
  }
);

router.get("/myProfile", protectRoute, getProfile);
router.get("/:username/recommendations", protectRoute, getUserRecommendations);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

router.delete("/account", protectRoute, deleteAccount);

// New route for choosing username
router.post("/choose-username", protectRoute, async (req, res) => {
  try {
    const { username } = req.body;

    if (!username || username.length < 4) {
      return res
        .status(400)
        .json({ error: "Username must be at least 4 characters" });
    }

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already taken" });
    }

    // Update user's username
    const user = await User.findById(req.user._id);
    user.username = username;
    user.hasChosenUsername = true;
    await user.save();

    res.status(200).json({ message: "Username updated successfully", user });
  } catch (error) {
    console.error("Error choosing username:", error);
    res.status(500).json({ error: "Failed to update username" });
  }
});

export default router;
