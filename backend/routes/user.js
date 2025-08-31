import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfollowUser,
  getUserProfile,
  updateUser,
  searchUsers,
} from "../controller/user.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/search", protectRoute, searchUsers);

router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);

export default router;
