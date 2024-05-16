const express = require("express");
const router = express.Router();
const isUserAuthorized = require("../middlewares/isUserAuthorized");
const cart = require("../models/cartModel");

router.post("/cart", isUserAuthorized, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;
    try {
        const existingCart = await cart.findOne({ userId }).populate("products.productId");
        if (existingCart) {
            const existingProductIndex = existingCart.products.findIndex(product => product.productId.equals(productId));
            if (existingProductIndex !== -1) {
                existingCart.products[existingProductIndex].quantity += parseInt(quantity);
            }
            else {
                existingCart.products.push({ productId, quantity });
            }
            await existingCart.save();
            return res.status(200).json(existingCart);
        }
        else {
            const newCart = new cart({
                userId,
                products: [{ productId, quantity }]
            })

            await newCart.save();
            await newCart.populate('products.productId').execPopulate();
            return res.status(200).json(newCart);
        }

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

module.exports = router;