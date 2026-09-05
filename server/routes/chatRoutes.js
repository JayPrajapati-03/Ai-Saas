import express from "express";
import {
  createSession,
  listSessions,
  getSession,
  clearSession,
  sendMessage,
} from "../controllers/chatController.js";
import { protectRoute } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/session", protectRoute, createSession); // create new
router.get("/sessions", protectRoute, listSessions); // list user's sessions
router.get("/session/:id", protectRoute, getSession); // get single session
router.post("/session/:id/clear", protectRoute, clearSession); // clear session
router.post("/message", protectRoute, sendMessage); // send message (create session if needed)

export default router;
