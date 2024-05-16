const express = require("express");
const router = express.Router();
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const {Jwt_Secret} = require("../utils/keys");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

router.post("/signup",async(req,res)=>{
    try{
        const {name,email,password} = req.body;
        console.log(name,email,password);
        if(!name||!email||!password){
            return res.status(422).json({error:"Please Provide all Details"});
        }


        if(!emailPattern.test(email)){
            return res.status(400).json({error:"Email Format is Incorrect"})
        }
        const existingUser = await User.findOne({email});


        if(existingUser){
            return res.status(409).json({error:"User already Exists"});
        }

        const newUser = new User({
            name,
            email,
            password: await bcrypt.hash(password,12)
        })
        const savedUser = await newUser.save();
        res.status(201).json({ message: "User Created Successfully" });
    }catch(error){
        res.status(500).json({error:"Internal Server error"});
    }
})

router.post("/signin",async(req,res)=>{
    const {email,password} = req.body;
    if(!email||!password){
        return res.status(422).json({error:"Please Provide all Details"});
    }
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(401).json({error:"Invalid Email"})
        }
        const matched = await bcrypt.compare(password,user.password);
        if(!matched){
            return res.status(401).json({error:"Invalid Password"});
        }
        const token = jwt.sign({userId:user._id},Jwt_Secret,{expiresIn:"7d"});
        res.cookie('token', token, { httpOnly: true, expiresIn: 604800000 });
        res.status(200).json({message:"Sign In Successfully",user: { _id: user._id,profilepic:user.profilepic, name: user.name }});

    }catch(error){
        res.status(500).json({error:"Internal Server Error"});
    }
})

router.get("/user/:id",async(req,res)=>{
    try{
        const userId = req.params.id;
        const user = await User.findById(userId);
        if(!user){
            return res.status(404).json({error:"User not found"});
        }
        res.status(200).json({message:"User Found",user:{id:user._id,name:user.name,profilepic:user.profilepic}})
    }catch(error){
        console.error(error);
        res.status(500).json({error:"Internal server error"});
    }
})


module.exports = router;