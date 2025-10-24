import express from "express";
import {
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  deleteOrder,
  getUserOrders,
  updateOrderStatus
} from "../controllers/order.controller.js";

const router = express.Router();

router.get("/orders", getOrders);             
router.get("/orders/:id", getOrder);          
router.post("/orders", createOrder);          
router.put("/orders/:id", updateOrder);       
router.delete("/orders/:id", deleteOrder);    

router.get("/users/:userId/orders", getUserOrders);       
router.patch("/orders/:id/status", updateOrderStatus);    

export default router;
