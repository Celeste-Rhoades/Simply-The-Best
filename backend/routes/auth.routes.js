import express from "express";
import { login, logout, signup, getMe } from "../controller/auth.controller.js";
import { protectRoute } from "../middleware/protectRoute.js";
import { getUserRecommendations } from "../controller/user.controller.js";

const router = express.Router();

router.get("/me", protectRoute, getMe);
router.get("/:username/recommendations", protectRoute, getUserRecommendations);

router.post("/signup", signup);

router.post("/login", login);

router.post("/logout", logout);

export default router;
