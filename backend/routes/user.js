import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  followUnfollowUser,
  getUserProfile,
  updateUser,
  searchUsers,
  sendFriendRequest,
  accceptFriendRequest,
  declineFriendRequest,
} from "../controller/user.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/search", protectRoute, searchUsers);
router.get("/friends", protectRoute, friendsList);
router.get("/friend-requests/pending", protectRoute, friendRequestpending);

router.post("/follow/:id", protectRoute, followUnfollowUser);
router.post("/update", protectRoute, updateUser);
router.post("/friend-request/send/:id", protectRoute, sendFriendRequest);
router.post("/friend-request/accept/:id", protectRoute, accceptFriendRequest);
router.post("/friend-request/decline/:id", protectRoute, declineFriendRequest);

export default router;
