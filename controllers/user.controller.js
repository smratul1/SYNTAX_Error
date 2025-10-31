import User from "../models/user.model.js";
import { z } from "zod";
const userValidator = z.object({
  name: z.string().min(2, "Name is too short."),
  email: z.string().email("Invalid email address."),
  age: z.number().int().positive("Age must be a positive integer."),
});
export const getUsers = async (req, res) => {
  try {
    const users = await User.find(); 
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Error fetching users", error: error.message });
  }
};
export const getUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const user = await User.findById(userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: "Error fetching user", error: error.message });
  }
};
export const createUser = async (req, res) => {
  try {
    const parsedData = userValidator.parse(req.body);
    const newUser = await User.create(parsedData);

    console.log("✅ Created User:", newUser);

    return res.status(201).json({
      success: true,
      message: "User created successfully!",
      data: newUser,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ success: false, errors: error.errors });
    }
    console.error("❌ Error creating user:", error.message);
    return res.status(500).json({ success: false, message: "Error creating user", error: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const parsedData = userValidator.parse(req.body); 
    const updatedUser = await User.findByIdAndUpdate(userId, parsedData, { new: true });

    if (!updatedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json(updatedUser);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ errors: error.errors });
    }
    res.status(500).json({ message: "Error updating user", error: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const userId = req.params.id;
    const deletedUser = await User.findByIdAndDelete(userId);

    if (!deletedUser) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting user", error: error.message });
  }
};