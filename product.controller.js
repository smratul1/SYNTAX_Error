import Product from "../models/product.model.js";
import { z } from "zod";

const productValidator = z.object({
  name: z.string().min(2, "Product name must be at least 2 characters long"),
  price: z.number().positive("Price must be a positive number"),
  stock: z.number().int().nonnegative("Stock cannot be negative"),
  category: z.string().optional(),
});

/**
 * @desc   Get all products
 * @route  GET /api/products
 */
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Get a single product by ID
 * @route  GET /api/products/:id
 */
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid product ID" });
  }
};

/**
 * @desc   Create new product
 * @route  POST /api/products
 */
export const createProduct = async (req, res) => {
  try {
    const parsed = productValidator.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.errors,
      });
    }

    const newProduct = await Product.create(parsed.data);
    res.status(201).json({ success: true, data: newProduct });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * @desc   Update existing product
 * @route  PUT /api/products/:id
 */
export const updateProduct = async (req, res) => {
  try {
    const parsed = productValidator.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        errors: parsed.error.errors,
      });
    }

    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      parsed.data,
      { new: true, runValidators: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, data: updatedProduct });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid product ID or data" });
  }
};

/**
 * @desc   Delete a product
 * @route  DELETE /api/products/:id
 */
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (error) {
    res.status(400).json({ success: false, message: "Invalid product ID" });
  }
};
