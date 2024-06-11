import express from "express";
import mongoose from "mongoose";
import { fileURLToPath } from 'url';
import path from "path";
import bodyParser from "body-parser";
import methodOverride from "method-override";


import Product from "./models/product.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3000;

const dbUrl = "mongodb://127.0.0.1:27017/farmStandDB";

mongoose.connect(dbUrl)
    .then(() => {
        console.log("Connected to MongoDB");
    }).catch((err) => {
        console.log('[DB ERROR]', err);
    });

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));

// Hard coded categories
const categories = ["fruit", "vegetable", "dairy"];

// Categories from db
// const categories = Product.schema.path("category").enumValues;

app.get("/", (req, res) => {
    res.send("Hello World!");
});

app.get("/products/new", (req, res) => {
    res.render("products/new", { categories });
});

app.get("/products", async (req, res) => {
    const { category } = req.query;

    try {
        if (category) {
            const products = await Product.find({ category: category });
            res.render("products/index", { products, categories });
        } else {
            const products = await Product.find({});
            // console.log(products);
            res.render("products/index", { products, categories });
        }
    } catch (error) {
        console.error(error);
        // Redirect to /products in case of an error (e.g., invalid ID format)
        res.redirect("/products");
    }
});

app.get("/products/:id", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);

        if (!product) {
            console.log(`No product found with id ${id}`);
            // Redirect to /products if the product is not found
            res.redirect("/products");
            return;
        }

        console.log(product);
        res.render("products/show", { product });
    } catch (error) {
        console.error(`Error finding product with id ${id}:`, error);
        // Redirect to /products in case of an error (e.g., invalid ID format)
        res.redirect("/products");
    }
});

app.get("/products/:id/edit", async (req, res) => {
    const { id } = req.params;
    try {
        const product = await Product.findById(id);
        if (!product) {
            return res.redirect("/products");
        }
        res.render("products/edit", { product, categories });
    } catch (error) {
        console.error(`Error finding product with id ${id}:`, error);
        res.redirect("/products");
    }
});

app.put("/products/:id", async (req, res) => {
    const { id } = req.params;
    const data = req.body;
    try {
        console.log(data);

        const product = await Product.findById(id);
        console.log(product);

        if (!product) {
            return res.redirect("/products");
        }

        const updatedProduct = await Product.findByIdAndUpdate(id, data, { new: true });
        res.redirect(`/products/${updatedProduct._id}`);
    } catch (error) {
        console.error(`Error finding product with id ${id}:`, error);
        res.redirect("/products");
    }
})

app.post("/products", async (req, res) => {
    const data = req.body;

    try {
        console.log(data);

        if (!data.price) {
            throw new Error("Price is required");
        }
        if (!data.name) {
            throw new Error("Name is required");
        }

        const newProduct = new Product(data);
        await newProduct.save();
        res.redirect(`/products/${newProduct._id}`);
    } catch (error) {
        console.log(error);
        res.redirect("/products/new");
    }
});

app.delete("/products/:id", async (req, res) => {
    const { id } = req.params;

    try {
        await Product.findByIdAndDelete(id);

        console.log(`Product with id ${id} deleted`);
        res.redirect("/products");
    } catch (error) {
        console.log(error);
        res.redirect("/products");
    }
});

app.listen(port, () => {
    console.log(`Listening on port ${port}`);
})