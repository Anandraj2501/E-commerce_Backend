const mongoose = require("mongoose");
const User =  require("./userModel");
const Product = require("./productsModel");

const OrderSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
      },
      orderTotal: {
        type: Number,
        required: true
      },
      items: [{
        productId:{
            type: String,
            required: true
        },
        quantity:{
            type:Number,
            required:true,
        },
        imageUrl:{
            type: String,
            required: true
        }
      }],
      razorpayOrderId: {
        type: String,
        required: true
      },
      paymentStatus: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
      }
    }, { timestamps: true });

module.exports = mongoose.model("OrderData",OrderSchema);