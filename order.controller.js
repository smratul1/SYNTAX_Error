import Order from "../models/order.model.js";
import Cart from "../models/cart.model.js";
import { z } from "zod";

const orderValidator = z.object({
  userId: z.string({ required_error: "User ID is required" }),
  items: z
    .array(
      z.object({
        productId: z.string({ required_error: "Product ID is required" }),
        quantity: z.number().int().positive({ message: "Quantity must be positive" }),
        price: z.number().positive({ message: "Price must be positive" }),
      })
    )
    .min(1, "At least one item is required"),
  totalAmount: z.number().positive({ message: "Total amount must be positive" }),
  paymentMethod: z.string({ required_error: "Payment method is required" }),
});

/**
 * @desc   Get all orders (optionally filtered by userId)
 * @route  GET /api/orders
 */
export const getOrders = async (req, res) => {
  try {
    const { userId } = req.query; // optional filter
    const filter = userId ? { userId } : {};
    const orders = await Order.find(filter).populate("items.productId", "name price");

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get single order by ID
 * @route  GET /api/orders/:id
 */
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate("items.productId", "name price");

    if (!order) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, data: order });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid order ID" });
  }
};

/**
 * @desc   Create new order
 * @route  POST /api/orders
 */
export const createOrder = async (req, res) => {
  try {
    const parsed = orderValidator.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const { userId, items, totalAmount, paymentMethod } = parsed.data;

    const calculatedTotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    if (calculatedTotal !== totalAmount) {
      return res.status(400).json({
        success: false,
        message: "Total amount mismatch with item prices",
      });
    }

    await Cart.findOneAndUpdate({ userId }, { items: [], total: 0 });

    const newOrder = await Order.create({
      userId,
      items,
      totalAmount,
      paymentMethod,
      status: "Pending",
    });

    res.status(201).json({ success: true, data: newOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Update order (e.g., status or payment info)
 * @route  PUT /api/orders/:id
 */
export const updateOrder = async (req, res) => {
  try {
    const { status, paymentMethod } = req.body;

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status, paymentMethod },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, data: updatedOrder });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid order ID or data" });
  }
};

/**
 * @desc   Delete (cancel) an order
 * @route  DELETE /api/orders/:id
 */
export const deleteOrder = async (req, res) => {
  try {
    const deletedOrder = await Order.findByIdAndDelete(req.params.id);
    if (!deletedOrder) return res.status(404).json({ success: false, message: "Order not found" });

    res.status(200).json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid order ID" });
  }
};

/**
 * @desc   Get all orders for a specific user
 * @route  GET /api/orders/user/:userId
 */
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).populate("items.productId", "name price");

    if (!orders.length) {
      return res.status(404).json({ success: false, message: "No orders found for this user" });
    }

    res.status(200).json({ success: true, count: orders.length, data: orders });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid user ID" });
  }
};
