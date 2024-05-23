const express = require("express");
const isUserAuthorized = require("../middlewares/isUserAuthorized");
const router = express.Router();
const OrderData = require("../models/orderDataModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Razorpay = require("razorpay");
const crypto = require("crypto");

const instance = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_SECRET_KEY,
});

router.post("/checkout", isUserAuthorized, async (req, res) => {
    const amount = req.body.total;
    const cartId = req.body.cartId;
    const userId = req.user._id;
    console.log(amount,cartId,userId);
    try {
        var options = {
            amount: Number(amount * 100),  // amount in the smallest currency unit
            currency: "INR",
            receipt: "order_rcptid_11"
        };
        const order = await instance.orders.create(options);

        const user = await User.findOne(userId);
        console.log(user);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Find the user's cart
        const cart = await Cart.findById(cartId);
        console.log(cart);
        if (!cart) {
            return res.status(404).json({ message: 'Cart not found' });
        }

        const orderData = {
            user: userId,
            orderTotal: amount,
            items: cart.products.map(item => ({
                productId: item.productId,
                quantity: item.quantity,
                imageUrl: item.imageUrl
            })),
            razorpayOrderId: order.id,
            paymentStatus: 'pending' // We can update this once payment is successful
        };
        const newOrder = await OrderData.create(orderData);

        // Clear the user's cart
        cart.items = [];
        await cart.save();
        res.status(200).json({ order });
    } catch (error) {
        console.log("Checkout error",error.message);
        res.status(500).json({ error: "Internal server error" });
    }

})

router.post("/paymentverification", async (req, res) => {
    const {razorpay_payment_id,razorpay_order_id,razorpay_signature} = req.body;
    try {

        const secret = process.env.RAZORPAY_SECRET_KEY;

        const generated_signature = crypto.createHmac('sha256', secret)
            .update(razorpay_order_id + "|" + razorpay_payment_id)
            .digest('hex');

        if (generated_signature === razorpay_signature) {
            console.log("payment is successful");

            // Find the order with the provided Razorpay order ID
            const order = await OrderData.findOne({ razorpayOrderId: razorpay_order_id });
            if (!order) {
                return res.status(404).json({ message: 'Order not found' });
            }

            // Update the payment status to 'completed'
            order.paymentStatus = 'completed';
            await order.save();
        } else {
            console.log("payment verification failed");
        }
        res.status(200).json({ success: true });
    } catch (error) {
        console.log(error);
        res.status(500).json({ error: "Internal server error" });
    }

})

module.exports = router;