import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

import recommendationRoutes from "./routes/recommendation.route.js";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";

import { connectMongoDB } from "./db/connectMongoDB.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5288;

app.use(express.json()); //allows express to read json on req.body
app.use(express.urlencoded({ extended: true }));

app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recommendation", recommendationRoutes);

connectMongoDB();
// Server listen
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
