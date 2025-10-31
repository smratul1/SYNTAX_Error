import express from "express";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrders,
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/", getOrders);            
router.get("/:id", getOrder);        
router.post("/", createOrder);        
router.put("//:id", updateOrder);      
router.delete("/:id", deleteOrder);   

router.get("/user/:userId/", getUserOrders); 

export default router;