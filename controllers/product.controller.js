import Product from "../models/product.model.js";
import { z } from "zod";

const productValidator = z.object({
  name: z.string().min(2, "Product name too short"),
  price: z.number().positive("Price must be positive"),
  stock: z.number().int().nonnegative(),
  category: z.string().optional(),
});

// 🔹 সব products দেখাও
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find();
    res.status(200).json({
      success: true,
      message: "Products fetched successfully",
      count: products.length,
      data: products,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 একক product দেখাও
export const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({ success: true, data: product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// 🔹 নতুন product তৈরি
export const createProduct = async (req, res) => {
  try {
    const validatedData = productValidator.parse(req.body);
    const newProduct = await Product.create(validatedData);

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: newProduct, // 👈 এখানে পুরো product ফেরত পাঠাচ্ছি
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// 🔹 product আপডেট
export const updateProduct = async (req, res) => {
  try {
    const validatedData = productValidator.partial().parse(req.body);
    const updatedProduct = await Product.findByIdAndUpdate(
      req.params.id,
      validatedData,
      { new: true }
    );

    if (!updatedProduct)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: updatedProduct,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: error.errors,
      });
    } else {
      res.status(500).json({ success: false, message: error.message });
    }
  }
};

// 🔹 product ডিলিট
export const deleteProduct = async (req, res) => {
  try {
    const deletedProduct = await Product.findByIdAndDelete(req.params.id);
    if (!deletedProduct)
      return res.status(404).json({ success: false, message: "Product not found" });

    res.status(200).json({
      success: true,
      message: "Product deleted successfully",
      data: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};