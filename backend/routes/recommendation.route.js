import express from "express";
import Recommend from "../models/Recommend.model.js";
import {
  createRecommendation,
  deleteRecommendation,
  getRecommendation,
  updateRecommendation,
} from "../controller/recommend.controller.js";

const router = express.Router();

// route to get all recomendations
router.get("/", getRecommendation);

// Route to create a recommendation
router.post("/", createRecommendation);
//update recommendation
router.put("/:id", updateRecommendation);
//delete recommendations
router.delete("/:id", deleteRecommendation);

export default router;
