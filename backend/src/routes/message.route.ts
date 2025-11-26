import express from "express";

import { protectedRoute } from "../middleware/auth.middleware";
import {
  deleteConversation,
  getMessages,
  getUsersForSidebar,
  sendMessage,
} from "../controllers/message.contoller";

const router = express.Router();

router.get("/users", protectedRoute, getUsersForSidebar);

router.get("/:id", protectedRoute, getMessages);

router.post("/send/:id", protectedRoute, sendMessage);

router.delete("/conversation/:id", protectedRoute, deleteConversation);

export default router;
