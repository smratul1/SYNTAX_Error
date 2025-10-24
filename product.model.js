import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Product name is required"],
      trim: true,
      minlength: [2, "Product name must be at least 2 characters long"],
    },

    price: {
      type: Number,
      required: [true, "Product price is required"],
      min: [0, "Price cannot be negative"],
    },

    description: {
      type: String,
      trim: true,
      maxlength: [500, "Description cannot exceed 500 characters"],
    },

    category: {
      type: String,
      trim: true,
      default: "general",
    },

    stock: {
      type: Number,
      default: 0,
      min: [0, "Stock cannot be negative"],
    },

    isAvailable: {
      type: Boolean,
      default: true,
    },

    imageUrl: {
      type: String,
      default: "https://via.placeholder.com/300x300?text=No+Image",
    },

    ratings: [
      {
        type: Number,
        min: 1,
        max: 5,
      },
    ],
  },
  {
    timestamps: true, 
  }
);

productSchema.virtual("averageRating").get(function () {
  if (!this.ratings || this.ratings.length === 0) return 0;
  const sum = this.ratings.reduce((total, r) => total + r, 0);
  return (sum / this.ratings.length).toFixed(1);
});


productSchema.pre("save", function (next) {
  this.isAvailable = this.stock > 0;
  next();
});

const Product = mongoose.model("Product", productSchema);
export default Product;
