/**
 * This is a Mongoose model for the Product schema.
 *
 * @constant {Object} Product
 * @property {string} name - The name of the product, required.
 * @property {number} price - The price of the product, required.
 * @property {string} category - The category of the product, required.
 * @property {string} [enum="fruit","vegetable","dairy"] - The allowed categories for the product.
 *
 * @example
 * const product = new Product({
 *   name: 'Apple',
 *   price: 2.5,
 *   category: 'fruit',
 * });
 */
import mongoose from "mongoose";

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        min: 0,
        required: true
    },
    category: {
        type: String,
        lowercase: true,
        enum: ["fruit", "vegetable", "dairy"],
        required: true
    }
});

const Product = mongoose.model("Product", productSchema);

export default Product;
