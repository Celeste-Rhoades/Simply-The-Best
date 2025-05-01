import Recommend from "../models/Recommend.model.js";
import mongoose, { createConnection } from "mongoose";

export const getRecommendation = async (req, res) => {
  try {
    const recommendations = await Recommend.find({});
    res.status(200).json({ success: true, data: recommendations });
  } catch (error) {
    console.log("error in fetching recommendation:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const getRecommendationsGroupedByCategory = async (req, res) => {
  try {
    const recommendations = await Recommend.find({});

    const grouped = recommendations.reduce((acc, rec) => {
      const category = rec.category.toLowerCase();
      if (!acc[category]) acc[category] = [];
      acc[category].push(rec);
      return acc;
    }, {});

    res.status(200).json({ success: true, data: grouped });
  } catch (error) {
    console.error("Error grouping recommendations:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const createRecommendation = async (req, res) => {
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
  if (
    typeof recommendation.rating !== "number" ||
    recommendation.rating < 1 ||
    recommendation.rating > 5
  ) {
    return res.status(400).json({ success: false, message: "Invalid rating" });
  }

  const newRecommendation = new Recommend(recommendation);

  try {
    await newRecommendation.save();
    res.status(201).json({ success: true, data: newRecommendation });
  } catch (error) {
    console.error("Error in creating recommendation:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const updateRecommendation = async (req, res) => {
  const { id } = req.params;
  const recommendation = req.body;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(404)
      .json({ success: false, message: "Invalid recommendation id" });
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
};

export const deleteRecommendation = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res
      .status(400)
      .json({ success: false, message: "Invalid recommendation ID" });
  }
  try {
    await Recommend.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Recommendation Deleted" });
  } catch (error) {
    res
      .status(404)
      .json({ success: false, message: "Recommendation not found" });
  }
};
