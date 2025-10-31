import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import { z } from "zod";
const orderValidator = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
      price: z.number().positive(),
    })
  ),
  totalAmount: z.number().positive(),
  paymentMethod: z.string(),
});
export const getOrders = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const orders = await Order.find(filter).populate("items.productId", "name price");
    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.productId", "name price");
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const createOrder = async (req, res) => {
  try {
    const validatedData = orderValidator.parse(req.body);
    const totalCheck = validatedData.items.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );

    if (totalCheck !== validatedData.totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Total amount mismatch! Please check item prices and quantities.",
      });
    }

    const newOrder = new Order({
      ...validatedData,
      status: "Pending",
      createdAt: new Date(),
    });
    await newOrder.save();
    await Cart.findOneAndUpdate({ userId: validatedData.userId }, { items: [], total: 0 });

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      data: newOrder,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation failed", errors: error.errors });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
export const updateOrder = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body; 

    const updatedOrder = await Order.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedOrder)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({
      success: true,
      message: "Order updated successfully",
      data: updatedOrder,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder)
      return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getUserOrders = async (req, res) => {
  try {
    const { userId } = req.params;
    const orders = await Order.find({ userId }).populate("items.productId", "name price");

    if (orders.length === 0)
      return res.status(404).json({ success: false, message: "No orders found for this user" });

    res.status(200).json({ success: true, data: orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};