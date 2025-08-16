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
    description: {
      type: String,
    },
    rating: {
      type: Number,
      required: true,
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
      ],
      required: true, // fixed typo
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

const Recommend = mongoose.model("Recommend", recommendSchema);

export default Recommend;
