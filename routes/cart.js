const express = require("express");
const router = express.Router();
const isUserAuthorized = require("../middlewares/isUserAuthorized");
const Cart = require("../models/cartModel");
const Product = require("../models/productsModel");

router.post("/cart", isUserAuthorized, async (req, res) => {
    const { productId, quantity } = req.body;
    const userId = req.user._id;
    try {
        const product =await Product.findById(productId);
        const imageUrl = product.imageUrl;
        const price = product.price;

        let cart = await Cart.findOne({userId});

        if(!cart){
            cart = await new Cart({userId,products:[]})
        }

        const productIndex = cart.products.findIndex(p => p.productId.toString() === productId.toString());

        if(productIndex > -1){
            cart.products[productIndex].quantity += parseInt(quantity);
            cart.products[productIndex].total = cart.products[productIndex].quantity * price;
        }else{
            cart.products.push({
                userId,
                productId,
                price,
                quantity,
                total : parseInt(quantity)*price,
                imageUrl
            })
        }
        cart.total = cart.products.reduce((acc,item)=>acc+item.total,0);
        cart.totalProducts = cart.products.length;
        cart.totalQuantity = cart.products.reduce((acc,item)=>acc+item.quantity,0);
        await cart.save();
        res.status(200).json({message:"Product added Successfully", cart})

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Internal Server Error" });
    }
})

module.exports = router;