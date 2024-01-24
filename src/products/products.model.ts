import { Schema, model } from "mongoose";
import { IProduct } from "./products.interface";


const ProductSchema = new Schema<IProduct>({
  sku: String,
  barcode: String,
  product: String,
  unMd: Number,
  lab: String,
  price: Number,
  activeIngredient: String,
});

const ProductModel = model<IProduct>("products", ProductSchema);

export default ProductModel;
