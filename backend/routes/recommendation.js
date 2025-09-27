import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";

import {
  createRecommendation,
  deleteRecommendation,
  getRecommendation,
  updateRecommendation,
  getRecommendationsGroupedByCategory,
  getPendingRecommendations,
  approveRecommendation,
  rejectRecommendation,
  getUsers,
  getFriendsRecommendations,
  copyRecommendation,
} from "../controller/recommend.js";

const router = express.Router();

// route to get all recomendations
router.get("/", getRecommendation);
router.get("/grouped", protectRoute, getRecommendationsGroupedByCategory);
// Route to create a recommendation
router.post("/", protectRoute, createRecommendation);
//get users
router.get("/users", protectRoute, getUsers);

//update recommendation
router.put("/:id", updateRecommendation);
//delete recommendations
router.delete("/:id", deleteRecommendation);
//accepting and declining recommendation
router.get("/pending", protectRoute, getPendingRecommendations);
router.put("/:id/approve", protectRoute, approveRecommendation);
router.put("/:id/reject", protectRoute, rejectRecommendation);

// Creating copy of friend recommendation
router.get("/friends", protectRoute, getFriendsRecommendations);
router.post("/copy/:id", protectRoute, copyRecommendation);
export default router;
