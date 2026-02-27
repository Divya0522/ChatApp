import express from "express";
import { createRoom, getRooms, getUsers } from "../controllers/room.controller.js";
import protectRoute from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/", protectRoute, getRooms);
router.get("/users", protectRoute, getUsers);
router.post("/create", protectRoute, createRoom);

export default router;
