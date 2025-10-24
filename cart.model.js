import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: [true, "Product ID is required"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity is required"],
      min: [1, "Quantity must be at least 1"],
      default: 1,
    },
  },
  { _id: false } 
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    items: {
      type: [cartItemSchema],
      validate: [(val) => val.length > 0, "Cart must contain at least one item"],
    },
    totalPrice: {
      type: Number,
      default: 0,
      min: [0, "Total price cannot be negative"],
    },
    status: {
      type: String,
      enum: ["active", "ordered", "cancelled"],
      default: "active",
    },
  },
  { timestamps: true }
);

cartSchema.pre("save", async function (next) {
  if (!this.isModified("items")) return next();

  try {
    const Product = mongoose.model("Product");
    let total = 0;

    for (const item of this.items) {
      const product = await Product.findById(item.productId);
      if (product) total += product.price * item.quantity;
    }

    this.totalPrice = total;
    next();
  } catch (error) {
    next(error);
  }
});

cartSchema.virtual("totalItems").get(function () {
  return this.items.reduce((acc, item) => acc + item.quantity, 0);
});

const Cart = mongoose.model("Cart", cartSchema);
export default Cart;
