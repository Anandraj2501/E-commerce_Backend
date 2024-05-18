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
            type: String,
            required: true
        },
        price:{
            type: String,
            required: true
        },
        quantity:{
            type:Number,
            required:true,
            min:[1,"Quantity can not be less than 1."]
        },
        total: {
            type: Number,
            required: true
        },
        imageUrl:{
            type: String,
            required: true
        }
    }],
    total:{
        type: Number,
        default : 0
    },
    totalProducts:{
        type: Number,
        default: 0
    },
    totalQuantity:{
        type: Number,
        default : 0
    }

},{timestamps:true})

module.exports = mongoose.model("Cart",CartSchema);