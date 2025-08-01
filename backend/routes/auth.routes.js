import express from "express";
import {
  login,
  logout,
  signup,
  getProfile,
} from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { getUserRecommendations } from "../controller/user.controller.js";
// Remove: import { getProfile as getMyProfile } from "../controller/user.controller.js";

const router = express.Router();

router.get("/myProfile", protectRoute, getProfile);
router.get("/:username/recommendations", protectRoute, getUserRecommendations);

router.post("/signup", signup);
router.post("/login", login);
router.post("/logout", logout);

export default router;
