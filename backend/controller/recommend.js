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
      $or: [
        { user: req.user._id }, // Recommendations you created
        {
          recommendedTo: req.user._id, // Recommendations made to you
          status: "approved", // Only show approved ones
        },
      ],
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
export const getFriendsRecommendations = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Get current user with friends list
    const currentUser = await User.findById(req.user._id);

    // Find recommendations from friends only
    const recommendations = await Recommend.find({
      user: { $in: currentUser.following },
      status: "approved",
    })
      .populate("user", "username")
      .populate("originalRecommendedBy", "username")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Group by user
    const groupedByUser = {};
    recommendations.forEach(rec => {
      const userId = rec.user._id.toString();
      if (!groupedByUser[userId]) {
        groupedByUser[userId] = {
          username: rec.user.username,
          recommendations: [],
        };
      }
      groupedByUser[userId].recommendations.push(rec);
    });

    res.status(200).json({
      success: true,
      data: groupedByUser,
      hasMore: recommendations.length === parseInt(limit),
    });
  } catch (error) {
    console.error("Error fetching friends recommendations:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const copyRecommendation = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, category, rating } = req.body;

    // Find original recommendation
    const originalRec = await Recommend.findById(id).populate(
      "user originalRecommendedBy"
    );
    if (!originalRec) {
      return res
        .status(404)
        .json({ success: false, message: "Recommendation not found" });
    }

    // Check if user is friends with the original poster
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.following.includes(originalRec.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Can only copy from friends" });
    }

    // Check for duplicates (same title + category)
    const existingRec = await Recommend.findOne({
      user: req.user._id,
      title: { $regex: new RegExp(`^${title}$`, "i") },
      category: category,
    });

    if (existingRec) {
      return res.status(400).json({
        success: false,
        message:
          "You already have a recommendation with this title in this category",
      });
    }

    // Create new recommendation
    const newRecommendation = new Recommend({
      user: req.user._id,
      title,
      description,
      category,
      rating,
      originalRecommendedBy:
        originalRec.originalRecommendedBy || originalRec.user._id,
      status: "approved",
    });

    await newRecommendation.save();
    res.status(201).json({ success: true, data: newRecommendation });
  } catch (error) {
    console.error("Error copying recommendation:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};

// recommend to a friend
export const recommendToFriend = async (req, res) => {
  try {
    const { friendId } = req.params;
    const { title, description, category, rating } = req.body;

    // Validate friend relationship
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.following.includes(friendId)) {
      return res.status(403).json({
        success: false,
        message: "Can only recommend to friends",
      });
    }

    // Create recommendation
    const newRecommendation = new Recommend({
      user: req.user._id, // You are the creator
      recommendedTo: friendId, // Friend receives it
      title,
      description,
      category,
      rating,
      status: "pending", // Needs friend's approval
    });

    await newRecommendation.save();
    res.status(201).json({ success: true, data: newRecommendation });
  } catch (error) {
    console.error("Error recommending to friend:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
