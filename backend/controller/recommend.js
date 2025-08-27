import Recommend from "../models/Recommend.js";
import User from "../models/User.js";
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
    const recommendations = await Recommend.find({
      user: req.user._id,
    }).populate("user", "username");

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

  // Add user association
  recommendation.user = req.user._id;

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
      .status(404)
      .json({ success: false, message: "Invalid recommendation ID" });
  }
  try {
    await Recommend.findByIdAndDelete(id);
    res.status(200).json({ success: true, message: "Recommendation Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getPendingRecommendations = async (req, res) => {
  try {
    const pendingRecs = await Recommend.find({
      recommendedTo: req.user._id,
      status: "pending",
    }).populate("user", "username");

    res.status(200).json({ success: true, data: pendingRecs });
  } catch (error) {
    console.error("Error fetching pending recommendations:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const approveRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await Recommend.findOneAndUpdate(
      { _id: id, recommendedTo: req.user._id },
      { status: "approved" },
      { new: true }
    );

    if (!recommendation) {
      return res
        .status(404)
        .json({ success: false, message: "Recommendation not found" });
    }

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

export const rejectRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const recommendation = await Recommend.findOneAndUpdate(
      { _id: id, recommendedTo: req.user._id },
      { status: "rejected" },
      { new: true }
    );

    if (!recommendation) {
      return res
        .status(404)
        .json({ success: false, message: "Recommendation not found" });
    }

    res.status(200).json({ success: true, data: recommendation });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const getUsers = async (req, res) => {
  try {
    const users = await User.find({}, "username");
    res.status(200).json({ success: true, data: users });
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
