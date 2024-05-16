const mongoose = require("mongoose");
const User = require("./userModel");
const Product = require("./productsModel");

const CartSchema = mongoose.Schema({
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    products:[{
        productId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"Product",
            required:true
        },
        quantity:{
            type:Number,
            required:true,
            min:[1,"Quantity can not be less than 1."]
        }
    }]
},{timestamps:true})

module.exports = mongoose.model("Cart",CartSchema);