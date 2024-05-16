const mongoose = require("mongoose");
const User = require("./userModel");
const productSchema = mongoose.Schema({
    name:{
        type:String,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    price:{
        type:Number,
        required:true,
        min:0
    },
    category:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    quantity:{
        type:Number,
        required:true,
        min: 0 
    },
    ratings:{
        type:Number,
        default:0
    },
    reviews:[{
        user:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        content:{
            type:String
        }
    }]
})

module.exports=mongoose.model("Product",productSchema)