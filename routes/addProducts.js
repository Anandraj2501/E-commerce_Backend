const express = require("express");
const isAdminAuthorized = require("../middlewares/isAdminAuthorized");
const upload = require("../middlewares/multer.middleware");
const {uploadOnCloudinary, deleteFromCloudinary} = require("../utils/cloudinary");
const router = express.Router();
const Product = require("../models/productsModel");

router.post("/addproducts", isAdminAuthorized, upload.single("image"), async (req, res) => {
    console.log(req.file);
    try {
        const { name, description, price, category, quantity } = req.body;
        if (!name || !description || !price || !category || !quantity || !req.file) {
            return res.status(400).json({ error: "Please provide all required fields and an image" });
        }
        const imageUrl = await uploadOnCloudinary(req.file.path);
        if (!imageUrl) {
            return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
        }

        // Create new product instance
        const newProduct = new Product({
            name,
            description,
            price,
            category,
            imageUrl,
            quantity,
            ratings: 0, // Initialize ratings to 0
            reviews: [] // Initialize reviews to an empty array
        });

        // Save the new product to the database
        await newProduct.save();

        // Respond with success message
        return res.status(201).json({ message: "Product added successfully", product: newProduct });
    } catch (error) {
        res.status(500).json({ error: "Internal Server Error" })
    }
})

router.put("/product/:id", isAdminAuthorized, upload.single("image"), async (req, res) => {
    try {
        const productId = req.params.id;
        const updates = req.body;
        console.log(req.body);
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: "Product Not found" });
        }
        if (req.file) {
            const imageUrl = await uploadOnCloudinary(req.file.path);
            if (!imageUrl) {
                return res.status(500).json({ error: "Failed to upload image to Cloudinary" });
            }
            if (product.imageUrl) {
                await deleteFromCloudinary(product.imageUrl); // Delete the old image from Cloudinary
            }
            product.imageUrl = imageUrl;
        }
        Object.assign(product, updates);
        await product.save();
        res.status(200).json({ message: "Product Updated", product: product });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

router.delete("/product/:id",isAdminAuthorized,async(req,res)=>{
    try{
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if(!product){
            return res.status(404).json({error:"Product Not Found"});
        }
        await Product.findByIdAndDelete(productId);

        if(product.imageUrl){
            await deleteFromCloudinary(product.imageUrl);
        }

        return res.status(200).json({message:"Product Deleted Successfully"});
    }catch(error){
        console.error(error);
        res.status(500).json({error:"Internal Server Error"});
    }
})

module.exports = router;