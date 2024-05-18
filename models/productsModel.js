const mongoose = require("mongoose");
const User = require("./userModel");
const productSchema = mongoose.Schema({
    //add details field also...;)
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
    stock:{
        type:Number,
        required:true,
        min: 0 
    },
    ratings:{
        type:Number,
        default:0
    },
    details:{
        type: String,
        required: true
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