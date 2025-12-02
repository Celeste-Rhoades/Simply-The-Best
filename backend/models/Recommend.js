import mongoose, { Schema } from "mongoose";

const recommendSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    rating: {
      type: Number,
      required: true,
    },
    description: {
      type: String,
    },

    category: {
      type: String,
      enum: [
        "Movies",
        "TV Shows",
        "Books",
        "Video Games",
        "Podcasts",
        "Music",
        "Recipes",
        "YouTube",
        "Restaurants",
        "Better Than All The Rest",
        "Other",
        "Sports",
        "Travel",
        "Apps",
        "Websites",
        "Events",
        "Services",
        "Health",
        "Fitness",
        "Home",
        "Pets",
        "Fashion",
        "Art",
      ],
      required: true,
    },
    originalRecommendedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    recommendedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    status: {
      type: String,
      enum: ["approved", "pending", "rejected"],
      default: "approved",
    },
    isPrivate: {
      type: Boolean,
      default: false, // Public by default
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Recommend = mongoose.model("Recommend", recommendSchema);

export default Recommend;
