import mongoose from "mongoose";

const orderItemSchema = new mongoose.Schema(
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
    },
    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },
  },
  { _id: false } 
);

const orderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },

    items: {
      type: [orderItemSchema],
      validate: [(val) => val.length > 0, "Order must contain at least one item"],
    },

    totalAmount: {
      type: Number,
      required: [true, "Total amount is required"],
      min: [0, "Total amount cannot be negative"],
      default: 0,
    },

    shippingAddress: {
      street: { type: String },
      city: { type: String },
      country: { type: String },
      zip: { type: String },
    },

    paymentMethod: {
      type: String,
      enum: ["card", "cash on delivery", "bank transfer"],
      required: [true, "Payment method is required"],
    },

    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed"],
      default: "pending",
    },

    orderStatus: {
      type: String,
      enum: ["processing", "shipped", "delivered", "cancelled"],
      default: "processing",
    },

    orderDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

orderSchema.pre("save", function (next) {
  if (!this.isModified("items")) return next();

  this.totalAmount = this.items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  next();
});

orderSchema.virtual("totalItems").get(function () {
  return this.items.reduce((sum, item) => sum + item.quantity, 0);
});

const Order = mongoose.model("Order", orderSchema);
export default Order;
