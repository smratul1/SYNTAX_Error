import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    price: { type: Number, required: true },
    stock: { type: Number, default: 0 },
    category: { type: String, default: "general" },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);