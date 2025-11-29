import Recommend from "../models/Recommend.js";
import User from "../models/User.js";
import mongoose, { createConnection } from "mongoose";
import { io } from "../server.js";
import { getUserSocketId } from "../socket/socket.js";

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
    })
      .populate("user", "username")
      .populate("originalRecommendedBy", "username");

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
  const { title, description, category, rating } = req.body;

  try {
    // Find the recommendation first
    const recommendation = await Recommend.findById(id);

    if (!recommendation) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    // Allow editing if:
    // 1. User owns this recommendation (created it)
    // 2. OR recommendation is pending and sent to this user
    const isOwner = recommendation.user.toString() === req.user._id.toString();
    const isPendingRecipient =
      recommendation.recommendedTo &&
      recommendation.recommendedTo.toString() === req.user._id.toString() &&
      recommendation.status === "pending";

    if (!isOwner && !isPendingRecipient) {
      return res.status(403).json({
        error: "You are not authorized to edit this recommendation",
      });
    }

    // User can edit it - safe to update
    recommendation.title = title || recommendation.title;
    recommendation.description = description || recommendation.description;
    recommendation.category = category || recommendation.category;
    recommendation.rating = rating || recommendation.rating;

    await recommendation.save();

    res.status(200).json({
      message: "Recommendation updated successfully",
      data: recommendation,
    });
  } catch (error) {
    console.error("Error updating recommendation:", error);
    res.status(500).json({ error: "Failed to update recommendation" });
  }
};

export const deleteRecommendation = async (req, res) => {
  const { id } = req.params;

  try {
    // Find the recommendation first
    const recommendation = await Recommend.findById(id);

    if (!recommendation) {
      return res.status(404).json({ error: "Recommendation not found" });
    }

    // Only the creator can delete their recommendation
    const isOwner = recommendation.user.toString() === req.user._id.toString();

    if (!isOwner) {
      return res.status(403).json({
        error: "You are not authorized to delete this recommendation",
      });
    }

    // User owns it - safe to delete
    await Recommend.findByIdAndDelete(id);

    res.status(200).json({
      message: "Recommendation deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting recommendation:", error);
    res.status(500).json({ error: "Failed to delete recommendation" });
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

    // Find the pending recommendation
    const pendingRec = await Recommend.findOne({
      _id: id,
      recommendedTo: req.user._id,
      status: "pending",
    }).populate("user", "username");

    if (!pendingRec) {
      return res
        .status(404)
        .json({ success: false, message: "Pending recommendation not found" });
    }

    // Create a NEW independent recommendation owned by the recipient
    const newRecommendation = new Recommend({
      user: req.user._id, // Recipient becomes the owner
      title: pendingRec.title,
      description: pendingRec.description,
      category: pendingRec.category,
      rating: pendingRec.rating,
      originalRecommendedBy: pendingRec.user._id, // Track who sent it
      status: "approved",
    });

    await newRecommendation.save();

    // Delete the pending recommendation (cleanup)
    await Recommend.findByIdAndDelete(id);

    res.status(200).json({ success: true, data: newRecommendation });
  } catch (error) {
    console.error("Error approving recommendation:", error);
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
    // Get current user with friends list
    const currentUser = await User.findById(req.user._id);

    // Find recommendations from friends - both created by them AND sent to them that were approved
    const recommendations = await Recommend.find({
      $or: [
        {
          user: { $in: currentUser.following },
          status: "approved",
        },
        {
          recommendedTo: { $in: currentUser.following },
          status: "approved",
        },
      ],
    })
      .populate("user", "username")
      .populate("recommendedTo", "username")
      .populate("originalRecommendedBy", "username")
      .sort({ createdAt: -1 });

    // Group by the friend (either creator or recipient)
    const groupedByUser = {};
    recommendations.forEach(rec => {
      let friendId;
      let friendUsername;

      // Check if friend is the recipient (PRIORITY: show in recipient's section if they accepted it)
      const isRecipient =
        rec.recommendedTo &&
        currentUser.following.some(
          f => f.toString() === rec.recommendedTo._id.toString()
        );

      // Check if friend is the creator
      const isCreator = currentUser.following.some(
        f => f.toString() === rec.user._id.toString()
      );

      // IMPORTANT: If recommendation was sent TO a friend and approved, show ONLY in recipient's section
      // This prevents duplicates when both sender and recipient are your friends
      if (isRecipient) {
        friendId = rec.recommendedTo._id.toString();
        friendUsername = rec.recommendedTo.username;
      } else if (isCreator && !rec.recommendedTo) {
        // Only show in creator's section if they created it for themselves (no recommendedTo)
        friendId = rec.user._id.toString();
        friendUsername = rec.user.username;
      }

      if (friendId) {
        if (!groupedByUser[friendId]) {
          groupedByUser[friendId] = {
            username: friendUsername,
            recommendations: [],
          };
        }
        groupedByUser[friendId].recommendations.push(rec);
      }
    });

    res.status(200).json({
      success: true,
      data: groupedByUser,
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
    const { title, description, category, rating, existingRecommendationId } =
      req.body;

    // Validate friend relationship
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.following.includes(friendId)) {
      return res.status(403).json({
        success: false,
        message: "Can only recommend to friends",
      });
    }

    // ONLY check for duplicates in SENDER's list when creating a BRAND NEW recommendation (not sharing existing)
    // When sharing existing (existingRecommendationId is provided), skip this check
    if (!existingRecommendationId) {
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
    }

    // Check if the RECIPIENT (friend) already has this recommendation
    // Check both: recommendations they created AND recommendations sent to them that were approved/pending
    // EXCLUDE rejected recommendations (they can receive it again after rejecting)
    const friendHasIt = await Recommend.findOne({
      $or: [
        {
          user: friendId,
          title: { $regex: new RegExp(`^${title}$`, "i") },
          category: category,
          status: { $ne: "rejected" }, // Exclude rejected
        },
        {
          recommendedTo: friendId,
          status: { $in: ["approved", "pending"] }, // Only check approved/pending, not rejected
          title: { $regex: new RegExp(`^${title}$`, "i") },
          category: category,
        },
      ],
    });

    if (friendHasIt) {
      return res.status(400).json({
        success: false,
        message: "Your friend already has this recommendation",
      });
    }

    // Create recommendation to send to friend
    // Note: This is ONLY sent to the friend, not added to your list
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

    // Emit socket event to the friend
    const friendSocketId = getUserSocketId(friendId);
    if (friendSocketId) {
      io.to(friendSocketId).emit("newRecommendation", {
        senderId: req.user._id,
        senderUsername: currentUser.username,
        recommendation: {
          id: newRecommendation._id,
          title: newRecommendation.title,
          category: newRecommendation.category,
        },
      });
    }

    res.status(201).json({ success: true, data: newRecommendation });
  } catch (error) {
    console.error("Error recommending to friend:", error.message);
    res.status(500).json({ success: false, message: "Server Error" });
  }
};
