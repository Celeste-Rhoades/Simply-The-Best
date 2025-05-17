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
        "movies",
        "tv shows",
        "books",
        "video games",
        "podcasts",
        "music",
        "recipes",
        "youtube",
        "restaurants",
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
