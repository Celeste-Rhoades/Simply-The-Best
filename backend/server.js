import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./config/db.js";
import recommendationRoutes from "./routes/recommendation.route.js";

dotenv.config();

const app = express();
app.use(express.json()); //allows express to read json on req.body

app.use(express.json()); // allows to accept JSON in req.body

app.use("/api/recommendation", recommendationRoutes);

// Server listen
app.listen(5288, () => {
  connectDB();
  console.log("Server started on port 5288");
});
