import express from "express";
import {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/products", getProducts);           
router.get("/products/:id", getProduct);        
router.post("/products", createProduct);        
router.put("/products/:id", updateProduct);     
router.delete("/products/:id", deleteProduct);  

export default router;
