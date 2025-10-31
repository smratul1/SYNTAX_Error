import Cart from "../models/cart.model.js";
import Product from "../models/product.model.js";
import { z } from "zod";
const cartValidator = z.object({
  userId: z.string(),
  items: z.array(
    z.object({
      productId: z.string(),
      quantity: z.number().int().positive(),
    })
  ),
});
export const getCarts = async (req, res) => {
  try {
    const { userId } = req.query;
    const filter = userId ? { userId } : {};
    const carts = await Cart.find(filter).populate("items.productId", "name price");
    res.status(200).json({ success: true, data: carts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const getCart = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.id).populate("items.productId", "name price");
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });
    res.status(200).json({ success: true, data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const createCart = async (req, res) => {
  try {
    const validatedData = cartValidator.parse(req.body);
    let total = 0;
    for (const item of validatedData.items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });
      total += product.price * item.quantity;
    }

    const newCart = new Cart({ ...validatedData, total });
    await newCart.save();

    res.status(201).json({ success: true, message: "Cart created successfully", data: newCart });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation failed", errors: error.errors });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
export const updateCart = async (req, res) => {
  try {
    const { id } = req.params;
    const validatedData = cartValidator.parse(req.body);
    let total = 0;
    for (const item of validatedData.items) {
      const product = await Product.findById(item.productId);
      if (!product) return res.status(404).json({ success: false, message: "Product not found" });
      total += product.price * item.quantity;
    }
    const updatedCart = await Cart.findByIdAndUpdate(
      id,
      { ...validatedData, total },
      { new: true }
    );
    if (!updatedCart)
      return res.status(404).json({ success: false, message: "Cart not found" });
    res.status(200).json({ success: true, message: "Cart updated successfully", data: updatedCart });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ success: false, message: "Validation failed", errors: error.errors });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};
export const deleteCart = async (req, res) => {
  try {
    const deletedCart = await Cart.findByIdAndDelete(req.params.id);
    if (!deletedCart)
      return res.status(404).json({ success: false, message: "Cart not found" });
    res.status(200).json({ success: true, message: "Cart deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const clearCart = async (req, res) => {
  try {
    const { userId } = req.params;
    const cart = await Cart.findOne({ userId });
    if (!cart) return res.status(404).json({ success: false, message: "Cart not found" });

    cart.items = [];
    cart.total = 0;
    await cart.save();

    res.status(200).json({ success: true, message: "Cart cleared successfully", data: cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};