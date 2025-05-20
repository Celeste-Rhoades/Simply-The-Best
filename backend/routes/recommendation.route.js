import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";

import {
  createRecommendation,
  deleteRecommendation,
  getRecommendation,
  updateRecommendation,
  getRecommendationsGroupedByCategory,
} from "../controller/recommend.controller.js";

const router = express.Router();

// route to get all recomendations
router.get("/", getRecommendation);
router.get("/grouped", getRecommendationsGroupedByCategory);
// Route to create a recommendation
router.post("/", protectRoute, createRecommendation);
//
//update recommendation
router.put("/:id", updateRecommendation);
//delete recommendations
router.delete("/:id", deleteRecommendation);

export default router;
