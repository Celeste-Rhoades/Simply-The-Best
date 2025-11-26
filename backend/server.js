import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import recommendationRoutes from "./routes/recommendation.js";
import notificationRoutes from "./routes/notification.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";

import { connectMongoDB } from "./db/connectMongoDB.js";
import { createServer } from "http";
import { Server } from "socket.io";
import { initializeSocket } from "./socket/socket.js";

dotenv.config();

const app = express();

const PORT = process.env.PORT || 5288;
const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5288",
  "https://simplytheebest.netlify.app",
  "https://getsimplythebest.net",
  "https://www.getsimplythebest.net",
  "https://api.getsimplythebest.net",
];

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

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

export { io };
initializeSocket(io);

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
app.use("/api/notifications", notificationRoutes);
app.use((_, res) => {
  res.status(404).send("Sorry, the requested page could not be found.");
});

connectMongoDB();
// Server listen
server.listen(PORT, () => {
  console.log(`Server started on ${PORT}`);
  console.log(`Socket.io server is ready`);
});
