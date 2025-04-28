import express from "express";
import mongoose from "mongoose";
import Recommend from "../models/Recommend.model.js";

const router = express.Router();

// route to get all recomendations
router.get("/", async (req, res) => {
  try {
    const recommendations = await Recommend.find({});
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.log("error in fetching recommendation:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// Route to create a recommendation
router.post("/", async (req, res) => {
  const recommendation = req.body;

  if (
    !recommendation.title ||
    !recommendation.rating ||
    !recommendation.category
  ) {
    return res
      .status(400)
      .json({ success: false, message: "Please provide all required fields" });
  }

  const newRecommendation = new Recommend(recommendation);

  try {
    await newRecommendation.save();
    res.status(201).json({ success: true, data: newRecommendation });
  } catch (error) {
    console.error("Error in creating recommendation:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
//update recommendation
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const recommendation = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ sucess: false, message: "Invalid recommendation id" });
  }

  try {
    const updatedRecommendation = await Recommend.findByIdAndUpdate(
      id,
      recommendation,
      { new: true }
    );
    res.status(200).json({ success: true, data: updatedRecommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
});
//delete recommendations
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    await Recommend.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Recommendation Deleted" });
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: "Recommendation not found" });
  }
});

export default router;
