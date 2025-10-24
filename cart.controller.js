import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { z } from "zod";

const cartValidator = z.object({
  userId: z.string({ required_error: "User ID is required" }),
  items: z
    .array(
      z.object({
        productId: z.string({ required_error: "Product ID is required" }),
        quantity: z
          .number()
          .int()
          .positive({ message: "Quantity must be greater than zero" }),
      })
    )
    .min(1, "At least one item is required in the cart"),
});

/**
 * @desc   Get all carts
 * @route  GET /api/carts
 */
export const getCarts = async (req, res) => {
  try {
    const carts = await Cart.find().populate("items.productId", "name price");
    res.status(200).json({ success: true, count: carts.length, data: carts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get single cart by ID
 * @route  GET /api/carts/:id
 */
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate("items.productId", "name price");

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid Cart ID" });
  }
};

/**
 * @desc   Create new cart
 * @route  POST /api/carts
 */
export const createCart = async (req, res) => {
  try {
    const parsed = cartValidator.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const { userId, items } = parsed.data;

    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      total += product.price * item.quantity;
    }

    const newCart = await Cart.create({ userId, items, total });

    res.status(201).json({ success: true, data: newCart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Update existing cart
 * @route  PUT /api/carts/:id
 */
export const updateCart = async (req, res) => {
  try {
    const parsed = cartValidator.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ success: false, errors: parsed.error.errors });
    }

    const { userId, items } = parsed.data;
    let total = 0;
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: `Product not found: ${item.productId}` });
      total += product.price * item.quantity;
    }

    const cart = await Cart.findByIdAndUpdate(
      req.params.id,
      { userId, items, total },
      { new: true, runValidators: true }
    );

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid data or cart ID" });
  }
};

/**
 * @desc   Delete cart
 * @route  DELETE /api/carts/:id
 */
export const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findByIdAndDelete(req.params.id);
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    res.status(200).json({ success: true, message: "Cart deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid cart ID" });
  }
};

/**
 * @desc   Clear all items from a user's cart
 * @route  DELETE /api/carts/clear/:userId
 */
export const clearCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndUpdate(
      { userId: req.params.userId },
      { items: [], total: 0 },
      { new: true }
    );

    if (!cart) return res.status(404).json({ success: false, message: "Cart not found for this user" });

    res.status(200).json({ success: true, message: "Cart cleared successfully", data: cart });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid user ID" });
  }
};
