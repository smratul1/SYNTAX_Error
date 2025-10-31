import express from "express";
import {
  getCarts,
  getCart,
  createCart,
  updateCart,
  deleteCart,
  clearCart,
} from "../controllers/cart.controller.js";

const router = express.Router();

router.get("/", getCarts);         
router.get("/:id", getCart);        
router.post("/", createCart);        
router.put("/:id", updateCart);     
router.delete("/:id", deleteCart);  

router.delete("/carts/clear/:userId", clearCart); 

export default router;