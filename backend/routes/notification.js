import express from "express";
import { protectRoute } from "../middleware/protectRoute.js";
import {
  deleteNotifications,
  deleteNotification,
  getNotifications,
} from "../controller/notification.js";

const router = express.Router();

router.get("/", protectRoute, getNotifications);
router.delete("/", protectRoute, deleteNotifications);
router.delete("/:id", protectRoute, deleteNotification);

export default router;
