import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  getUserProfile,
  updateUser,
  searchUsers,
  sendFriendRequest,
  acceptFriendRequest,
  declineFriendRequest,
  getFriends,
  getPendingRequests,
} from "../controller/user.js";

const router = express.Router();

router.get("/profile/:username", protectRoute, getUserProfile);
router.get("/search", protectRoute, searchUsers);
router.get("/friends", protectRoute, getFriends);
router.get("/friendRequests/pending", protectRoute, getPendingRequests);

router.post("/update", protectRoute, updateUser);
router.post("/friendRequest/send/:id", protectRoute, sendFriendRequest);
router.post("/friendRequest/accept/:id", protectRoute, acceptFriendRequest);
router.post("/friendRequest/decline/:id", protectRoute, declineFriendRequest);

export default router;
