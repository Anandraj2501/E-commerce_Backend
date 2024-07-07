const express = require("express");
const router = express.Router();
const isUserAuthorized = require("../middlewares/isUserAuthorized");
const Cart = require("../models/cartModel");
const Product = require("../models/productsModel");

router.post("/cart", isUserAuthorized, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;
    try {
        const product = await Product.findById(productId);
        const imageUrl = product.imageUrl;
        const price = product.price;

        let cart = await Cart.findOne({ userId });

        if (!cart) {
            cart = await new Cart({ userId, products: [] })
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId.toString());

        if (productIndex > -1) {
            cart.products[productIndex].quantity += parseInt(quantity);
            cart.products[productIndex].total = cart.products[productIndex].quantity * price;
        } else {
            cart.products.push({
                userId,
                productId,
                price,
                quantity,
                total: parseInt(quantity) * price,
                imageUrl
            })
        }
        cart.total = cart.products.reduce((acc, item) => acc + item.total, 0);
        cart.totalProducts = cart.products.length;
        cart.totalQuantity = cart.products.reduce((acc, item) => acc + item.quantity, 0);
        await cart.save();
        res.status(200).json({ message: "Product added Successfully", cart })

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})
router.get("/getcart", isUserAuthorized, async (req, res) => {
    const userId = req.user._id;
    console.log(userId);
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart || cart.products.length === 0) { // Check if cart is empty
            return res.status(200).json({ message: "Cart is empty", cart: [] });
        }
        res.status(200).json({ message: "Success", cart });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal Serveer Error" });
    }
})

router.delete("/removeItem/:id", isUserAuthorized, async (req, res) => {
    const productId = req.params.id;
    const userId = req.user._id;
    console.log(req);
    try {

        const cart =await Cart.findOne({ userId });
        if (!cart) {
            res.status(400).json({ error: "Cart not found" });
        }
        const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId.toString());
        if (productIndex === -1) {
            return res.status(400).json({ error: "Product Not Found In Cart" });
        }
        const removedItem = cart.products.splice(productIndex, 1)[0];

        // Update cart totals (total, totalProducts, totalQuantity) based on removed item
        cart.total -= removedItem.total;
        cart.totalProducts -= 1;
        cart.totalQuantity -= removedItem.quantity;
    
        // Save the updated cart to the database
        await cart.save();
        res.status(200).json({ message: "Success", cart });
        
    }catch(error){
        console.log(error);
        res.status(500).json({ error: "Cart Updation Failed" });
    }
})

router.put("/updatecart/:id", isUserAuthorized, async (req, res) => {
    const productId = req.params.id;
    const { quantity } = req.body;
    console.log(quantity);
    const userId = req.user._id;
    try {
        const cart = await Cart.findOne({ userId });
        if (!cart) {
            return res.status(400).json({ error: "Cart not found" });
        }
        const productIndex = cart.products.findIndex((p) => p.productId.toString() === productId.toString());
        if (productIndex === -1) {
            return res.status(400).json({ error: "Product Not Found In Cart" });
        }
        cart.products[productIndex].quantity = parseInt(quantity);
        cart.products[productIndex].total = cart.products[productIndex].quantity * cart.products[productIndex].price;
        cart.total = cart.products.reduce((acc, item) => acc + item.total, 0);
        cart.totalProducts = cart.products.length;
        cart.totalQuantity = cart.products.reduce((acc, item) => acc + item.quantity, 0);
        await cart.save();
        return res.status(200).json({ message: "Updated", cart });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Cart Updation Failed" });
    }
})

module.exports = router;