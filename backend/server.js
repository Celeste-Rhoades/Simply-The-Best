import express from "express";
import dotenv from "dotenv";
import { connectMongoDB } from "./db/connectMongoDB.js";
import recommendationRoutes from "./routes/recommendation.route.js";
import authRoutes from "./routes/auth.routes.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5288;

app.use(express.json()); //allows express to read json on req.body
app.use("/api/auth", authRoutes);
app.use("/api/recommendation", recommendationRoutes);

connectMongoDB();
// Server listen
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
