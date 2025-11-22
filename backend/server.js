import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import recommendationRoutes from "./routes/recommendation.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

import { connectMongoDB } from "./db/connectMongoDB.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5288;

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173",
  "https://simplytheebest.netlify.app",
  "https://www.getsimplythebest.net",
  process.env.FRONTEND_URL,
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json()); //allows express to read json on req.body
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use((_, res) => {
  res.status(404).send("Sorry, the requested page could not be found.");
});

connectMongoDB();
// Server listen
app.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
});
