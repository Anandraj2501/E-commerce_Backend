const express = require("express");
const router = express.Router();
const Products = require("../models/productsModel");

router.get("/allproducts",async(req,res)=>{
    const page = req.query.pages ? parseInt(req.query.pages) : 1;
    const limit = req.query.limit ? parseInt(req.query.limit) : 10;
    try{
        const products = await Products.find()
        .skip((page - 1) * limit)
        .limit(limit);
        res.status(200).json({message:"Successfully fetched",products:products});
    }catch(error){
        res.status(500).json({error:"Internal Server Error"})
    }

})

router.get("/product/:id",async(req,res)=>{

    try{
        const productId = req.params.id;
        const product = await Products.findById(productId);
        if(!product){
            return res.status(404).json({error:"Product not found"});
        }
        return res.status(200).json({message:"Product Found",product:product});
    }catch(error){
        res.status(500).json({error:"Internal server Error"});
    }
})



module.exports = router;