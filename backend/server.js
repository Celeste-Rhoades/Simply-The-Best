import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import Recommend from "./models/Recommend.js";

dotenv.config();

const app = express();
app.use(express.json()); //allows express to read json on req.body

app.use(express.json()); // allows to accept JSON in req.body

// Route to create a recommendation
app.post("/api/recommends", async (req, res) => {
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
app.delete("/api/recommends/:id", async (req, res) => {
  const { id } = req.params;
  console.log("id:", id);
});

// Server listen
app.listen(5288, () => {
  connectDB();
  console.log("Server started on port 5288");
});
