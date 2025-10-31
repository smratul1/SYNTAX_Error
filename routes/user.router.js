import express from "express";
import { 
  getUsers, 
  getUser, 
  createUser, 
  updateUser, 
  deleteUser 
} from "../controllers/user.controller.js";

const router = express.Router();

// ✅ Get all users
router.get("/", getUsers);

// ✅ Get a specific user by ID
router.get("/:id", getUser);

// ✅ Create a new user
router.post("/", createUser);

// ✅ Update an existing user
router.put("/:id", updateUser);

// ✅ Delete a user
router.delete("/:id", deleteUser);

export default router;