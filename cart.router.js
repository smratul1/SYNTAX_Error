import express from "express";
import {
  getCarts,
  getCart,
  createCart,
  updateCart,
  deleteCart,
  clearCart,
  getUserCart
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/carts", getCarts);           
router.get("/carts/:id", getCart);       
router.post("/carts", createCart);       
router.put("/carts/:id", updateCart);     
router.delete("/carts/:id", deleteCart);  

router.delete("/carts/:id/clear", clearCart);         
router.get("/users/:userId/cart", getUserCart);       

export default router;
